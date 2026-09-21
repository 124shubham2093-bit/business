"""
Data Cleaning, Leakage Auditing, and Preprocessing Pipeline for Startup Failure Intelligence.

Implements:
- Numeric and currency string parsing (e.g., "$1.2M", "$90k/mo", "24 months")
- Missing-value handling via scikit-learn imputers
- Duplicate detection and removal
- Invalid value detection (non-negative constraints, zero division)
- Non-leaking feature engineering tailored for Startup Failure Intelligence
- Strict target leakage auditing (flags collinear labels, closure dates, outcome fields)
- Reproducible feature transformation via scikit-learn Pipeline and ColumnTransformer
- Feature name preservation for explainability
"""

import re
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler, StandardScaler

from .data_loader import (
    KAGGLE_LEAKAGE_COLUMNS,
    KAGGLE_ARTIFACT_COLUMNS,
    KAGGLE_IDENTIFIER_COLUMNS,
    KAGGLE_PREDICTIVE_NUMERIC_COLUMNS,
    KAGGLE_PREDICTIVE_CATEGORICAL_COLUMNS,
    KAGGLE_PREDICTIVE_BINARY_COLUMNS,
)

logger = logging.getLogger(__name__)


# =====================================================================
# Numeric & Currency Cleaning Utilities
# =====================================================================
class CurrencyAndNumericParser:
    """
    Robust parser for human-written financial and operational metrics commonly
    found in pitch decks, cap tables, and startup profiles.
    """

    MULTIPLIERS = {
        "k": 1e3,
        "m": 1e6,
        "b": 1e9,
        "t": 1e12,
    }

    @classmethod
    def parse_currency(cls, val: Any) -> Optional[float]:
        """
        Parses strings like '$1.2M', '$90k', '€2.5M', '$450,000' into raw float.
        """
        if val is None or pd.isna(val):
            return np.nan
        if isinstance(val, (int, float)):
            return float(val)

        text = str(val).strip().lower()
        if not text or text in {"n/a", "na", "null", "none", "unknown", "-"}:
            return np.nan

        cleaned = re.sub(r"[\$,€,£,¥,\s]", "", text)
        match = re.match(r"^(-?[\d\.]+)\s*([kmbt])?.*$", cleaned)
        if match:
            number_part, suffix = match.groups()
            try:
                base_num = float(number_part)
                multiplier = cls.MULTIPLIERS.get(suffix, 1.0)
                return base_num * multiplier
            except ValueError:
                return np.nan

        return np.nan

    @classmethod
    def parse_duration_months(cls, val: Any) -> Optional[float]:
        """
        Parses duration strings like '24 months', '1.5 years', '18 mo' into months.
        """
        if val is None or pd.isna(val):
            return np.nan
        if isinstance(val, (int, float)):
            return float(val)

        text = str(val).strip().lower()
        if not text:
            return np.nan

        year_match = re.search(r"([\d\.]+)\s*(?:years?|yrs?|y)", text)
        if year_match:
            try:
                return float(year_match.group(1)) * 12.0
            except ValueError:
                pass

        month_match = re.search(r"([\d\.]+)\s*(?:months?|mos?|m)?", text)
        if month_match:
            try:
                return float(month_match.group(1))
            except ValueError:
                pass

        return np.nan

    @classmethod
    def parse_percentage(cls, val: Any) -> Optional[float]:
        """
        Parses percentage strings like '18.2%', '95%' into float.
        """
        if val is None or pd.isna(val):
            return np.nan
        if isinstance(val, (int, float)):
            return float(val)

        text = str(val).strip().replace("%", "")
        try:
            return float(text)
        except ValueError:
            return np.nan


