"""
Unit and Integration Tests for ML Prediction Layer & API Contract.

Tests:
1. Model Availability & Status reporting (offline default)
2. PredictionFeatureInput Pydantic schema validation & target leakage prevention
3. Risk Band Interpretation heuristic mapping
4. Feature preparation & feature engineering pipeline execution
5. In-Memory Mock Model inference simulation (zero model files created)
6. FastAPI API endpoints (/api/predict-failure and /api/predict-failure/model-status)
7. DecisionAgent integration seam and heuristic/ML designation
"""

import unittest
from unittest.mock import MagicMock, patch
import numpy as np
import pandas as pd
from pydantic import ValidationError

from app.ml.schemas import (
    ModelStatusEnum,
    RiskLevelEnum,
    PredictionFeatureInput,
    StartupMetadataInput,
    StartupFailurePredictionRequest,
    StartupFailurePredictionResponse,
    FORBIDDEN_LEAKAGE_KEYS,
)
from app.ml.model_service import (
    FailurePredictionService,
    interpret_failure_probability,
    prediction_service,
)
from app.agents.decision_agent import DecisionAgent


class TestMLSchemasAndLeakage(unittest.TestCase):
    """
    Tests Pydantic input/output schemas and target leakage guardrails.
    """

    def setUp(self):
        self.valid_features_dict = {
            "funding_total_usd": 1500000.0,
            "funding_rounds": 2,
            "avg_participants": 2.5,
            "relationships": 8,
            "milestones": 2,
            "age_first_milestone_year": 1.2,
            "age_last_milestone_year": 2.5,
            "age_first_funding_year": 0.8,
            "age_last_funding_year": 2.1,
            "category_code": "software",
            "state_code": "CA",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "has_VC": 1,
            "has_angel": 0,
            "has_roundA": 1,
            "has_roundB": 0,
            "has_roundC": 0,
            "has_roundD": 0,
            "is_top500": 1,
        }

    def test_valid_feature_input_instantiation(self):
        """Valid feature dictionary should parse without errors."""
        features = PredictionFeatureInput(**self.valid_features_dict)
        self.assertEqual(features.funding_total_usd, 1500000.0)
        self.assertEqual(features.funding_rounds, 2)
        self.assertEqual(features.category_code, "software")
        self.assertEqual(features.state_code, "CA")

    def test_target_leakage_rejection_status(self):
        """Payloads containing target column 'status' must be rejected."""
        leaky_data = dict(self.valid_features_dict)
        leaky_data["status"] = "closed"
        with self.assertRaises(ValidationError) as ctx:
            PredictionFeatureInput(**leaky_data)
        self.assertIn("Target leakage violation", str(ctx.exception))
        self.assertIn("status", str(ctx.exception))

    def test_target_leakage_rejection_closed_at(self):
        """Payloads containing 'closed_at' date must be rejected."""
        leaky_data = dict(self.valid_features_dict)
        leaky_data["closed_at"] = "2013-05-01"
        with self.assertRaises(ValidationError) as ctx:
            PredictionFeatureInput(**leaky_data)
        self.assertIn("Target leakage violation", str(ctx.exception))

    def test_target_leakage_rejection_labels(self):
        """Payloads containing 'labels' target indicator must be rejected."""
        leaky_data = dict(self.valid_features_dict)
        leaky_data["labels"] = 0
        with self.assertRaises(ValidationError) as ctx:
            PredictionFeatureInput(**leaky_data)
        self.assertIn("Target leakage violation", str(ctx.exception))

    def test_target_leakage_rejection_all_forbidden_keys(self):
        """Every key defined in FORBIDDEN_LEAKAGE_KEYS must trigger rejection."""
        for forbidden_key in FORBIDDEN_LEAKAGE_KEYS:
            leaky_data = dict(self.valid_features_dict)
            leaky_data[forbidden_key] = 1
            with self.assertRaises(ValidationError, msg=f"Key '{forbidden_key}' should have been rejected"):
                PredictionFeatureInput(**leaky_data)

    def test_prediction_request_envelope(self):
        """Valid request envelope parses both features and metadata."""
        req = StartupFailurePredictionRequest(
            features=PredictionFeatureInput(**self.valid_features_dict),
            metadata=StartupMetadataInput(
                startup_id="c:9999",
                name="Acme Analytics",
                city="San Francisco",
            ),
        )
        self.assertEqual(req.metadata.startup_id, "c:9999")
        self.assertEqual(req.metadata.name, "Acme Analytics")
        self.assertEqual(req.features.funding_rounds, 2)


