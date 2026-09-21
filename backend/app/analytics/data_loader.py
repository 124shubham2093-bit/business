"""
Data Loading Layer for Startup Failure Intelligence Platform.

Handles:
- Loading structured startup datasets (CSV / file-like buffers)
- Column validation against configurable schemas
- Dataset profiling (shape, dtypes, missing values, duplicates)
- Documented target schema for later Machine Learning stages
- Integration with the real Kaggle Startup Outcome Dataset (startup_data.csv)
- Separation of predictive features from target leakage and identifiers
- Development/testing fixtures clearly segregated from real training data
"""

from dataclasses import dataclass, field
from io import StringIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import logging
import pandas as pd

logger = logging.getLogger(__name__)


# =====================================================================
# Real Kaggle Startup Dataset Schema Definition & Constants
# =====================================================================
KAGGLE_STARTUP_DATASET_PATH = (
    Path(__file__).resolve().parent.parent.parent / "data" / "startup_data.csv"
)

# Columns that MUST NOT enter predictive feature matrix because they leak the outcome:
# - 'status': the raw outcome ('acquired' / 'closed')
# - 'labels': original Kaggle binary label (1=acquired, 0=closed), exactly 1 - is_failed
# - 'closed_at': closure date, populated for 99% of closed startups and NaN for active/acquired
KAGGLE_LEAKAGE_COLUMNS: List[str] = [
    "status",
    "labels",
    "closed_at",
]

# Non-informative CSV index/artifacts and exact duplicate columns:
KAGGLE_ARTIFACT_COLUMNS: List[str] = [
    "Unnamed: 0",
    "Unnamed: 6",
    "object_id",      # 100% identical duplicate of 'id'
    "state_code.1",   # 100% duplicate of 'state_code' (except 1 null row)
]

# Startup identifiers and raw text metadata (retained for indexing/joins, excluded from ML features):
KAGGLE_IDENTIFIER_COLUMNS: List[str] = [
    "id",
    "name",
    "city",
    "zip_code",
    "founded_at",
    "first_funding_at",
    "last_funding_at",
]

# Pre-outcome numerical features available in the real Kaggle dataset:
KAGGLE_PREDICTIVE_NUMERIC_COLUMNS: List[str] = [
    "funding_total_usd",
    "funding_rounds",
    "relationships",
    "milestones",
    "age_first_funding_year",
    "age_last_funding_year",
    "age_first_milestone_year",
    "age_last_milestone_year",
    "avg_participants",
    "latitude",
    "longitude",
]

# Pre-outcome categorical features:
KAGGLE_PREDICTIVE_CATEGORICAL_COLUMNS: List[str] = [
    "category_code",
    "state_code",
]

# Pre-outcome binary/indicator features already present in the dataset:
KAGGLE_PREDICTIVE_BINARY_COLUMNS: List[str] = [
    "has_VC",
    "has_angel",
    "has_roundA",
    "has_roundB",
    "has_roundC",
    "has_roundD",
    "is_top500",
    "is_CA",
    "is_NY",
    "is_MA",
    "is_TX",
    "is_otherstate",
    "is_software",
    "is_web",
    "is_mobile",
    "is_enterprise",
    "is_advertising",
    "is_gamesvideo",
    "is_ecommerce",
    "is_biotech",
    "is_consulting",
    "is_othercategory",
]

# Fields from Step 1 conceptual schema that are NOT available in this Kaggle dataset
# (documented explicitly so no synthetic variables are manufactured):
UNAVAILABLE_CONCEPTUAL_FIELDS: List[str] = [
    "burn_rate_monthly",
    "runway_months",
    "revenue_annual",
    "valuation_usd",
    "team_size",  # partially proxied by 'relationships'
]


# =====================================================================
# Target Dataset Schema Definition for Startup Failure Intelligence
# =====================================================================
EXPECTED_ML_FEATURE_COLUMNS: List[str] = [
    "funding_total_usd",
    "funding_rounds",
    "relationships",
    "milestones",
    "age_first_funding_year",
    "age_last_funding_year",
    "age_first_milestone_year",
    "age_last_milestone_year",
    "avg_participants",
    "category_code",
    "state_code",
    "has_VC",
    "has_angel",
    "has_roundA",
    "has_roundB",
    "has_roundC",
    "has_roundD",
    "is_top500",
]

TARGET_CANDIDATES: Set[str] = {
    "is_failed",
    "failed",
    "status",
    "outcome",
    "label",
    "target",
}


# =====================================================================
# Custom Exceptions
# =====================================================================
class DatasetError(Exception):
    """Base exception for data loading and validation errors."""
    pass


class DatasetNotFoundError(DatasetError):
    """Raised when the specified dataset path does not exist."""
    pass


class EmptyDatasetError(DatasetError):
    """Raised when the dataset contains zero records."""
    pass


