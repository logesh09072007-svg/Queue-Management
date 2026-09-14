from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import PredictionRecord, QueueRecord
from ..schemas import (
    PredictionRequest,
    PredictionResponse,
    SlotPrediction,
    RecommendedTimeResponse
)
from .queue_service import get_or_create_settings
from ..ml.model_loader import get_predictor

def get_today_predictions(db: Session, day_offset: int = 0) -> List[SlotPrediction]:
    """Generates 30-minute interval predictions for opening to closing hours."""
    cfg = get_or_create_settings(db)
    predictor = get_predictor()

    target_date = datetime.now() + timedelta(days=day_offset)
    raw_timeline = predictor.predict_timeline(
        target_date=target_date,
        active_counters=cfg.default_active_counters,
        canteen_capacity=cfg.canteen_capacity,
        start_hour=cfg.opening_hour,
        end_hour=cfg.closing_hour
    )

    result = [SlotPrediction(**item) for item in raw_timeline]
    return result

def get_upcoming_predictions(db: Session, max_slots: int = 8) -> List[SlotPrediction]:
    """Returns upcoming time slots starting from current time slot onwards."""
    all_today = get_today_predictions(db, day_offset=0)
    now = datetime.now()
    current_minutes = now.hour * 60 + now.minute

    # Filter slots that are at or after the current time slot (or next 15 min)
    future_slots = [
        slot for slot in all_today
        if (slot.hour * 60 + slot.minute) >= (current_minutes - 15)
    ]

    # If the day is ending (past closing hour), return tomorrow morning's upcoming slots
    if len(future_slots) < 3:
        tomorrow_slots = get_today_predictions(db, day_offset=1)
        future_slots.extend(tomorrow_slots)

    return future_slots[:max_slots]

def get_recommended_time_to_visit(db: Session) -> RecommendedTimeResponse:
    """Calculates best time window to visit based on ML predictions."""
    cfg = get_or_create_settings(db)
    predictor = get_predictor()
    timeline = predictor.predict_timeline(
        active_counters=cfg.default_active_counters,
        canteen_capacity=cfg.canteen_capacity,
        start_hour=cfg.opening_hour,
        end_hour=cfg.closing_hour
    )

    rec = predictor.get_best_time_to_visit(timeline, canteen_capacity=cfg.canteen_capacity)
    return RecommendedTimeResponse(
        recommended_window=rec["recommended_window"],
        start_time=rec["start_time"],
        end_time=rec["end_time"],
        crowd_level=rec["crowd_level"],
        expected_wait_minutes=rec["expected_wait_minutes"],
        confidence=rec["confidence"],
        why=rec["why"],
        slot_details=SlotPrediction(**rec["slot_details"])
    )

def predict_custom(db: Session, req: PredictionRequest) -> PredictionResponse:
    """Runs on-the-fly prediction with custom user/admin inputs."""
    cfg = get_or_create_settings(db)
    predictor = get_predictor()

    now = datetime.now()
    dow = req.day_of_week if req.day_of_week is not None else now.weekday()

    pred = predictor.predict_single(
        hour=req.hour,
        minute=req.minute,
        day_of_week=dow,
        queue_length=req.queue_length or 0,
        active_counters=req.active_counters or cfg.default_active_counters,
        orders_pending=req.orders_pending or 0,
        average_service_time=req.average_service_time or (cfg.service_time_seconds / 60.0),
        is_holiday=req.is_holiday or False,
        is_exam_period=req.is_exam_period or False,
        canteen_capacity=cfg.canteen_capacity
    )

    # Persist prediction record for audit and feedback pairing
    rec_obj = PredictionRecord(
        prediction_time=now.replace(hour=req.hour, minute=req.minute, second=0, microsecond=0),
        predicted_customers=pred["predicted_customers"],
        predicted_wait_minutes=pred["predicted_wait_minutes"],
        crowd_level=pred["crowd_level"],
        confidence=pred["confidence"],
        created_at=now
    )
    db.add(rec_obj)
    db.commit()

    return PredictionResponse(**pred)
