import os
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model

from src.data.load_data import load_crop_data
from src.data.synthetic_price import generate_synthetic_price
from src.features.lag_features import add_lag_features
from src.features.seasonality import encode_month

MODEL_PATH = "models"
SEQ_LEN = 3


def load_all_artifacts(crop: str):
    """
    Load model, scaler and selected features for given crop.
    """

    model_file = f"{MODEL_PATH}/{crop}_lstm.h5"
    scaler_file = f"{MODEL_PATH}/{crop}_scaler.pkl"
    features_file = f"{MODEL_PATH}/{crop}_features.pkl"

    if not os.path.exists(model_file):
        raise FileNotFoundError("Model not found for crop")

    model = load_model(model_file)
    scaler = joblib.load(scaler_file)
    selected_features = joblib.load(features_file)

    return model, scaler, selected_features


def prepare_sequence_for_prediction(crop: str):
    """
    Prepare last SEQ_LEN sequence for LSTM prediction
    and return graph-ready historical price data.
    """

    # 🔹 Load historical data
    df = load_crop_data(f"data/raw/{crop}.csv")

    # 🔹 Generate synthetic prices (same as training)
    df = generate_synthetic_price(df, crop)

    # 🔹 Add lag features (same as training)
    df = add_lag_features(df)

    # 🔹 Encode month
    df = encode_month(df)

    # 🔹 Drop NA rows (from lag creation)
    df = df.dropna().reset_index(drop=True)

    # 🔹 Feature list (must match training)
    features = [
        'Rainfall', 'WPI',
        'Month_sin', 'Month_cos',
        'Price_lag_1', 'Price_lag_2',
        'Price_lag_3', 'Price_roll_mean_3'
    ]

    # 🔹 Load scaler & selected features
    _, scaler, selected_features = load_all_artifacts(crop)

    # 🔹 Take last SEQ_LEN rows
    X_last = df[features].iloc[-SEQ_LEN:]
    X_last = X_last[selected_features]

    # 🔹 Scale
    X_scaled = scaler.transform(X_last)

    # 🔹 Reshape for LSTM
    X_scaled = X_scaled.reshape(1, SEQ_LEN, X_scaled.shape[1])

    # 🔹 Last 12 actual prices for graph
    last_actual_prices = df['Price'].iloc[-12:].tolist()

    return X_scaled, last_actual_prices

def predict_crop_price(crop: str):

    model = load_model(f"models/{crop}_lstm.h5")
    X_scaler = joblib.load(f"models/{crop}_scaler.pkl")
    y_scaler = joblib.load(f"models/{crop}_y_scaler.pkl")

    X_scaled, last_actual_prices = prepare_sequence_for_prediction(crop)

    scaled_prediction = model.predict(X_scaled)

    # 🔥 CRITICAL STEP
    prediction = y_scaler.inverse_transform(scaled_prediction)[0][0]

    return float(prediction), last_actual_prices
