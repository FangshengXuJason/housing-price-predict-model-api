"""Pydantic schemas for request/response models."""
from pydantic import BaseModel, Field


class HousingFeatures(BaseModel):
    """Single housing feature set."""

    square_footage: float = Field(..., gt=0, description="Living area in square feet")
    bedrooms: int = Field(..., ge=1, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0.5, description="Number of bathrooms")
    year_built: int = Field(..., ge=1900, le=2026, description="Year the house was built")
    lot_size: float = Field(..., gt=0, description="Lot size in square feet")
    distance_to_city_center: float = Field(..., ge=0, description="Distance to city center in miles")
    school_rating: float = Field(..., ge=1, le=10, description="School rating (1-10)")


class BatchPredictionRequest(BaseModel):
    """Batch prediction request."""

    features: list[HousingFeatures] = Field(..., min_length=1, description="List of housing feature sets")


class PredictionResponse(BaseModel):
    """Single prediction response."""

    predicted_price: float = Field(..., description="Predicted house price in USD")


class BatchPredictionResponse(BaseModel):
    """Batch prediction response."""

    predictions: list[float] = Field(..., description="List of predicted prices in USD")


class ModelInfoResponse(BaseModel):
    """Model information and metrics."""

    model_type: str = Field(..., description="Type of regression model")
    coefficients: dict[str, float] = Field(..., description="Feature coefficients")
    intercept: float = Field(..., description="Model intercept")
    metrics: dict[str, float] = Field(..., description="Training and test metrics")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
