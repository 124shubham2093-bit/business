# Model Training Specification & Contract
**Startup Failure Intelligence Platform — Capstone Project**  
**Designated Location:** `backend/ml_training/`  
**Execution Environment:** To be executed on a dedicated higher-capacity machine.

---

## 1. Objective & Scope

This specification defines the exact contract for training, validating, and persisting machine learning models to predict startup failure risk.

> [!WARNING]
> **TRAINING CONSTRAINT NOTICE**  
> In accordance with project resource constraints, model training is deferred to an external higher-capacity environment.  
> **DO NOT** execute model training on low-capacity host environments. The template script (`train_template.py`) is provided as an executable specification and guide for the team member who will perform model training.

---

## 2. Training Data Contract

* **Input Data File:** `backend/data/startup_ml_ready.csv`
* **Entity Count:** 922 unique, deduplicated startup records.
* **Target Feature:** `is_failed` (integer, non-null).
* **Target Semantics:**
  * `1` = **Closed / Failed** (326 instances, 35.36% of dataset)
  * `0` = **Acquired / Survived** (596 instances, 64.64% of dataset)
* **Design Matrix Dimensions:** 42 predictive pre-outcome features (expands to 110 dimensions following one-hot encoding).
* **Leakage Safeguard:** The dataset has already been audited to exclude `status`, `labels`, `closed_at`, and raw identifiers.

---

## 3. Recommended Validation Protocol

1. **Stratified Train-Test Split:**
   * An 80/20 stratified split (`test_size=0.20`, `random_state=42`, `stratify=y`) ensures both partitions reflect the 35.36% failure base rate.
2. **Repeated Stratified K-Fold Cross-Validation:**
   * 5-Fold Stratified Cross-Validation (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`) on the training split ($N=737$) to guard against variance on smaller cohorts.

---

## 4. Candidate Model Suite

The designated team member should evaluate at least the following algorithms:
1. **L2-Regularized Logistic Regression (Baseline):** Provides interpretable odds-ratio coefficients for feature weights.
2. **Random Forest Classifier:** Robust to non-linear interactions between network scale (`relationships`) and milestones.
3. **Gradient Boosting / XGBoost / LightGBM:** High discriminative capability across tabular venture metrics.
4. **Support Vector Classifier (RBF Kernel):** Non-linear boundary evaluation with calibrated probabilities (`CalibratedClassifierCV`).

---

## 5. Model Evaluation Criteria

Due to the class distribution (64.6% Acquired vs. 35.4% Closed), **Accuracy alone is misleading** (a naive model predicting all ventures succeed achieves 64.6% accuracy while catching zero failures).

Models must be evaluated on:
* **Primary Metric:** **ROC-AUC** (Receiver Operating Characteristic Area Under Curve) — Measures class separation across all decision thresholds.
* **Secondary Metric:** **Recall on Class 1 (Failure Recall)** — Critical for due diligence (identifying at-risk startups before capital allocation).
* **Balanced Metric:** **PR-AUC (Precision-Recall AUC)** & **Macro F1-Score**.
* **Probability Calibration:** **Brier Score** — Evaluates whether predicted probabilities reflect empirical risk.
* **Confusion Matrix:** True Positives, False Positives, True Negatives, False Negatives.

---

## 6. Required Exported Artifacts

Upon selecting the winning model, the training script must export exactly these files to `backend/models/`:

1. **`backend/models/startup_failure_model.joblib`**
   * Must implement `.predict(X)` and `.predict_proba(X)`.
2. **`backend/models/startup_preprocessor.joblib`**
   * The fitted `StartupDataPreprocessor` (or scikit-learn `ColumnTransformer`) ensuring inference transforms match training transforms identically.
3. **`backend/models/model_metadata.json`**
   * Documenting algorithm, hyperparameters, feature names, training timestamp, and verified test-set metrics (ROC-AUC, Precision, Recall, F1, Confusion Matrix).

---

## 7. Important Methodological Note: Historical Outcome vs. Real-Time Horizon

> [!NOTE]
> **METHODOLOGICAL LIMITATION & DEFENSE**  
> The current dataset captures *historical completed startup lifecycles*. Certain features (such as `age_last_funding_year` or `age_last_milestone_year`) reflect events that occurred across the startup's operational lifetime.  
> 
> Therefore, for academic defense and institutional reporting:
> - The model must be described as **"historical startup outcome classification / venture risk profiling"**.
> - It must **NOT** be claimed as a proven "real-time early-warning causal forecast" unless a future iteration implements a fixed retrospective observation window (e.g. "metrics known strictly at Year 2 post-founding").
> - All correlation and prediction outputs represent statistical association, **NOT causal proof** that changing a feature will guarantee venture survival.
