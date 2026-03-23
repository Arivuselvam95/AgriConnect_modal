from fastapi import FastAPI, HTTPException
import os
from app.schemas import CropRecommendationRequest
from app.utils import predict_top_3_crops

from app.utils import predict_crop_price
 

app = FastAPI(
    title="AgriConnect API",
    description="Price Prediction and Crop recommendation Api using lstm, rf",
    version="2.0"
)

@app.get("/")
def loading():
    return {'AgriConnectModal': 'Started'}
@app.get("/predict/{crop}")
def predict_price(crop: str):

    crop = crop.lower()

    try:
        predictions, last_actual_prices = predict_crop_price(crop, 3)

        return {
            "crop": crop,
            "unit": "₹ per quintal",
            "predicted_prices_next_3_months": [round(p, 2) for p in predictions],
            "graph_data": {
                "actual_prices_last_12_months": last_actual_prices,
                "predictions": [round(p, 2) for p in predictions]
            }
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found for crop")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/predict/crop")
def recommend_crop(data: CropRecommendationRequest):
    return predict_top_3_crops(data.dict())
