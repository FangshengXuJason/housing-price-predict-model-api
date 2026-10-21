"""Tests for the ML API client using respx to mock HTTP calls."""

import httpx
import pytest
import respx

from app.schemas import HousingFeatures
from app.services.ml_client import MLClient, MLClientError

MOCK_BASE = "http://mock-ml-api:8000"


# ---------------------------------------------------------------------------
# predict_single
# ---------------------------------------------------------------------------

class TestPredictSingle:
    @pytest.mark.asyncio
    async def test_success(self, sample_features):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(200, json={"predicted_price": 350000.50})
            )
            client = MLClient(base_url=MOCK_BASE)
            price = await client.predict_single(sample_features)
            await client.close()
        assert price == 350000.50

    @pytest.mark.asyncio
    async def test_ml_api_http_error(self, sample_features):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict").mock(
                return_value=httpx.Response(500, json={"detail": "Internal error"})
            )
            client = MLClient(base_url=MOCK_BASE)
            with pytest.raises(MLClientError, match="status 500"):
                await client.predict_single(sample_features)
            await client.close()

    @pytest.mark.asyncio
    async def test_ml_api_connection_error(self, sample_features):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict").mock(side_effect=httpx.ConnectError("Connection refused"))
            client = MLClient(base_url=MOCK_BASE)
            with pytest.raises(MLClientError, match="request failed"):
                await client.predict_single(sample_features)
            await client.close()


# ---------------------------------------------------------------------------
# predict_batch
# ---------------------------------------------------------------------------

class TestPredictBatch:
    @pytest.mark.asyncio
    async def test_success(self, sample_features_list):
        expected = [300000.0, 250000.0, 500000.0]
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict/batch").mock(
                return_value=httpx.Response(200, json={"predictions": expected})
            )
            client = MLClient(base_url=MOCK_BASE)
            prices = await client.predict_batch(sample_features_list)
            await client.close()
        assert prices == expected

    @pytest.mark.asyncio
    async def test_ml_api_http_error(self, sample_features_list):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict/batch").mock(
                return_value=httpx.Response(503, json={"detail": "Service unavailable"})
            )
            client = MLClient(base_url=MOCK_BASE)
            with pytest.raises(MLClientError, match="status 503"):
                await client.predict_batch(sample_features_list)
            await client.close()


# ---------------------------------------------------------------------------
# get_model_info
# ---------------------------------------------------------------------------

class TestGetModelInfo:
    @pytest.mark.asyncio
    async def test_success(self):
        model_info = {
            "model_type": "Ridge Regression",
            "coefficients": {"square_footage": 150.0},
            "intercept": 50000.0,
            "metrics": {"r2_score": 0.85},
        }
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.get("/model-info").mock(
                return_value=httpx.Response(200, json=model_info)
            )
            client = MLClient(base_url=MOCK_BASE)
            result = await client.get_model_info()
            await client.close()
        assert result == model_info

    @pytest.mark.asyncio
    async def test_http_error(self):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.get("/model-info").mock(
                return_value=httpx.Response(500, json={"detail": "error"})
            )
            client = MLClient(base_url=MOCK_BASE)
            with pytest.raises(MLClientError, match="status 500"):
                await client.get_model_info()
            await client.close()


# ---------------------------------------------------------------------------
# health_check
# ---------------------------------------------------------------------------

class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_ml_api_up(self):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.get("/health").mock(return_value=httpx.Response(200, json={"status": "ok"}))
            client = MLClient(base_url=MOCK_BASE)
            result = await client.health_check()
            await client.close()
        assert result is True

    @pytest.mark.asyncio
    async def test_ml_api_down(self):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.get("/health").mock(side_effect=httpx.ConnectError("down"))
            client = MLClient(base_url=MOCK_BASE)
            result = await client.health_check()
            await client.close()
        assert result is False

    @pytest.mark.asyncio
    async def test_ml_api_returns_500(self):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.get("/health").mock(return_value=httpx.Response(500))
            client = MLClient(base_url=MOCK_BASE)
            result = await client.health_check()
            await client.close()
        assert result is False


# ---------------------------------------------------------------------------
# timeout handling
# ---------------------------------------------------------------------------

class TestTimeout:
    @pytest.mark.asyncio
    async def test_timeout_raises_ml_client_error(self, sample_features):
        with respx.mock(base_url=MOCK_BASE, assert_all_called=True) as rsps:
            rsps.post("/predict").mock(side_effect=httpx.ReadTimeout("timeout"))
            client = MLClient(base_url=MOCK_BASE, timeout=1.0)
            with pytest.raises(MLClientError, match="request failed"):
                await client.predict_single(sample_features)
            await client.close()
