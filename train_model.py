#!/usr/bin/env python3
"""Train models and save the best pipeline for Employee Attrition Prediction."""
import json
import warnings
warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.utils.class_weight import compute_class_weight

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "Employee.csv"
MODEL_DIR = ROOT / "backend" / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def main():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    print(f"Shape: {df.shape}")
    print(f"Class distribution:\n{df['LeaveOrNot'].value_counts(normalize=True)}")

    X = df.drop(columns=["LeaveOrNot"])
    y = df["LeaveOrNot"]

    categorical = ["Education", "City", "Gender", "EverBenched"]
    numerical = ["JoiningYear", "PaymentTier", "Age", "ExperienceInCurrentDomain"]

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
        ]
    )

    classes = np.unique(y_train)
    weights = compute_class_weight("balanced", classes=classes, y=y_train)
    class_weight = dict(zip(classes, weights))
    print(f"Class weights: {class_weight}")

    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=10, class_weight="balanced",
            random_state=42, n_jobs=-1
        ),
    }
    if HAS_XGB:
        scale_pos = (y_train == 0).sum() / max((y_train == 1).sum(), 1)
        models["XGBoost"] = XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            scale_pos_weight=scale_pos, random_state=42,
            use_label_encoder=False, eval_metric="logloss", n_jobs=-1
        )

    results = {}
    best_name = None
    best_auc = -1
    best_pipeline = None

    for name, clf in models.items():
        print(f"\n=== Training {name} ===")
        pipe = Pipeline([("preprocessor", preprocessor), ("classifier", clf)])
        pipe.fit(X_train, y_train)

        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]

        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred)),
            "recall": float(recall_score(y_test, y_pred)),
            "f1": float(f1_score(y_test, y_pred)),
            "roc_auc": float(roc_auc_score(y_test, y_prob)),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        }
        results[name] = metrics
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1: {metrics['f1']:.4f}")
        print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
        print("Confusion Matrix:", metrics["confusion_matrix"])

        if metrics["roc_auc"] > best_auc:
            best_auc = metrics["roc_auc"]
            best_name = name
            best_pipeline = pipe

    print(f"\n*** Best model: {best_name} (ROC-AUC={best_auc:.4f}) ***")

    # Feature importance for tree models
    feature_importance = {}
    if best_name in ("RandomForest", "XGBoost"):
        # Get feature names after preprocessing
        ohe = best_pipeline.named_steps["preprocessor"].named_transformers_["cat"]
        cat_features = list(ohe.get_feature_names_out(categorical))
        all_features = numerical + cat_features
        importances = best_pipeline.named_steps["classifier"].feature_importances_
        feature_importance = dict(zip(all_features, [float(x) for x in importances]))
        # sort
        feature_importance = dict(
            sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        )

    # Save pipeline
    pipeline_path = MODEL_DIR / "pipeline.pkl"
    joblib.dump(best_pipeline, pipeline_path)
    print(f"Saved pipeline to {pipeline_path}")

    # Save metrics
    metrics_out = {
        "best_model": best_name,
        "metrics": results[best_name],
        "all_models": results,
        "feature_importance": feature_importance,
        "features": {
            "categorical": categorical,
            "numerical": numerical,
        },
    }
    metrics_path = MODEL_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics_out, f, indent=2)
    print(f"Saved metrics to {metrics_path}")

    # Quick sanity check
    sample = X_test.iloc[[0]]
    pred = best_pipeline.predict(sample)[0]
    prob = best_pipeline.predict_proba(sample)[0, 1]
    print(f"Sample prediction: {pred} (prob={prob:.3f})")
    print("Done!")

if __name__ == "__main__":
    main()
