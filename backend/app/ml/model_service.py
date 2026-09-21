"""
Machine Learning Inference & Model Service for Startup Failure Intelligence Platform.

Handles:
- Safe lazy-loading of trained model artifacts (startup_failure_model.joblib)
- Graceful degradation when model artifact is absent (MODEL_NOT_AVAILABLE)
- Input feature preparation, validation, and non-leaking feature engineering
- Inference execution (predict + predict_proba)
- Application heuristic risk level categorization
- Operational model status and metadata reporting
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from app.analytics.preprocessing import StartupFeatureEngineer, StartupDataPreprocessor
from .schemas import (
    ModelStatusEnum,
    ModelStatusResponse,
    PredictionFeatureInput,
    RiskLevelEnum,
    StartupFailurePredictionRequest,
    StartupFailurePredictionResponse,
)

logger = logging.getLogger(__name__)

# Base path for model artifacts
MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_FILE = MODELS_DIR / "startup_failure_model.joblib"
PREPROCESSOR_FILE = MODELS_DIR / "startup_preprocessor.joblib"
METADATA_FILE = MODELS_DIR / "model_metadata.json"


# =====================================================================
# Risk Interpretation Layer (Application Heuristic Bands)
# =====================================================================
def interpret_failure_probability(prob: float) -> Tuple[RiskLevelEnum, str]:
    """
    Maps failure probability into documented application risk bands.

    IMPORTANT METHODOLOGICAL NOTE:
    These probability thresholds are heuristic application interpretation bands designed
    for operational venture triage. They are NOT medically, actuarially, financially,
    or scientifically proven guarantees.

    Threshold Bands:
    - [0.00, 0.25): Low Risk
    - [0.25, 0.50): Medium Risk
    - [0.50, 0.75): High Risk
    - [0.75, 1.00]: Critical Risk
    """
    if prob < 0.25:
        level = RiskLevelEnum.LOW
        interpretation = (
            "Application Heuristic: Low closure risk. The venture exhibits historical "
            "attributes associated with robust capital progression and ecosystem relationships."
        )
    elif prob < 0.50:
        level = RiskLevelEnum.MEDIUM
        interpretation = (
            "Application Heuristic: Moderate risk. The venture demonstrates balanced operational "
            "indicators, though milestone velocity or follow-on round depth may warrant ongoing monitoring."
        )
    elif prob < 0.75:
        level = RiskLevelEnum.HIGH
        interpretation = (
            "Application Heuristic: Elevated failure risk. Historical peers in this probability "
            "band experienced limited syndicate participation, low relationship count, or stalling between rounds."
        )
    else:
        level = RiskLevelEnum.CRITICAL
        interpretation = (
            "Application Heuristic: Critical failure risk. Attributes reflect historical patterns "
            "strongly associated with venture closure, such as capital isolation and absence of milestone validation."
        )

    return level, interpretation


# =====================================================================
# Failure Prediction Service
# =====================================================================
class FailurePredictionService:
    """
    Core prediction service for Startup Failure Intelligence.
    Guarantees that when no model exists on disk, the system reports
    a controlled unavailable state rather than crashing or inventing fake numbers.
    """

    def __init__(
        self,
        model_path: Optional[Path] = None,
        preprocessor_path: Optional[Path] = None,
        metadata_path: Optional[Path] = None,
    ):
        self.model_path = model_path or MODEL_FILE
        self.preprocessor_path = preprocessor_path or PREPROCESSOR_FILE
        self.metadata_path = metadata_path or METADATA_FILE

        self._cached_model: Optional[Any] = None
        self._cached_preprocessor: Optional[Any] = None
        self._cached_metadata: Optional[Dict[str, Any]] = None

    def is_model_available(self) -> bool:
        """
        Verifies whether the trained model artifact is physically present on disk.
        """
        return self.model_path.exists() and self.model_path.is_file()

    def is_preprocessor_available(self) -> bool:
        """
        Verifies whether the fitted preprocessor artifact is physically present.
        """
        return self.preprocessor_path.exists() and self.preprocessor_path.is_file()

    def get_model_status(self) -> ModelStatusResponse:
        """
        Returns structured operational status of the ML model subsystem.
        """
        available = self.is_model_available()
        status_enum = (
            ModelStatusEnum.MODEL_AVAILABLE
            if available
            else ModelStatusEnum.MODEL_NOT_AVAILABLE
        )

        metadata = self._load_metadata_safe()

        if available:
            msg = "Trained startup failure model is loaded and ready for inference."
            name = metadata.get("model_name", "StartupFailureClassifier")
            ver = metadata.get("model_version", "1.0.0")
        else:
            msg = (
                "Trained model artifact (startup_failure_model.joblib) is not available. "
                "Training is deferred to a higher-capacity machine. Please train and export "
                "artifacts to backend/models/ before requesting live predictions."
            )
            name = None
            ver = None

        return ModelStatusResponse(
            model_available=available,
            status=status_enum,
            model_name=name,
            model_version=ver,
            model_path=str(self.model_path),
            preprocessor_path=str(self.preprocessor_path),
            message=msg,
            metadata=metadata if available else None,
        )

    def _load_metadata_safe(self) -> Dict[str, Any]:
        """
        Loads metadata if present, else returns empty dict.
        """
        if self._cached_metadata is not None:
            return self._cached_metadata

        if self.metadata_path.exists():
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self._cached_metadata = json.load(f)
                    return self._cached_metadata
            except Exception as e:
                logger.warning(f"Failed to read model metadata: {e}")

        return {}

    def load_model(self) -> Any:
        """
        Safely loads the trained classification model using joblib.
        Raises FileNotFoundError if artifact is absent.
        """
        if self._cached_model is not None:
            return self._cached_model

        if not self.is_model_available():
            raise FileNotFoundError(
                f"Model artifact not found at {self.model_path.resolve()}. "
                "Model training has not yet been conducted."
            )

        try:
            self._cached_model = joblib.load(self.model_path)
            logger.info(f"Successfully loaded trained model from {self.model_path}")
            return self._cached_model
        except Exception as e:
            logger.error(f"Error loading model artifact from {self.model_path}: {e}")
            raise RuntimeError(f"Corrupted or incompatible model artifact: {e}") from e

    def load_preprocessor(self) -> Any:
        """
        Safely loads the persisted scikit-learn preprocessor pipeline.
        """
        if self._cached_preprocessor is not None:
            return self._cached_preprocessor

        if self.is_preprocessor_available():
            try:
                self._cached_preprocessor = joblib.load(self.preprocessor_path)
                logger.info(f"Loaded preprocessor from {self.preprocessor_path}")
                return self._cached_preprocessor
            except Exception as e:
                logger.warning(f"Could not load preprocessor from {self.preprocessor_path}: {e}")

        return None

    def prepare_input_dataframe(self, features: PredictionFeatureInput) -> pd.DataFrame:
        """
        Transforms input payload into a standardized DataFrame and executes
        non-leaking feature engineering matching training conditions.
        """
        data_dict = features.model_dump()
        df = pd.DataFrame([data_dict])

        # Execute standardized feature engineering
        df = StartupFeatureEngineer.engineer_features(df)

        # Ensure geographic and category binary flags match input
        top_states = ["CA", "NY", "MA", "TX"]
        curr_state = str(features.state_code).upper()
        for st in top_states:
            col_name = f"is_{st}"
            if col_name not in df.columns or pd.isna(df.loc[0, col_name]):
                df[col_name] = int(curr_state == st)
        if "is_otherstate" not in df.columns:
            df["is_otherstate"] = int(curr_state not in top_states)

        top_cats = [
            "software", "web", "mobile", "enterprise", "advertising",
            "gamesvideo", "ecommerce", "biotech", "consulting"
        ]
        curr_cat = str(features.category_code).lower()
        for cat in top_cats:
            col_name = f"is_{cat}"
            if col_name not in df.columns or pd.isna(df.loc[0, col_name]):
                df[col_name] = int(curr_cat == cat)
        if "is_othercategory" not in df.columns:
            df["is_othercategory"] = int(curr_cat not in top_cats)

        # Handle milestone nulls (0 for startups with 0 milestones)
        if "age_first_milestone_year" in df.columns:
            df["age_first_milestone_year"] = df["age_first_milestone_year"].fillna(0.0)
        if "age_last_milestone_year" in df.columns:
            df["age_last_milestone_year"] = df["age_last_milestone_year"].fillna(0.0)

        return df

    def predict(self, request: StartupFailurePredictionRequest) -> StartupFailurePredictionResponse:
        """
        Executes inference if model is available, or returns controlled unavailable state.
        """
        meta = request.metadata
        s_id = meta.startup_id if meta else None
        s_name = meta.name if meta else None

        # 1. Check model availability
        if not self.is_model_available():
            status_info = self.get_model_status()
            return StartupFailurePredictionResponse(
                model_available=False,
                status=ModelStatusEnum.MODEL_NOT_AVAILABLE,
                startup_id=s_id,
                startup_name=s_name,
                predicted_outcome=None,
                is_failed=None,
                failure_probability=None,
                survival_probability=None,
                risk_level=None,
                risk_interpretation=None,
                model_version=None,
                explanation_available=False,
                message=status_info.message,
            )

        # 2. Model is available -> Load and prepare
        model = self.load_model()
        input_df = self.prepare_input_dataframe(request.features)

        # 3. Preprocess features
        preprocessor = self.load_preprocessor()
        if preprocessor is not None:
            if hasattr(preprocessor, "transform"):
                X = preprocessor.transform(input_df)
                if isinstance(X, tuple):
                    X = X[0]
            else:
                X = input_df
        else:
            X = input_df

        # 4. Run inference
        try:
            # Predict probabilities if supported
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X)
                # Class 1 is failure ('closed')
                p_fail = float(probs[0][1]) if probs.shape[1] > 1 else float(probs[0][0])
                p_surv = round(1.0 - p_fail, 4)
                p_fail = round(p_fail, 4)
            else:
                # Fallback to binary decision if no proba
                pred_raw = int(model.predict(X)[0])
                p_fail = 1.0 if pred_raw == 1 else 0.0
                p_surv = 1.0 - p_fail

            pred_class = 1 if p_fail >= 0.50 else 0
            outcome_str = "closed" if pred_class == 1 else "acquired"

            # 5. Determine application risk band
            risk_level, risk_desc = interpret_failure_probability(p_fail)

            metadata = self._load_metadata_safe()
            ver = metadata.get("model_version", "1.0.0")

            return StartupFailurePredictionResponse(
                model_available=True,
                status=ModelStatusEnum.MODEL_AVAILABLE,
                startup_id=s_id,
                startup_name=s_name,
                predicted_outcome=outcome_str,
                is_failed=pred_class,
                failure_probability=p_fail,
                survival_probability=p_surv,
                risk_level=risk_level,
                risk_interpretation=risk_desc,
                model_version=ver,
                explanation_available=True,
                message="Inference completed successfully.",
            )
        except Exception as exc:
            logger.error(f"Inference error: {exc}")
            raise RuntimeError(f"Prediction execution failed: {str(exc)}") from exc


# Global service singleton instance
prediction_service = FailurePredictionService()
