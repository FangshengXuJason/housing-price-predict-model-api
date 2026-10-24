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
_raw_model_info = None


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


def _compute_raw_coefficients():
    """Convert scaled-space coefficients to raw-space coefficients.

    Returns dict with raw_coefficients, raw_intercept, scaled_coefficients,
    scaled_intercept, and feature metrics.
    """
    global _raw_model_info
    if _raw_model_info is not None:
        return _raw_model_info

    model, scaler, metrics = _load_artifacts()

    means = scaler.mean_
    stds = scaler.scale_
    scaled_coefs = model.coef_

    # raw_coef = scaled_coef / std
    raw_coefs = scaled_coefs / stds

    # corrected_intercept = intercept - sum(scaled_coef * mean / std)
    corrected_intercept = float(model.intercept_ - np.sum(scaled_coefs * means / stds))

    _raw_model_info = {
        "raw_coefficients": {
            col: float(raw_coefs[i]) for i, col in enumerate(FEATURE_COLS)
        },
        "raw_intercept": corrected_intercept,
        "scaled_coefficients": metrics["coefficients"],
        "scaled_intercept": metrics["intercept"],
    }
    return _raw_model_info


def get_model_info() -> dict:
    """Return model type, raw-space coefficients, intercept, and metrics."""
    model, _, metrics = _load_artifacts()
    raw_info = _compute_raw_coefficients()
    return {
        "model_type": type(model).__name__,
        "coefficients": raw_info["raw_coefficients"],
        "intercept": raw_info["raw_intercept"],
        "scaled_coefficients": raw_info["scaled_coefficients"],
        "scaled_intercept": raw_info["scaled_intercept"],
        "metrics": {
            "train_r2": metrics["train_r2"],
            "test_r2": metrics["test_r2"],
            "train_rmse": metrics["train_rmse"],
            "test_rmse": metrics["test_rmse"],
            "train_mae": metrics["train_mae"],
            "test_mae": metrics["test_mae"],
        },
    }
