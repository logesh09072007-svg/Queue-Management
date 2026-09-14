# QueueSense AI: Smart Canteen Queue Prediction & Management System

> **Know the queue before you go.**  
> An AI-powered full-stack web application designed for college canteens to predict crowd density, calculate estimated waiting times, dynamically recommend the best time to visit, and provide managers with live queue controls and empirical analytics.

---

## ⚠️ Important Notice on Dataset & Demo Mode

> **DATA HONESTY STATEMENT**:  
> The training data included in `ml/data/synthetic_canteen_data.csv` is **Synthetic Demo Data** generated specifically for development, demonstration, and evaluation purposes. It models realistic college canteen scheduling patterns (such as morning breakfast peaks, short break surges, and major lunch rushes) using a reproducible seed (`seed=42`).  
> **It is NOT presented as real-world field observation data.** The system architecture is built so that real sensor, POS, or camera observations can directly replace or supplement the dataset for model retraining.

---

## Project Highlights & Features

### 🎓 Student Experience
- **Live Canteen Status**: View current queue length, active counter throughput, pending kitchen orders, and occupancy rates.
- **Visual Crowd Status**: Clear, color-coded, accessible crowd level indicator:
  - 🟢 **LOW**: 0–30% capacity
  - 🟡 **MEDIUM**: 31–60% capacity
  - 🟠 **HIGH**: 61–80% capacity
  - 🔴 **VERY HIGH**: 81–100% capacity
- **Estimated Waiting Time**: Accurate waiting time in minutes calculated through a blended combination of trained Random Forest regression models and Little's Law queuing theory ($W_q \approx \frac{\text{Queue}}{\text{Counters}} \times \text{Service Time}$).
- **Best Time to Visit**: Prominently displays the optimal 30-minute arrival window for the day along with model confidence score and explanatory rationale.
- **Interactive Graphs**:
  - **Crowd Volume vs Time**: Area chart with toggles for *Today*, *Tomorrow*, and *Next 3 Days*.
  - **Waiting Time Trend**: Latency curve plotted against the 15-minute rush threshold.
- **Prediction Timeline**: Table of upcoming 30-minute intervals showing forecasted crowds and wait times.
- **Post-Visit Feedback**: 1–5 star rating modal allowing students to submit actual wait times to validate prediction accuracy.

### 🛡️ Canteen Admin Portal
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing and role enforcement.
- **Live Queue Manager**: Instant controls to record queue length, active counter count, pending orders, and average service time per customer.
- **Quick Demo Scenario Presets**: One-click simulation buttons (*Calm Off-Peak*, *Breakfast Rush*, *Heavy Lunch Peak*, *Afternoon Slump*).
- **Historical Logs**: Paginated audit table of historical queue records with delete capabilities.
- **Configurable Settings**: Dynamic settings for canteen capacity, default counters, target service time, and opening/closing hours (not hard-coded).
- **Analytics Dashboard**: Real-time calculation of daily average queues, maximum congestion spikes, peak hours, lowest-crowd hours, Mean Absolute Error (MAE), and honest accuracy percentages.

### 📷 Future Vision Architecture
- **Computer Vision Blueprint**: Dedicated architectural overview detailing future integration with automated CCTV cameras and **YOLOv8** head-detection/people-counting modules (Camera → YOLO Detection → Person Count → API Update → ML Prediction).

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Uvicorn, SQLAlchemy, Pydantic V2 |
| **Database** | SQLite (`canteen.db`) |
| **Machine Learning** | scikit-learn (`RandomForestRegressor`), pandas, NumPy, joblib |
| **Authentication** | JWT (JSON Web Tokens), bcrypt, OAuth2 Bearer scheme |
| **Testing** | pytest, httpx, TestClient |

---

## Project Structure

