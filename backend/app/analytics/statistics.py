"""
Defensible Statistical Analysis Layer for Startup Failure Intelligence.

Implements rigorous hypothesis testing and correlation analysis:
- Pearson / Spearman correlation with two-tailed p-values
- Welch's two-sample t-test (handles unequal variances)
- Mann-Whitney U test (non-parametric, robust to skewed financial metrics)
- Chi-Square test of independence with Cramer's V effect size
- Explicit assumption verification before running tests (never manufactures results)
- Plain-language statistical interpretations for decision-makers
"""

import logging
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats

logger = logging.getLogger(__name__)


# =====================================================================
# Correlation with P-Value Significance
# =====================================================================
def calculate_feature_correlations(
    df: pd.DataFrame,
    target_column: str = "is_failed",
    method: str = "pearson",
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Computes correlation between numerical features and the outcome variable,
    along with exact two-tailed p-values and significance flags.
    """
    if target_column not in df.columns:
        return {
            "status": "pending_dataset",
            "message": f"Target column '{target_column}' not found. Cannot calculate target correlations.",
        }

    target_series = pd.to_numeric(df[target_column], errors="coerce")
    if target_series.dropna().nunique() < 2:
        return {
            "status": "error",
            "message": f"Target column '{target_column}' must have at least 2 distinct values.",
        }

    numeric_cols = [
        c for c in df.select_dtypes(include=["number"]).columns
        if c != target_column
    ]

    results = []
    for col in numeric_cols:
        col_series = pd.to_numeric(df[col], errors="coerce")
        valid_mask = col_series.notnull() & target_series.notnull()
        x = col_series[valid_mask]
        y = target_series[valid_mask]

        if len(x) < 5 or x.nunique() <= 1:
            continue

        try:
            if method == "spearman":
                res = stats.spearmanr(x, y)
                corr_val = float(res.statistic)
                p_val = float(res.pvalue)
            else:
                res = stats.pearsonr(x, y)
                corr_val = float(res.statistic)
                p_val = float(res.pvalue)

            is_significant = bool(p_val < alpha)
            results.append({
                "feature": col,
                "correlation": round(corr_val, 4),
                "absolute_correlation": round(abs(corr_val), 4),
                "p_value": round(p_val, 6),
                "is_statistically_significant": is_significant,
                "sample_size": int(len(x)),
                "direction": "positive" if corr_val > 0 else "negative" if corr_val < 0 else "none",
            })
        except Exception as e:
            logger.debug(f"Correlation calculation skipped for '{col}': {e}")
            continue

    results.sort(key=lambda item: item["absolute_correlation"], reverse=True)

    return {
        "status": "ready",
        "method": method,
        "significance_threshold_alpha": alpha,
        "target_column": target_column,
        "correlations": results,
    }


# =====================================================================
# Two-Group Comparison: Welch's T-Test (Parametric)
# =====================================================================
def compare_groups_ttest(
    df: pd.DataFrame,
    feature_column: str,
    target_column: str = "is_failed",
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Performs Welch's two-sample t-test (unequal variances assumed) comparing
    a numerical metric between failed (1) and non-failed (0) startups.

    Verifies assumptions:
    - Minimum sample size (n >= 3 per group)
    - Non-zero variance in both groups
    """
    if target_column not in df.columns or feature_column not in df.columns:
        return {
            "status": "error",
            "message": f"Required column(s) not in dataset: feature='{feature_column}', target='{target_column}'.",
        }

    clean_df = df[[feature_column, target_column]].dropna()
    group_0 = clean_df[clean_df[target_column] == 0][feature_column]
    group_1 = clean_df[clean_df[target_column] == 1][feature_column]

    n0, n1 = len(group_0), len(group_1)
    if n0 < 3 or n1 < 3:
        return {
            "status": "insufficient_data",
            "message": f"Sample size too small for t-test (Active n={n0}, Failed n={n1}, required n>=3).",
        }

    var0, var1 = group_0.var(), group_1.var()
    if var0 == 0 and var1 == 0:
        return {
            "status": "zero_variance",
            "message": f"Zero variance observed in both groups for feature '{feature_column}'.",
        }

    # Perform Welch's t-test (equal_var=False)
    t_stat, p_val = stats.ttest_ind(group_1, group_0, equal_var=False)

    mean_active = float(group_0.mean())
    mean_failed = float(group_1.mean())
    std_active = float(group_0.std()) if n0 > 1 else 0.0
    std_failed = float(group_1.std()) if n1 > 1 else 0.0
    diff = mean_failed - mean_active

    # Compute Cohen's d effect size
    pooled_std = np.sqrt(((n0 - 1) * var0 + (n1 - 1) * var1) / (n0 + n1 - 2)) if (n0 + n1 > 2) else 1.0
    cohens_d = (diff / pooled_std) if pooled_std > 0 else 0.0

    is_significant = bool(p_val < alpha)

    interpretation = (
        f"Statistically significant difference (p={p_val:.4f} < {alpha}) between failed and active startups. "
        f"Failed startups have {'higher' if diff > 0 else 'lower'} mean {feature_column} "
        f"({mean_failed:.2f} vs {mean_active:.2f})."
        if is_significant
        else f"No statistically significant difference (p={p_val:.4f} >= {alpha}) between failed and active startups."
    )

    return {
        "status": "ready",
        "test": "Welch's two-sample t-test",
        "feature": feature_column,
        "sample_sizes": {"active_n": n0, "failed_n": n1},
        "group_active": {"mean": round(mean_active, 4), "std": round(std_active, 4)},
        "group_failed": {"mean": round(mean_failed, 4), "std": round(std_failed, 4)},
        "mean_difference": round(diff, 4),
        "t_statistic": round(float(t_stat), 4),
        "p_value": round(float(p_val), 6),
        "cohens_d": round(float(cohens_d), 4),
        "is_statistically_significant": is_significant,
        "interpretation": interpretation,
    }


# =====================================================================
# Two-Group Comparison: Mann-Whitney U Test (Non-Parametric)
# =====================================================================
def compare_groups_mann_whitney(
    df: pd.DataFrame,
    feature_column: str,
    target_column: str = "is_failed",
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Performs the non-parametric Mann-Whitney U test.
    Crucial for skewed financial and funding metrics (power-law distributions)
    where normality assumptions of the t-test are violated.
    """
    if target_column not in df.columns or feature_column not in df.columns:
        return {
            "status": "error",
            "message": f"Column '{feature_column}' or '{target_column}' missing from dataset.",
        }

    clean_df = df[[feature_column, target_column]].dropna()
    group_0 = clean_df[clean_df[target_column] == 0][feature_column]
    group_1 = clean_df[clean_df[target_column] == 1][feature_column]

    n0, n1 = len(group_0), len(group_1)
    if n0 < 3 or n1 < 3:
        return {
            "status": "insufficient_data",
            "message": f"Sample size too small for Mann-Whitney U test (Active n={n0}, Failed n={n1}).",
        }

    try:
        u_stat, p_val = stats.mannwhitneyu(group_1, group_0, alternative="two-sided")
    except Exception as e:
        return {"status": "error", "message": f"Mann-Whitney test failed: {str(e)}"}

    median_active = float(group_0.median())
    median_failed = float(group_1.median())
    is_significant = bool(p_val < alpha)

    interpretation = (
        f"Statistically significant rank difference (p={p_val:.4f} < {alpha}). "
        f"Median for failed startups is {median_failed:.2f} vs active {median_active:.2f}."
        if is_significant
        else f"No significant distributional difference detected between active and failed startups (p={p_val:.4f})."
    )

    return {
        "status": "ready",
        "test": "Mann-Whitney U Test (Non-parametric)",
        "feature": feature_column,
        "sample_sizes": {"active_n": n0, "failed_n": n1},
        "medians": {"active_median": round(median_active, 4), "failed_median": round(median_failed, 4)},
        "u_statistic": round(float(u_stat), 4),
        "p_value": round(float(p_val), 6),
        "is_statistically_significant": is_significant,
        "interpretation": interpretation,
    }


# =====================================================================
# Categorical Association: Chi-Square Test of Independence
# =====================================================================
def categorical_association_chi2(
    df: pd.DataFrame,
    categorical_column: str,
    target_column: str = "is_failed",
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Performs Chi-Square Test of Independence between a categorical variable
    (e.g., industry_sector, country_code) and startup outcome.
    Computes Cramer's V to measure association effect size.
    """
    if target_column not in df.columns or categorical_column not in df.columns:
        return {
            "status": "error",
            "message": f"Required columns missing: cat='{categorical_column}', target='{target_column}'.",
        }

    clean_df = df[[categorical_column, target_column]].dropna()
    if clean_df[target_column].nunique() < 2 or clean_df[categorical_column].nunique() < 2:
        return {
            "status": "insufficient_variance",
            "message": "Both variables must have at least 2 distinct categories.",
        }

    contingency_table = pd.crosstab(clean_df[categorical_column], clean_df[target_column])
    chi2_stat, p_val, dof, expected = stats.chi2_contingency(contingency_table)

    # Cramer's V effect size calculation
    n = contingency_table.sum().sum()
    min_dim = min(contingency_table.shape) - 1
    cramers_v = np.sqrt(chi2_stat / (n * min_dim)) if (n > 0 and min_dim > 0) else 0.0

    is_significant = bool(p_val < alpha)

    effect_magnitude = (
        "Large" if cramers_v >= 0.35
        else "Medium" if cramers_v >= 0.20
        else "Small" if cramers_v >= 0.08
        else "Negligible"
    )

    interpretation = (
        f"Statistically significant association between '{categorical_column}' and startup failure "
        f"(chi2={chi2_stat:.2f}, p={p_val:.4f}, Cramer's V={cramers_v:.3f} [{effect_magnitude}])."
        if is_significant
        else f"No statistically significant association between '{categorical_column}' and startup failure (p={p_val:.4f})."
    )

    # Format contingency table for serialization
    table_dict = {
        str(cat): {
            "active": int(contingency_table.loc[cat, 0]) if 0 in contingency_table.columns else 0,
            "failed": int(contingency_table.loc[cat, 1]) if 1 in contingency_table.columns else 0,
        }
        for cat in contingency_table.index
    }

    return {
        "status": "ready",
        "test": "Chi-Square Test of Independence",
        "categorical_feature": categorical_column,
        "degrees_of_freedom": int(dof),
        "chi2_statistic": round(float(chi2_stat), 4),
        "p_value": round(float(p_val), 6),
        "cramers_v": round(float(cramers_v), 4),
        "effect_size": effect_magnitude,
        "is_statistically_significant": is_significant,
        "contingency_table": table_dict,
        "interpretation": interpretation,
    }


# =====================================================================
# Master Statistical Battery Report
# =====================================================================
def generate_comprehensive_statistical_report(
    df: pd.DataFrame,
    target_column: Optional[str] = "is_failed",
    alpha: float = 0.05,
) -> Dict[str, Any]:
    """
    Executes a complete battery of defensible statistical tests across all features
    against the target failure variable.
    """
    if not target_column or target_column not in df.columns:
        return {
            "status": "pending_dataset",
            "has_target": False,
            "message": (
                f"Target column '{target_column}' is not present in the dataset. "
                "Inferential hypothesis tests (t-tests, Mann-Whitney U, Chi-Square) require an outcome column."
            ),
        }

    # 1. Feature Correlations
    correlations_report = calculate_feature_correlations(
        df, target_column=target_column, alpha=alpha
    )

    # 2. Group comparisons for numeric features
    numeric_cols = [
        c for c in df.select_dtypes(include=["number"]).columns
        if c != target_column
    ]
    ttest_results = {}
    mann_whitney_results = {}
    for num_col in numeric_cols:
        ttest_results[num_col] = compare_groups_ttest(
            df, feature_column=num_col, target_column=target_column, alpha=alpha
        )
        mann_whitney_results[num_col] = compare_groups_mann_whitney(
            df, feature_column=num_col, target_column=target_column, alpha=alpha
        )

    # 3. Categorical associations (Chi-Square)
    cat_cols = [
        c for c in df.select_dtypes(include=["object", "category"]).columns
        if c != target_column
    ]
    chi2_results = {}
    for cat_col in cat_cols:
        chi2_results[cat_col] = categorical_association_chi2(
            df, categorical_column=cat_col, target_column=target_column, alpha=alpha
        )

    return {
        "status": "ready",
        "has_target": True,
        "target_column": target_column,
        "feature_correlations": correlations_report,
        "parametric_group_comparisons_ttest": ttest_results,
        "nonparametric_group_comparisons_mann_whitney": mann_whitney_results,
        "categorical_associations_chi2": chi2_results,
    }
