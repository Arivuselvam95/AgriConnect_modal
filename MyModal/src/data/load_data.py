import pandas as pd

def load_crop_data(path):
    df = pd.read_csv(path)
    df = df.sort_values(['Year', 'Month']).reset_index(drop=True)
    return df
