"""Flask API for Employee Attrition Prediction."""
import json
import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = Path(__file__).resolve().parent / "model"
PIPELINE_PATH = MODEL_DIR / "pipeline.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"

# Load model and metrics at startup
pipeline = None
metrics = None

def load_artifacts():
    global pipeline, metrics
    if PIPELINE_PATH.exists():
        pipeline = joblib.load(PIPELINE_PATH)
        print(f"Loaded pipeline from {PIPELINE_PATH}")
    else:
        print(f"WARNING: Pipeline not found at {PIPELINE_PATH}")
    if METRICS_PATH.exists():
        with open(METRICS_PATH) as f:
            metrics = json.load(f)
        print(f"Loaded metrics from {METRICS_PATH}")
    else:
        print(f"WARNING: Metrics not found at {METRICS_PATH}")

load_artifacts()

REQUIRED_FEATURES = [
    "Education", "JoiningYear", "City", "PaymentTier",
    "Age", "Gender", "EverBenched", "ExperienceInCurrentDomain"
]

VALID_VALUES = {
    "Education": ["Bachelors", "Masters", "PHD"],
    "City": ["Bangalore", "Pune", "New Delhi"],
    "Gender": ["Male", "Female"],
    "EverBenched": ["Yes", "No"],
}


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": pipeline is not None
    })


@app.route("/model-info", methods=["GET"])
def model_info():
    if metrics is None:
        return jsonify({"error": "Metrics not available"}), 503
    return jsonify(metrics)


@app.route("/predict", methods=["POST"])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded"}), 503

    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    if not data:
        return jsonify({"error": "Empty request body"}), 400

    # Validate required fields
    missing = [f for f in REQUIRED_FEATURES if f not in data]
    if missing:
        return jsonify({"error": f"Missing features: {missing}"}), 400

    # Type / value checks
    try:
        payload = {
            "Education": str(data["Education"]),
            "JoiningYear": int(data["JoiningYear"]),
            "City": str(data["City"]),
            "PaymentTier": int(data["PaymentTier"]),
            "Age": int(data["Age"]),
            "Gender": str(data["Gender"]),
            "EverBenched": str(data["EverBenched"]),
            "ExperienceInCurrentDomain": int(data["ExperienceInCurrentDomain"]),
        }
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid feature types: {e}"}), 400

    # Range / category validation
    if payload["Education"] not in VALID_VALUES["Education"]:
        return jsonify({"error": f"Education must be one of {VALID_VALUES['Education']}"}), 400
    if payload["City"] not in VALID_VALUES["City"]:
        return jsonify({"error": f"City must be one of {VALID_VALUES['City']}"}), 400
    if payload["Gender"] not in VALID_VALUES["Gender"]:
        return jsonify({"error": f"Gender must be one of {VALID_VALUES['Gender']}"}), 400
    if payload["EverBenched"] not in VALID_VALUES["EverBenched"]:
        return jsonify({"error": f"EverBenched must be one of {VALID_VALUES['EverBenched']}"}), 400
    if payload["PaymentTier"] not in (1, 2, 3):
        return jsonify({"error": "PaymentTier must be 1, 2 or 3"}), 400
    if not (18 <= payload["Age"] <= 70):
        return jsonify({"error": "Age must be between 18 and 70"}), 400
    if not (2010 <= payload["JoiningYear"] <= 2025):
        return jsonify({"error": "JoiningYear must be between 2010 and 2025"}), 400
    if not (0 <= payload["ExperienceInCurrentDomain"] <= 20):
        return jsonify({"error": "ExperienceInCurrentDomain must be between 0 and 20"}), 400

    # Build DataFrame with correct column order
    df = pd.DataFrame([payload])[REQUIRED_FEATURES]

    try:
        pred = int(pipeline.predict(df)[0])
        proba = float(pipeline.predict_proba(df)[0, 1])
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

    message = "Employee is likely to leave" if pred == 1 else "Employee is likely to stay"

    return jsonify({
        "prediction": pred,
        "probability": round(proba, 4),
        "message": message
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
