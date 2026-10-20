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

## API Endpoints

### POST /predict

Predict price for a single house.

```json
{
  "square_footage": 2000,
  "bedrooms": 4,
  "bathrooms": 2.5,
  "year_built": 2005,
  "lot_size": 8500,
  "distance_to_city_center": 6.0,
  "school_rating": 8.5
}
```

### POST /predict/batch

Predict prices for multiple houses.

```json
{
  "features": [
    {"square_footage": 1500, "bedrooms": 3, "bathrooms": 2, "year_built": 1995, "lot_size": 6500, "distance_to_city_center": 4.0, "school_rating": 7.5},
    {"square_footage": 2500, "bedrooms": 5, "bathrooms": 3, "year_built": 2015, "lot_size": 10000, "distance_to_city_center": 8.0, "school_rating": 9.0}
  ]
}
```

### GET /model-info

Returns model coefficients and performance metrics.

### GET /health

Returns service health status.

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
├── pyproject.toml         # Dependencies (uv)
└── uv.lock               # Locked dependencies
```
