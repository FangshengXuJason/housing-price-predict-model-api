# Housing Price Prediction Backend Service

A production-grade **FastAPI** backend service that integrates with a Machine Learning model API to provide housing price predictions, persistent prediction history, and comparative analysis.

---

## Features

- **Single Prediction** — Submit property features and receive an ML-powered price estimate
- **Batch Predictions** — Submit multiple properties in a single request
- **Prediction History** — Retrieve all past predictions with pagination
- **Get Prediction by ID** — Look up a specific prediction record
- **Delete Prediction** — Remove a single prediction record
- **Delete All Predictions** — Clear the entire prediction history
- **Compare Predictions** — Compare multiple predictions with summary statistics (min, max, avg price)
- **Model Info Proxy** — Retrieve underlying ML model metadata (coefficients, metrics)
- **Health Check** — Service and ML API connectivity status

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115+ |
| Language | Python 3.12+ |
| Database | SQLite (async via aiosqlite) |
| ORM | SQLAlchemy 2.0 (async) |
| HTTP Client | httpx (async) |
| Validation | Pydantic v2 |
| Package Manager | uv |
| Containerization | Docker, Docker Compose |
| Testing | pytest, pytest-asyncio, respx |

---

## Prerequisites

- **Python 3.12+** (for local development)
- **Docker & Docker Compose** (for containerized deployment)
- **uv** package manager (optional, for faster dependency resolution)
- Access to the **ML Model API** service (included in docker-compose)

---

## Quick Start

### Local Development Setup

```bash
# 1. Navigate to the service directory
cd services/backend-python

# 2. (Optional) Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux

# 3. Install dependencies with uv
uv pip install -r pyproject.toml

# 4. Install dev dependencies (for testing)
uv pip install -r pyproject.toml --extra dev

# 5. Set environment variables
export ML_API_URL=http://localhost:8000
export DATABASE_URL=sqlite+aiosqlite:////path/to/data/predictions.db

# 6. Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

The API will be available at `http://localhost:8001`.  
Interactive docs at `http://localhost:8001/docs`.

### Running with Docker Compose

