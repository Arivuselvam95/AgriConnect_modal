from fastapi import FastAPI, HTTPException
import os

from app.utils import predict_crop_price

app = FastAPI(
    title="Crop Price Prediction API",
    description="LSTM-based crop price prediction system",
    version="2.0"
)


@app.get("/predict/{crop}")
def predict_price(crop: str):

    crop = crop.lower()

    try:
        predicted_price, last_actual_prices = predict_crop_price(crop)

        return {
            "crop": crop,
            "unit": "₹ per quintal",
            "predicted_price": round(predicted_price, 2),
            "graph_data": {
                "actual_prices_last_12_months": last_actual_prices,
                "predicted_next_month": round(predicted_price, 2)
            }
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found for crop")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
