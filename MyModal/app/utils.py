import numpy as np
import joblib

def prepare_features(rainfall, wpi, month, crop):
    rainfall = np.array(rainfall)
    wpi = np.array(wpi)
    month = np.array(month)

    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    X = np.column_stack([
        rainfall,
        wpi,
        month_sin,
        month_cos
    ])

    scaler = joblib.load(f"models/{crop}_scaler.pkl")
    X_scaled = scaler.transform(X)

    return X_scaled.reshape(1, X.shape[0], X.shape[1])
