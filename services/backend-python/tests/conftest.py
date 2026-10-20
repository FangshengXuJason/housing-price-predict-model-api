"""Shared test fixtures for the housing price prediction backend tests."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_db
from app.main import app
from app.models import Base
from app.schemas import HousingFeatures
from app.services.ml_client import MLClient

# Use an in-memory SQLite database for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture
async def db_session():
    """Yield an async database session backed by an in-memory SQLite DB."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_factory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """Yield an httpx.AsyncClient wired to the FastAPI app with test overrides."""

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    # Attach a mock ML client to app.state so routes that use it work
    mock_ml = MLClient(base_url="http://mock-ml-api:8000")
    app.state.ml_client = mock_ml

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def mock_ml_client():
    """Return an MLClient pointing at a mock base URL (for respx mocking)."""
    ml = MLClient(base_url="http://mock-ml-api:8000")
    yield ml
    await ml.close()


@pytest.fixture
def sample_features_data() -> dict:
    """Return a dict of valid housing features."""
    return {
        "square_footage": 2000.0,
        "bedrooms": 3,
        "bathrooms": 2.0,
        "year_built": 2005,
        "lot_size": 5000.0,
        "distance_to_city_center": 10.0,
        "school_rating": 7.5,
    }


@pytest.fixture
def sample_features(sample_features_data: dict) -> HousingFeatures:
    """Return a HousingFeatures instance."""
    return HousingFeatures(**sample_features_data)


@pytest.fixture
def sample_features_list(sample_features_data: dict) -> list[HousingFeatures]:
    """Return a list of 3 different HousingFeatures instances."""
    base = sample_features_data.copy()
    items = [
        base,
        {**base, "square_footage": 1500.0, "bedrooms": 2, "bathrooms": 1.5},
        {**base, "square_footage": 3000.0, "bedrooms": 5, "bathrooms": 3.5},
    ]
    return [HousingFeatures(**item) for item in items]
