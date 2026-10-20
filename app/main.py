"""FastAPI application for housing price prediction."""
from fastapi import FastAPI, HTTPException

from app.model_service import get_model_info, predict_batch, predict_single
from app.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    HealthResponse,
    HousingFeatures,
    ModelInfoResponse,
    PredictionResponse,
)

app = FastAPI(
    title="Housing Price Prediction API",
    description="Predicts housing prices using a Ridge regression model trained on housing features.",
    version="0.1.0",
)


@app.post("/predict", response_model=PredictionResponse)
def predict_single_price(features: HousingFeatures):
    """Predict the price for a single house."""
    try:
        price = predict_single(features.model_dump())
        return PredictionResponse(predicted_price=price)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch_prices(request: BatchPredictionRequest):
    """Predict prices for a batch of houses."""
    try:
        prices = predict_batch([f.model_dump() for f in request.features])
        return BatchPredictionResponse(predictions=prices)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@app.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    """Return model coefficients and performance metrics."""
    return get_model_info()


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Simple health check endpoint."""
    return HealthResponse(status="healthy", version=app.version)
