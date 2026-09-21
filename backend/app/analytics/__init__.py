"""
Analytics Foundation Package for Startup Failure Intelligence Platform.

Provides:
- Data Loading & Schema Validation (StartupDataLoader, DatasetMetadata)
- Cleaning, Leakage Auditing & Preprocessing Pipelines (StartupDataPreprocessor, StartupFeatureEngineer, TargetLeakageAuditor)
- Exploratory Data Analysis (EDA functions)
- Defensible Statistical Analysis (Hypothesis testing, correlations, Chi-Square)
"""

from .data_loader import (
    StartupDataLoader,
    DatasetMetadata,
    DatasetError,
    DatasetNotFoundError,
    EmptyDatasetError,
    MissingColumnsError,
    TargetDefinitionError,
    KAGGLE_STARTUP_DATASET_PATH,
    KAGGLE_LEAKAGE_COLUMNS,
    KAGGLE_ARTIFACT_COLUMNS,
    KAGGLE_IDENTIFIER_COLUMNS,
    KAGGLE_PREDICTIVE_NUMERIC_COLUMNS,
    KAGGLE_PREDICTIVE_CATEGORICAL_COLUMNS,
    KAGGLE_PREDICTIVE_BINARY_COLUMNS,
    UNAVAILABLE_CONCEPTUAL_FIELDS,
    EXPECTED_ML_FEATURE_COLUMNS,
    TARGET_CANDIDATES,
)
from .preprocessing import (
    StartupDataPreprocessor,
    StartupFeatureEngineer,
    TargetLeakageAuditor,
    CurrencyAndNumericParser,
)
from .eda import (
    missing_value_summary,
    duplicate_summary,
    descriptive_statistics,
    numerical_distributions,
    categorical_distributions,
    correlation_analysis,
    target_distribution,
    grouped_outcome_analysis,
    generate_comprehensive_eda_report,
)
from .statistics import (
    calculate_feature_correlations,
    compare_groups_ttest,
    compare_groups_mann_whitney,
    categorical_association_chi2,
    generate_comprehensive_statistical_report,
)

__all__ = [
    # Data Loading & Schema Constants
    "StartupDataLoader",
    "DatasetMetadata",
    "DatasetError",
    "DatasetNotFoundError",
    "EmptyDatasetError",
    "MissingColumnsError",
    "TargetDefinitionError",
    "KAGGLE_STARTUP_DATASET_PATH",
    "KAGGLE_LEAKAGE_COLUMNS",
    "KAGGLE_ARTIFACT_COLUMNS",
    "KAGGLE_IDENTIFIER_COLUMNS",
    "KAGGLE_PREDICTIVE_NUMERIC_COLUMNS",
    "KAGGLE_PREDICTIVE_CATEGORICAL_COLUMNS",
    "KAGGLE_PREDICTIVE_BINARY_COLUMNS",
    "UNAVAILABLE_CONCEPTUAL_FIELDS",
    "EXPECTED_ML_FEATURE_COLUMNS",
    "TARGET_CANDIDATES",
    # Preprocessing & Leakage Auditing
    "StartupDataPreprocessor",
    "StartupFeatureEngineer",
    "TargetLeakageAuditor",
    "CurrencyAndNumericParser",
    # EDA
    "missing_value_summary",
    "duplicate_summary",
    "descriptive_statistics",
    "numerical_distributions",
    "categorical_distributions",
    "correlation_analysis",
    "target_distribution",
    "grouped_outcome_analysis",
    "generate_comprehensive_eda_report",
    # Statistics
    "calculate_feature_correlations",
    "compare_groups_ttest",
    "compare_groups_mann_whitney",
    "categorical_association_chi2",
    "generate_comprehensive_statistical_report",
]
