import os
import sys
from typing import Optional

# Ensure project root is in sys.path so ml.predict can be imported
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.predict import QueuePredictor
from ..config import settings

_predictor_instance: Optional[QueuePredictor] = None

def get_predictor() -> QueuePredictor:
    """Returns a singleton instance of the QueuePredictor."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = QueuePredictor(models_dir=settings.ML_MODELS_DIR)
    return _predictor_instance