```bash
# From this directory (services/backend-python)
docker compose up --build

# Run in detached mode
docker compose up --build -d

# View logs
docker compose logs -f backend-python

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

This starts both:
- **ml-api** on port `8000`
- **backend-python** on port `8001`

---

## API Documentation

### Base URL

```
http://localhost:8001
```

---

### Health Check

#### `GET /health`

Returns service health and ML API connectivity status.

**Response** `200 OK`
```json
{
  "status": "ok",
  "ml_api_status": "ok"
}
```

> When ML API is unreachable, `status` returns `"degraded"` and `ml_api_status` returns `"unavailable"`.

---

### Model Info

#### `GET /api/model-info`

Proxies to the ML API to retrieve model metadata.

**Response** `200 OK`
```json
{
  "model_type": "ridge_regression",
  "coefficients": {
    "square_footage": 150.5,
    "bedrooms": 20000.0,
    "bathrooms": 15000.0,
    "year_built": 500.0,
    "lot_size": 50.0,
    "distance_to_city_center": -5000.0,
    "school_rating": 25000.0
  },
  "intercept": -1000000.0,
  "metrics": {
    "r2_score": 0.95,
    "rmse": 25000.0
  }
}
```

**Status Codes**: `200`, `502` (ML API unavailable)

---

### Create Single Prediction

#### `POST /api/predictions`

**Request Body**
```json
{
  "features": {
    "square_footage": 2000,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 2000,
    "lot_size": 5000,
    "distance_to_city_center": 10,
    "school_rating": 7
  }
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "timestamp": "2026-10-20T12:00:00",
  "features": {
    "square_footage": 2000.0,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 2000,
    "lot_size": 5000.0,
    "distance_to_city_center": 10.0,
    "school_rating": 7.0
  },
  "predicted_price": 385000.0
}
```

**Status Codes**: `201`, `422` (validation error), `502` (ML API error)

---

### Create Batch Predictions

#### `POST /api/predictions/batch`

**Request Body**
```json
{
  "features_list": [
    {
      "square_footage": 1500,
      "bedrooms": 2,
      "bathrooms": 1.5,
      "year_built": 1995,
      "lot_size": 4000,
      "distance_to_city_center": 15,
      "school_rating": 6
    },
    {
      "square_footage": 3000,
      "bedrooms": 4,
      "bathrooms": 3,
      "year_built": 2010,
      "lot_size": 8000,
      "distance_to_city_center": 5,
      "school_rating": 9
    }
  ]
}
```

**Response** `201 Created`
```json
{
  "predictions": [
    { "id": 2, "timestamp": "...", "features": {...}, "predicted_price": 310000.0 },
    { "id": 3, "timestamp": "...", "features": {...}, "predicted_price": 520000.0 }
  ]
}
```

**Status Codes**: `201`, `422`, `502`

---

### Get Prediction History

#### `GET /api/predictions`

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| skip | int | 0 | Number of records to skip |
| limit | int | 100 | Maximum records to return |

**Response** `200 OK`
```json
{
  "predictions": [
    { "id": 1, "timestamp": "...", "features": {...}, "predicted_price": 385000.0 }
  ],
  "total": 1
}
```

---

### Get Prediction by ID

#### `GET /api/predictions/{prediction_id}`

**Response** `200 OK`
```json
{
  "id": 1,
  "timestamp": "2026-10-20T12:00:00",
  "features": {...},
  "predicted_price": 385000.0
}
```

**Status Codes**: `200`, `404`

---

### Compare Predictions

#### `POST /api/predictions/compare`

**Request Body**
```json
{
  "prediction_ids": [1, 2, 3]
}
```

**Response** `200 OK`
```json
{
  "predictions": [
    { "id": 1, "predicted_price": 385000.0 },
    { "id": 2, "predicted_price": 310000.0 },
    { "id": 3, "predicted_price": 520000.0 }
  ],
  "summary": {
    "min_price": 310000.0,
    "max_price": 520000.0,
    "avg_price": 405000.0
  }
}
```

**Status Codes**: `200`, `404`

---

### Delete Prediction

#### `DELETE /api/predictions/{prediction_id}`

**Response** `204 No Content`

**Status Codes**: `204`, `404`

---

### Delete All Predictions

#### `DELETE /api/predictions`

**Response** `204 No Content`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ML_API_URL` | `http://localhost:8000` | URL of the ML Model API service |
| `DATABASE_URL` | `sqlite+aiosqlite:///./predictions.db` | Async SQLAlchemy database URL |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8001` | Server port |

---

## Testing

### Unit Tests

```bash
# Install dev dependencies
uv pip install -r pyproject.toml --extra dev

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=term-missing
```

### Integration Tests

Start the services first:

```bash
docker compose up --build -d
```

Run the test script:

```bash
# Default (localhost:8001)
./test_api.sh

# Custom URL
BASE_URL=http://your-host:8001 ./test_api.sh
```

The script tests all 9 API endpoints and reports pass/fail counts.

---

## Project Structure

```
services/backend-python/
├── app/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── predictions.py    # Prediction CRUD & comparison endpoints
│   │   └── model_info.py     # Model info proxy & health check
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ml_client.py      # Async HTTP client for ML API
│   │   └── prediction_service.py  # Business logic layer
│   ├── __init__.py
│   ├── config.py             # Settings (env vars)
│   ├── database.py           # Async SQLAlchemy setup
│   ├── main.py               # FastAPI application entry point
│   ├── models.py             # DB models (PredictionRecord)
│   └── schemas.py            # Pydantic request/response schemas
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Test fixtures
│   ├── test_api_endpoints.py # Endpoint integration tests
│   ├── test_ml_client.py     # ML client unit tests (with respx mocks)
│   ├── test_predictions_service.py  # Service layer tests
│   └── test_schemas.py       # Schema validation tests
├── .python-version           # Python 3.12
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # Service orchestration (ml-api + backend)
├── pyproject.toml            # Project dependencies & build config
├── test_api.sh               # Manual integration test script
└── README.md
```

---

## Future Frontend Integration

This backend is designed to support a Next.js frontend portal with the following planned features:

1. **Prediction Form** — Interactive form for submitting property features and receiving real-time price estimates
2. **Prediction History Dashboard** — Tabular view of all past predictions with sorting, filtering, and pagination
3. **Property Comparison View** — Side-by-side comparison of selected properties with visual summary statistics
4. **Model Information Page** — Display ML model metadata, coefficients, and performance metrics

The API is CORS-enabled for all origins during development and follows RESTful conventions for straightforward frontend integration.

---

## License

This project is licensed under the MIT License.
