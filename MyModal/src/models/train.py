import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler

from src.data.load_data import load_crop_data
from src.data.synthetic_price import generate_synthetic_price
from src.data.preprocess import preprocess
from src.features.lag_features import add_lag_features
from src.features.seasonality import encode_month
from src.models.rf_selector import select_features
from src.models.lstm_model import build_lstm
from src.evaluation.metrics import evaluate
from src.evaluation.plots import plot_results

SEQ_LEN = 3

def create_sequences(X, y, seq_len):
    Xs, ys = [], []
    for i in range(len(X) - seq_len):
        Xs.append(X.iloc[i:i+seq_len].values)
        ys.append(y.iloc[i+seq_len])
    return np.array(Xs), np.array(ys)

def train_crop_model(crop):
    print(f"\n🚜 Training model for {crop}")

    df = load_crop_data(f"data/raw/{crop}.csv")
    df = generate_synthetic_price(df, crop)
    df = encode_month(df)
    df = preprocess(df)

    features = [
        'Rainfall',
        'WPI',
        'Month_sin',
        'Month_cos'
    ]

    X = df[features]
    y = df['Price']

    print("Price statistics:")
    print(y.describe())

    selected_features, _ = select_features(X, y)
    X = X[selected_features]

    joblib.dump(selected_features, f"models/{crop}_features.pkl")

    X_seq, y_seq = create_sequences(X, y, SEQ_LEN)

    split = int(0.8 * len(X_seq))
    X_train, X_test = X_seq[:split], X_seq[split:]
    y_train, y_test = y_seq[:split], y_seq[split:]

    # 🔥 SCALE X
    X_scaler = MinMaxScaler()
    X_train = X_scaler.fit_transform(
        X_train.reshape(-1, X_train.shape[-1])
    ).reshape(X_train.shape)

    X_test = X_scaler.transform(
        X_test.reshape(-1, X_test.shape[-1])
    ).reshape(X_test.shape)

    joblib.dump(X_scaler, f"models/{crop}_scaler.pkl")

    # 🔥 SCALE Y (VERY IMPORTANT)
    y_scaler = MinMaxScaler()
    y_train = y_scaler.fit_transform(y_train.reshape(-1, 1))
    y_test_scaled = y_scaler.transform(y_test.reshape(-1, 1))

    joblib.dump(y_scaler, f"models/{crop}_y_scaler.pkl")

    # 🔥 Train Model
    model = build_lstm((SEQ_LEN, X_train.shape[2]))
    model.fit(X_train, y_train, epochs=50, batch_size=4, verbose=0)

    # 🔥 Predict (scaled)
    y_pred_scaled = model.predict(X_test)

    # 🔥 Inverse transform for evaluation
    y_pred = y_scaler.inverse_transform(y_pred_scaled).flatten()

    metrics = evaluate(y_test, y_pred)
    print("Metrics:", metrics)

    plot_results(y_test, y_pred, crop)

    model.save(f"models/{crop}_lstm.h5")
