"""Integration tests for all FastAPI endpoints."""

import httpx
import pytest
import respx
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.main import app
from app.services.ml_client import MLClient

MOCK_ML_BASE = "http://mock-ml-api:8000"


# ---------------------------------------------------------------------------
# POST /api/predictions
# ---------------------------------------------------------------------------

class TestCreatePredictionEndpoint:
    @pytest.mark.asyncio
    async def test_201_success(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 350000.0})
            )
            resp = await client.post(
                "/api/predictions",
                json={"features": sample_features_data},
            )
        assert resp.status_code == 201
        body = resp.json()
        assert body["predicted_price"] == 350000.0
        assert "id" in body
        assert "timestamp" in body

    @pytest.mark.asyncio
    async def test_422_validation_error(self, client: AsyncClient):
        invalid_data = {
            "features": {
                "square_footage": -100,  # invalid: must be > 0
                "bedrooms": 3,
                "bathrooms": 2.0,
                "year_built": 2005,
                "lot_size": 5000.0,
                "distance_to_city_center": 10.0,
                "school_rating": 7.5,
            }
        }
        resp = await client.post("/api/predictions", json=invalid_data)
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/predictions/batch
# ---------------------------------------------------------------------------

class TestBatchPredictionEndpoint:
    @pytest.mark.asyncio
    async def test_201_success(self, client: AsyncClient, sample_features_data):
        features_list = [sample_features_data, {**sample_features_data, "square_footage": 1500}]
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict/batch").mock(
                return_value=httpx.Response(200, json={"predictions": [300000.0, 250000.0]})
            )
            resp = await client.post(
                "/api/predictions/batch",
                json={"features_list": features_list},
            )
        assert resp.status_code == 201
        body = resp.json()
        assert len(body["predictions"]) == 2

    @pytest.mark.asyncio
    async def test_422_empty_list(self, client: AsyncClient):
        resp = await client.post(
            "/api/predictions/batch",
            json={"features_list": []},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/predictions
# ---------------------------------------------------------------------------

class TestGetPredictionHistoryEndpoint:
    @pytest.mark.asyncio
    async def test_200_empty(self, client: AsyncClient):
        resp = await client.get("/api/predictions")
        assert resp.status_code == 200
        body = resp.json()
        assert body["predictions"] == []
        assert body["total"] == 0

    @pytest.mark.asyncio
    async def test_200_with_pagination(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 300000.0})
            )
            for _ in range(3):
                await client.post("/api/predictions", json={"features": sample_features_data})

        resp = await client.get("/api/predictions?skip=1&limit=2")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == 3
        assert len(body["predictions"]) == 2


# ---------------------------------------------------------------------------
# GET /api/predictions/{id}
# ---------------------------------------------------------------------------

class TestGetPredictionByIdEndpoint:
    @pytest.mark.asyncio
    async def test_200_found(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 400000.0})
            )
            create_resp = await client.post(
                "/api/predictions", json={"features": sample_features_data}
            )
        prediction_id = create_resp.json()["id"]

        resp = await client.get(f"/api/predictions/{prediction_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == prediction_id

    @pytest.mark.asyncio
    async def test_404_not_found(self, client: AsyncClient):
        resp = await client.get("/api/predictions/9999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/predictions/{id}
# ---------------------------------------------------------------------------

class TestDeletePredictionEndpoint:
    @pytest.mark.asyncio
    async def test_204_deleted(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 300000.0})
            )
            create_resp = await client.post(
                "/api/predictions", json={"features": sample_features_data}
            )
        prediction_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/predictions/{prediction_id}")
        assert resp.status_code == 204

        # Verify it's gone
        resp = await client.get(f"/api/predictions/{prediction_id}")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_404_not_found(self, client: AsyncClient):
        resp = await client.delete("/api/predictions/9999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/predictions (delete all)
# ---------------------------------------------------------------------------

class TestDeleteAllPredictionsEndpoint:
    @pytest.mark.asyncio
    async def test_204_success(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 300000.0})
            )
            await client.post("/api/predictions", json={"features": sample_features_data})
            await client.post("/api/predictions", json={"features": sample_features_data})

        resp = await client.delete("/api/predictions")
        assert resp.status_code == 204

        # Verify all gone
        resp = await client.get("/api/predictions")
        assert resp.json()["total"] == 0


# ---------------------------------------------------------------------------
# POST /api/predictions/compare
# ---------------------------------------------------------------------------

class TestComparePredictionsEndpoint:
    @pytest.mark.asyncio
    async def test_200_success(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                side_effect=[
                    httpx.Response(200, json={"prediction": 200000.0}),
                    httpx.Response(200, json={"prediction": 400000.0}),
                ]
            )
            ids = []
            for _ in range(2):
                create_resp = await client.post(
                    "/api/predictions", json={"features": sample_features_data}
                )
                ids.append(create_resp.json()["id"])

        resp = await client.post(
            "/api/predictions/compare",
            json={"prediction_ids": ids},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["predictions"]) == 2
        assert body["summary"]["min_price"] == 200000.0
        assert body["summary"]["max_price"] == 400000.0
        assert body["summary"]["avg_price"] == 300000.0

    @pytest.mark.asyncio
    async def test_404_missing_id(self, client: AsyncClient, sample_features_data):
        with respx.mock(base_url=MOCK_ML_BASE) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"prediction": 300000.0})
            )
            create_resp = await client.post(
                "/api/predictions", json={"features": sample_features_data}
            )
        prediction_id = create_resp.json()["id"]

        resp = await client.post(
            "/api/predictions/compare",
            json={"prediction_ids": [prediction_id, 9999]},
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# GET /api/model-info
# ---------------------------------------------------------------------------

class TestModelInfoEndpoint:
    @pytest.mark.asyncio
    async def test_200_success(self, client: AsyncClient):
        model_info = {
            "model_type": "Ridge",
            "coefficients": {"a": 1.0},
            "intercept": 100.0,
            "metrics": {"r2": 0.9},
        }
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.get("/model-info").mock(
                return_value=httpx.Response(200, json=model_info)
            )
            resp = await client.get("/api/model-info")
        assert resp.status_code == 200
        assert resp.json() == model_info

    @pytest.mark.asyncio
    async def test_502_ml_api_error(self, client: AsyncClient):
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.get("/model-info").mock(
                return_value=httpx.Response(500, json={"detail": "error"})
            )
            resp = await client.get("/api/model-info")
        assert resp.status_code == 502


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_200_ml_up(self, client: AsyncClient):
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.get("/health").mock(
                return_value=httpx.Response(200, json={"status": "ok"})
            )
            resp = await client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["ml_api_status"] == "ok"

    @pytest.mark.asyncio
    async def test_200_ml_down(self, client: AsyncClient):
        with respx.mock(base_url=MOCK_ML_BASE, assert_all_called=True) as rsps:
            rsps.get("/health").mock(side_effect=httpx.ConnectError("down"))
            resp = await client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "degraded"
        assert body["ml_api_status"] == "unavailable"
