import pandas as pd
import numpy as np

# Define the function exactly as provided
def generate_synthetic_price(df, crop):
    np.random.seed(42)
    crop = crop.lower()
    crop_base_prices = {
        "wheat": 2200, "paddy": 2100, "barley": 1900, "maize": 1800,
        "bajra": 1700, "copra": 9000, "cotton": 6500, "masoor": 6000,
        "gram": 5500, "groundnut": 5000, "arhar": 7000, "sesamum": 8000,
        "jowar": 2000, "moong": 7500, "niger": 6000, "rape": 4500,
        "jute": 4000, "safflower": 5200, "soyabean": 4200, "urad": 6800,
        "ragi": 2100, "sunflower": 4800, "sugarcane": 350,
        "cabbage": 2500,   
        "carrot": 2800,    
        "beetroot": 2600,  
        "beans": 4000,     
        "chilli": 5500,    
        "turmeric": 12000   
    }
    base_price = crop_base_prices.get(crop, 3000)
    seasonality = 0.05 * base_price * np.sin(2 * np.pi * df['Month'] / 12)
    df['Price'] = (
        base_price +
        0.02 * base_price * df['WPI'] / 100 +
        0.01 * base_price * df['Rainfall'] / 100 +
        seasonality +
        np.random.normal(0, 0.05 * base_price, len(df))
    )
    df['Price'] = df['Price'].clip(lower=100).round(2)
    return df
