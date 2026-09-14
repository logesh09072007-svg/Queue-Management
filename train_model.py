"""
QueueSense AI - Model Training Script
=====================================
Trains RandomForestRegressor models for:
1. Crowd / Customer Volume Prediction (predicts expected customers in time slot)
2. Waiting Time Prediction (predicts expected queue wait in minutes)

Saves trained models and metadata to ml/saved_models/
"""

import os
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_canteen_data.csv")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes engineered features for machine learning models."""
    data = df.copy()

    # Time-based cyclical encodings
    # Convert hour and minute into continuous hour float (0.0 to 24.0)
    hour_float = data["hour"] + data["minute"] / 60.0
    data["sin_hour"] = np.sin(2 * np.pi * hour_float / 24.0)
    data["cos_hour"] = np.cos(2 * np.pi * hour_float / 24.0)

    # Day of week cyclical encoding (0 = Monday, 6 = Sunday)
    data["sin_dow"] = np.sin(2 * np.pi * data["day_of_week"] / 7.0)
    data["cos_dow"] = np.cos(2 * np.pi * data["day_of_week"] / 7.0)

    # Rush hour flags
    data["is_breakfast_peak"] = ((hour_float >= 8.5) & (hour_float <= 9.5)).astype(int)
    data["is_morning_break"] = ((hour_float >= 10.5) & (hour_float <= 11.5)).astype(int)
    data["is_lunch_peak"] = ((hour_float >= 12.0) & (hour_float <= 14.0)).astype(int)
    data["is_evening_break"] = ((hour_float >= 16.5) & (hour_float <= 17.5)).astype(int)

    # Queue and workload ratios
    data["queue_per_counter"] = data["queue_length"] / np.maximum(1, data["active_counters"])
    data["workload_index"] = (data["queue_length"] + data["orders_pending"]) / np.maximum(1, data["active_counters"])

    return data

def main():
    print("=" * 65)
    print("QueueSense AI - Machine Learning Model Training")
    print("=" * 65)

    # 1. Load dataset
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run generate_synthetic_data.py first.")

    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"Total records loaded: {len(df)}")

    # 2. Data validation and cleaning
    print("Validating dataset integrity...")
    missing_count = df.isnull().sum().sum()
    if missing_count > 0:
        print(f"Handling {missing_count} missing values...")
        df = df.dropna()

    # 3. Feature engineering
    print("Engineering features (cyclical encodings, rush windows, queue ratios)...")
    featured_df = engineer_features(df)

    # Feature sets
    # Model 1 features: for predicting customer crowd volume
    crowd_features = [
        "hour",
        "minute",
        "day_of_week",
        "sin_hour",
        "cos_hour",
        "sin_dow",
        "cos_dow",
        "is_holiday",
        "is_exam_period",
        "is_breakfast_peak",
        "is_morning_break",
        "is_lunch_peak",
        "is_evening_break"
    ]

    # Model 2 features: for predicting queue waiting time
    wait_features = [
        "queue_length",
        "active_counters",
        "orders_pending",
        "average_service_time",
        "queue_per_counter",
        "workload_index",
        "hour",
        "minute",
        "day_of_week",
        "sin_hour",
        "cos_hour",
        "is_lunch_peak"
    ]

    # Target variables
    y_crowd = featured_df["predicted_customer_count"]
    y_wait = featured_df["waiting_time_minutes"]

    X_crowd = featured_df[crowd_features]
    X_wait = featured_df[wait_features]

    # 4. Train-test split (80% train, 20% test)
    X_c_train, X_c_test, y_c_train, y_c_test = train_test_split(
        X_crowd, y_crowd, test_size=0.20, random_state=42
    )
    X_w_train, X_w_test, y_w_train, y_w_test = train_test_split(
        X_wait, y_wait, test_size=0.20, random_state=42
    )

    print(f"Training set: {len(X_c_train)} samples | Test set: {len(X_c_test)} samples")

    # 5. Train Model 1: Crowd / Volume Predictor
    print("\n--- Training Model 1: Crowd Volume (RandomForestRegressor) ---")
    crowd_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    crowd_model.fit(X_c_train, y_c_train)
    y_c_pred = crowd_model.predict(X_c_test)

    c_mae = mean_absolute_error(y_c_test, y_c_pred)
    c_mse = mean_squared_error(y_c_test, y_c_pred)
    c_rmse = np.sqrt(c_mse)
    c_r2 = r2_score(y_c_test, y_c_pred)

    print(f"Crowd Model Evaluation Metrics:")
    print(f"  MAE  : {c_mae:.3f} customers")
    print(f"  RMSE : {c_rmse:.3f} customers")
    print(f"  R²   : {c_r2:.4f}")

    # 6. Train Model 2: Waiting Time Predictor
    print("\n--- Training Model 2: Waiting Time (RandomForestRegressor) ---")
    wait_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=14,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    wait_model.fit(X_w_train, y_w_train)
    y_w_pred = wait_model.predict(X_w_test)

    w_mae = mean_absolute_error(y_w_test, y_w_pred)
    w_mse = mean_squared_error(y_w_test, y_w_pred)
    w_rmse = np.sqrt(w_mse)
    w_r2 = r2_score(y_w_test, y_w_pred)

    print(f"Waiting Time Model Evaluation Metrics:")
    print(f"  MAE  : {w_mae:.3f} minutes")
    print(f"  RMSE : {w_rmse:.3f} minutes")
    print(f"  R²   : {w_r2:.4f}")

    # 7. Save Models and Metadata
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    crowd_model_path = os.path.join(SAVED_MODELS_DIR, "crowd_model.joblib")
    wait_model_path = os.path.join(SAVED_MODELS_DIR, "wait_model.joblib")

    joblib.dump(crowd_model, crowd_model_path)
    joblib.dump(wait_model, wait_model_path)

    metadata = {
        "model_version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "random_seed": 42,
        "dataset_name": "synthetic_canteen_data.csv",
        "dataset_records": len(df),
        "data_disclaimer": "Trained on Synthetic Demo Data for development and demonstration.",
        "crowd_model": {
            "algorithm": "RandomForestRegressor",
            "n_estimators": 100,
            "features": crowd_features,
            "metrics": {
                "mae": round(float(c_mae), 3),
                "rmse": round(float(c_rmse), 3),
                "r2_score": round(float(c_r2), 4)
            }
        },
        "wait_model": {
            "algorithm": "RandomForestRegressor",
            "n_estimators": 100,
            "features": wait_features,
            "metrics": {
                "mae": round(float(w_mae), 3),
                "rmse": round(float(w_rmse), 3),
                "r2_score": round(float(w_r2), 4)
            }
        },
        "capacity_thresholds": {
            "canteen_capacity_default": 120,
            "low_pct": 30,
            "medium_pct": 60,
            "high_pct": 80
        }
    }

    metadata_path = os.path.join(SAVED_MODELS_DIR, "metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "=" * 65)
    print(f"[SUCCESS] Saved crowd model to: {crowd_model_path}")
    print(f"[SUCCESS] Saved wait model to : {wait_model_path}")
    print(f"[SUCCESS] Saved metadata to   : {metadata_path}")
    print("=" * 65)

if __name__ == "__main__":
    main()
