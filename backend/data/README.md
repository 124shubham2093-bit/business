# Startup Failure Intelligence Platform — Data Documentation
**Dataset Source:** Kaggle Startup Success/Failure Prediction Dataset  
**Location:** `backend/data/`  
**Files:**
- `startup_data.csv`: Raw, unmodified source dataset (923 records, 49 columns)
- `startup_ml_ready.csv`: Cleaned, leakage-free, feature-engineered dataset ready for ML training (922 records, 43 columns)
- `eda_plots/`: Exploratory data analysis diagnostic visualizations (PNG)

---

## 1. Dataset Overview

* **Domain:** Venture capital and startup lifecycle outcomes.
* **Raw Dimensions:** 923 rows, 49 columns.
* **Cleaned / Deduplicated Dimensions:** 922 unique startup entities, 42 predictive features + 1 target column (`is_failed`).
* **Entity Deduplication:** 1 confirmed entity duplicate removed (`id == 'c:28482'`, *Redwood Systems*, present at row indices 124 and 832).

---

## 2. Target Variable Formulation

The platform's goal is **Startup Failure Intelligence**. The target variable `is_failed` is derived strictly from the ground-truth outcome column `status`:

$$\text{is\_failed} = \begin{cases} 1 & \text{if } \text{status} = \text{'closed'} \quad \text{(Startup Failure)} \\ 0 & \text{if } \text{status} = \text{'acquired'} \quad \text{(Successful Outcome)} \end{cases}$$

### Class Balance:
* **Active / Acquired ($0$):** 596 startups (64.64%)
* **Closed / Failed ($1$):** 326 startups (35.36%)
* **Total Clean Entities:** 922 startups
* **Failure Base Rate:** 35.36%

> [!NOTE]
> No heuristics (such as missing dates or low capital) were used to infer failure. The ground-truth `status` attribute is the sole source of truth.

---

## 3. Target Leakage Audit & Excluded Columns

A strict leakage audit was conducted (`TargetLeakageAuditor`). Columns were categorized into analytical roles and removed from the predictive feature set:

| Column Name | Category | Reason for Exclusion from Predictive Model |
| :--- | :--- | :--- |
| `status` | **Direct Target** | Ground-truth outcome label (`acquired` / `closed`). |
| `labels` | **Target Leakage** | Original competition target ($1 = \text{acquired}, 0 = \text{closed}$). Collinear with $1 - \text{is\_failed}$ ($r = -1.000$). |
| `closed_at` | **Target Leakage** | Calendar date of company closure. Present for 99% of closed startups and NaN for 98.5% of acquired startups. |
| `Unnamed: 0` | **Artifact** | Raw CSV export index number. |
| `Unnamed: 6` | **Artifact** | Unstructured address text snippet with 492 missing values; redundant with city/state. |
| `object_id` | **Duplicate Identifier** | 100% duplicate of startup `id`. |
| `state_code.1` | **Duplicate Identifier** | Duplicate of `state_code` (with 1 missing row). |
| `id` | **Identifier** | Crunchbase entity key (e.g. `c:6669`). Excluded from weights to prevent overfitting. |
| `name` | **Identifier** | Startup company trade name. Excluded to prevent overfitting. |
| `city` | **High-Cardinality Meta** | 221 distinct cities across 922 rows. Geographic location is cleanly captured by `state_code` and regional flags. |
| `zip_code` | **High-Cardinality Meta** | 382 distinct zip codes across 922 rows. |
| `founded_at` | **Raw Date String** | Unstructured date string; operating age is captured by `age_first_funding_year` and `age_last_funding_year`. |
| `first_funding_at` | **Raw Date String** | Unstructured date string; captured by numeric age variables. |
| `last_funding_at` | **Raw Date String** | Unstructured date string; captured by numeric age variables. |

---

## 4. Retained & Engineered Predictive Features

The ML-ready dataset (`startup_ml_ready.csv`) contains **42 predictive features** categorized as follows:

### A. Operational & Capital Metrics (Numerical)
1. `funding_total_usd` (int64): Cumulative venture funding raised in USD.
2. `funding_rounds` (int64): Total number of funding events closed.
3. `relationships` (int64): Number of verified founder, executive, and investor connections.
4. `milestones` (int64): Total business and operational milestones logged.
5. `avg_participants` (float64): Average number of participating investors per round.
6. `age_first_funding_year` (float64): Startup age in years at initial funding round.
7. `age_last_funding_year` (float64): Startup age in years at final funding round.
8. `age_first_milestone_year` (float64): Startup age at first milestone (imputed as 0 if no milestones).
9. `age_last_milestone_year` (float64): Startup age at final milestone (imputed as 0 if no milestones).
10. `latitude` (float64): Geographic coordinate.
11. `longitude` (float64): Geographic coordinate.

