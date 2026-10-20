from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.model_info import router as model_info_router
from app.routes.predictions import router as predictions_router
from app.services.ml_client import MLClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown lifecycle."""
    # Startup
    await init_db()
    app.state.ml_client = MLClient()

    yield

    # Shutdown
    await app.state.ml_client.close()


app = FastAPI(
    title="Housing Price Prediction Service",
    description=(
        "Backend service for housing price prediction with ML model integration, "
        "prediction history, and comparison analysis."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(predictions_router)
app.include_router(model_info_router)
