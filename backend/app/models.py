from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student") # "student" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    feedback_entries = relationship("Feedback", back_populates="user")

class QueueRecord(Base):
    __tablename__ = "queue_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    queue_length = Column(Integer, nullable=False)
    active_counters = Column(Integer, nullable=False, default=3)
    orders_pending = Column(Integer, nullable=False, default=0)
    customers_served = Column(Integer, nullable=False, default=0)
    average_service_time = Column(Float, nullable=False, default=1.5) # in minutes
    day_of_week = Column(Integer, nullable=False) # 0 = Mon, 6 = Sun
    hour = Column(Integer, nullable=False)
    is_holiday = Column(Boolean, default=False)
    is_exam_period = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_time = Column(DateTime, nullable=False, index=True)
    predicted_customers = Column(Integer, nullable=False)
    predicted_wait_minutes = Column(Float, nullable=False)
    crowd_level = Column(String(20), nullable=False) # "LOW", "MEDIUM", "HIGH", "VERY HIGH"
    confidence = Column(Float, nullable=False, default=0.90)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedback_entries = relationship("Feedback", back_populates="prediction")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    actual_wait_minutes = Column(Float, nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedback_entries")
    prediction = relationship("PredictionRecord", back_populates="feedback_entries")

class CanteenSetting(Base):
    __tablename__ = "canteen_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    canteen_capacity = Column(Integer, nullable=False, default=120)
    default_active_counters = Column(Integer, nullable=False, default=3)
    service_time_seconds = Column(Integer, nullable=False, default=90)
    opening_hour = Column(Integer, nullable=False, default=8)
    closing_hour = Column(Integer, nullable=False, default=20)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