class TestRiskBandInterpretation(unittest.TestCase):
    """
    Tests application risk band categorization and heuristic explanations.
    """

    def test_low_risk_band(self):
        level, desc = interpret_failure_probability(0.12)
        self.assertEqual(level, RiskLevelEnum.LOW)
        self.assertIn("Low closure risk", desc)

    def test_medium_risk_band(self):
        level, desc = interpret_failure_probability(0.38)
        self.assertEqual(level, RiskLevelEnum.MEDIUM)
        self.assertIn("Moderate risk", desc)

    def test_high_risk_band(self):
        level, desc = interpret_failure_probability(0.65)
        self.assertEqual(level, RiskLevelEnum.HIGH)
        self.assertIn("Elevated failure risk", desc)

    def test_critical_risk_band(self):
        level, desc = interpret_failure_probability(0.88)
        self.assertEqual(level, RiskLevelEnum.CRITICAL)
        self.assertIn("Critical failure risk", desc)

    def test_boundary_values(self):
        # 0.25 threshold
        level_25, _ = interpret_failure_probability(0.25)
        self.assertEqual(level_25, RiskLevelEnum.MEDIUM)

        # 0.50 threshold
        level_50, _ = interpret_failure_probability(0.50)
        self.assertEqual(level_50, RiskLevelEnum.HIGH)

        # 0.75 threshold
        level_75, _ = interpret_failure_probability(0.75)
        self.assertEqual(level_75, RiskLevelEnum.CRITICAL)


class TestModelServiceOffline(unittest.TestCase):
    """
    Tests service behavior in default offline state (no model artifacts on disk).
    """

    def setUp(self):
        self.service = FailurePredictionService()

    def test_is_model_available_returns_false(self):
        """Confirms that no dummy model exists in backend/models/."""
        self.assertFalse(self.service.is_model_available())

    def test_load_model_raises_filenotfound(self):
        """Attempting to load absent model raises FileNotFoundError."""
        with self.assertRaises(FileNotFoundError):
            self.service.load_model()

    def test_get_model_status_offline(self):
        """Status reports MODEL_NOT_AVAILABLE with descriptive guidance."""
        status = self.service.get_model_status()
        self.assertFalse(status.model_available)
        self.assertEqual(status.status, ModelStatusEnum.MODEL_NOT_AVAILABLE)
        self.assertIsNone(status.model_name)
        self.assertIn("Trained model artifact", status.message)
        self.assertIn("deferred", status.message)

    def test_predict_graceful_degradation_when_offline(self):
        """predict() returns graceful response without crashing or guessing."""
        req = StartupFailurePredictionRequest(
            features=PredictionFeatureInput(
                funding_total_usd=500000.0,
                funding_rounds=1,
                relationships=2,
            )
        )
        resp = self.service.predict(req)
        self.assertFalse(resp.model_available)
        self.assertEqual(resp.status, ModelStatusEnum.MODEL_NOT_AVAILABLE)
        self.assertIsNone(resp.failure_probability)
        self.assertIsNone(resp.predicted_outcome)
        self.assertIsNone(resp.risk_level)

    def test_prepare_input_dataframe(self):
        """Input features are converted to DataFrame with engineered features."""
        features = PredictionFeatureInput(
            funding_total_usd=1000000.0,
            funding_rounds=2,
            relationships=5,
            state_code="CA",
            category_code="software",
            age_first_funding_year=1.0,
            age_last_funding_year=3.0,
        )
        df = self.service.prepare_input_dataframe(features)
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 1)
        # Check engineered features
        self.assertIn("funding_duration_years", df.columns)
        self.assertIn("funding_per_round_usd", df.columns)
        self.assertEqual(df.loc[0, "funding_duration_years"], 2.0)
        self.assertEqual(df.loc[0, "funding_per_round_usd"], 500000.0)
        # Check geographic and category binary indicators
        self.assertEqual(df.loc[0, "is_CA"], 1)
        self.assertEqual(df.loc[0, "is_software"], 1)


