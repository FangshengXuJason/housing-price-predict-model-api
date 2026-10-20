"""Train a Ridge regression model on housing price data."""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Paths
DATA_PATH = Path("data/test_data.xlsx")
ARTIFACTS_DIR = Path("model/artifacts")
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

# Load data
df = pd.read_excel(DATA_PATH, sheet_name="Test Data For Prediction")

# Features and target
FEATURE_COLS = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET_COL = "price"

X = df[FEATURE_COLS]
y = df[TARGET_COL]

# Split 80/20
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Ridge regression
model = Ridge(alpha=1.0)
model.fit(X_train_scaled, y_train)

# Predict
y_pred_train = model.predict(X_train_scaled)
y_pred_test = model.predict(X_test_scaled)

# Metrics
metrics = {
    "train_r2": r2_score(y_train, y_pred_train),
    "test_r2": r2_score(y_test, y_pred_test),
    "train_rmse": float(np.sqrt(mean_squared_error(y_train, y_pred_train))),
    "test_rmse": float(np.sqrt(mean_squared_error(y_test, y_pred_test))),
    "train_mae": float(mean_absolute_error(y_train, y_pred_train)),
    "test_mae": float(mean_absolute_error(y_test, y_pred_test)),
    "coefficients": {
        col: float(coef) for col, coef in zip(FEATURE_COLS, model.coef_)
    },
    "intercept": float(model.intercept_),
}

# Save artifacts
joblib.dump(model, ARTIFACTS_DIR / "model.joblib")
joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")

with open(ARTIFACTS_DIR / "metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Training complete!")
print(f"Train R²: {metrics['train_r2']:.4f}, Test R²: {metrics['test_r2']:.4f}")
print(f"Train RMSE: {metrics['train_rmse']:.0f}, Test RMSE: {metrics['test_rmse']:.0f}")
print(f"Artifacts saved to {ARTIFACTS_DIR}")
