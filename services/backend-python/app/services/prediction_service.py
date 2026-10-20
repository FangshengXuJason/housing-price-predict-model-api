from datetime import datetime, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PredictionRecord
from app.schemas import (
    ComparisonResponse,
    ComparisonSummary,
    HousingFeatures,
    SinglePredictionResponse,
)
from app.services.ml_client import MLClient


class PredictionService:
    """Business logic layer for housing price predictions."""

    def __init__(self, db: AsyncSession, ml_client: MLClient) -> None:
        self._db = db
        self._ml_client = ml_client

    async def create_prediction(
        self, features: HousingFeatures
    ) -> SinglePredictionResponse:
        """Call ML API, persist the result, and return the prediction."""
        predicted_price = await self._ml_client.predict_single(features)

        record = PredictionRecord(
            square_footage=features.square_footage,
            bedrooms=features.bedrooms,
            bathrooms=features.bathrooms,
            year_built=features.year_built,
            lot_size=features.lot_size,
            distance_to_city_center=features.distance_to_city_center,
            school_rating=features.school_rating,
            predicted_price=predicted_price,
        )
        self._db.add(record)
        await self._db.flush()
        await self._db.refresh(record)

        return SinglePredictionResponse(
            id=record.id,
            timestamp=record.timestamp,
            features=features,
            predicted_price=record.predicted_price,
        )

    async def create_batch_predictions(
        self, features_list: list[HousingFeatures]
    ) -> list[SinglePredictionResponse]:
        """Call ML API batch endpoint, persist all results, return responses."""
        prices = await self._ml_client.predict_batch(features_list)

        responses: list[SinglePredictionResponse] = []
        for features, price in zip(features_list, prices):
            record = PredictionRecord(
                square_footage=features.square_footage,
                bedrooms=features.bedrooms,
                bathrooms=features.bathrooms,
                year_built=features.year_built,
                lot_size=features.lot_size,
                distance_to_city_center=features.distance_to_city_center,
                school_rating=features.school_rating,
                predicted_price=price,
            )
            self._db.add(record)
            await self._db.flush()
            await self._db.refresh(record)

            responses.append(
                SinglePredictionResponse(
                    id=record.id,
                    timestamp=record.timestamp,
                    features=features,
                    predicted_price=record.predicted_price,
                )
            )
        return responses

    async def get_prediction_history(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[SinglePredictionResponse], int]:
        """Fetch paginated prediction history."""
        count_stmt = select(func.count()).select_from(PredictionRecord)
        total = (await self._db.execute(count_stmt)).scalar_one()

        stmt = (
            select(PredictionRecord)
            .order_by(PredictionRecord.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._db.execute(stmt)
        records = result.scalars().all()

        predictions = [
            SinglePredictionResponse(
                id=r.id,
                timestamp=r.timestamp,
                features=HousingFeatures(
                    square_footage=r.square_footage,
                    bedrooms=r.bedrooms,
                    bathrooms=r.bathrooms,
                    year_built=r.year_built,
                    lot_size=r.lot_size,
                    distance_to_city_center=r.distance_to_city_center,
                    school_rating=r.school_rating,
                ),
                predicted_price=r.predicted_price,
            )
            for r in records
        ]
        return predictions, total

    async def get_prediction_by_id(
        self, prediction_id: int
    ) -> SinglePredictionResponse | None:
        """Fetch a single prediction by ID."""
        stmt = select(PredictionRecord).where(PredictionRecord.id == prediction_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            return None

        return SinglePredictionResponse(
            id=record.id,
            timestamp=record.timestamp,
            features=HousingFeatures(
                square_footage=record.square_footage,
                bedrooms=record.bedrooms,
                bathrooms=record.bathrooms,
                year_built=record.year_built,
                lot_size=record.lot_size,
                distance_to_city_center=record.distance_to_city_center,
                school_rating=record.school_rating,
            ),
            predicted_price=record.predicted_price,
        )

    async def delete_prediction(self, prediction_id: int) -> bool:
        """Delete a single prediction. Returns True if deleted, False if not found."""
        stmt = select(PredictionRecord).where(PredictionRecord.id == prediction_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            return False

        await self._db.delete(record)
        await self._db.flush()
        return True

    async def delete_all_predictions(self) -> int:
        """Delete all prediction records. Returns the count of deleted records."""
        count_stmt = select(func.count()).select_from(PredictionRecord)
        total = (await self._db.execute(count_stmt)).scalar_one()

        if total > 0:
            await self._db.execute(delete(PredictionRecord))
            await self._db.flush()

        return total

    async def compare_predictions(
        self, prediction_ids: list[int]
    ) -> ComparisonResponse | None:
        """Compare multiple predictions by ID. Returns None if any ID is missing."""
        stmt = select(PredictionRecord).where(PredictionRecord.id.in_(prediction_ids))
        result = await self._db.execute(stmt)
        records = result.scalars().all()

        if len(records) != len(prediction_ids):
            return None

        predictions = [
            SinglePredictionResponse(
                id=r.id,
                timestamp=r.timestamp,
                features=HousingFeatures(
                    square_footage=r.square_footage,
                    bedrooms=r.bedrooms,
                    bathrooms=r.bathrooms,
                    year_built=r.year_built,
                    lot_size=r.lot_size,
                    distance_to_city_center=r.distance_to_city_center,
                    school_rating=r.school_rating,
                ),
                predicted_price=r.predicted_price,
            )
            for r in records
        ]

        prices = [p.predicted_price for p in predictions]
        summary = ComparisonSummary(
            min_price=min(prices),
            max_price=max(prices),
            avg_price=sum(prices) / len(prices),
        )

        return ComparisonResponse(predictions=predictions, summary=summary)
