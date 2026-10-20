from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    ComparisonRequest,
    ComparisonResponse,
    PredictionHistoryResponse,
    SinglePredictionRequest,
    SinglePredictionResponse,
)
from app.services.ml_client import MLClient
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


def _get_service(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PredictionService:
    """Build a PredictionService with the current DB session and ML client."""
    ml_client: MLClient = request.app.state.ml_client
    return PredictionService(db=db, ml_client=ml_client)


@router.post("", response_model=SinglePredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    body: SinglePredictionRequest,
    service: PredictionService = Depends(_get_service),
) -> SinglePredictionResponse:
    """Create a single housing price prediction."""
    return await service.create_prediction(body.features)


@router.post(
    "/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_batch_predictions(
    body: BatchPredictionRequest,
    service: PredictionService = Depends(_get_service),
) -> BatchPredictionResponse:
    """Create batch predictions for multiple properties."""
    predictions = await service.create_batch_predictions(body.features_list)
    return BatchPredictionResponse(predictions=predictions)


@router.get("", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    skip: int = 0,
    limit: int = 100,
    service: PredictionService = Depends(_get_service),
) -> PredictionHistoryResponse:
    """Retrieve prediction history with pagination."""
    predictions, total = await service.get_prediction_history(skip=skip, limit=limit)
    return PredictionHistoryResponse(predictions=predictions, total=total)


@router.get("/{prediction_id}", response_model=SinglePredictionResponse)
async def get_prediction_by_id(
    prediction_id: int,
    service: PredictionService = Depends(_get_service),
) -> SinglePredictionResponse:
    """Retrieve a single prediction by ID."""
    result = await service.get_prediction_by_id(prediction_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction {prediction_id} not found",
        )
    return result


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: int,
    service: PredictionService = Depends(_get_service),
) -> None:
    """Delete a single prediction."""
    deleted = await service.delete_prediction(prediction_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction {prediction_id} not found",
        )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_predictions(
    service: PredictionService = Depends(_get_service),
) -> None:
    """Delete all prediction records."""
    await service.delete_all_predictions()


@router.post("/compare", response_model=ComparisonResponse)
async def compare_predictions(
    body: ComparisonRequest,
    service: PredictionService = Depends(_get_service),
) -> ComparisonResponse:
    """Compare multiple predictions by ID."""
    result = await service.compare_predictions(body.prediction_ids)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more prediction IDs not found",
        )
    return result
