"""
Future Model Training Template & Specification Script.

NOTICE:
This script is a TEMPLATE intended to be run ONLY by the team member on a dedicated
higher-capacity machine. It does NOT run automatically.

Usage (on dedicated machine):
    python train_template.py --execute-training
"""

import sys
import argparse
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT_DIR / "data" / "startup_ml_ready.csv"
OUTPUT_DIR = ROOT_DIR / "models"


def print_training_contract():
    print("=" * 70)
    print("STARTUP FAILURE INTELLIGENCE PLATFORM — MODEL TRAINING TEMPLATE")
    print("=" * 70)
    print(f"Data Source: {DATA_PATH}")
    print(f"Target Output Directory: {OUTPUT_DIR}")
    print("\nExpected Outputs when executed on high-capacity hardware:")
    print("  1. backend/models/startup_failure_model.joblib")
    print("  2. backend/models/startup_preprocessor.joblib")
    print("  3. backend/models/model_metadata.json")
    print("\nCandidate Algorithms:")
    print("  - L2-Regularized Logistic Regression (Interpretable Baseline)")
    print("  - Random Forest Classifier (Non-linear & interaction robust)")
    print("  - Gradient Boosting / XGBoost (High discriminative capability)")
    print("\nEvaluation Metrics Contract:")
    print("  - Primary: ROC-AUC")
    print("  - Secondary: Failure Recall (Class 1 Recall)")
    print("  - Balanced: F1-Score & PR-AUC")
    print("=" * 70)
    print("To execute training on your dedicated machine, run:")
    print("    python train_template.py --execute-training")
    print("=" * 70)


def execute_training_workflow():
    """
    Workflow to be executed on the higher-capacity machine.
    """
    import json
    from datetime import datetime, timezone
    import joblib
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        roc_auc_score,
        confusion_matrix,
    )
    from sklearn.model_selection import train_test_split

    from app.analytics import StartupDataPreprocessor

    print("[1/5] Loading ML-ready dataset...")
    df = pd.read_csv(DATA_PATH)
    print(f"      Loaded {len(df)} records, {len(df.columns)} columns.")

    print("[2/5] Initializing and fitting preprocessor...")
    preprocessor = StartupDataPreprocessor(target_column="is_failed", scaler_type="robust")
    X, y, feature_names = preprocessor.fit_transform(df)

    print("[3/5] Performing Stratified Train/Test Split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("[4/5] Training candidate model (Random Forest Classifier)...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }
    print("      Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"        {k}: {v}")

    print(f"[5/5] Exporting artifacts to {OUTPUT_DIR}...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, OUTPUT_DIR / "startup_failure_model.joblib")
    joblib.dump(preprocessor, OUTPUT_DIR / "startup_preprocessor.joblib")

    metadata = {
        "model_name": "RandomForestClassifier",
        "model_version": "1.0.0",
        "training_dataset": "backend/data/startup_ml_ready.csv",
        "training_records": len(df),
        "feature_count": len(feature_names),
        "target_column": "is_failed",
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "evaluation_metrics": metrics,
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 6,
            "class_weight": "balanced",
            "random_state": 42,
        },
    }
    with open(OUTPUT_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("SUCCESS: Model training and persistence completed successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Startup Failure Model Training Template")
    parser.add_argument(
        "--execute-training",
        action="store_true",
        help="Explicit flag required to execute training on higher-capacity hardware",
    )
    args = parser.parse_args()

    if args.execute_training:
        execute_training_workflow()
    else:
        print_training_contract()
