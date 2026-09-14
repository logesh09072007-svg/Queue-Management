"""
QueueSense AI - Synthetic Demo Data Generator
=============================================
IMPORTANT NOTICE:
This script generates SYNTHETIC DEMO DATA for development, evaluation, and demonstration purposes only.
It is explicitly labeled as synthetic demo data and must not be presented as real field observations.

Real canteen behavior patterns modeled:
- Opening hours: 08:00 - 20:00 (12 hours/day) in 30-minute intervals
- Breakfast peak: 08:30 - 09:30
- Short morning break peak: 10:30 - 11:30
- Lunch rush (primary peak): 12:00 - 14:00
- Evening snack break: 16:30 - 17:30
- Off-peak windows: 08:00 - 08:30, 14:30 - 16:00, 18:30 - 20:00
- Weekends & holidays: Significantly reduced traffic (~70% lower)
- Exam periods: Higher bursty traffic during break transitions
- Active counters: 1 to 5 counters, where more counters reduce queue buildup and wait times
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Reproducibility seed
SEED = 42
np.random.seed(SEED)
random.seed(SEED)

def get_base_demand_multiplier(hour: float, day_of_week: int, is_holiday: bool, is_exam: bool) -> float:
    """Calculates time-of-day demand multiplier reflecting college schedule."""
    # Weekend / Holiday reduction
    if is_holiday or day_of_week in [5, 6]:
        base = 0.25
        if 12.0 <= hour <= 14.0:
            base = 0.45
        return base

    # Weekday schedule
    if 8.0 <= hour < 8.5:
        base = 0.35  # Early arrivals
    elif 8.5 <= hour < 9.5:
        base = 0.75  # Breakfast rush
    elif 9.5 <= hour < 10.5:
        base = 0.40  # Lectures active
    elif 10.5 <= hour < 11.5:
        base = 0.85  # Morning short break
    elif 11.5 <= hour < 12.0:
        base = 0.50  # Pre-lunch lecture wrap-up
    elif 12.0 <= hour <= 13.5:
        base = 1.00  # Major lunch peak
    elif 13.5 < hour <= 14.5:
        base = 0.70  # Late lunch
    elif 14.5 < hour < 16.5:
        base = 0.30  # Afternoon slump
    elif 16.5 <= hour <= 17.5:
        base = 0.80  # Evening tea/snack break
    elif 17.5 < hour <= 18.5:
        base = 0.45  # Study groups / evening
    else:
        base = 0.20  # Winding down towards closing

    # Exam period adjustment: sharper peaks
    if is_exam:
        if (10.5 <= hour <= 11.5) or (12.5 <= hour <= 13.5) or (16.5 <= hour <= 17.5):
            base = min(1.0, base * 1.15)
        else:
            base = base * 0.85

    return base

def generate_synthetic_canteen_dataset(num_days: int = 75) -> pd.DataFrame:
    """Generates over 1,500 synthetic records with realistic operational parameters."""
    start_date = datetime(2026, 1, 12, 8, 0, 0)
    records = []

    # Nominal canteen max capacity
    MAX_CAPACITY = 120

    for day_idx in range(num_days):
        current_day = start_date + timedelta(days=day_idx)
        dow = current_day.weekday() # 0 = Monday, 6 = Sunday

        # Flag holiday (every 14th day demo) or exam period (days 40-50)
        is_holiday = bool(dow == 6 or (day_idx % 21 == 0 and dow < 5))
        is_exam = bool(40 <= day_idx <= 54 and dow < 5)

        # 30-minute intervals from 08:00 to 19:30 (24 slots per day)
        for slot in range(24):
            slot_time = current_day + timedelta(minutes=slot * 30)
            hour_float = slot_time.hour + slot_time.minute / 60.0
            hour_int = slot_time.hour
            minute_int = slot_time.minute

            multiplier = get_base_demand_multiplier(hour_float, dow, is_holiday, is_exam)

            # Expected customer arrival for this 30-minute window
            # Normal distribution with bounded variance
            mean_customers = multiplier * (MAX_CAPACITY * 0.85)
            noise = np.random.normal(0, 4.0)
            customer_count = max(2, int(np.round(mean_customers + noise)))

            # Active counters: 1 to 5 counters, canteen manager usually adjusts to demand
            if multiplier >= 0.8:
                active_counters = np.random.choice([3, 4, 5], p=[0.25, 0.55, 0.20])
            elif multiplier >= 0.5:
                active_counters = np.random.choice([2, 3, 4], p=[0.30, 0.50, 0.20])
            else:
                active_counters = np.random.choice([1, 2, 3], p=[0.50, 0.40, 0.10])

            # Average service time per customer in minutes (e.g., 1.0 to 2.2 min)
            # Service time slightly increases when rush causes kitchen pressure
            base_service_time = 1.35 + (0.35 if multiplier >= 0.8 else 0.0)
            avg_service_time = round(max(0.75, np.random.normal(base_service_time, 0.18)), 2)

            # Queue length: depends on customer influx vs counter processing capacity
            # 30-minute processing capacity = (30 / avg_service_time) * active_counters
            service_capacity = (30.0 / avg_service_time) * active_counters
            net_pressure = customer_count - (service_capacity * 0.45)

            if net_pressure > 0:
                raw_queue = net_pressure * 0.9 + np.random.normal(0, 2.5)
            else:
                raw_queue = customer_count * 0.25 + np.random.normal(0, 1.5)

            queue_length = max(0, int(np.round(raw_queue)))

            # Orders pending (orders paid or in preparation)
            orders_pending = max(0, int(np.round(queue_length * 0.8 + np.random.uniform(0, 4))))

            # Customers served in this interval
            customers_served = min(customer_count, int(np.round(service_capacity * 0.5 + np.random.uniform(2, 8))))

            # Waiting time calculation (Little's Law + queuing theory approximation + empirical noise)
            # W_q = (Queue_length / active_counters) * avg_service_time + pending_orders_delay
            queue_wait = (queue_length / max(1, active_counters)) * avg_service_time
            pending_delay = (orders_pending / (max(1, active_counters) * 2.0)) * 0.5
            total_wait = queue_wait + pending_delay + np.random.normal(0, 0.8)
            waiting_time_minutes = max(1.0, round(float(total_wait), 1))

            # Categorize crowd level
            occupancy_rate = min(1.0, customer_count / MAX_CAPACITY)
            if occupancy_rate <= 0.30:
                crowd_level = "LOW"
            elif occupancy_rate <= 0.60:
                crowd_level = "MEDIUM"
            elif occupancy_rate <= 0.80:
                crowd_level = "HIGH"
            else:
                crowd_level = "VERY HIGH"

            records.append({
                "timestamp": slot_time.strftime("%Y-%m-%d %H:%M:%S"),
                "day_of_week": dow,
                "hour": hour_int,
                "minute": minute_int,
                "hour_float": round(hour_float, 2),
                "is_holiday": int(is_holiday),
                "is_exam_period": int(is_exam),
                "active_counters": active_counters,
                "queue_length": queue_length,
                "orders_pending": orders_pending,
                "customers_served": customers_served,
                "average_service_time": avg_service_time,
                "predicted_customer_count": customer_count,
                "waiting_time_minutes": waiting_time_minutes,
                "crowd_level": crowd_level,
                "data_source": "SYNTHETIC_DEMO_DATA"
            })

    df = pd.DataFrame(records)
    return df

def main():
    print("=" * 60)
    print("QueueSense AI - Generating Synthetic Demo Dataset")
    print("=" * 60)

    df = generate_synthetic_canteen_dataset(num_days=75)
    print(f"Generated {len(df)} synthetic records across {df['day_of_week'].nunique()} days of week.")
    print(f"Time range: {df['timestamp'].min()} to {df['timestamp'].max()}")

    # Display summary statistics
    print("\n--- Summary Statistics ---")
    print(df[["queue_length", "active_counters", "predicted_customer_count", "waiting_time_minutes"]].describe())

    print("\n--- Crowd Level Distribution ---")
    print(df["crowd_level"].value_counts(normalize=True).apply(lambda x: f"{x*100:.1f}%"))

    # Save to data directory
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "synthetic_canteen_data.csv")

    df.to_csv(output_path, index=False)
    print(f"\n[SUCCESS] Dataset saved to: {output_path}")
    print("NOTE: Clearly labeled with data_source='SYNTHETIC_DEMO_DATA'")

if __name__ == "__main__":
    main()
