"""
Pydantic Schemas for Startup Failure Prediction & Inference API.

Defines:
- Input contract based strictly on real startup_ml_ready.csv features
- Target leakage rejection validator (forbids status, labels, closed_at)
- Model status and diagnostic response schemas
- Prediction output schema with failure probability and risk band interpretation
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field, model_validator


# =====================================================================
# Status & Risk Level Enums
# =====================================================================
class ModelStatusEnum(str, Enum):
    MODEL_AVAILABLE = "MODEL_AVAILABLE"
    MODEL_NOT_AVAILABLE = "MODEL_NOT_AVAILABLE"


class RiskLevelEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


# =====================================================================
# Input Contracts
# =====================================================================
FORBIDDEN_LEAKAGE_KEYS: Set[str] = {
    "status",
    "labels",
    "closed_at",
    "is_closed",
    "outcome",
    "target",
}


class PredictionFeatureInput(BaseModel):
    """
    Input schema containing pre-outcome predictive features.
    Derived strictly from the real Kaggle startup dataset (startup_ml_ready.csv).
    Does NOT accept post-outcome variables or target leakage fields.
    """

    # 1. Capital & Financing Metrics
    funding_total_usd: float = Field(
        default=0.0,
        ge=0.0,
        description="Total cumulative venture capital raised in USD.",
    )
    funding_rounds: int = Field(
        default=1,
        ge=1,
        description="Total count of financing rounds closed.",
    )
    avg_participants: float = Field(
        default=1.0,
        ge=0.0,
        description="Average number of participating investors per funding round.",
    )

    # 2. Traction, Team & Milestones
    relationships: int = Field(
        default=1,
        ge=0,
        description="Number of verified founder, executive, and investor connections.",
    )
    milestones: int = Field(
        default=0,
        ge=0,
        description="Total business, product, or operational milestones achieved.",
    )
    age_first_milestone_year: Optional[float] = Field(
        default=0.0,
        description="Startup age (years) when first milestone was achieved (0 if no milestones).",
    )
    age_last_milestone_year: Optional[float] = Field(
        default=0.0,
        description="Startup age (years) when final milestone was achieved (0 if no milestones).",
    )

    # 3. Temporal Lifecycles
    age_first_funding_year: float = Field(
        default=1.0,
        description="Startup age (years) at initial venture funding round.",
    )
    age_last_funding_year: float = Field(
        default=1.0,
        description="Startup age (years) at most recent venture funding round.",
    )

    # 4. Geography & Sector Categoricals
    category_code: str = Field(
        default="software",
        description="Operating domain sector (e.g. software, biotech, ecommerce, web).",
    )
    state_code: str = Field(
        default="CA",
        description="Two-letter US state code of headquarters (e.g. CA, NY, MA, TX).",
    )
    latitude: float = Field(
        default=37.7749,
        description="Headquarters geographic latitude.",
    )
    longitude: float = Field(
        default=-122.4194,
        description="Headquarters geographic longitude.",
    )

    # 5. Financing Stage & Entity Indicators (0 or 1)
    has_VC: int = Field(default=0, ge=0, le=1, description="1 if backed by venture capital firms, else 0.")
    has_angel: int = Field(default=0, ge=0, le=1, description="1 if backed by angel investors, else 0.")
    has_roundA: int = Field(default=0, ge=0, le=1, description="1 if startup raised Series A, else 0.")
    has_roundB: int = Field(default=0, ge=0, le=1, description="1 if startup raised Series B, else 0.")
    has_roundC: int = Field(default=0, ge=0, le=1, description="1 if startup raised Series C, else 0.")
    has_roundD: int = Field(default=0, ge=0, le=1, description="1 if startup raised Series D, else 0.")
    is_top500: int = Field(default=0, ge=0, le=1, description="1 if ranked among Top 500 entities, else 0.")

    # Optional pre-calculated engineered features (auto-calculated if omitted)
    funding_duration_years: Optional[float] = None
    funding_per_round_usd: Optional[float] = None
    funding_stages_count: Optional[int] = None
    investor_diversity_score: Optional[int] = None
    has_milestone: Optional[int] = None
    milestone_duration_years: Optional[float] = None
    relationships_per_year: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def check_for_target_leakage(cls, data: Any) -> Any:
        """
        Rejects payload if any forbidden target leakage keys are present.
        """
        if isinstance(data, dict):
            for k in data.keys():
                if k.strip().lower() in FORBIDDEN_LEAKAGE_KEYS:
                    raise ValueError(
                        f"Target leakage violation: field '{k}' is forbidden in prediction feature inputs. "
                        "Do not pass final outcomes or closure dates to predictive models."
                    )
        return data


class StartupMetadataInput(BaseModel):
    """
    Informational context about the startup (retained for UI/logging, excluded from ML features).
    """
    startup_id: Optional[str] = Field(default=None, description="Startup entity ID (e.g. c:6669)")
    name: Optional[str] = Field(default=None, description="Startup legal or trade name")
    city: Optional[str] = Field(default=None, description="Headquarters city")


class StartupFailurePredictionRequest(BaseModel):
    """
    Complete request envelope for startup failure risk scoring.
    """
    features: PredictionFeatureInput
    metadata: Optional[StartupMetadataInput] = None


# =====================================================================
# Output Contracts
# =====================================================================
class ModelStatusResponse(BaseModel):
    """
    Reports the operational availability of the trained machine learning model.
    """
    model_available: bool
    status: ModelStatusEnum
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    model_path: str
    preprocessor_path: str
    message: str
    metadata: Optional[Dict[str, Any]] = None


class StartupFailurePredictionResponse(BaseModel):
    """
    Structured failure prediction output.
    When model_available is False, probability and outcome fields are None.
    """
    model_available: bool
    status: ModelStatusEnum
    startup_id: Optional[str] = None
    startup_name: Optional[str] = None
    predicted_outcome: Optional[str] = None        # "closed" (failure) | "acquired" (survived)
    is_failed: Optional[int] = None                # 1 = closed, 0 = acquired
    failure_probability: Optional[float] = None    # 0.0 to 1.0
    survival_probability: Optional[float] = None   # 0.0 to 1.0
    risk_level: Optional[RiskLevelEnum] = None     # Low, Medium, High, Critical
    risk_interpretation: Optional[str] = None      # Application heuristic band explanation
    model_version: Optional[str] = None
    explanation_available: bool = False
    message: Optional[str] = None
