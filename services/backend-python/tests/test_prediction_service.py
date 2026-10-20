"""Tests for the PredictionService business logic layer."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PredictionRecord
from app.schemas import ComparisonResponse, HousingFeatures, SinglePredictionResponse
from app.services.ml_client import MLClient
from app.services.prediction_service import PredictionService


@pytest.fixture
def mock_ml_client():
    """Return a MagicMock standing in for MLClient."""
    client = AsyncMock(spec=MLClient)
    return client


@pytest.fixture
def service(db_session: AsyncSession, mock_ml_client):
    """Return a PredictionService wired to the test DB and mock ML client."""
    return PredictionService(db=db_session, ml_client=mock_ml_client)


# ---------------------------------------------------------------------------
# create_prediction
# ---------------------------------------------------------------------------

class TestCreatePrediction:
    @pytest.mark.asyncio
    async def test_success(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 350000.0

        result = await service.create_prediction(sample_features)

        mock_ml_client.predict_single.assert_awaited_once_with(sample_features)
        assert isinstance(result, SinglePredictionResponse)
        assert result.predicted_price == 350000.0
        assert result.features == sample_features
        assert result.id is not None

    @pytest.mark.asyncio
    async def test_persists_to_db(self, service, mock_ml_client, sample_features, db_session):
        mock_ml_client.predict_single.return_value = 250000.0

        result = await service.create_prediction(sample_features)
        await db_session.flush()

        stmt = MagicMock()
        from sqlalchemy import select
        stmt = select(PredictionRecord).where(PredictionRecord.id == result.id)
        record = (await db_session.execute(stmt)).scalar_one()
        assert record.predicted_price == 250000.0


# ---------------------------------------------------------------------------
# create_batch_predictions
# ---------------------------------------------------------------------------

class TestCreateBatchPredictions:
    @pytest.mark.asyncio
    async def test_success(self, service, mock_ml_client, sample_features_list):
        expected_prices = [300000.0, 250000.0, 500000.0]
        mock_ml_client.predict_batch.return_value = expected_prices

        results = await service.create_batch_predictions(sample_features_list)

        mock_ml_client.predict_batch.assert_awaited_once_with(sample_features_list)
        assert len(results) == 3
        for result, price in zip(results, expected_prices):
            assert result.predicted_price == price

    @pytest.mark.asyncio
    async def test_empty_list(self, service, mock_ml_client):
        mock_ml_client.predict_batch.return_value = []
        results = await service.create_batch_predictions([])
        assert results == []


# ---------------------------------------------------------------------------
# get_prediction_history
# ---------------------------------------------------------------------------

class TestGetPredictionHistory:
    @pytest.mark.asyncio
    async def test_empty_history(self, service, mock_ml_client):
        predictions, total = await service.get_prediction_history()
        assert predictions == []
        assert total == 0

    @pytest.mark.asyncio
    async def test_with_records(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 300000.0
        await service.create_prediction(sample_features)
        await service.create_prediction(sample_features)

        predictions, total = await service.get_prediction_history()
        assert total == 2
        assert len(predictions) == 2

    @pytest.mark.asyncio
    async def test_pagination(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 300000.0
        for _ in range(5):
            await service.create_prediction(sample_features)

        predictions, total = await service.get_prediction_history(skip=2, limit=2)
        assert total == 5
        assert len(predictions) == 2


# ---------------------------------------------------------------------------
# get_prediction_by_id
# ---------------------------------------------------------------------------

class TestGetPredictionById:
    @pytest.mark.asyncio
    async def test_found(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 400000.0
        created = await service.create_prediction(sample_features)

        result = await service.get_prediction_by_id(created.id)
        assert result is not None
        assert result.id == created.id
        assert result.predicted_price == 400000.0

    @pytest.mark.asyncio
    async def test_not_found(self, service):
        result = await service.get_prediction_by_id(9999)
        assert result is None


# ---------------------------------------------------------------------------
# delete_prediction
# ---------------------------------------------------------------------------

class TestDeletePrediction:
    @pytest.mark.asyncio
    async def test_deleted(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 300000.0
        created = await service.create_prediction(sample_features)

        deleted = await service.delete_prediction(created.id)
        assert deleted is True

        result = await service.get_prediction_by_id(created.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_not_found(self, service):
        deleted = await service.delete_prediction(9999)
        assert deleted is False


# ---------------------------------------------------------------------------
# delete_all_predictions
# ---------------------------------------------------------------------------

class TestDeleteAllPredictions:
    @pytest.mark.asyncio
    async def test_deletes_all(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 300000.0
        await service.create_prediction(sample_features)
        await service.create_prediction(sample_features)

        count = await service.delete_all_predictions()
        assert count == 2

        _, total = await service.get_prediction_history()
        assert total == 0

    @pytest.mark.asyncio
    async def test_empty_returns_zero(self, service):
        count = await service.delete_all_predictions()
        assert count == 0


# ---------------------------------------------------------------------------
# compare_predictions
# ---------------------------------------------------------------------------

class TestComparePredictions:
    @pytest.mark.asyncio
    async def test_success(self, service, mock_ml_client, sample_features):
        prices = [200000.0, 400000.0, 300000.0]
        mock_ml_client.predict_single.side_effect = prices

        ids = []
        for _ in range(3):
            result = await service.create_prediction(sample_features)
            ids.append(result.id)

        comparison = await service.compare_predictions(ids)
        assert comparison is not None
        assert isinstance(comparison, ComparisonResponse)
        assert len(comparison.predictions) == 3
        assert comparison.summary.min_price == 200000.0
        assert comparison.summary.max_price == 400000.0
        assert comparison.summary.avg_price == 300000.0

    @pytest.mark.asyncio
    async def test_missing_id_returns_none(self, service, mock_ml_client, sample_features):
        mock_ml_client.predict_single.return_value = 300000.0
        created = await service.create_prediction(sample_features)

        result = await service.compare_predictions([created.id, 9999])
        assert result is None
