def add_lag_features(df, lags=[1, 2, 3]):
    for lag in lags:
        df[f'Price_lag_{lag}'] = df['Price'].shift(lag)

    df['Price_roll_mean_3'] = df['Price'].rolling(3).mean()
    return df