class MissingColumnsError(DatasetError):
    """Raised when required schema columns are absent from the dataset."""
    def __init__(self, missing_cols: List[str], available_cols: List[str]):
        self.missing_cols = missing_cols
        self.available_cols = available_cols
        super().__init__(
            f"Dataset is missing required columns: {missing_cols}. "
            f"Available columns are: {available_cols}"
        )


class TargetDefinitionError(DatasetError):
    """Raised when an invalid target status is encountered."""
    pass


# =====================================================================
# Metadata and Validation Models
# =====================================================================
@dataclass
class DatasetMetadata:
    """Statistical and structural summary of a loaded dataset."""
    total_rows: int
    total_columns: int
    columns: List[str]
    dtypes: Dict[str, str]
    missing_counts: Dict[str, int]
    missing_percentages: Dict[str, float]
    duplicate_rows: int
    detected_target_column: Optional[str]
    detected_numeric_columns: List[str]
    detected_categorical_columns: List[str]
    has_target: bool = field(init=False)

    def __post_init__(self):
        self.has_target = self.detected_target_column is not None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_rows": self.total_rows,
            "total_columns": self.total_columns,
            "columns": self.columns,
            "dtypes": self.dtypes,
            "missing_counts": self.missing_counts,
            "missing_percentages": self.missing_percentages,
            "duplicate_rows": self.duplicate_rows,
            "has_target": self.has_target,
            "detected_target_column": self.detected_target_column,
            "detected_numeric_columns": self.detected_numeric_columns,
            "detected_categorical_columns": self.detected_categorical_columns,
        }