```
College Qeue/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, CORS, startup seed
│   │   ├── config.py             # App configuration & JWT settings
│   │   ├── database.py           # SQLAlchemy SQLite engine & session
│   │   ├── models.py             # ORM models (User, QueueRecord, Feedback, etc.)
│   │   ├── schemas.py            # Pydantic schemas with strict validation
│   │   ├── auth.py               # Password hashing & JWT dependency
│   │   ├── routes/
│   │   │   ├── auth.py           # /api/auth (login, register, me)
│   │   │   ├── queue.py          # /api/queue (current, update, history)
│   │   │   ├── predictions.py    # /api/predictions (today, upcoming, predict)
│   │   │   ├── feedback.py       # /api/feedback (submit, review)
│   │   │   ├── analytics.py      # /api/analytics (dashboard, MAE, accuracy)
│   │   │   └── settings.py       # /api/settings (capacity configuration)
│   │   ├── services/
│   │   │   ├── queue_service.py  # Queue status & Little's Law blending
│   │   │   └── prediction_service.py # Schedule forecasts & best visit time
│   │   └── ml/
│   │       └── model_loader.py   # Model singleton service
│   ├── tests/
│   │   ├── test_auth.py          # Auth unit tests
│   │   ├── test_queue.py         # Queue validation & permissions tests
│   │   └── test_predictions.py   # ML inference & recommendation tests
│   └── requirements.txt
│
├── ml/
│   ├── data/
│   │   └── synthetic_canteen_data.csv # 1,800+ realistic synthetic records
│   ├── generate_synthetic_data.py    # Synthetic demo data generator (Seed=42)
│   ├── train_model.py                # Model training, evaluation & joblib export
│   ├── predict.py                    # Inference engine with confidence scoring
│   └── saved_models/
│       ├── crowd_model.joblib        # Trained Random Forest crowd model
│       ├── wait_model.joblib         # Trained Random Forest wait model
│       └── metadata.json             # Model metrics & feature schema
│
├── frontend/
│   ├── src/
│   │   ├── components/           # UI components (Navbar, StatusCard, CrowdBadge, Charts, Modals)
│   │   ├── pages/                # LandingPage, StudentDashboard, AdminDashboard, AdminAnalytics, Auth
│   │   ├── services/api.js       # Frontend API client
│   │   ├── context/AuthContext.jsx # Auth state & token persistence
│   │   ├── App.jsx               # Top-level routing
│   │   └── index.css             # Tailwind styling & glassmorphism
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md
└── .env.example
```

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# In project root:
python -m pip install -r backend/requirements.txt
```

### 3. Generate Synthetic Data & Train ML Models
```bash
# Generate 1,800+ realistic synthetic records:
python ml/generate_synthetic_data.py

# Train Random Forest regression models:
python ml/train_model.py
```
*Expected training performance:*
- **Crowd Volume Model**: $R^2 \approx 0.975$, MAE $\approx 3.5$ customers
- **Waiting Time Model**: $R^2 \approx 0.994$, MAE $\approx 0.83$ minutes

### 4. Run Backend Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation will be available at:  
👉 **`http://127.0.0.1:8000/docs`**

### 5. Run Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open your browser at:  
👉 **`http://127.0.0.1:5173/`**

---

## Sample Credentials for Demo Testing

The application automatically seeds default accounts and initial calibration logs upon startup:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Canteen Admin** | `admin@queuesense.ai` | `admin123` | Full access to Live Queue Manager, History, Settings, and Analytics |
| **Student** | `student@college.edu` | `student123` | Access to Student View, Prediction Forecasts, and Post-Visit Feedback |

*(The login page includes one-click **Fill Admin** and **Fill Student** quick buttons for rapid testing).*

---

## Verification & Automated Tests

To execute the test suite (covers authentication, queue input validation, negative value safeguards, role permissions, and ML prediction endpoints):

```bash
python -m pytest backend/tests -v
```

All 13 integration and unit tests pass with 100% success.

---

## API Endpoints Reference

| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `POST` | `/api/auth/register` | Register new student or admin account | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/queue/current` | Retrieve live queue length, crowd level, and estimated wait | Public |
| `POST` | `/api/queue/update` | Update live queue length, counters, orders pending | Admin Only |
| `GET` | `/api/queue/history` | Retrieve historical queue audit records | Admin Only |
| `DELETE`| `/api/queue/{id}` | Delete a specific queue record | Admin Only |
| `GET` | `/api/predictions/today` | 30-min schedule forecasts for today / future days | Public |
| `GET` | `/api/predictions/upcoming` | Retrieve upcoming 6-8 operational slots | Public |
| `GET` | `/api/predictions/recommended` | Dynamically calculated Best Time to Visit window | Public |
| `POST` | `/api/predictions/predict` | On-the-fly custom scenario simulation | Public |
| `POST` | `/api/feedback` | Submit student wait time accuracy rating (1-5 stars) | Public / Student |
| `GET` | `/api/analytics/dashboard` | Aggregated stats, peak hours, MAE, accuracy % | Public / Admin |
| `GET` | `/api/settings` | Operational settings (capacity, counters, hours) | Public |
| `PUT` | `/api/settings` | Modify capacity and counter configuration | Admin Only |

---

## Known Limitations

1. **Synthetic Data Calibration**: While the synthetic data accurately reflects rush hours, break surges, and counter throughput, real canteen deployments should replace this with 2-4 weeks of actual POS or cashier transaction logs for site-specific fine-tuning.
2. **Manual Counter Logging**: In this initial production release, the canteen staff manually updates the queue length or triggers quick presets. The camera-based people-counting pipeline is designed as an architectural extension.

---

## Future Improvements

1. **YOLOv8 Edge Device Module**: Deploy an RTSP CCTV camera feed at the canteen entrance running YOLOv8 person detection to stream queue head counts directly to `/api/queue/update`.
2. **Student Push Notifications**: Browser Web Push notifications when the queue drops below 10 people or enters the "LOW" crowd category.
3. **Menu Item Lead Times**: Integrate POS dish preparation times so wait estimates differentiate between quick pre-packaged snacks and cooked-to-order meals.
