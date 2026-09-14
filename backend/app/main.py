import os
import sys
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Ensure proper package resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from contextlib import asynccontextmanager
from .config import settings
from .database import engine, SessionLocal, Base
from .models import User, CanteenSetting, QueueRecord, Feedback, PredictionRecord
from .auth import get_password_hash
from .routes import auth, queue, predictions, feedback, analytics, settings as settings_route

# Ensure tables exist
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite tables and seed data
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Canteen Queue Prediction & Management System API. Built with FastAPI and Scikit-Learn.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(queue.router)
app.include_router(predictions.router)
app.include_router(feedback.router)
app.include_router(analytics.router)
app.include_router(settings_route.router)

def seed_initial_data():
    """Seeds default accounts, configuration, and sample queue records on first launch."""
    db: Session = SessionLocal()
    try:
        # 1. Create default settings
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

        # 2. Create default Admin account
        admin_user = db.query(User).filter(User.email == "admin@queuesense.ai").first()
        if not admin_user:
            admin_user = User(
                name="Canteen Admin",
                email="admin@queuesense.ai",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)

        # 3. Create default Student account
        student_user = db.query(User).filter(User.email == "student@college.edu").first()
        if not student_user:
            student_user = User(
                name="Alex Kumar",
                email="student@college.edu",
                password_hash=get_password_hash("student123"),
                role="student"
            )
            db.add(student_user)
        db.commit()

        # 4. Seed initial queue records if empty
        q_count = db.query(QueueRecord).count()
        if q_count == 0:
            now = datetime.now()
            # Seed 5 recent records leading up to current moment
            sample_records = [
                (now - timedelta(minutes=90), 12, 3, 2, 40, 1.4),
                (now - timedelta(minutes=60), 22, 3, 5, 52, 1.5),
                (now - timedelta(minutes=40), 31, 3, 7, 65, 1.6),
                (now - timedelta(minutes=20), 28, 4, 6, 78, 1.5),
                (now - timedelta(minutes=5), 24, 3, 5, 88, 1.45),
            ]
            for ts, q_len, counters, pending, served, avg_svc in sample_records:
                rec = QueueRecord(
                    timestamp=ts,
                    queue_length=q_len,
                    active_counters=counters,
                    orders_pending=pending,
                    customers_served=served,
                    average_service_time=avg_svc,
                    day_of_week=ts.weekday(),
                    hour=ts.hour,
                    is_holiday=(ts.weekday() == 6),
                    is_exam_period=False,
                    notes="Synthetic initial calibration log"
                )
                db.add(rec)
            db.commit()

        # 5. Seed initial feedback entries if empty
        fb_count = db.query(Feedback).count()
        if fb_count == 0 and student_user:
            sample_feedbacks = [
                (student_user.id, 9.0, 5, "Spot on! The wait was barely 9 minutes exactly like predicted."),
                (student_user.id, 14.5, 4, "Slightly crowded because one counter paused for restock, but accurate estimate."),
                (student_user.id, 4.0, 5, "Visited at 3:15 PM during the recommended window. Zero line!"),
            ]
            for uid, actual_wait, rating, comment in sample_feedbacks:
                fb = Feedback(
                    user_id=uid,
                    actual_wait_minutes=actual_wait,
                    rating=rating,
                    comment=comment
                )
                db.add(fb)
            db.commit()

    except Exception as e:
        print(f"[ERROR] Error during startup seed: {e}")
        db.rollback()
    finally:
        db.close()

# Initial seed on module load if not yet seeded
seed_initial_data()

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "version": settings.VERSION,
        "status": "running",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
        "disclaimer": "This system utilizes synthetic demo data for development and demonstration."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected"
    }
