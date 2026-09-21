"""
Statistical analysis runner for Startup Failure Intelligence Platform.
Computes empirical inferential statistics on startup_ml_ready.csv.
"""

import json
import pandas as pd
from app.analytics import (
    compare_groups_ttest,
    compare_groups_mann_whitney,
    categorical_association_chi2,
    calculate_feature_correlations,
)

def run_analysis():
    df = pd.read_csv("data/startup_ml_ready.csv")

    print("=== FEATURE CORRELATIONS WITH IS_FAILED ===")
    corrs = calculate_feature_correlations(df, target_column="is_failed")
    for item in corrs["correlations"][:10]:
        print(f"{item['feature']:25s} | r={item['correlation']:7.4f} | p={item['p_value']:9.6f} | sig={item['is_statistically_significant']}")

    print("\n=== TWO-SAMPLE GROUP COMPARISONS (ACQUIRED VS FAILED) ===")
    features = [
        "relationships",
        "milestones",
        "funding_rounds",
        "funding_total_usd",
        "funding_duration_years",
        "funding_stages_count",
    ]
    for feat in features:
        t_res = compare_groups_ttest(df, feature_column=feat, target_column="is_failed")
        mw_res = compare_groups_mann_whitney(df, feature_column=feat, target_column="is_failed")
        mean_0 = t_res["group_active"]["mean"]
        mean_1 = t_res["group_failed"]["mean"]
        t_stat = t_res["t_statistic"]
        t_p = t_res["p_value"]
        d = t_res["cohens_d"]
        med_0 = mw_res["medians"]["active_median"]
        med_1 = mw_res["medians"]["failed_median"]
        u_p = mw_res["p_value"]
        print(f"\nFeature: {feat}")
        print(f"  Means: Acquired={mean_0:.2f} vs Closed={mean_1:.2f} (diff={mean_1 - mean_0:.2f}, Cohen's d={d:.3f})")
        print(f"  Welch's t-test: t={t_stat:.3f}, p={t_p:.6e}")
        print(f"  Medians: Acquired={med_0:.2f} vs Closed={med_1:.2f}")
        print(f"  Mann-Whitney U test: p={u_p:.6e}")

    print("\n=== CATEGORICAL ASSOCIATIONS (CHI-SQUARE & CRAMER'S V) ===")
    cat_vars = ["category_code", "state_code", "has_roundB", "is_top500", "is_otherstate"]
    for cat in cat_vars:
        res = categorical_association_chi2(df, categorical_column=cat, target_column="is_failed")
        print(
            f"{cat:15s} | Chi2: {res['chi2_statistic']:7.2f} | p-value: {res['p_value']:9.6e} | "
            f"Cramer's V: {res['cramers_v']:6.3f} ({res['effect_size']})"
        )

if __name__ == "__main__":
    run_analysis()
