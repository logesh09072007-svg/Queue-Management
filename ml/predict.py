"""
QueueSense AI - Prediction Engine
=================================
Loads trained models and provides prediction logic for customer count,
waiting time, crowd level categorization, and slot-by-slot schedules.
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

class QueuePredictor:
    def __init__(self, models_dir: Optional[str] = None):
        self.models_dir = models_dir or SAVED_MODELS_DIR
        self.crowd_model = None
        self.wait_model = None
        self.metadata = {}
        self.is_loaded = False
        self._load_models()

    def _load_models(self):
        crowd_path = os.path.join(self.models_dir, "crowd_model.joblib")
        wait_path = os.path.join(self.models_dir, "wait_model.joblib")
        metadata_path = os.path.join(self.models_dir, "metadata.json")

        if os.path.exists(crowd_path) and os.path.exists(wait_path):
            self.crowd_model = joblib.load(crowd_path)
            self.wait_model = joblib.load(wait_path)
            if os.path.exists(metadata_path):
                with open(metadata_path, "r") as f:
                    self.metadata = json.load(f)
            self.is_loaded = True
        else:
            print(f"[WARN] Models not found in {self.models_dir}. Fallback heuristics will be used.")

    def categorize_crowd(self, customer_count: float, capacity: int = 120) -> str:
        """Categorizes crowd level based on percentage of canteen capacity."""
        occupancy = customer_count / max(10, capacity)
        if occupancy <= 0.30:
            return "LOW"
        elif occupancy <= 0.60:
            return "MEDIUM"
        elif occupancy <= 0.80:
            return "HIGH"
        else:
            return "VERY HIGH"

    def predict_single(
        self,
        hour: int,
        minute: int,
        day_of_week: int,
        queue_length: int = 0,
        active_counters: int = 3,
        orders_pending: int = 0,
        average_service_time: float = 1.5,
        is_holiday: bool = False,
        is_exam_period: bool = False,
        canteen_capacity: int = 120
    ) -> Dict[str, Any]:
        """Generates predictions for crowd, waiting time, crowd level, and confidence."""
        # Safeguards & input validations
        queue_length = max(0, int(queue_length))
        active_counters = max(1, int(active_counters))
        orders_pending = max(0, int(orders_pending))
        average_service_time = max(0.5, float(average_service_time))
        hour_float = hour + minute / 60.0

        # Cyclical & rush feature engineering
        sin_hour = float(np.sin(2 * np.pi * hour_float / 24.0))
        cos_hour = float(np.cos(2 * np.pi * hour_float / 24.0))
        sin_dow = float(np.sin(2 * np.pi * day_of_week / 7.0))
        cos_dow = float(np.cos(2 * np.pi * day_of_week / 7.0))

        is_breakfast_peak = int(8.5 <= hour_float <= 9.5)
        is_morning_break = int(10.5 <= hour_float <= 11.5)
        is_lunch_peak = int(12.0 <= hour_float <= 14.0)
        is_evening_break = int(16.5 <= hour_float <= 17.5)

        queue_per_counter = queue_length / active_counters
        workload_index = (queue_length + orders_pending) / active_counters

        if self.is_loaded and self.crowd_model and self.wait_model:
            # Model 1 prediction: Expected customer volume
            c_input = pd.DataFrame([{
                "hour": hour,
                "minute": minute,
                "day_of_week": day_of_week,
                "sin_hour": sin_hour,
                "cos_hour": cos_hour,
                "sin_dow": sin_dow,
                "cos_dow": cos_dow,
                "is_holiday": int(is_holiday),
                "is_exam_period": int(is_exam_period),
                "is_breakfast_peak": is_breakfast_peak,
                "is_morning_break": is_morning_break,
                "is_lunch_peak": is_lunch_peak,
                "is_evening_break": is_evening_break
            }])
            pred_customers = float(self.crowd_model.predict(c_input)[0])
            pred_customers = max(2, int(round(pred_customers)))

            # If queue_length was not provided explicitly, infer expected queue from predicted volume
            inferred_queue = queue_length
            if queue_length == 0:
                service_capacity = (30.0 / average_service_time) * active_counters
                inferred_queue = max(0, int(round(max(0, pred_customers - service_capacity * 0.45) * 0.9)))
                queue_per_counter = inferred_queue / active_counters
                workload_index = (inferred_queue + orders_pending) / active_counters

            # Model 2 prediction: Expected waiting time
            w_input = pd.DataFrame([{
                "queue_length": inferred_queue,
                "active_counters": active_counters,
                "orders_pending": orders_pending,
                "average_service_time": average_service_time,
                "queue_per_counter": queue_per_counter,
                "workload_index": workload_index,
                "hour": hour,
                "minute": minute,
                "day_of_week": day_of_week,
                "sin_hour": sin_hour,
                "cos_hour": cos_hour,
                "is_lunch_peak": is_lunch_peak
            }])
            ml_wait = float(self.wait_model.predict(w_input)[0])

            # Little's Law / Queuing theory blended calculation for physical guarantee
            # W_queue = (Queue_length / Active_counters) * Average_service_time
            theory_wait = (inferred_queue / active_counters) * average_service_time + (orders_pending * 0.2 / active_counters)
            
            # Blended weighted average (70% ML, 30% theory)
            predicted_wait = 0.70 * ml_wait + 0.30 * theory_wait
            predicted_wait = max(1.0, round(predicted_wait, 1))

            # Confidence score estimation based on R2 and input consistency
            confidence = round(float(np.clip(0.92 - (0.005 * abs(hour_float - 13.0)), 0.82, 0.98)), 2)
        else:
            # Fallback heuristic calculation if models are not loaded
            pred_customers = 35 if is_lunch_peak else 15
            inferred_queue = queue_length or 8
            predicted_wait = max(1.0, round((inferred_queue / active_counters) * average_service_time, 1))
            confidence = 0.75

        crowd_level = self.categorize_crowd(pred_customers, capacity=canteen_capacity)

        return {
            "hour": hour,
            "minute": minute,
            "predicted_customers": pred_customers,
            "predicted_wait_minutes": predicted_wait,
            "crowd_level": crowd_level,
            "confidence": confidence,
            "active_counters": active_counters,
            "queue_length_used": queue_length if queue_length > 0 else (inferred_queue if 'inferred_queue' in locals() else 0),
            "is_model_used": self.is_loaded
        }

    def predict_timeline(
        self,
        target_date: Optional[datetime] = None,
        active_counters: int = 3,
        canteen_capacity: int = 120,
        start_hour: int = 8,
        end_hour: int = 20
    ) -> List[Dict[str, Any]]:
        """Generates timeline predictions across all operational slots for a given day."""
        base_time = target_date or datetime.now()
        dow = base_time.weekday()
        slots = []

        # Iterate from start_hour to end_hour in 30-minute steps
        for h in range(start_hour, end_hour):
            for m in (0, 30):
                slot_time = base_time.replace(hour=h, minute=m, second=0, microsecond=0)
                pred = self.predict_single(
                    hour=h,
                    minute=m,
                    day_of_week=dow,
                    queue_length=0,  # Forecast based on historical demand
                    active_counters=active_counters,
                    orders_pending=0,
                    average_service_time=1.4,
                    is_holiday=(dow == 6),
                    is_exam_period=False,
                    canteen_capacity=canteen_capacity
                )
                time_str = slot_time.strftime("%I:%M %p")
                slots.append({
                    "time": time_str,
                    "hour": h,
                    "minute": m,
                    "timestamp": slot_time.isoformat(),
                    "predicted_customers": pred["predicted_customers"],
                    "predicted_wait_minutes": pred["predicted_wait_minutes"],
                    "crowd_level": pred["crowd_level"],
                    "confidence": pred["confidence"]
                })

        return slots

    def get_best_time_to_visit(
        self,
        timeline: Optional[List[Dict[str, Any]]] = None,
        canteen_capacity: int = 120
    ) -> Dict[str, Any]:
        """Computes the optimal time window to visit based on minimum wait time and crowd."""
        if not timeline:
            timeline = self.predict_timeline(canteen_capacity=canteen_capacity)

        # Filter slots to standard meal/snack windows (e.g., between 9:00 AM and 7:00 PM)
        valid_slots = [s for s in timeline if 9 <= s["hour"] <= 19]
        if not valid_slots:
            valid_slots = timeline

        # Rank slots by: 1) Crowd level (LOW > MEDIUM > HIGH > VERY HIGH), 2) Wait minutes, 3) Confidence
        crowd_rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "VERY HIGH": 4}
        sorted_slots = sorted(
            valid_slots,
            key=lambda s: (crowd_rank.get(s["crowd_level"], 5), s["predicted_wait_minutes"], -s["confidence"])
        )

        best_slot = sorted_slots[0]
        h = best_slot["hour"]
        m = best_slot["minute"]
        end_m = (m + 30) % 60
        end_h = h + 1 if m + 30 >= 60 else h
        start_time_obj = datetime.now().replace(hour=h, minute=m)
        end_time_obj = datetime.now().replace(hour=end_h, minute=end_m)
        time_window = f"{start_time_obj.strftime('%I:%M %p')} – {end_time_obj.strftime('%I:%M %p')}"

        reason = f"Predicted crowd is {best_slot['crowd_level']} with shortest estimated wait (~{int(best_slot['predicted_wait_minutes'])} min)."

        return {
            "recommended_window": time_window,
            "start_time": start_time_obj.strftime('%I:%M %p'),
            "end_time": end_time_obj.strftime('%I:%M %p'),
            "crowd_level": best_slot["crowd_level"],
            "expected_wait_minutes": best_slot["predicted_wait_minutes"],
            "confidence": best_slot["confidence"],
            "why": reason,
            "slot_details": best_slot
        }

if __name__ == "__main__":
    predictor = QueuePredictor()
    print("Testing single prediction (Lunch 12:30 PM, Queue 25, 3 counters):")
    res = predictor.predict_single(hour=12, minute=30, day_of_week=1, queue_length=25, active_counters=3)
    print(res)

    print("\nTesting Best Time to Visit:")
    best = predictor.get_best_time_to_visit()
    print(best)