# =====================================================================
# Data Loader Implementation
# =====================================================================
class StartupDataLoader:
    """
    Reusable data loading and schema validation layer for startup data.
    Provides verified ingestion of the real Kaggle startup dataset.
    """

    @staticmethod
    def load_csv(
        source: Union[str, Path, StringIO],
        required_columns: Optional[List[str]] = None,
        target_column: Optional[str] = None,
        **pandas_kwargs: Any,
    ) -> pd.DataFrame:
        """
        Load a CSV file or buffer into a Pandas DataFrame and validate schema.
        """
        if isinstance(source, (str, Path)):
            path_obj = Path(source)
            if not path_obj.exists():
                raise DatasetNotFoundError(f"Dataset file not found at: {path_obj.resolve()}")

        try:
            df = pd.read_csv(source, **pandas_kwargs)
        except pd.errors.EmptyDataError:
            raise EmptyDatasetError("The provided dataset source contains no data or headers.")
        except Exception as exc:
            raise DatasetError(f"Failed to parse CSV dataset: {str(exc)}") from exc

        if df.empty:
            raise EmptyDatasetError("Dataset was loaded but contains zero rows.")

        if required_columns:
            StartupDataLoader.validate_columns(df, required_columns)

        if target_column and target_column not in df.columns:
            raise MissingColumnsError([target_column], list(df.columns))

        return df

    @staticmethod
    def create_target(
        df: pd.DataFrame,
        status_column: str = "status",
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Creates the binary 'is_failed' target variable based strictly on the status column:
        - status == 'closed'   -> is_failed = 1 (Failure)
        - status == 'acquired' -> is_failed = 0 (Successful outcome)

        Returns:
            Tuple[pd.DataFrame, pd.Series]: (DataFrame with 'is_failed' column added, target Series)
        """
        if status_column not in df.columns:
            raise MissingColumnsError([status_column], list(df.columns))

        normalized_status = df[status_column].astype(str).str.strip().str.lower()
        valid_statuses = {"closed", "acquired"}
        actual_statuses = set(normalized_status.unique())
        invalid = actual_statuses - valid_statuses
        if invalid:
            raise TargetDefinitionError(
                f"Encountered unexpected status values: {invalid}. "
                f"Expected only {valid_statuses}."
            )

        df_out = df.copy()
        target_series = (normalized_status == "closed").astype(int)
        df_out["is_failed"] = target_series

        return df_out, target_series

    @staticmethod
    def load_kaggle_dataset(
        filepath: Optional[Union[str, Path]] = None,
        deduplicate: bool = True,
    ) -> pd.DataFrame:
        """
        Loads the real Kaggle Startup Success/Failure dataset (startup_data.csv),
        validates its shape, formats the binary target 'is_failed', and optionally
        removes confirmed duplicate startup records.

        Args:
            filepath: Path to startup_data.csv (defaults to backend/data/startup_data.csv)
            deduplicate: If True, removes exact startup duplicates by 'id' (default: True)

        Returns:
            pd.DataFrame: Cleaned DataFrame with 'is_failed' target column
        """
        csv_path = Path(filepath) if filepath else KAGGLE_STARTUP_DATASET_PATH
        if not csv_path.exists():
            raise DatasetNotFoundError(f"Kaggle startup dataset not found at {csv_path.resolve()}")

        df = StartupDataLoader.load_csv(csv_path)

        # Create target
        df, _ = StartupDataLoader.create_target(df, status_column="status")

        # Deduplicate if requested
        if deduplicate and "id" in df.columns:
            initial_count = len(df)
            df = df.drop_duplicates(subset=["id"], keep="first").copy()
            dropped = initial_count - len(df)
            if dropped > 0:
                logger.info(f"Deduplicated Kaggle dataset: dropped {dropped} row(s). Final rows: {len(df)}")

        return df

    @staticmethod
    def partition_features(df: pd.DataFrame) -> Dict[str, List[str]]:
        """
        Partitions DataFrame columns into distinct analytical roles to prevent target leakage:
        - target: ['is_failed']
        - leakage: ['status', 'labels', 'closed_at']
        - identifiers_artifacts: ['id', 'name', 'city', 'zip_code', 'Unnamed: 0', ...]
        - predictive_features: all valid pre-outcome predictive variables
        """
        all_cols = set(df.columns)
        target = ["is_failed"] if "is_failed" in all_cols else []
        leakage = [c for c in KAGGLE_LEAKAGE_COLUMNS if c in all_cols]
        artifacts = [c for c in KAGGLE_ARTIFACT_COLUMNS if c in all_cols]
        identifiers = [c for c in KAGGLE_IDENTIFIER_COLUMNS if c in all_cols]

        excluded = set(target + leakage + artifacts + identifiers)
        predictive = [c for c in df.columns if c not in excluded]

        return {
            "target": target,
            "leakage": leakage,
            "artifacts": artifacts,
            "identifiers": identifiers,
            "predictive_features": predictive,
        }

    @staticmethod
    def validate_columns(df: pd.DataFrame, required_columns: List[str]) -> List[str]:
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise MissingColumnsError(missing, list(df.columns))
        return required_columns

    @staticmethod
    def detect_target_column(
        df: pd.DataFrame,
        candidates: Optional[Set[str]] = None,
    ) -> Optional[str]:
        search_set = candidates or TARGET_CANDIDATES
        for col in df.columns:
            if col.strip().lower() in search_set:
                return col
        return None

    @staticmethod
    def inspect(
        df: pd.DataFrame,
        target_column: Optional[str] = None,
    ) -> DatasetMetadata:
        total_rows = len(df)
        total_columns = len(df.columns)
        columns = list(df.columns)
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

        missing_counts = df.isnull().sum().to_dict()
        missing_percentages = {
            col: round((count / total_rows) * 100.0, 2)
            for col, count in missing_counts.items()
        }
        duplicate_rows = int(df.duplicated().sum())

        detected_target = target_column or StartupDataLoader.detect_target_column(df)

        numeric_cols = list(df.select_dtypes(include=["number"]).columns)
        categorical_cols = list(df.select_dtypes(include=["object", "string", "category", "bool"]).columns)

        if detected_target:
            if detected_target in numeric_cols:
                numeric_cols.remove(detected_target)
            if detected_target in categorical_cols:
                categorical_cols.remove(detected_target)

        return DatasetMetadata(
            total_rows=total_rows,
            total_columns=total_columns,
            columns=columns,
            dtypes=dtypes,
            missing_counts=missing_counts,
            missing_percentages=missing_percentages,
            duplicate_rows=duplicate_rows,
            detected_target_column=detected_target,
            detected_numeric_columns=numeric_cols,
            detected_categorical_columns=categorical_cols,
        )

    @staticmethod
    def get_development_sample_fixture() -> pd.DataFrame:
        logger.warning(
            "[FIXTURE NOTICE] Loaded development test fixture. "
            "This fixture is for software pipeline testing only and NOT real-world training data."
        )
        data = {
            "startup_id": [f"DEV-FIXTURE-{i:03d}" for i in range(1, 11)],
            "name": [
                "DevTest Alpha", "DevTest Beta", "DevTest Gamma", "DevTest Delta", "DevTest Epsilon",
                "DevTest Zeta", "DevTest Eta", "DevTest Theta", "DevTest Iota", "DevTest Kappa"
            ],
            "funding_total_usd": [
                1500000.0, 450000.0, 8200000.0, 200000.0, 3100000.0,
                1200000.0, 600000.0, 9500000.0, 180000.0, 4200000.0
            ],
            "funding_rounds": [2, 1, 3, 1, 2, 2, 1, 4, 1, 3],
            "burn_rate_monthly": [
                90000.0, 45000.0, 250000.0, 30000.0, 140000.0,
                80000.0, 50000.0, 310000.0, 35000.0, 160000.0
            ],
            "runway_months": [
                16.6, 10.0, 32.8, 6.6, 22.1,
                15.0, 12.0, 30.6, 5.1, 26.2
            ],
            "team_size": [12, 4, 45, 3, 18, 10, 5, 52, 2, 24],
            "industry_sector": [
                "SaaS", "FinTech", "BioTech", "DevTools", "SaaS",
                "FinTech", "DevTools", "BioTech", "EdTech", "SaaS"
            ],
            "is_failed": [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
        }
        return pd.DataFrame(data)