class TestModelServiceWithMockInference(unittest.TestCase):
    """
    Tests inference pipeline execution using an in-memory mock.
    Verifies that IF a model is present, predict() generates probabilities,
    predicted outcome, and risk levels correctly, without touching disk.
    """

    def setUp(self):
        self.service = FailurePredictionService()

    def test_mock_model_predict_closed(self):
        """Simulates a model predicting high closure probability."""
        mock_model = MagicMock()
        # predict_proba returns [[P(class 0 = acquired), P(class 1 = closed)]]
        mock_model.predict_proba.return_value = np.array([[0.15, 0.85]])
        mock_model.predict.return_value = np.array([1])

        with patch.object(self.service, "is_model_available", return_value=True):
            with patch.object(self.service, "load_model", return_value=mock_model):
                with patch.object(self.service, "load_preprocessor", return_value=None):
                    req = StartupFailurePredictionRequest(
                        features=PredictionFeatureInput(
                            funding_total_usd=100000.0,
                            funding_rounds=1,
                            relationships=1,
                        ),
                        metadata=StartupMetadataInput(
                            startup_id="c:test1",
                            name="AtRisk Startup",
                        ),
                    )
                    resp = self.service.predict(req)

                    self.assertTrue(resp.model_available)
                    self.assertEqual(resp.status, ModelStatusEnum.MODEL_AVAILABLE)
                    self.assertEqual(resp.predicted_outcome, "closed")
                    self.assertEqual(resp.is_failed, 1)
                    self.assertEqual(resp.failure_probability, 0.85)
                    self.assertEqual(resp.survival_probability, 0.15)
                    self.assertEqual(resp.risk_level, RiskLevelEnum.CRITICAL)
                    self.assertEqual(resp.startup_name, "AtRisk Startup")

    def test_mock_model_predict_acquired(self):
        """Simulates a model predicting high survival/acquisition probability."""
        mock_model = MagicMock()
        mock_model.predict_proba.return_value = np.array([[0.88, 0.12]])
        mock_model.predict.return_value = np.array([0])

        with patch.object(self.service, "is_model_available", return_value=True):
            with patch.object(self.service, "load_model", return_value=mock_model):
                with patch.object(self.service, "load_preprocessor", return_value=None):
                    req = StartupFailurePredictionRequest(
                        features=PredictionFeatureInput(
                            funding_total_usd=10000000.0,
                            funding_rounds=3,
                            relationships=15,
                        ),
                        metadata=StartupMetadataInput(
                            startup_id="c:test2",
                            name="Healthy Startup",
                        ),
                    )
                    resp = self.service.predict(req)

                    self.assertTrue(resp.model_available)
                    self.assertEqual(resp.predicted_outcome, "acquired")
                    self.assertEqual(resp.is_failed, 0)
                    self.assertEqual(resp.failure_probability, 0.12)
                    self.assertEqual(resp.survival_probability, 0.88)
                    self.assertEqual(resp.risk_level, RiskLevelEnum.LOW)


