def preprocess(df):
    df = df.dropna().reset_index(drop=True)
    return df