# =====================================================================
# Feature Engineering (Non-Leaking)
# =====================================================================
class StartupFeatureEngineer:
    """
    Constructs domain-meaningful, non-leaking predictive features
    strictly from pre-outcome startup operational, financial, and milestone metrics.
    """

    @staticmethod
    def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Derives engineered features from the raw dataset.
        Ensures no post-outcome variables or closing dates are utilized.
        """
        df_out = df.copy()

        # 1. Funding Duration (years between first and last round)
        if "age_last_funding_year" in df_out.columns and "age_first_funding_year" in df_out.columns:
            duration = df_out["age_last_funding_year"] - df_out["age_first_funding_year"]
            df_out["funding_duration_years"] = np.maximum(duration, 0.0)

        # 2. Funding Per Round (capital intensity per financing event)
        if "funding_total_usd" in df_out.columns and "funding_rounds" in df_out.columns:
            rounds = np.maximum(df_out["funding_rounds"], 1)
            df_out["funding_per_round_usd"] = df_out["funding_total_usd"] / rounds

        # 3. Funding Stages Count (count of named VC rounds raised: A, B, C, D)
        stage_cols = [c for c in ["has_roundA", "has_roundB", "has_roundC", "has_roundD"] if c in df_out.columns]
        if stage_cols:
            df_out["funding_stages_count"] = df_out[stage_cols].sum(axis=1)

        # 4. Investor Diversity Score (breadth of capital: VC + Angel)
        investor_cols = [c for c in ["has_VC", "has_angel"] if c in df_out.columns]
        if investor_cols:
            df_out["investor_diversity_score"] = df_out[investor_cols].sum(axis=1)

        # 5. Milestone Indicator & Milestone Duration
        if "milestones" in df_out.columns:
            df_out["has_milestone"] = (df_out["milestones"] > 0).astype(int)

        if "age_first_milestone_year" in df_out.columns and "age_last_milestone_year" in df_out.columns:
            m_first = df_out["age_first_milestone_year"].fillna(0.0)
            m_last = df_out["age_last_milestone_year"].fillna(0.0)
            milestone_dur = np.where(df_out["milestones"] > 1, np.maximum(m_last - m_first, 0.0), 0.0)
            df_out["milestone_duration_years"] = milestone_dur

            # Impute missing milestone ages for startups with 0 milestones (informative missingness)
            df_out["age_first_milestone_year"] = m_first
            df_out["age_last_milestone_year"] = m_last

        # 6. Relationship Velocity (relationships normalized by operating tenure)
        if "relationships" in df_out.columns and "age_last_funding_year" in df_out.columns:
            tenure = np.maximum(df_out["age_last_funding_year"], 0.5)
            df_out["relationships_per_year"] = (df_out["relationships"] / tenure).round(4)

        return df_out


# =====================================================================
# Target Leakage Auditor
# =====================================================================
class TargetLeakageAuditor:
    """
    Audits feature sets to guarantee that target leakage does NOT contaminate
    the training feature matrix.
    """

    LEAKAGE_NAMES: Set[str] = {
        "status",
        "labels",
        "closed_at",
        "is_closed",
        "outcome",
        "target",
        "exit_status",
    }

    @classmethod
    def audit_features(
        cls,
        df: pd.DataFrame,
        feature_columns: List[str],
        target_column: str = "is_failed",
    ) -> Dict[str, Any]:
        """
        Inspects feature candidates against leakage rules:
        1. Checks for known leakage column names.
        2. Checks correlation with target (flags any feature with |r| > 0.90 as potential leakage).

        Returns:
            Dict[str, Any]: Audit summary with pass/fail flag.
        """
        leakage_found = []
        for col in feature_columns:
            if col.strip().lower() in cls.LEAKAGE_NAMES or col == target_column:
                leakage_found.append(col)

        suspicious_correlations = []
        if target_column in df.columns:
            target_series = pd.to_numeric(df[target_column], errors="coerce")
            for col in feature_columns:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    col_series = pd.to_numeric(df[col], errors="coerce")
                    valid_mask = col_series.notnull() & target_series.notnull()
                    if valid_mask.sum() > 10:
                        corr = abs(float(np.corrcoef(col_series[valid_mask], target_series[valid_mask])[0, 1]))
                        if corr >= 0.90:
                            suspicious_correlations.append({
                                "feature": col,
                                "absolute_correlation": round(corr, 4),
                                "reason": "Extremely high correlation with target suggests direct derivation or collinearity.",
                            })

        is_clean = len(leakage_found) == 0 and len(suspicious_correlations) == 0

        return {
            "is_clean": is_clean,
            "leakage_columns_found": leakage_found,
            "suspicious_correlations": suspicious_correlations,
            "total_features_audited": len(feature_columns),
        }


# =====================================================================
# Main Data Preprocessor Pipeline
# =====================================================================
class StartupDataPreprocessor:
    """
    Standardized, reproducible preprocessing pipeline for Startup Failure Intelligence.
    Uses scikit-learn ColumnTransformer to allow identical transformation at ML inference time.
    """

    def __init__(
        self,
        id_columns: Optional[List[str]] = None,
        target_column: Optional[str] = "is_failed",
        numeric_columns: Optional[List[str]] = None,
        categorical_columns: Optional[List[str]] = None,
        binary_columns: Optional[List[str]] = None,
        scaler_type: str = "robust",  # 'robust', 'standard', or 'none'
    ):
        self.id_columns = id_columns or ["startup_id", "name", "id"]
        self.target_column = target_column
        self.numeric_columns = numeric_columns or []
        self.categorical_columns = categorical_columns or []
        self.binary_columns = binary_columns or []
        self.scaler_type = scaler_type

        self.fitted_pipeline: Optional[ColumnTransformer] = None
        self.output_feature_names: List[str] = []
        self._is_fitted = False

    def remove_duplicates(
        self,
        df: pd.DataFrame,
        subset: Optional[List[str]] = None,
        keep: str = "first",
    ) -> Tuple[pd.DataFrame, int]:
        """
        Identify and remove duplicate startup records.
        """
        initial_len = len(df)
        sub = subset or (["id"] if "id" in df.columns else None)
        cleaned_df = df.drop_duplicates(subset=sub, keep=keep).copy()
        dropped = initial_len - len(cleaned_df)
        if dropped > 0:
            logger.info(f"Removed {dropped} duplicate startup records.")
        return cleaned_df, dropped

    def clean_raw_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Pre-cleans raw data: parses formatted strings, replaces invalid values,
        and ensures consistent dtypes before feeding to the scikit-learn pipeline.
        """
        cleaned = df.copy()

        # Parse known currency/financial columns if present as strings
        currency_fields = [
            "funding_total_usd",
            "last_funding_usd",
            "burn_rate_monthly",
            "revenue_annual",
            "valuation_usd",
            "funding_per_round_usd",
        ]
        for col in currency_fields:
            if col in cleaned.columns and cleaned[col].dtype == object:
                cleaned[col] = cleaned[col].apply(CurrencyAndNumericParser.parse_currency)

        # Parse duration strings if present
        duration_fields = ["runway_months", "funding_duration_years"]
        for col in duration_fields:
            if col in cleaned.columns and cleaned[col].dtype == object:
                cleaned[col] = cleaned[col].apply(CurrencyAndNumericParser.parse_duration_months)

        # Invalidate domain-impossible negative values (funding, rounds, etc.)
        non_negative_cols = [
            "funding_total_usd",
            "funding_rounds",
            "relationships",
            "milestones",
            "funding_duration_years",
            "funding_per_round_usd",
            "milestone_duration_years",
        ]
        for col in non_negative_cols:
            if col in cleaned.columns and pd.api.types.is_numeric_dtype(cleaned[col]):
                invalid_mask = cleaned[col] < 0
                if invalid_mask.any():
                    cleaned.loc[invalid_mask, col] = np.nan

        # Replace infinite values with NaN
        cleaned.replace([np.inf, -np.inf], np.nan, inplace=True)

        return cleaned

    def _auto_detect_columns(self, df: pd.DataFrame) -> None:
        """
        If feature column lists were not provided, detect them dynamically.
        Excludes target, leakage, and identifiers.
        """
        cols_to_exclude = set(self.id_columns)
        if self.target_column:
            cols_to_exclude.add(self.target_column)
        cols_to_exclude.update(KAGGLE_LEAKAGE_COLUMNS)
        cols_to_exclude.update(KAGGLE_ARTIFACT_COLUMNS)
        cols_to_exclude.update(KAGGLE_IDENTIFIER_COLUMNS)

        candidate_cols = [c for c in df.columns if c not in cols_to_exclude]

        if not self.numeric_columns:
            # Distinguish binary from continuous numeric
            num_candidates = list(
                df[candidate_cols].select_dtypes(include=["number"]).columns
            )
            bin_cols = []
            cont_cols = []
            for col in num_candidates:
                unique_vals = set(df[col].dropna().unique())
                if unique_vals.issubset({0, 1}):
                    bin_cols.append(col)
                else:
                    cont_cols.append(col)

            self.numeric_columns = cont_cols
            if not self.binary_columns:
                self.binary_columns = bin_cols

        if not self.categorical_columns:
            self.categorical_columns = list(
                df[candidate_cols].select_dtypes(include=["object", "string", "category"]).columns
            )

    def build_sklearn_pipeline(self) -> ColumnTransformer:
        """
        Constructs the scikit-learn ColumnTransformer.
        """
        transformers = []

        # 1. Numeric transformer: SimpleImputer (median) -> Scaler
        if self.numeric_columns:
            scaler = (
                RobustScaler()
                if self.scaler_type == "robust"
                else StandardScaler()
                if self.scaler_type == "standard"
                else "passthrough"
            )
            num_steps = [("imputer", SimpleImputer(strategy="median"))]
            if scaler != "passthrough":
                num_steps.append(("scaler", scaler))

            num_pipe = Pipeline(steps=num_steps)
            transformers.append(("num", num_pipe, self.numeric_columns))

        # 2. Binary transformer: passthrough (impute missing with 0 if any)
        if self.binary_columns:
            bin_pipe = Pipeline(steps=[("imputer", SimpleImputer(strategy="constant", fill_value=0))])
            transformers.append(("bin", bin_pipe, self.binary_columns))

        # 3. Categorical transformer: SimpleImputer (constant) -> OneHotEncoder
        if self.categorical_columns:
            cat_pipe = Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="constant", fill_value="other")),
                    (
                        "encoder",
                        OneHotEncoder(
                            handle_unknown="ignore",
                            sparse_output=False,
                        ),
                    ),
                ]
            )
            transformers.append(("cat", cat_pipe, self.categorical_columns))

        pipeline = ColumnTransformer(
            transformers=transformers,
            remainder="drop",
        )
        return pipeline

    def fit(self, df: pd.DataFrame, y: Optional[pd.Series] = None) -> "StartupDataPreprocessor":
        """
        Fits the scikit-learn pipeline on the provided dataset.
        """
        cleaned_df = self.clean_raw_dataframe(df)
        self._auto_detect_columns(cleaned_df)

        self.fitted_pipeline = self.build_sklearn_pipeline()
        self.fitted_pipeline.fit(cleaned_df, y)
        self._is_fitted = True

        # Extract output feature names for explainability
        feature_names = []
        if self.numeric_columns:
            feature_names.extend(self.numeric_columns)
        if self.binary_columns:
            feature_names.extend(self.binary_columns)
        if self.categorical_columns:
            try:
                cat_encoder = self.fitted_pipeline.named_transformers_["cat"].named_steps["encoder"]
                cat_feature_names = cat_encoder.get_feature_names_out(self.categorical_columns)
                feature_names.extend(list(cat_feature_names))
            except Exception:
                feature_names.extend(self.categorical_columns)

        self.output_feature_names = feature_names
        return self

    def transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Transforms input DataFrame into processed numpy feature matrix X
        and target array y (if target column is present).
        """
        if not self._is_fitted or self.fitted_pipeline is None:
            raise RuntimeError("StartupDataPreprocessor must be fitted before calling transform().")

        cleaned_df = self.clean_raw_dataframe(df)
        X_matrix = self.fitted_pipeline.transform(cleaned_df)

        y_vector = None
        if self.target_column and self.target_column in cleaned_df.columns:
            y_vector = cleaned_df[self.target_column].values

        return X_matrix, y_vector

    def fit_transform(
        self,
        df: pd.DataFrame,
    ) -> Tuple[np.ndarray, Optional[np.ndarray], List[str]]:
        self.fit(df)
        X_matrix, y_vector = self.transform(df)
        return X_matrix, y_vector, self.output_feature_names

    def transform_to_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms input and returns a DataFrame with preserved column names.
        """
        X_matrix, _ = self.transform(df)
        return pd.DataFrame(X_matrix, columns=self.output_feature_names)

    def prepare_ml_dataset(
        self,
        df: pd.DataFrame,
        engineer_features: bool = True,
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        End-to-end preparation utility:
        1. Deduplicates startups by 'id'.
        2. Validates / constructs target 'is_failed' from 'status'.
        3. Executes non-leaking feature engineering.
        4. Isolates identifiers into a metadata DataFrame.
        5. Strips all target leakage and artifact columns.
        6. Audits remaining features to verify ZERO leakage remains.

        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: (ml_ready_df, metadata_df)
        """
        # 1. Deduplicate
        cleaned_df, _ = self.remove_duplicates(df)

        # 2. Ensure is_failed target
        if "status" in cleaned_df.columns and "is_failed" not in cleaned_df.columns:
            cleaned_df["is_failed"] = (cleaned_df["status"].str.strip().str.lower() == "closed").astype(int)

        # 3. Feature Engineering
        if engineer_features:
            cleaned_df = StartupFeatureEngineer.engineer_features(cleaned_df)

        # 4. Extract metadata (identifiers and tracking fields)
        meta_cols = [c for c in ["id", "name", "status", "city", "state_code", "category_code", "founded_at", "closed_at"] if c in cleaned_df.columns]
        metadata_df = cleaned_df[meta_cols].copy()

        # 5. Drop leakage, artifacts, and identifiers from ML feature frame
        drop_cols = set(KAGGLE_LEAKAGE_COLUMNS + KAGGLE_ARTIFACT_COLUMNS + KAGGLE_IDENTIFIER_COLUMNS)
        # Preserve is_failed as the designated target
        keep_cols = [c for c in cleaned_df.columns if c not in drop_cols or c == "is_failed"]
        ml_ready_df = cleaned_df[keep_cols].copy()

        # 6. Leakage Audit
        predictive_cols = [c for c in ml_ready_df.columns if c != "is_failed"]
        audit_result = TargetLeakageAuditor.audit_features(
            ml_ready_df,
            feature_columns=predictive_cols,
            target_column="is_failed",
        )
        if not audit_result["is_clean"]:
            raise ValueError(f"Target leakage audit failed! Details: {audit_result}")

        return ml_ready_df, metadata_df

    def save(self, filepath: Union[str, Path]) -> None:
        if not self._is_fitted:
            raise RuntimeError("Cannot save an unfitted preprocessor.")
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, filepath)
        logger.info(f"Saved preprocessor pipeline to {filepath}")

    @classmethod
    def load(cls, filepath: Union[str, Path]) -> "StartupDataPreprocessor":
        obj = joblib.load(filepath)
        if not isinstance(obj, cls):
            raise TypeError(f"Loaded object is of type {type(obj)}, expected {cls}.")
        return obj
