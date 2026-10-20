# Housing Price Prediction API

A FastAPI service that predicts housing prices using a Ridge regression model trained on housing features.

## Features

- **Single prediction**: `/predict` — predict price for one house
- **Batch prediction**: `/predict/batch` — predict prices for multiple houses
- **Model info**: `/model-info` — view model coefficients and performance metrics
- **Health check**: `/health` — service health status

## Model

- **Type**: Ridge Regression (scikit-learn)
- **Features**: square_footage, bedrooms, bathrooms, year_built, lot_size, distance_to_city_center, school_rating
- **Performance**: R² = 0.986, RMSE ≈ $9,000

## Quick Start

### Local (with uv)

```bash
# Install dependencies
uv sync

# Run the API
uv run uvicorn app.main:app --reload
```

API will be available at http://127.0.0.1:8000

### Docker

```bash
# Build image
docker build -t housing-price-api:0.1.0 .

# Run container
docker run -p 8000:8000 housing-price-api:0.1.0
```

### Docker Compose (Recommended)

```bash
# Start service (builds if needed)
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop service
docker compose down
```

Service will be available at http://localhost:8000

### Testing

```bash
# Start the service first
docker compose up -d

# Run the test suite
./test_api.sh

# Test against a different URL
./test_api.sh http://localhost:9000

# Stop the service
docker compose down
```

## API Reference

**Base URL**: `http://<host>:8000`  
**Content-Type**: `application/json`  
**Interactive Docs**: `http://<host>:8000/docs` (Swagger UI)

---

### `POST /predict`

Predict the price for a single house.

#### Request Body

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `square_footage` | float | Yes | > 0 | Living area in sq ft |
| `bedrooms` | int | Yes | >= 1 | Number of bedrooms |
| `bathrooms` | float | Yes | >= 0.5 | Number of bathrooms |
| `year_built` | int | Yes | 1900–2026 | Construction year |
| `lot_size` | float | Yes | > 0 | Lot size in sq ft |
| `distance_to_city_center` | float | Yes | >= 0 | Distance to city center (miles) |
| `school_rating` | float | Yes | 1–10 | School district rating |

#### Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 2000,
    "bedrooms": 4,
    "bathrooms": 2.5,
    "year_built": 2005,
    "lot_size": 8500,
    "distance_to_city_center": 6.0,
    "school_rating": 8.5
  }'
```

#### Response — `200 OK`

```json
{
  "predicted_price": 329019.94
}
```

| Field | Type | Description |
|---|---|---|
| `predicted_price` | float | Predicted house price in USD |

---

### `POST /predict/batch`

Predict prices for multiple houses in a single request.

#### Request Body

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `features` | array | Yes | min length: 1 | List of housing feature objects (same schema as `/predict`) |

#### Example Request

```bash
curl -X POST http://localhost:8000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      {
        "square_footage": 1500, "bedrooms": 3, "bathrooms": 2,
        "year_built": 1995, "lot_size": 6500,
        "distance_to_city_center": 4.0, "school_rating": 7.5
      },
      {
        "square_footage": 2500, "bedrooms": 5, "bathrooms": 3,
        "year_built": 2015, "lot_size": 10000,
        "distance_to_city_center": 8.0, "school_rating": 9.0
      }
    ]
  }'
```

#### Response — `200 OK`

```json
{
  "predictions": [244167.55, 398768.31]
}
```

| Field | Type | Description |
|---|---|---|
| `predictions` | float[] | List of predicted prices in USD (same order as input) |

---

### `GET /model-info`

Returns model type, feature coefficients, intercept, and performance metrics.

#### Example Request

```bash
curl http://localhost:8000/model-info
```

#### Response — `200 OK`

```json
{
  "model_type": "Ridge",
  "coefficients": {
    "square_footage": 759.27,
    "bedrooms": 5463.86,
    "bathrooms": 11368.38,
    "year_built": -1101.95,
    "lot_size": 22813.99,
    "distance_to_city_center": 25937.05,
    "school_rating": 14373.25
  },
  "intercept": 270375.0,
  "metrics": {
    "train_r2": 0.9860,
    "test_r2": 0.9857,
    "train_rmse": 9423.14,
    "test_rmse": 8948.69,
    "train_mae": 7911.81,
    "test_mae": 8629.04
  }
}
```

| Field | Type | Description |
|---|---|---|
| `model_type` | string | Regression algorithm name |
| `coefficients` | object | Feature name → coefficient mapping |
| `intercept` | float | Model y-intercept |
| `metrics` | object | Train/test performance metrics (R², RMSE, MAE) |

---

### `GET /health`

Health check endpoint for monitoring and load balancers.

#### Example Request

```bash
curl http://localhost:8000/health
```

#### Response — `200 OK`

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | string | Service status (`"healthy"`) |
| `version` | string | API version |

---

### Error Responses

#### `422 Unprocessable Entity` — Validation Error

Returned when the request body fails validation (missing fields, out-of-range values, wrong types).

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "bathrooms"],
      "msg": "Field required",
      "input": { "square_footage": 2000, "bedrooms": 4 }
    }
  ]
}
```

#### `500 Internal Server Error`

Returned when prediction fails unexpectedly.

```json
{
  "detail": "Prediction failed: <error message>"
}
```

### HTTP Status Codes Summary

| Code | Meaning |
|---|---|
| `200` | Success |
| `422` | Request validation error (missing/invalid fields) |
| `500` | Internal server error |

## Training

To retrain the model:

```bash
uv run python model/train.py
```

This reads `data/test_data.xlsx` and saves artifacts to `model/artifacts/`.

## Project Structure

```
├── app/                    # FastAPI application
│   ├── main.py            # API endpoints
│   ├── model_service.py   # Model loading & prediction
│   └── schemas.py         # Pydantic request/response models
├── model/
│   ├── train.py           # Training script
│   └── artifacts/         # Trained model + metrics
├── data/
│   └── test_data.xlsx     # Training dataset
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose configuration
├── pyproject.toml         # Dependencies (uv)
└── uv.lock               # Locked dependencies
```
