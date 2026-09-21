"""
Exploratory Data Analysis (EDA) Layer for Startup Failure Intelligence.

Provides schema-aware, reusable analytical functions for:
- Missing value profiling
- Duplicate profiling
- Descriptive statistical summaries (mean, median, std, skewness, kurtosis, IQR)
- Numerical distributions and quantile profiling
- Categorical frequency distributions
- Correlation analysis (Pearson/Spearman) with top feature pair ranking
- Target / outcome balance analysis (gracefully handles absence of outcome column)
- Grouped failure rate analysis across sectors and funding stages
"""

import logging
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


# =====================================================================
# Data Quality Profiling
# =====================================================================
def missing_value_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Summarizes missing values across all columns.
    """
    total_cells = df.size
    total_missing = int(df.isnull().sum().sum())
    overall_pct = round((total_missing / total_cells * 100.0) if total_cells > 0 else 0.0, 2)

    column_missing = {}
    for col in df.columns:
        cnt = int(df[col].isnull().sum())
        if cnt > 0:
            column_missing[col] = {
                "missing_count": cnt,
                "missing_percentage": round((cnt / len(df)) * 100.0, 2),
                "dtype": str(df[col].dtype),
            }

    return {
        "total_rows": len(df),
        "total_cells": total_cells,
        "total_missing_cells": total_missing,
        "overall_missing_percentage": overall_pct,
        "columns_with_missing_data": column_missing,
    }


def duplicate_summary(df: pd.DataFrame, subset: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Summarizes duplicate records in the dataset.
    """
    total_rows = len(df)
    duplicate_count = int(df.duplicated(subset=subset).sum())
    duplicate_pct = round((duplicate_count / total_rows * 100.0) if total_rows > 0 else 0.0, 2)

    return {
        "total_rows": total_rows,
        "duplicate_rows": duplicate_count,
        "duplicate_percentage": duplicate_pct,
        "subset_used": subset or "all_columns",
    }


# =====================================================================
# Distribution & Descriptive Summaries
# =====================================================================
def descriptive_statistics(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
) -> Dict[str, Dict[str, Any]]:
    """
    Calculates comprehensive parametric and non-parametric descriptive statistics
    for numerical columns: count, mean, std, min, 25%, 50% (median), 75%, max,
    IQR, skewness, and kurtosis.
    """
    numeric_df = df.select_dtypes(include=["number"])
    target_cols = columns or list(numeric_df.columns)

    stats_summary: Dict[str, Dict[str, Any]] = {}

    for col in target_cols:
        if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
            continue

        series = df[col].dropna()
        if series.empty:
            continue

        q25 = float(series.quantile(0.25))
        q75 = float(series.quantile(0.75))
        iqr = float(q75 - q25)

        stats_summary[col] = {
            "count": int(series.count()),
            "mean": round(float(series.mean()), 4),
            "std": round(float(series.std()), 4) if len(series) > 1 else 0.0,
            "min": round(float(series.min()), 4),
            "q25": round(q25, 4),
            "median": round(float(series.median()), 4),
            "q75": round(q75, 4),
            "max": round(float(series.max()), 4),
            "iqr": round(iqr, 4),
            "skewness": round(float(series.skew()), 4) if len(series) > 2 else 0.0,
            "kurtosis": round(float(series.kurt()), 4) if len(series) > 3 else 0.0,
        }

    return stats_summary


def numerical_distributions(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    bins: int = 10,
) -> Dict[str, Any]:
    """
    Computes histogram bin distributions and quantile summaries for numerical columns.
    Useful for feeding frontend charts without raw data exposure.
    """
    numeric_df = df.select_dtypes(include=["number"])
    target_cols = columns or list(numeric_df.columns)

    distributions: Dict[str, Any] = {}

    for col in target_cols:
        if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
            continue

        series = df[col].dropna()
        if series.empty:
            continue

        counts, bin_edges = np.histogram(series, bins=bins)

        quantiles = {
            "p05": round(float(series.quantile(0.05)), 2),
            "p25": round(float(series.quantile(0.25)), 2),
            "p50": round(float(series.quantile(0.50)), 2),
            "p75": round(float(series.quantile(0.75)), 2),
            "p95": round(float(series.quantile(0.95)), 2),
        }

        distributions[col] = {
            "bin_edges": [round(float(b), 2) for b in bin_edges],
            "counts": [int(c) for c in counts],
            "quantiles": quantiles,
        }

    return distributions


def categorical_distributions(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    top_n: int = 10,
) -> Dict[str, Any]:
    """
    Profiles cardinality and category distributions for non-numeric columns.
    """
    cat_df = df.select_dtypes(include=["object", "string", "category", "bool"])
    target_cols = columns or list(cat_df.columns)

    distributions: Dict[str, Any] = {}

    for col in target_cols:
        if col not in df.columns:
            continue

        series = df[col]
        total = len(series)
        val_counts = series.value_counts(dropna=False).head(top_n)

        top_categories = []
        for val, count in val_counts.items():
            label = "Missing (NaN)" if pd.isna(val) else str(val)
            pct = round((count / total) * 100.0, 2) if total > 0 else 0.0
            top_categories.append({"category": label, "count": int(count), "percentage": pct})

        distributions[col] = {
            "unique_count": int(series.nunique(dropna=True)),
            "missing_count": int(series.isnull().sum()),
            "top_categories": top_categories,
        }

    return distributions


