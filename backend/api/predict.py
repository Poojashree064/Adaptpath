import numpy as np
import joblib
from fastapi import APIRouter
from api.schemas import PredictRequest
from utils.config import settings  # ⬅ corrected import path

router = APIRouter()
import os
print("📌 ABSOLUTE MODEL PATH =", os.path.abspath(settings.MODEL_PATH))

# Load Model Once
print("📌 Loading model from:", settings.MODEL_PATH)
model = joblib.load(settings.MODEL_PATH)
print("✅ Model loaded successfully!")

@router.post("/predict")
def predict_performance(req: PredictRequest):

    features = np.array([[v for v in req.dict().values()]])
    
    prob = model.predict_proba(features)[0][1]
    pred = int(prob >= 0.5)

    return {
        "prediction": pred,
        "confidence": float(prob)
    }
