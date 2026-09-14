from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Feedback, User
from ..schemas import FeedbackCreate, FeedbackResponse
from ..auth import get_optional_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Allows students to submit feedback comparing predicted wait vs actual wait time."""
    feedback_entry = Feedback(
        user_id=current_user.id if current_user else None,
        prediction_id=data.prediction_id,
        actual_wait_minutes=data.actual_wait_minutes,
        rating=data.rating,
        comment=data.comment.strip() if data.comment else None
    )
    db.add(feedback_entry)
    db.commit()
    db.refresh(feedback_entry)
    return feedback_entry

@router.get("", response_model=List[FeedbackResponse])
def get_feedback_list(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieves list of recent feedback entries."""
    return db.query(Feedback).order_by(Feedback.created_at.desc()).limit(limit).all()
