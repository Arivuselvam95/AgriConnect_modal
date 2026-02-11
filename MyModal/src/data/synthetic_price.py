import numpy as np

def generate_synthetic_price(df):
    np.random.seed(42)

    seasonality = 50 * np.sin(2 * np.pi * df['Month'] / 12)

    df['Price'] = (
        8.5 * df['WPI'] +
        0.25 * df['Rainfall'] +
        seasonality +
        np.random.normal(0, 40, len(df))
    )

    df['Price'] = df['Price'].clip(lower=500).round(2)
    return df
