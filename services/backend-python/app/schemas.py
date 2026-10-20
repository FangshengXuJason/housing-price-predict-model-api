from datetime import datetime

from pydantic import BaseModel, Field


class HousingFeatures(BaseModel):
    """Input features for housing price prediction."""

    square_footage: float = Field(..., gt=0, description="Living area in square feet")
    bedrooms: int = Field(..., ge=1, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0.5, description="Number of bathrooms")
    year_built: int = Field(
        ..., ge=1900, le=2026, description="Year the property was built"
    )
    lot_size: float = Field(..., gt=0, description="Lot size in square feet")
    distance_to_city_center: float = Field(
        ..., ge=0, description="Distance to city center in miles"
    )
    school_rating: float = Field(
        ..., ge=1, le=10, description="School rating from 1 to 10"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "square_footage": 2000.0,
                "bedrooms": 3,
                "bathrooms": 2.0,
                "year_built": 2005,
                "lot_size": 5000.0,
                "distance_to_city_center": 10.0,
                "school_rating": 7.5,
            }
        }
    }


class SinglePredictionRequest(BaseModel):
    """Request schema for a single prediction."""

    features: HousingFeatures


class SinglePredictionResponse(BaseModel):
    """Response schema for a single prediction result."""

    id: int
    timestamp: datetime
    features: HousingFeatures
    predicted_price: float

    model_config = {"from_attributes": True}


class BatchPredictionRequest(BaseModel):
    """Request schema for batch predictions."""

    features_list: list[HousingFeatures] = Field(..., min_length=1)


class BatchPredictionResponse(BaseModel):
    """Response schema for batch prediction results."""

    predictions: list[SinglePredictionResponse]


class PredictionHistoryResponse(BaseModel):
    """Response schema for prediction history."""

    predictions: list[SinglePredictionResponse]
    total: int


class ComparisonRequest(BaseModel):
    """Request schema for comparing multiple predictions."""

    prediction_ids: list[int] = Field(..., min_length=1)


class ComparisonSummary(BaseModel):
    """Summary statistics for compared predictions."""

    min_price: float
    max_price: float
    avg_price: float


class ComparisonResponse(BaseModel):
    """Response schema for prediction comparison."""

    predictions: list[SinglePredictionResponse]
    summary: ComparisonSummary


class ModelInfoResponse(BaseModel):
    """Response schema for ML model information."""

    model_type: str
    coefficients: dict[str, float]
    intercept: float
    metrics: dict[str, float]


class HealthResponse(BaseModel):
    """Response schema for health check."""

    status: str
    ml_api_status: str
