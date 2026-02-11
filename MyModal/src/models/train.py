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
    df = generate_synthetic_price(df)
    df = add_lag_features(df)
    df = encode_month(df)
    df = preprocess(df)

    features = [
        'Rainfall', 'WPI',
        'Month_sin', 'Month_cos',
        'Price_lag_1', 'Price_lag_2',
        'Price_lag_3', 'Price_roll_mean_3'
    ]

    X = df[features]
    y = df['Price']

    selected_features, _ = select_features(X, y)
    X = X[selected_features]

    X_seq, y_seq = create_sequences(X, y, SEQ_LEN)

    split = int(0.8 * len(X_seq))
    X_train, X_test = X_seq[:split], X_seq[split:]
    y_train, y_test = y_seq[:split], y_seq[split:]

    scaler = MinMaxScaler()
    X_train = scaler.fit_transform(
        X_train.reshape(-1, X_train.shape[-1])
    ).reshape(X_train.shape)
    
    joblib.dump(scaler, f"models/{crop}_scaler.pkl")
    X_test = scaler.transform(
        X_test.reshape(-1, X_test.shape[-1])
    ).reshape(X_test.shape)

    model = build_lstm((SEQ_LEN, X_train.shape[2]))
    model.fit(X_train, y_train, epochs=50, batch_size=4, verbose=0)

    y_pred = model.predict(X_test).flatten()

    metrics = evaluate(y_test, y_pred)
    print("Metrics:", metrics)

    plot_results(y_test, y_pred, crop)

    model.save(f"models/{crop}_lstm.h5")
