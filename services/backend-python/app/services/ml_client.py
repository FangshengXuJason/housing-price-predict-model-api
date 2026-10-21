import httpx

from app.config import settings
from app.schemas import HousingFeatures


class MLClientError(Exception):
    """Raised when ML API communication fails."""

    pass


class MLClient:
    """Async HTTP client for communicating with the ML Model API."""

    def __init__(self, base_url: str | None = None, timeout: float = 10.0) -> None:
        self._base_url = base_url or settings.ML_API_URL
        self._timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                timeout=self._timeout,
            )
        return self._client

    async def predict_single(self, features: HousingFeatures) -> float:
        """Call POST /predict and return the predicted price."""
        client = await self._get_client()
        try:
            response = await client.post(
                "/predict",
                json=features.model_dump(),
            )
            response.raise_for_status()
            data = response.json()
            return float(data["predicted_price"])
        except httpx.HTTPStatusError as exc:
            raise MLClientError(
                f"ML API returned status {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise MLClientError(f"ML API request failed: {exc}") from exc

    async def predict_batch(self, features_list: list[HousingFeatures]) -> list[float]:
        """Call POST /predict/batch and return list of predicted prices."""
        client = await self._get_client()
        payload = {"features": [f.model_dump() for f in features_list]}
        try:
            response = await client.post(
                "/predict/batch",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return [float(p) for p in data["predictions"]]
        except httpx.HTTPStatusError as exc:
            raise MLClientError(
                f"ML API returned status {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise MLClientError(f"ML API request failed: {exc}") from exc

    async def get_model_info(self) -> dict:
        """Call GET /model-info and return model information."""
        client = await self._get_client()
        try:
            response = await client.get("/model-info")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            raise MLClientError(
                f"ML API returned status {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise MLClientError(f"ML API request failed: {exc}") from exc

    async def health_check(self) -> bool:
        """Call GET /health and return True if the ML API is healthy."""
        client = await self._get_client()
        try:
            response = await client.get("/health")
            response.raise_for_status()
            return True
        except (httpx.HTTPStatusError, httpx.RequestError):
            return False

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