# =====================================================================
# Correlation Analysis
# =====================================================================
def correlation_analysis(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    method: str = "pearson",
    top_pairs_count: int = 8,
) -> Dict[str, Any]:
    """
    Computes correlation matrix for numeric columns and identifies top correlated pairs.
    """
    numeric_df = df.select_dtypes(include=["number"])
    if columns:
        valid_cols = [c for c in columns if c in numeric_df.columns]
        numeric_df = numeric_df[valid_cols]

    if numeric_df.shape[1] < 2:
        return {
            "matrix": {},
            "top_correlated_pairs": [],
            "message": "Fewer than 2 numeric columns available for correlation analysis.",
        }

    corr_df = numeric_df.corr(method=method).round(4)
    corr_matrix = corr_df.to_dict()

    # Identify top unique pairs (excluding diagonal and symmetrical duplicates)
    pairs = []
    cols = list(corr_df.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1 = cols[i]
            col2 = cols[j]
            val = corr_df.loc[col1, col2]
            if not np.isnan(val):
                pairs.append({
                    "feature_1": col1,
                    "feature_2": col2,
                    "correlation": float(val),
                    "absolute_correlation": round(abs(float(val)), 4),
                })

    pairs.sort(key=lambda x: x["absolute_correlation"], reverse=True)

    return {
        "method": method,
        "matrix": corr_matrix,
        "top_correlated_pairs": pairs[:top_pairs_count],
    }


# =====================================================================
# Outcome & Failure-Specific Analysis
# =====================================================================
def target_distribution(
    df: pd.DataFrame,
    target_column: Optional[str] = "is_failed",
) -> Dict[str, Any]:
    """
    Profiles the target failure variable.
    Gracefully reports pending status if no target column is in the dataset.
    """
    if not target_column or target_column not in df.columns:
        return {
            "status": "pending_dataset",
            "has_target": False,
            "message": (
                f"Target column '{target_column}' is not present in the dataset. "
                "Outcome-specific failure analysis is pending ingestion of a historical outcome dataset."
            ),
        }

    series = df[target_column]
    total = len(series)
    val_counts = series.value_counts(dropna=False).to_dict()

    distribution = {}
    for val, count in val_counts.items():
        label = "Missing (NaN)" if pd.isna(val) else str(val)
        pct = round((count / total) * 100.0, 2) if total > 0 else 0.0
        distribution[label] = {"count": int(count), "percentage": pct}

    # Calculate failure rate if binary or recognizable status
    failure_rate = None
    if set(series.dropna().unique()).issubset({0, 1, True, False}):
        failed_count = int((series == 1).sum())
        failure_rate = round((failed_count / total) * 100.0, 2)

    return {
        "status": "ready",
        "has_target": True,
        "target_column": target_column,
        "total_records": total,
        "distribution": distribution,
        "failure_rate_percentage": failure_rate,
    }


def grouped_outcome_analysis(
    df: pd.DataFrame,
    group_by_column: str,
    target_column: str = "is_failed",
) -> Dict[str, Any]:
    """
    Analyzes failure rates grouped by a categorical dimension (e.g. industry_sector or funding_stage).
    """
    if target_column not in df.columns:
        return {
            "status": "pending_dataset",
            "message": f"Target column '{target_column}' not found.",
        }

    if group_by_column not in df.columns:
        return {
            "status": "error",
            "message": f"Grouping column '{group_by_column}' not found in dataset.",
        }

    grouped_results = []
    for group_name, group_data in df.groupby(group_by_column):
        total_in_group = len(group_data)
        if total_in_group == 0:
            continue

        failed_count = int((group_data[target_column] == 1).sum())
        failure_rate = round((failed_count / total_in_group) * 100.0, 2)

        record: Dict[str, Any] = {
            "group": str(group_name),
            "total_startups": total_in_group,
            "failed_startups": failed_count,
            "failure_rate_pct": failure_rate,
        }

        # Add mean funding or runway if columns are present
        if "funding_total_usd" in group_data.columns and pd.api.types.is_numeric_dtype(group_data["funding_total_usd"]):
            record["mean_funding_usd"] = round(float(group_data["funding_total_usd"].mean()), 2)
        if "runway_months" in group_data.columns and pd.api.types.is_numeric_dtype(group_data["runway_months"]):
            record["mean_runway_months"] = round(float(group_data["runway_months"].mean()), 2)

        grouped_results.append(record)

    # Sort descending by failure rate
    grouped_results.sort(key=lambda x: x["failure_rate_pct"], reverse=True)

    return {
        "status": "ready",
        "group_by": group_by_column,
        "groups_count": len(grouped_results),
        "results": grouped_results,
    }


# =====================================================================
# Comprehensive Master EDA Report
# =====================================================================
def generate_comprehensive_eda_report(
    df: pd.DataFrame,
    target_column: Optional[str] = "is_failed",
) -> Dict[str, Any]:
    """
    Compiles an end-to-end Exploratory Data Analysis report.
    """
    missing_report = missing_value_summary(df)
    duplicate_report = duplicate_summary(df)
    stats_report = descriptive_statistics(df)
    num_distributions = numerical_distributions(df)
    cat_distributions = categorical_distributions(df)
    corr_report = correlation_analysis(df)
    target_report = target_distribution(df, target_column=target_column)

    report = {
        "dataset_shape": {"rows": len(df), "columns": len(df.columns)},
        "data_quality": {
            "missing_values": missing_report,
            "duplicates": duplicate_report,
        },
        "descriptive_statistics": stats_report,
        "numerical_distributions": num_distributions,
        "categorical_distributions": cat_distributions,
        "correlation_analysis": corr_report,
        "target_analysis": target_report,
    }

    # If target is available, run grouped analysis on top categorical fields
    if target_report.get("has_target"):
        grouped_analyses = {}
        for candidate in ["industry_sector", "funding_stage", "country_code"]:
            if candidate in df.columns:
                grouped_analyses[candidate] = grouped_outcome_analysis(
                    df, group_by_column=candidate, target_column=target_column or "is_failed"
                )
        report["grouped_outcome_analyses"] = grouped_analyses

    return report
