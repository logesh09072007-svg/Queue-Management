from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import (
    PredictionRequest,
    PredictionResponse,
    SlotPrediction,
    RecommendedTimeResponse
)
from ..services.prediction_service import (
    get_today_predictions,
    get_upcoming_predictions,
    get_recommended_time_to_visit,
    predict_custom
)

router = APIRouter(prefix="/api/predictions", tags=["Predictions & ML"])

@router.get("/today", response_model=List[SlotPrediction])
def get_day_predictions(
    day_offset: int = Query(0, ge=0, le=7, description="0 for today, 1 for tomorrow, etc."),
    db: Session = Depends(get_db)
):
    """Retrieves full day schedule predictions (30-min intervals) for today or upcoming days."""
    return get_today_predictions(db, day_offset=day_offset)

@router.get("/upcoming", response_model=List[SlotPrediction])
def get_upcoming(
    max_slots: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """Retrieves upcoming time slots starting from the current time."""
    return get_upcoming_predictions(db, max_slots=max_slots)

@router.get("/recommended", response_model=RecommendedTimeResponse)
def get_recommended(db: Session = Depends(get_db)):
    """Dynamically calculates the best time window to visit based on predicted crowd and wait time."""
    return get_recommended_time_to_visit(db)

@router.post("/predict", response_model=PredictionResponse)
def run_custom_prediction(
    req: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Accepts custom queue & timing conditions and returns ML model prediction."""
    return predict_custom(db, req)
