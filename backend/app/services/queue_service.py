from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from ..models import QueueRecord, CanteenSetting
from ..schemas import QueueRecordCreate, CurrentQueueStatusResponse
from ..config import settings
from ..ml.model_loader import get_predictor

def get_or_create_settings(db: Session) -> CanteenSetting:
    cfg = db.query(CanteenSetting).first()
    if not cfg:
        cfg = CanteenSetting(
            canteen_capacity=settings.DEFAULT_CANTEEN_CAPACITY,
            default_active_counters=settings.DEFAULT_ACTIVE_COUNTERS,
            service_time_seconds=settings.DEFAULT_SERVICE_TIME_SECONDS,
            opening_hour=settings.DEFAULT_OPENING_HOUR,
            closing_hour=settings.DEFAULT_CLOSING_HOUR
        )
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg

def get_current_queue_status(db: Session) -> CurrentQueueStatusResponse:
    cfg = get_or_create_settings(db)
    latest_record = db.query(QueueRecord).order_by(QueueRecord.timestamp.desc()).first()

    now = datetime.now()
    if latest_record:
        q_len = latest_record.queue_length
        counters = latest_record.active_counters
        pending = latest_record.orders_pending
        served = latest_record.customers_served
        avg_svc = latest_record.average_service_time
        updated_at = latest_record.timestamp
    else:
        # Initial default if no record entered yet
        q_len = 18
        counters = cfg.default_active_counters
        pending = 4
        served = 45
        avg_svc = cfg.service_time_seconds / 60.0
        updated_at = now

    # Use ML predictor to calculate blended wait time and crowd level
    predictor = get_predictor()
    pred_res = predictor.predict_single(
        hour=now.hour,
        minute=now.minute,
        day_of_week=now.weekday(),
        queue_length=q_len,
        active_counters=counters,
        orders_pending=pending,
        average_service_time=avg_svc,
        canteen_capacity=cfg.canteen_capacity
    )

    estimated_wait = pred_res["predicted_wait_minutes"]
    crowd_level = pred_res["crowd_level"]
    occupancy_rate = min(1.0, round(q_len / max(10, cfg.canteen_capacity), 2))

    return CurrentQueueStatusResponse(
        queue_length=q_len,
        active_counters=counters,
        orders_pending=pending,
        customers_served=served,
        average_service_time=avg_svc,
        crowd_level=crowd_level,
        estimated_wait_minutes=estimated_wait,
        canteen_capacity=cfg.canteen_capacity,
        occupancy_rate=occupancy_rate,
        last_updated=updated_at,
        is_demo_mode=settings.DEMO_MODE
    )

def create_queue_record(db: Session, data: QueueRecordCreate) -> QueueRecord:
    now = datetime.now()
    record = QueueRecord(
        timestamp=now,
        queue_length=data.queue_length,
        active_counters=data.active_counters,
        orders_pending=data.orders_pending,
        customers_served=data.customers_served,
        average_service_time=data.average_service_time,
        day_of_week=now.weekday(),
        hour=now.hour,
        is_holiday=data.is_holiday or False,
        is_exam_period=data.is_exam_period or False,
        notes=data.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_queue_history(db: Session, skip: int = 0, limit: int = 50) -> Tuple[List[QueueRecord], int]:
    query = db.query(QueueRecord).order_by(QueueRecord.timestamp.desc())
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    return records, total

def delete_queue_record(db: Session, record_id: int) -> bool:
    record = db.query(QueueRecord).filter(QueueRecord.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
        return True
    return False
