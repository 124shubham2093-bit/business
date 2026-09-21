"""
FastAPI Router for Startup Failure Historical Analytics.

Provides structured descriptive analytics computed directly from the cleaned
Kaggle Startup Outcome dataset (startup_ml_ready.csv / startup_data.csv).

Endpoints:
- GET /api/analytics/failure-intelligence : Returns dataset totals, sector failure rates,
  funding stage failure distributions, milestone/relationship outcome contrasts,
  and statistical feature correlations.
- GET /api/analytics/plots/{plot_name} : Serves diagnostic EDA visualization plots.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.analytics.data_loader import StartupDataLoader, KAGGLE_STARTUP_DATASET_PATH
from app.analytics.eda import (
    target_distribution,
    grouped_outcome_analysis,
)
from app.analytics.statistics import calculate_feature_correlations

router = APIRouter()

# Directory paths
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
ML_READY_CSV_PATH = DATA_DIR / "startup_ml_ready.csv"
EDA_PLOTS_DIR = DATA_DIR / "eda_plots"

# In-memory cache for analytics payload
_cached_analytics_payload: Optional[Dict[str, Any]] = None


def _compute_failure_intelligence() -> Dict[str, Any]:
    """
    Computes structured historical failure analytics directly from the verified dataset.
    Uses StartupDataLoader and EDA / statistics modules.
    """
    # Load dataset
    if ML_READY_CSV_PATH.exists():
        df = pd.read_csv(ML_READY_CSV_PATH)
    else:
        df = StartupDataLoader.load_kaggle_dataset()

    total_records = len(df)
    closed_count = int((df["is_failed"] == 1).sum())
    acquired_count = int((df["is_failed"] == 0).sum())
    historical_closure_rate = round(closed_count / total_records, 4) if total_records > 0 else 0.0
    base_rate_pct = round(historical_closure_rate * 100.0, 2)

    # 1. Failure rate by category (Filter to categories with >= 8 startups for statistical validity)
    cat_results = []
    for cat, group in df.groupby("category_code"):
        total_in_cat = len(group)
        if total_in_cat >= 8:
            failed_in_cat = int((group["is_failed"] == 1).sum())
            acquired_in_cat = total_in_cat - failed_in_cat
            failure_pct = round((failed_in_cat / total_in_cat) * 100.0, 2)
            mean_funding = round(float(group["funding_total_usd"].mean()), 2)
            cat_results.append({
                "category": str(cat).replace("_", " ").title(),
                "category_key": str(cat),
                "total_startups": total_in_cat,
                "closed_startups": failed_in_cat,
                "acquired_startups": acquired_in_cat,
                "failure_rate_pct": failure_pct,
                "survival_rate_pct": round(100.0 - failure_pct, 2),
                "mean_funding_usd": mean_funding,
            })
    # Sort descending by failure rate
    cat_results.sort(key=lambda x: x["failure_rate_pct"], reverse=True)

    # 2. Failure rate by funding stage
    stage_definitions = [
        ("Angel Backed", "has_angel", "Early stage angel backing"),
        ("VC Backed", "has_VC", "Institutional venture capital backing"),
        ("Series A Closed", "has_roundA", "Completed Series A round"),
        ("Series B Closed", "has_roundB", "Completed Series B round"),
        ("Series C Closed", "has_roundC", "Completed Series C expansion"),
        ("Series D+ Closed", "has_roundD", "Late stage Series D or higher"),
    ]
    stage_results = []
    for label, col_name, desc in stage_definitions:
        if col_name in df.columns:
            subset = df[df[col_name] == 1]
            total_in_stage = len(subset)
            if total_in_stage > 0:
                failed_in_stage = int((subset["is_failed"] == 1).sum())
                acquired_in_stage = total_in_stage - failed_in_stage
                failure_pct = round((failed_in_stage / total_in_stage) * 100.0, 2)
                stage_results.append({
                    "stage": label,
                    "column": col_name,
                    "description": desc,
                    "total_startups": total_in_stage,
                    "closed_startups": failed_in_stage,
                    "acquired_startups": acquired_in_stage,
                    "failure_rate_pct": failure_pct,
                    "survival_rate_pct": round(100.0 - failure_pct, 2),
                })

    # 3. Relationships and milestones by outcome (Acquired vs Closed)
    outcome_comparison = []
    for outcome_label, outcome_val in [("Acquired", 0), ("Closed", 1)]:
        subset = df[df["is_failed"] == outcome_val]
        count = len(subset)
        outcome_comparison.append({
            "outcome": outcome_label,
            "is_failed": outcome_val,
            "count": count,
            "percentage_of_total": round((count / total_records) * 100.0, 2),
            "mean_relationships": round(float(subset["relationships"].mean()), 2) if "relationships" in subset.columns else 0.0,
            "median_relationships": round(float(subset["relationships"].median()), 2) if "relationships" in subset.columns else 0.0,
            "mean_milestones": round(float(subset["milestones"].mean()), 2) if "milestones" in subset.columns else 0.0,
            "median_milestones": round(float(subset["milestones"].median()), 2) if "milestones" in subset.columns else 0.0,
            "mean_funding_usd": round(float(subset["funding_total_usd"].mean()), 2) if "funding_total_usd" in subset.columns else 0.0,
            "median_funding_usd": round(float(subset["funding_total_usd"].median()), 2) if "funding_total_usd" in subset.columns else 0.0,
            "mean_funding_rounds": round(float(subset["funding_rounds"].mean()), 2) if "funding_rounds" in subset.columns else 0.0,
            "mean_funding_duration_years": round(float(subset["funding_duration_years"].mean()), 2) if "funding_duration_years" in subset.columns else 0.0,
        })

    # 4. Feature Correlations with Target (is_failed)
    stat_corr = calculate_feature_correlations(df, target_column="is_failed")
    correlations_list = []
    if "correlations" in stat_corr:
        for item in stat_corr["correlations"]:
            # Clean up feature name for display
            feat_raw = item["feature"]
            readable_name = feat_raw.replace("_", " ").title()
            direction = "Elevated Failure Association" if item["correlation"] > 0 else "Protective Association"
            correlations_list.append({
                "feature": feat_raw,
                "display_name": readable_name,
                "correlation": round(float(item["correlation"]), 4),
                "absolute_correlation": round(abs(float(item["correlation"])), 4),
                "p_value": float(item["p_value"]),
                "is_significant": bool(item.get("is_significant", True)),
                "direction": direction,
            })

    # 5. Methodological & integrity metadata
    methodology = {
        "dataset_source": "Kaggle Crunchbase Startup Success / Failure Dataset",
        "sample_size": total_records,
        "historical_scope": "Venture entities with verified binary outcomes (acquired or closed)",
        "target_definition": "is_failed = 1 for closed startups, is_failed = 0 for acquired startups",
        "notes": [
            "This section presents historical descriptive analytics from 922 clean startup records.",
            "All correlations reflect observed historical patterns and do NOT prove causality.",
            "Historical failure rates must not be conflated with individual startup prediction probabilities.",
            "Supervised ML failure prediction operates as a separate inference subsystem requiring trained model weights.",
        ],
    }

    return {
        "dataset": {
            "total_startups": total_records,
            "acquired": acquired_count,
            "closed": closed_count,
            "historical_closure_rate": historical_closure_rate,
            "base_rate_percentage": base_rate_pct,
        },
        "by_category": cat_results,
        "by_funding_stage": stage_results,
        "relationships_and_milestones_by_outcome": outcome_comparison,
        "correlations": correlations_list,
        "methodology": methodology,
    }


@router.get(
    "/analytics/failure-intelligence",
    summary="Get Historical Startup Failure Analytics",
    description="Returns verified historical failure statistics, distributions, and correlations from the clean Kaggle dataset.",
)
async def get_failure_intelligence():
    """
    Returns structured failure analytics computed directly from startup_ml_ready.csv.
    """
    global _cached_analytics_payload
    if _cached_analytics_payload is None:
        _cached_analytics_payload = _compute_failure_intelligence()
    return _cached_analytics_payload


@router.get(
    "/analytics/plots/{plot_name}",
    summary="Get Diagnostic EDA Plot Image",
    description="Returns pre-generated PNG diagnostic plots from backend/data/eda_plots/.",
)
async def get_eda_plot(plot_name: str):
    """
    Serves static EDA PNG plots (e.g. outcome_distribution.png, failure_rate_by_category.png).
    """
    if not plot_name.endswith(".png"):
        plot_name = f"{plot_name}.png"

    plot_file = EDA_PLOTS_DIR / plot_name
    if not plot_file.exists() or not plot_file.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnostic plot '{plot_name}' not found.",
        )
    return FileResponse(path=plot_file, media_type="image/png")
