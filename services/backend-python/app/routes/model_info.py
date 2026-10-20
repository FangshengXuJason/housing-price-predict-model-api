from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.schemas import HealthResponse
from app.services.ml_client import MLClient, MLClientError

router = APIRouter(tags=["model-info"])


@router.get("/api/model-info", response_model=dict)
async def get_model_info(request: Request) -> dict:
    """Proxy to the ML API model info endpoint."""
    ml_client: MLClient = request.app.state.ml_client
    try:
        info = await ml_client.get_model_info()
        return info
    except MLClientError as exc:
        return JSONResponse(
            status_code=502,
            content={"detail": f"ML API error: {exc}"},
        )


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
    """Health check endpoint that also tests ML API connectivity."""
    ml_client: MLClient = request.app.state.ml_client
    ml_healthy = await ml_client.health_check()

    return HealthResponse(
        status="ok" if ml_healthy else "degraded",
        ml_api_status="ok" if ml_healthy else "unavailable",
    )
