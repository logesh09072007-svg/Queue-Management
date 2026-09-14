import os
from typing import List

class Settings:
    PROJECT_NAME: str = "QueueSense AI"
    PROJECT_SUBTITLE: str = "Smart Canteen Queue Prediction & Management System"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "queuesense-super-secret-jwt-key-for-college-canteen-ai-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./canteen.db")

    # ML Model directory
    ML_MODELS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "saved_models"))

    # Default Canteen Settings
    DEFAULT_CANTEEN_CAPACITY: int = 120
    DEFAULT_ACTIVE_COUNTERS: int = 3
    DEFAULT_SERVICE_TIME_SECONDS: int = 90
    DEFAULT_OPENING_HOUR: int = 8
    DEFAULT_CLOSING_HOUR: int = 20

    # CORS origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
