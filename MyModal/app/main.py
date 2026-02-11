from fastapi import FastAPI, HTTPException
from tensorflow.keras.models import load_model

from app.schemas import PredictionRequest, PredictionResponse
from app.utils import prepare_features

import os

app = FastAPI(
    title="Crop Price Prediction API",
    description="RF + LSTM based crop price prediction (Synthetic)",
    version="1.0"
)

MODEL_PATH = "models"

@app.post("/predict", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):

    crop = request.crop.lower()
    model_file = f"{MODEL_PATH}/{crop}_lstm.h5"

    if not os.path.exists(model_file):
        raise HTTPException(status_code=404, detail="Model not found for crop")

    if len(request.rainfall) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 months data required")

    model = load_model(model_file)

    X = prepare_features(
        request.rainfall,
        request.wpi,
        request.month,
        crop
    )

    prediction = model.predict(X)[0][0]

    return PredictionResponse(
        crop=crop,
        predicted_price=round(float(prediction), 2)
    )
