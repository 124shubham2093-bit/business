"""
Unit and Integration Tests for Data Foundation & Analytics Modules.

Tests:
- StartupDataLoader (loading, validation, schema detection, error raising)
- CurrencyAndNumericParser & StartupDataPreprocessor (scikit-learn ColumnTransformer)
- Exploratory Data Analysis (EDA metrics, distributions, correlations, outcome analysis)
- Defensible Statistics (Welch t-test, Mann-Whitney U, Chi-Square, p-values, assumption checks)
"""

import unittest
from io import StringIO
import tempfile
from pathlib import Path
import numpy as np
import pandas as pd

from app.analytics.data_loader import (
    StartupDataLoader,
    DatasetMetadata,
    DatasetError,
    DatasetNotFoundError,
    EmptyDatasetError,
    MissingColumnsError,
)
from app.analytics.preprocessing import (
    CurrencyAndNumericParser,
    StartupDataPreprocessor,
    StartupFeatureEngineer,
    TargetLeakageAuditor,
)
from app.analytics.eda import (
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
from app.analytics.statistics import (
    calculate_feature_correlations,
    compare_groups_ttest,
    compare_groups_mann_whitney,
    categorical_association_chi2,
    generate_comprehensive_statistical_report,
)


class TestStartupDataLoader(unittest.TestCase):
    def setUp(self):
        self.csv_content = (
            "startup_id,name,funding_total_usd,funding_rounds,runway_months,industry_sector,is_failed\n"
            "S01,StartupOne,1000000,2,18.0,FinTech,0\n"
            "S02,StartupTwo,250000,1,6.0,SaaS,1\n"
            "S03,StartupThree,5000000,3,24.0,BioTech,0\n"
            "S04,StartupFour,150000,1,4.5,SaaS,1\n"
            "S05,StartupFive,3200000,2,20.0,FinTech,0\n"
        )

    def test_load_csv_from_buffer(self):
        buf = StringIO(self.csv_content)
        df = StartupDataLoader.load_csv(buf)
        self.assertEqual(len(df), 5)
        self.assertIn("startup_id", df.columns)
        self.assertIn("is_failed", df.columns)

    def test_validate_columns_success(self):
        buf = StringIO(self.csv_content)
        df = StartupDataLoader.load_csv(buf, required_columns=["funding_total_usd", "runway_months"])
        self.assertEqual(len(df), 5)

    def test_validate_columns_missing_raises_error(self):
        buf = StringIO(self.csv_content)
        with self.assertRaises(MissingColumnsError) as ctx:
            StartupDataLoader.load_csv(buf, required_columns=["non_existent_column_xyz"])
        self.assertIn("non_existent_column_xyz", str(ctx.exception))

    def test_empty_csv_raises_error(self):
        buf = StringIO("")
        with self.assertRaises(EmptyDatasetError):
            StartupDataLoader.load_csv(buf)

    def test_non_existent_file_raises_error(self):
        with self.assertRaises(DatasetNotFoundError):
            StartupDataLoader.load_csv("non_existent_dataset_path_12345.csv")

    def test_inspect_metadata(self):
        df = StartupDataLoader.get_development_sample_fixture()
        metadata = StartupDataLoader.inspect(df)
        self.assertEqual(metadata.total_rows, 10)
        self.assertEqual(metadata.detected_target_column, "is_failed")
        self.assertTrue(metadata.has_target)
        self.assertIn("funding_total_usd", metadata.detected_numeric_columns)
        self.assertIn("industry_sector", metadata.detected_categorical_columns)


class TestPreprocessing(unittest.TestCase):
    def test_currency_parser(self):
        self.assertEqual(CurrencyAndNumericParser.parse_currency("$1.2M"), 1200000.0)
        self.assertEqual(CurrencyAndNumericParser.parse_currency("$90k"), 90000.0)
        self.assertEqual(CurrencyAndNumericParser.parse_currency("€2.5M"), 2500000.0)
        self.assertEqual(CurrencyAndNumericParser.parse_currency("$450,000"), 450000.0)
        self.assertEqual(CurrencyAndNumericParser.parse_currency("500000"), 500000.0)
        self.assertTrue(np.isnan(CurrencyAndNumericParser.parse_currency("Unknown")))
        self.assertTrue(np.isnan(CurrencyAndNumericParser.parse_currency(None)))

    def test_duration_parser(self):
        self.assertEqual(CurrencyAndNumericParser.parse_duration_months("24 months"), 24.0)
        self.assertEqual(CurrencyAndNumericParser.parse_duration_months("1.5 years"), 18.0)
        self.assertEqual(CurrencyAndNumericParser.parse_duration_months("6 mo"), 6.0)
        self.assertTrue(np.isnan(CurrencyAndNumericParser.parse_duration_months("invalid")))

    def test_percentage_parser(self):
        self.assertEqual(CurrencyAndNumericParser.parse_percentage("18.2%"), 18.2)
        self.assertEqual(CurrencyAndNumericParser.parse_percentage("95"), 95.0)

    def test_preprocessor_pipeline_fit_transform(self):
        df = StartupDataLoader.get_development_sample_fixture()

        preprocessor = StartupDataPreprocessor(
            id_columns=["startup_id", "name"],
            target_column="is_failed",
            scaler_type="robust",
        )

        X, y, feature_names = preprocessor.fit_transform(df)

        self.assertEqual(X.shape[0], 10)
        self.assertEqual(len(y), 10)
        self.assertGreater(len(feature_names), 0)
        self.assertEqual(X.shape[1], len(feature_names))
        # Ensure no NaNs exist in the processed feature matrix
        self.assertFalse(np.isnan(X).any())

    def test_preprocessor_serialization(self):
        df = StartupDataLoader.get_development_sample_fixture()
        preprocessor = StartupDataPreprocessor()
        preprocessor.fit(df)

        with tempfile.TemporaryDirectory() as tmpdir:
            save_path = Path(tmpdir) / "preprocessor.joblib"
            preprocessor.save(save_path)
            self.assertTrue(save_path.exists())

            loaded = StartupDataPreprocessor.load(save_path)
            X_orig, _ = preprocessor.transform(df)
            X_loaded, _ = loaded.transform(df)
            np.testing.assert_array_almost_equal(X_orig, X_loaded)


class TestEDA(unittest.TestCase):
    def setUp(self):
        self.df = StartupDataLoader.get_development_sample_fixture()

    def test_missing_value_summary(self):
        res = missing_value_summary(self.df)
        self.assertEqual(res["total_rows"], 10)
        self.assertEqual(res["total_missing_cells"], 0)

    def test_duplicate_summary(self):
        res = duplicate_summary(self.df)
        self.assertEqual(res["duplicate_rows"], 0)

    def test_descriptive_statistics(self):
        stats = descriptive_statistics(self.df)
        self.assertIn("funding_total_usd", stats)
        self.assertIn("mean", stats["funding_total_usd"])
        self.assertIn("median", stats["funding_total_usd"])
        self.assertIn("iqr", stats["funding_total_usd"])
        self.assertIn("skewness", stats["funding_total_usd"])

    def test_numerical_distributions(self):
        dists = numerical_distributions(self.df, bins=5)
        self.assertIn("runway_months", dists)
        self.assertEqual(len(dists["runway_months"]["counts"]), 5)
        self.assertIn("quantiles", dists["runway_months"])

    def test_categorical_distributions(self):
        cats = categorical_distributions(self.df)
        self.assertIn("industry_sector", cats)
        self.assertGreaterEqual(cats["industry_sector"]["unique_count"], 3)

    def test_correlation_analysis(self):
        corr = correlation_analysis(self.df)
        self.assertIn("matrix", corr)
        self.assertIn("top_correlated_pairs", corr)
        self.assertGreater(len(corr["top_correlated_pairs"]), 0)

    def test_target_distribution_with_target(self):
        t_dist = target_distribution(self.df, target_column="is_failed")
        self.assertEqual(t_dist["status"], "ready")
        self.assertTrue(t_dist["has_target"])
        self.assertEqual(t_dist["failure_rate_percentage"], 40.0)

    def test_target_distribution_without_target(self):
        no_target_df = self.df.drop(columns=["is_failed"])
        t_dist = target_distribution(no_target_df, target_column="is_failed")
        self.assertEqual(t_dist["status"], "pending_dataset")
        self.assertFalse(t_dist["has_target"])

    def test_grouped_outcome_analysis(self):
        res = grouped_outcome_analysis(self.df, group_by_column="industry_sector", target_column="is_failed")
        self.assertEqual(res["status"], "ready")
        self.assertGreater(res["groups_count"], 0)
        self.assertIn("failure_rate_pct", res["results"][0])

    def test_comprehensive_eda_report(self):
        report = generate_comprehensive_eda_report(self.df, target_column="is_failed")
        self.assertIn("dataset_shape", report)
        self.assertIn("data_quality", report)
        self.assertIn("descriptive_statistics", report)
        self.assertIn("target_analysis", report)


class TestDefensibleStatistics(unittest.TestCase):
    def setUp(self):
        self.df = StartupDataLoader.get_development_sample_fixture()

    def test_calculate_feature_correlations(self):
        res = calculate_feature_correlations(self.df, target_column="is_failed")
        self.assertEqual(res["status"], "ready")
        self.assertGreater(len(res["correlations"]), 0)
        first_corr = res["correlations"][0]
        self.assertIn("p_value", first_corr)
        self.assertIn("is_statistically_significant", first_corr)

    def test_welch_ttest(self):
        res = compare_groups_ttest(self.df, feature_column="runway_months", target_column="is_failed")
        self.assertEqual(res["status"], "ready")
        self.assertIn("t_statistic", res)
        self.assertIn("p_value", res)
        self.assertIn("cohens_d", res)
        self.assertIn("interpretation", res)

    def test_mann_whitney(self):
        res = compare_groups_mann_whitney(self.df, feature_column="funding_total_usd", target_column="is_failed")
        self.assertEqual(res["status"], "ready")
        self.assertIn("u_statistic", res)
        self.assertIn("p_value", res)
        self.assertIn("interpretation", res)

    def test_chi2_association(self):
        res = categorical_association_chi2(self.df, categorical_column="industry_sector", target_column="is_failed")
        self.assertEqual(res["status"], "ready")
        self.assertIn("chi2_statistic", res)
        self.assertIn("cramers_v", res)
        self.assertIn("effect_size", res)

    def test_statistics_handles_missing_target_gracefully(self):
        no_target_df = self.df.drop(columns=["is_failed"])
        report = generate_comprehensive_statistical_report(no_target_df, target_column="is_failed")
        self.assertEqual(report["status"], "pending_dataset")
        self.assertFalse(report["has_target"])


class TestRealKaggleDatasetIntegration(unittest.TestCase):
    """
    Tests specific to the real Kaggle Startup Failure dataset (startup_data.csv).
    Validates loading, target definition, leakage prevention, and ML readiness.
    """

    def setUp(self):
        self.raw_df = StartupDataLoader.load_kaggle_dataset(deduplicate=False)
        self.dedup_df = StartupDataLoader.load_kaggle_dataset(deduplicate=True)

    def test_kaggle_dataset_dimensions(self):
        # Raw dataset has 923 rows
        self.assertEqual(len(self.raw_df), 923)
        # Deduplicated dataset has 922 rows (1 duplicate 'c:28482' removed)
        self.assertEqual(len(self.dedup_df), 922)
        self.assertIn("is_failed", self.dedup_df.columns)
        self.assertIn("status", self.dedup_df.columns)

    def test_target_creation_rules(self):
        # Ground truth rule: status == 'closed' -> 1, status == 'acquired' -> 0
        df = self.dedup_df
        closed_mask = df["status"] == "closed"
        acquired_mask = df["status"] == "acquired"

        self.assertTrue((df.loc[closed_mask, "is_failed"] == 1).all())
        self.assertTrue((df.loc[acquired_mask, "is_failed"] == 0).all())

        # Exact target class balance
        failed_count = (df["is_failed"] == 1).sum()
        acquired_count = (df["is_failed"] == 0).sum()
        self.assertEqual(failed_count, 326)
        self.assertEqual(acquired_count, 596)
        self.assertEqual(failed_count + acquired_count, 922)

        # Ensure no other target values exist
        self.assertTrue(set(df["is_failed"].unique()).issubset({0, 1}))

    def test_feature_engineering(self):
        engineered_df = StartupFeatureEngineer.engineer_features(self.dedup_df)
        expected_eng_cols = [
            "funding_duration_years",
            "funding_per_round_usd",
            "funding_stages_count",
            "investor_diversity_score",
            "has_milestone",
            "milestone_duration_years",
            "relationships_per_year",
        ]
        for col in expected_eng_cols:
            self.assertIn(col, engineered_df.columns)
            # Ensure non-negative
            self.assertTrue((engineered_df[col].dropna() >= 0).all())

    def test_target_leakage_auditor_catches_leakage(self):
        # Auditor should flag 'status', 'labels', and 'closed_at' as leakage
        leakage_candidates = ["relationships", "status", "milestones", "labels", "closed_at"]
        audit = TargetLeakageAuditor.audit_features(
            self.dedup_df,
            feature_columns=leakage_candidates,
            target_column="is_failed",
        )
        self.assertFalse(audit["is_clean"])
        self.assertIn("status", audit["leakage_columns_found"])
        self.assertIn("labels", audit["leakage_columns_found"])
        self.assertIn("closed_at", audit["leakage_columns_found"])

    def test_ml_ready_dataset_has_zero_leakage_and_zero_nulls(self):
        preprocessor = StartupDataPreprocessor()
        ml_df, meta_df = preprocessor.prepare_ml_dataset(self.raw_df, engineer_features=True)

        self.assertEqual(len(ml_df), 922)
        self.assertEqual(len(meta_df), 922)

        # Verify NO leakage columns in ml_df
        self.assertNotIn("status", ml_df.columns)
        self.assertNotIn("labels", ml_df.columns)
        self.assertNotIn("closed_at", ml_df.columns)
        self.assertNotIn("Unnamed: 0", ml_df.columns)
        self.assertNotIn("id", ml_df.columns)
        self.assertNotIn("name", ml_df.columns)

        # Target must be present
        self.assertIn("is_failed", ml_df.columns)

        # Zero missing values across the entire ML-ready dataset
        self.assertEqual(int(ml_df.isnull().sum().sum()), 0)

    def test_preprocessing_pipeline_fit_transform_real_data(self):
        preprocessor = StartupDataPreprocessor(target_column="is_failed", scaler_type="robust")
        ml_df, _ = preprocessor.prepare_ml_dataset(self.raw_df, engineer_features=True)

        X, y, feature_names = preprocessor.fit_transform(ml_df)
        self.assertEqual(X.shape[0], 922)
        self.assertEqual(len(y), 922)
        self.assertEqual(X.shape[1], len(feature_names))
        # Ensure zero NaNs in transformed design matrix
        self.assertFalse(np.isnan(X).any())


if __name__ == "__main__":
    unittest.main()

