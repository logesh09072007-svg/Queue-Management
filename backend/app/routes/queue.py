from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import (
    CurrentQueueStatusResponse,
    QueueRecordCreate,
    QueueRecordResponse
)
from ..auth import require_admin
from ..services.queue_service import (
    get_current_queue_status,
    create_queue_record,
    get_queue_history,
    delete_queue_record
)

router = APIRouter(prefix="/api/queue", tags=["Queue Management"])

@router.get("/current", response_model=CurrentQueueStatusResponse)
def get_current(db: Session = Depends(get_db)):
    """Retrieves live current queue conditions, blended wait time, and crowd level."""
    return get_current_queue_status(db)

@router.post("/update", response_model=QueueRecordResponse, status_code=status.HTTP_201_CREATED)
def update_queue(
    data: QueueRecordCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Allows authenticated canteen admin to update current queue conditions."""
    return create_queue_record(db, data)

@router.get("/history", response_model=List[QueueRecordResponse])
def list_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin view for inspecting historical queue records."""
    records, _ = get_queue_history(db, skip=skip, limit=limit)
    return records

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_record(
    record_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin endpoint to remove an erroneous queue log."""
    success = delete_queue_record(db, record_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue record not found."
        )
    return None