### B. Derived Features (Non-Leaking Feature Engineering)
12. `funding_duration_years` (float64): $\max(\text{age\_last\_funding\_year} - \text{age\_first\_funding\_year}, 0.0)$. Measures the chronological span of investor backing ($r = -0.210$ with failure).
13. `funding_per_round_usd` (float64): $\text{funding\_total\_usd} / \max(\text{funding\_rounds}, 1)$. Capital intensity per round.
14. `funding_stages_count` (int64): Count of named venture stages reached ($\text{has\_roundA} + \text{has\_roundB} + \text{has\_roundC} + \text{has\_roundD}$, range 0–4; $r = -0.293$ with failure).
15. `investor_diversity_score` (int64): Breadth of capital sources ($\text{has\_VC} + \text{has\_angel}$, range 0–2).
16. `has_milestone` (int64): Binary indicator ($1$ if $\text{milestones} > 0$, else $0$; $r = -0.313$ with failure).
17. `milestone_duration_years` (float64): Span between first and final milestone ($r = -0.246$ with failure).
18. `relationships_per_year` (float64): $\text{relationships} / \max(\text{age\_last\_funding\_year}, 0.5)$. Network growth velocity.

### C. Financing Stage & Entity Indicators (Binary)
19. `has_VC` (0/1): Venture capital firm backed.
20. `has_angel` (0/1): Angel investor backed.
21. `has_roundA` (0/1): Closed Series A.
22. `has_roundB` (0/1): Closed Series B.
23. `has_roundC` (0/1): Closed Series C.
24. `has_roundD` (0/1): Closed Series D.
25. `is_top500` (0/1): Recognized Top 500 entity on Crunchbase ($r = -0.310$ with failure).

### D. Geographic Region Indicators
26. `state_code` (categorical str): Two-letter state code.
27. `is_CA` (0/1): California headquarters.
28. `is_NY` (0/1): New York headquarters.
29. `is_MA` (0/1): Massachusetts headquarters.
30. `is_TX` (0/1): Texas headquarters.
31. `is_otherstate` (0/1): Non-hub US state ($r = +0.169$ with failure).

### E. Industry & Sector Indicators
32. `category_code` (categorical str): Primary operating sector (35 distinct domains).
33. `is_software` (0/1)
34. `is_web` (0/1)
35. `is_mobile` (0/1)
36. `is_enterprise` (0/1)
37. `is_advertising` (0/1)
38. `is_gamesvideo` (0/1)
39. `is_ecommerce` (0/1)
40. `is_biotech` (0/1)
41. `is_consulting` (0/1)
42. `is_othercategory` (0/1)

---

## 5. Missing-Value Strategy

* **Informative Milestone Missingness:** Startups with `milestones == 0` (152 rows) had missing values for `age_first_milestone_year` and `age_last_milestone_year`. These are filled with `0.0`, and the structural indicator `has_milestone = 0` explicitly alerts linear and tree models to the absence of milestones.
* **Predictive Numerical Features:** All remaining numerical features have **0 missing values**.
* **Categorical Imputation:** Any missing categorical entry is imputed with `'other'` prior to one-hot encoding.
* **Final Missing Value Count in `startup_ml_ready.csv`:** **0 missing values across all 43 columns**.

---

## 6. Preprocessing & Encoding Pipeline

The `StartupDataPreprocessor` implements an exact scikit-learn `ColumnTransformer`:
1. **Continuous Features (11 columns):** Imputed via median and normalized via `RobustScaler()` (robust to power-law funding distributions).
2. **Binary Features (29 columns):** Passed through as native $0/1$ integer indicators.
3. **Categorical Features (2 columns: `category_code`, `state_code`):** One-hot encoded with `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.
4. **Target ($y$):** Extracted cleanly as the 1D integer vector `is_failed`.
5. **Transformed Dimensions:** Transforming `startup_ml_ready.csv` yields an exact design matrix $X$ of shape $(922, 110)$.

---

## 7. Dataset Limitations & Schema Gap Analysis

Compared to our Step-1 theoretical diligence schema, the following private financial fields are **unavailable in public Crunchbase data**:
* `burn_rate_monthly`: Private internal ledger data.
* `runway_months`: Private cash-on-hand ratio.
* `revenue_annual`: Private P&L data.
* `valuation_usd`: Private cap table data.
* `team_size`: Exact headcount is private; partially proxied in this dataset by verified professional `relationships` ($r = -0.360$ with failure).

In strict adherence to project guidelines, **none of these unavailable fields were fabricated**.
