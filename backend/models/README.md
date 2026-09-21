# Model Artifacts Directory — Startup Failure Intelligence Platform

This directory (`backend/models/`) is reserved for trained machine learning model artifacts and serialized preprocessing pipelines.

---

## 1. Important Constraint

> [!IMPORTANT]
> **No trained models are pre-committed in this directory.**
> In accordance with project requirements, model training is deferred to a designated machine with suitable hardware.
> **DO NOT** commit dummy, untrained, or fabricated `.joblib` files to simulate functionality. The platform's prediction service is architected to safely detect model absence and report a graceful `MODEL_NOT_AVAILABLE` state.

---

## 2. Expected Artifacts

When model training is completed, the training script must export the following three artifacts into this directory:

### A. `startup_failure_model.joblib`
* **Type:** Serialized scikit-learn / XGBoost / LightGBM classification model.
* **Interface Required:**
  * `.predict(X)` $\rightarrow$ binary array of predictions (`1` = closed/failed, `0` = acquired/survived).
  * `.predict_proba(X)` $\rightarrow$ 2D array of class probabilities $[P(\text{is\_failed}=0), P(\text{is\_failed}=1)]$.

### B. `startup_preprocessor.joblib`
* **Type:** Serialized `StartupDataPreprocessor` or scikit-learn `ColumnTransformer`.
* **Interface Required:**
  * `.transform(df)` $\rightarrow$ transformed numerical design matrix $X$ of shape $(N, 110)$.

### C. `model_metadata.json`
* **Type:** Structured metadata JSON detailing model provenance and validation metrics.
* **Schema:**
  ```json
  {
    "model_name": "RandomForestClassifier",
    "model_version": "1.0.0",
    "training_dataset": "backend/data/startup_ml_ready.csv",
    "training_records": 922,
    "feature_count": 42,
    "transformed_feature_count": 110,
    "target_column": "is_failed",
    "target_mapping": {
      "0": "acquired",
      "1": "closed"
    },
    "training_timestamp": "YYYY-MM-DDTHH:MM:SSZ",
    "hardware_specs": "GPU / Multi-core CPU",
    "evaluation_metrics": {
      "accuracy": 0.0,
      "precision": 0.0,
      "recall": 0.0,
      "f1_score": 0.0,
      "roc_auc": 0.0,
      "confusion_matrix": [[0, 0], [0, 0]]
    },
    "hyperparameters": {}
  }
  ```

---

## 3. Expected Input Features

The model expects the 42 pre-outcome features documented in `backend/data/README.md`, including:
* Capital: `funding_total_usd`, `funding_rounds`, `avg_participants`
* Traction: `relationships`, `milestones`, milestone ages
* Derived: `funding_duration_years`, `funding_per_round_usd`, `funding_stages_count`, `has_milestone`, `milestone_duration_years`, `relationships_per_year`
* Stages: `has_VC`, `has_angel`, `has_roundA`, `has_roundB`, `has_roundC`, `has_roundD`, `is_top500`
* Location & Domain: `category_code`, `state_code`, and regional indicator flags

---

## 4. Safe Loading Mechanism

The backend's `ModelService` (`backend/app/ml/model_service.py`) checks for the existence of `startup_failure_model.joblib`:
1. If found: Lazily deserializes the model via `joblib.load()` and serves real predictions.
2. If missing: Returns an explicit `MODEL_NOT_AVAILABLE` status (HTTP 503 on prediction requests) with detailed diagnostic instructions.
