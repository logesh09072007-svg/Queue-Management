from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CanteenSetting
from ..schemas import CanteenSettingResponse, CanteenSettingUpdate
from ..auth import require_admin
from ..services.queue_service import get_or_create_settings

router = APIRouter(prefix="/api/settings", tags=["Canteen Settings"])

@router.get("", response_model=CanteenSettingResponse)
def get_settings(db: Session = Depends(get_db)):
    """Retrieves current operational canteen settings."""
    return get_or_create_settings(db)

@router.put("", response_model=CanteenSettingResponse)
def update_settings(
    data: CanteenSettingUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Allows admin to reconfigure canteen capacity, active counters, and operating hours."""
    cfg = get_or_create_settings(db)
    cfg.canteen_capacity = data.canteen_capacity
    cfg.default_active_counters = data.default_active_counters
    cfg.service_time_seconds = data.service_time_seconds
    cfg.opening_hour = data.opening_hour
    cfg.closing_hour = data.closing_hour

    db.commit()
    db.refresh(cfg)
    return cfg