class TestDecisionAgentSeam(unittest.TestCase):
    """
    Verifies that DecisionAgent integrates ML prediction when provided,
    and explicitly defaults to Heuristic Diligence Synthesis when absent.
    """

    def test_decision_agent_offline_ml_designation(self):
        """When ML prediction is absent, decision agent explicitly designates heuristic synthesis."""
        import asyncio
        report = asyncio.run(
            DecisionAgent.compile_decision(
                startup_id="c:test100",
                analyses={"founder": {"score": 75}},
                ml_prediction=None,
            )
        )
        self.assertIn("mlRiskAssessment", report)
        assessment = report["mlRiskAssessment"]
        self.assertFalse(assessment["model_available"])
        self.assertEqual(assessment["status"], "MODEL_NOT_AVAILABLE")
        self.assertEqual(assessment["methodology"], "Heuristic Diligence Synthesis")
        self.assertNotIn("failure_probability", assessment)

    def test_decision_agent_with_ml_prediction(self):
        """When ML prediction is provided, decision agent incorporates probabilities."""
        import asyncio
        ml_data = {
            "model_available": True,
            "status": "MODEL_AVAILABLE",
            "predicted_outcome": "closed",
            "failure_probability": 0.78,
            "survival_probability": 0.22,
            "risk_level": "Critical",
            "risk_interpretation": "Critical failure risk based on historical venture data.",
            "model_version": "1.0.0",
        }
        report = asyncio.run(
            DecisionAgent.compile_decision(
                startup_id="c:test200",
                analyses={"founder": {"score": 40}},
                ml_prediction=ml_data,
            )
        )
        assessment = report["mlRiskAssessment"]
        self.assertTrue(assessment["model_available"])
        self.assertEqual(assessment["status"], "MODEL_AVAILABLE")
        self.assertEqual(assessment["methodology"], "Trained Machine Learning Classifier")
        self.assertEqual(assessment["failure_probability"], 0.78)
        self.assertEqual(assessment["risk_level"], "Critical")



class TestFastAPIPredictionEndpoints(unittest.TestCase):
    """
    Tests the FastAPI HTTP endpoints for predictions and model status.
    """

    @classmethod
    def setUpClass(cls):
        from fastapi.testclient import TestClient
        from app.main import app
        cls.client = TestClient(app)

    def test_get_model_status_endpoint(self):
        """GET /api/predict-failure/model-status returns 200 with MODEL_NOT_AVAILABLE."""
        response = self.client.get("/api/predict-failure/model-status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["model_available"])
        self.assertEqual(data["status"], "MODEL_NOT_AVAILABLE")
        self.assertIn("startup_failure_model.joblib", data["model_path"])

    def test_post_predict_failure_offline_returns_503(self):
        """POST /api/predict-failure returns 503 Service Unavailable when model is absent."""
        payload = {
            "features": {
                "funding_total_usd": 1000000.0,
                "funding_rounds": 2,
                "avg_participants": 2.0,
                "relationships": 5,
                "milestones": 1,
                "category_code": "software",
                "state_code": "CA",
            },
            "metadata": {
                "startup_id": "c:test100",
                "name": "TestCorp",
            },
        }
        response = self.client.post("/api/predict-failure", json=payload)
        self.assertEqual(response.status_code, 503)
        detail = response.json()["detail"]
        self.assertFalse(detail["model_available"])
        self.assertEqual(detail["status"], "MODEL_NOT_AVAILABLE")
        self.assertIn("higher-capacity machine", detail["diagnostic"])

    def test_post_predict_failure_leakage_returns_422(self):
        """POST /api/predict-failure with target leakage fields triggers 422 Unprocessable Entity."""
        leaky_payload = {
            "features": {
                "funding_total_usd": 1000000.0,
                "funding_rounds": 2,
                "status": "closed",  # FORBIDDEN TARGET LEAKAGE
            }
        }
        response = self.client.post("/api/predict-failure", json=leaky_payload)
        self.assertEqual(response.status_code, 422)
        error_str = str(response.json())
        self.assertIn("Target leakage violation", error_str)


if __name__ == "__main__":
    unittest.main()
