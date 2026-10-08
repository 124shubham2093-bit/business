"""
Decision Agent for VentureIQ Due Diligence Synthesis.

Compiles multi-agent outputs into an investment recommendation.
Provides an explicit integration seam for the ML Failure Prediction subsystem:
- When a trained ML model is present, incorporates ML failure probabilities and risk bands.
- When no trained ML model is available, explicitly reports MODEL_NOT_AVAILABLE and marks
  the score as a rule-based heuristic synthesis, NEVER mislabeling it as ML prediction.
"""

from typing import Dict, Any, Optional
from app.ml.model_service import prediction_service


class DecisionAgent:
    @staticmethod
    async def compile_decision(
        startup_id: str,
        analyses: Dict[str, Any],
        ml_prediction: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        founder = analyses.get("founder", {})
        tech = analyses.get("tech", {})
        finance = analyses.get("finance", {})
        market = analyses.get("market", {})
        competition = analyses.get("competition", {})
        legal = analyses.get("legal", {})

        # Heuristic score synthesis
        scores = [
            founder.get("score", 0),
            tech.get("score", 0),
            finance.get("score", 0),
            market.get("score", 0),
            competition.get("score", 0),
        ]
        avg = sum(scores) // len(scores) if scores else 50
        investmentScore = max(10, min(98, avg - (legal.get("score", 0) // 10)))

        recommendation = "UNDER REVIEW"
        if investmentScore >= 80:
            recommendation = "INVEST"
        elif investmentScore < 60:
            recommendation = "PASS"

        # Gather qualitative insights
        strengths = []
        for key in ["founder", "tech", "finance", "market", "competition", "legal"]:
            strengths.extend(analyses.get(key, {}).get("strengths", []))

        risks = []
        for key in ["founder", "tech", "finance", "market", "competition", "legal"]:
            risks.extend(analyses.get(key, {}).get("weaknesses", []))

        evidence = []
        for key in ["founder", "tech", "finance", "market", "competition", "legal"]:
            evidence.extend(analyses.get(key, {}).get("evidence", []))

        reasoning = (
            f"Diligence analysis completed for {startup_id} yielding a score of {investmentScore}/100. "
            f"Core strengths and risk factors synthesized across founder, technical, financial, market, competitive, and legal dimensions."
        )

        # ML Failure Intelligence Integration Seam
        if ml_prediction is not None and ml_prediction.get("model_available"):
            ml_assessment = {
                "model_available": True,
                "status": "MODEL_AVAILABLE",
                "methodology": "Trained Machine Learning Classifier",
                "predicted_outcome": ml_prediction.get("predicted_outcome"),
                "failure_probability": ml_prediction.get("failure_probability"),
                "survival_probability": ml_prediction.get("survival_probability"),
                "risk_level": ml_prediction.get("risk_level"),
                "risk_interpretation": ml_prediction.get("risk_interpretation"),
                "model_version": ml_prediction.get("model_version"),
            }
        else:
            model_status = prediction_service.get_model_status()
            ml_assessment = {
                "model_available": False,
                "status": model_status.status.value,
                "methodology": "Heuristic Diligence Synthesis",
                "note": (
                    "Machine learning failure model is not yet trained/installed. "
                    "The above score represents a simulated heuristic synthesis and must NOT "
                    "be interpreted as a statistical ML failure prediction."
                ),
            }

        return {
            "recommendation": recommendation,
            "confidence": "90%",
            "reasoning": reasoning,
            "supportingEvidence": evidence,
            "riskFactors": risks,
            "strengths": strengths,
            "weaknesses": risks,
            "mlRiskAssessment": ml_assessment,
        }
