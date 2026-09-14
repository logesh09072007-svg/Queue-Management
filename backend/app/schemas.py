from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = Field("student", pattern="^(student|admin)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- Queue Record Schemas ---
class QueueRecordCreate(BaseModel):
    queue_length: int = Field(..., ge=0, description="Number of people in queue")
    active_counters: int = Field(..., ge=1, le=10, description="Number of operational service counters")
    orders_pending: int = Field(0, ge=0, description="Orders pending or in preparation")
    customers_served: int = Field(0, ge=0, description="Customers served during this interval")
    average_service_time: float = Field(1.5, gt=0, le=10.0, description="Average service time per customer in minutes")
    is_holiday: Optional[bool] = False
    is_exam_period: Optional[bool] = False
    notes: Optional[str] = None

class QueueRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    queue_length: int
    active_counters: int
    orders_pending: int
    customers_served: int
    average_service_time: float
    day_of_week: int
    hour: int
    is_holiday: bool
    is_exam_period: bool
    notes: Optional[str] = None

class CurrentQueueStatusResponse(BaseModel):
    queue_length: int
    active_counters: int
    orders_pending: int
    customers_served: int
    average_service_time: float
    crowd_level: str  # LOW, MEDIUM, HIGH, VERY HIGH
    estimated_wait_minutes: float
    canteen_capacity: int
    occupancy_rate: float
    last_updated: datetime
    is_demo_mode: bool

# --- Prediction Schemas ---
class PredictionRequest(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    queue_length: Optional[int] = Field(0, ge=0)
    active_counters: Optional[int] = Field(3, ge=1, le=10)
    orders_pending: Optional[int] = Field(0, ge=0)
    average_service_time: Optional[float] = Field(1.5, gt=0)
    is_holiday: Optional[bool] = False
    is_exam_period: Optional[bool] = False

class PredictionResponse(BaseModel):
    hour: int
    minute: int
    predicted_customers: int
    predicted_wait_minutes: float
    crowd_level: str
    confidence: float
    active_counters: int
    queue_length_used: int
    is_model_used: bool

class SlotPrediction(BaseModel):
    time: str
    hour: int
    minute: int
    timestamp: str
    predicted_customers: int
    predicted_wait_minutes: float
    crowd_level: str
    confidence: float

class RecommendedTimeResponse(BaseModel):
    recommended_window: str
    start_time: str
    end_time: str
    crowd_level: str
    expected_wait_minutes: float
    confidence: float
    why: str
    slot_details: SlotPrediction

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    prediction_id: Optional[int] = None
    actual_wait_minutes: float = Field(..., ge=0, le=180)
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    prediction_id: Optional[int]
    actual_wait_minutes: float
    rating: int
    comment: Optional[str]
    created_at: datetime

# --- Canteen Settings Schemas ---
class CanteenSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    canteen_capacity: int
    default_active_counters: int
    service_time_seconds: int
    opening_hour: int
    closing_hour: int
    updated_at: Optional[datetime]

class CanteenSettingUpdate(BaseModel):
    canteen_capacity: int = Field(..., ge=20, le=1000)
    default_active_counters: int = Field(..., ge=1, le=10)
    service_time_seconds: int = Field(..., ge=30, le=600)
    opening_hour: int = Field(..., ge=6, le=12)
    closing_hour: int = Field(..., ge=14, le=23)

# --- Analytics Schemas ---
class AnalyticsDashboardResponse(BaseModel):
    average_daily_queue: float
    maximum_queue: int
    average_waiting_time: float
    peak_hour: str
    lowest_crowd_hour: str
    total_customers_served_today: int
    prediction_mae: float
    prediction_accuracy_pct: float
    hourly_trends: List[Dict[str, Any]]
    prediction_vs_actual: List[Dict[str, Any]]
    crowd_distribution: Dict[str, int]
    is_synthetic_demo: bool
