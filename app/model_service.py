"""Model service: loads trained model and handles predictions."""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ARTIFACTS_DIR = Path(__file__).parent.parent / "model" / "artifacts"

FEATURE_COLS = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]

# Module-level singletons (loaded once on first use)
_model = None
_scaler = None
_metrics = None


def _load_artifacts():
    """Lazy-load model, scaler, and metrics on first call."""
    global _model, _scaler, _metrics
    if _model is None:
        _model = joblib.load(ARTIFACTS_DIR / "model.joblib")
    if _scaler is None:
        _scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
    if _metrics is None:
        with open(ARTIFACTS_DIR / "metrics.json") as f:
            _metrics = json.load(f)
    return _model, _scaler, _metrics


def predict_single(features_dict: dict) -> float:
    """Predict price for a single housing feature set."""
    model, scaler, _ = _load_artifacts()
    df = pd.DataFrame([features_dict], columns=FEATURE_COLS)
    scaled = scaler.transform(df)
    return float(model.predict(scaled)[0])


def predict_batch(features_list: list[dict]) -> list[float]:
    """Predict prices for a batch of housing feature sets."""
    model, scaler, _ = _load_artifacts()
    df = pd.DataFrame(features_list, columns=FEATURE_COLS)
    scaled = scaler.transform(df)
    return [float(p) for p in model.predict(scaled)]


def get_model_info() -> dict:
    """Return model type, coefficients, intercept, and metrics."""
    model, _, metrics = _load_artifacts()
    return {
        "model_type": type(model).__name__,
        "coefficients": metrics["coefficients"],
        "intercept": metrics["intercept"],
        "metrics": {
            "train_r2": metrics["train_r2"],
            "test_r2": metrics["test_r2"],
            "train_rmse": metrics["train_rmse"],
            "test_rmse": metrics["test_rmse"],
            "train_mae": metrics["train_mae"],
            "test_mae": metrics["test_mae"],
        },
    }
