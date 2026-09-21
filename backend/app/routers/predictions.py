"""
FastAPI Router for Startup Failure Prediction & ML Model Status.

Endpoints:
- GET /api/predict-failure/model-status : Reports whether a trained model is installed on disk.
- POST /api/predict-failure : Runs inference for startup failure risk scoring (returns 503 if model is unavailable).
"""

from fastapi import APIRouter, HTTPException, status
from app.ml.schemas import (
    ModelStatusResponse,
    StartupFailurePredictionRequest,
    StartupFailurePredictionResponse,
)
from app.ml.model_service import prediction_service

router = APIRouter()


@router.get(
    "/predict-failure/model-status",
    response_model=ModelStatusResponse,
    summary="Check ML Model Operational Status",
    description="Returns the status of trained model artifacts in backend/models/.",
)
async def get_model_status():
    """
    Checks whether startup_failure_model.joblib is installed and returns diagnostic metadata.
    """
    return prediction_service.get_model_status()


@router.post(
    "/predict-failure",
    response_model=StartupFailurePredictionResponse,
    summary="Predict Startup Failure Risk",
    description="Generates failure probability and risk band interpretation based on pre-outcome metrics.",
)
async def predict_failure(request: StartupFailurePredictionRequest):
    """
    Evaluates startup venture attributes against the trained failure prediction model.
    If the model artifact is not installed, returns HTTP 503 with structured diagnostic details.
    """
    # Verify model presence before attempting execution
    if not prediction_service.is_model_available():
        status_info = prediction_service.get_model_status()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "model_available": False,
                "status": status_info.status.value,
                "message": status_info.message,
                "model_path": status_info.model_path,
                "diagnostic": (
                    "Inference service is active, but trained model artifact is pending. "
                    "In accordance with project policy, training will be executed on a dedicated "
                    "higher-capacity machine and exported to backend/models/."
                ),
            },
        )

    # Execute inference
    try:
        response = prediction_service.predict(request)
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(exc)}",
        ) from exc
