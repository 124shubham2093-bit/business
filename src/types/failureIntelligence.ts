/**
 * TypeScript definitions for Startup Failure Intelligence Platform.
 * 
 * Accurately mirrors backend schemas:
 * - ModelStatusResponse (GET /api/predict-failure/model-status)
 * - PredictionFeatureInput / PredictionRequest / PredictionResponse (POST /api/predict-failure)
 * - HistoricalFailureAnalytics (GET /api/analytics/failure-intelligence)
 */

export type ModelStatusType = 'MODEL_AVAILABLE' | 'MODEL_NOT_AVAILABLE';
export type RiskLevelType = 'Low' | 'Medium' | 'High' | 'Critical';
export type PredictedOutcomeType = 'closed' | 'acquired';

export interface ModelStatusResponse {
  model_available: boolean;
  status: ModelStatusType;
  model_name?: string | null;
  model_version?: string | null;
  model_path: string;
  preprocessor_path: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export interface PredictionFeatureInput {
  funding_total_usd: number;
  funding_rounds: number;
  avg_participants: number;
  relationships: number;
  milestones: number;
  age_first_milestone_year?: number | null;
  age_last_milestone_year?: number | null;
  age_first_funding_year: number;
  age_last_funding_year: number;
  category_code: string;
  state_code: string;
  latitude: number;
  longitude: number;
  has_VC: number;
  has_angel: number;
  has_roundA: number;
  has_roundB: number;
  has_roundC: number;
  has_roundD: number;
  is_top500: number;
  funding_duration_years?: number | null;
  funding_per_round_usd?: number | null;
  funding_stages_count?: number | null;
  investor_diversity_score?: number | null;
  has_milestone?: number | null;
  milestone_duration_years?: number | null;
  relationships_per_year?: number | null;
}

export interface StartupMetadataInput {
  startup_id?: string;
  name?: string;
  city?: string;
}

export interface PredictionRequest {
  features: PredictionFeatureInput;
  metadata?: StartupMetadataInput;
}

export interface PredictionResponse {
  model_available: boolean;
  status: ModelStatusType;
  startup_id?: string | null;
  startup_name?: string | null;
  predicted_outcome?: PredictedOutcomeType | null;
  is_failed?: number | null; // 1 = closed, 0 = acquired
  failure_probability?: number | null; // 0.0 to 1.0
  survival_probability?: number | null; // 0.0 to 1.0
  risk_level?: RiskLevelType | null;
  risk_interpretation?: string | null;
  model_version?: string | null;
  explanation_available: boolean;
  message?: string | null;
}

export interface HistoricalCategoryAnalytics {
  category: string;
  category_key: string;
  total_startups: number;
  closed_startups: number;
  acquired_startups: number;
  failure_rate_pct: number;
  survival_rate_pct: number;
  mean_funding_usd: number;
}

export interface HistoricalFundingStageAnalytics {
  stage: string;
  column: string;
  description: string;
  total_startups: number;
  closed_startups: number;
  acquired_startups: number;
  failure_rate_pct: number;
  survival_rate_pct: number;
}

export interface HistoricalOutcomeMetricComparison {
  outcome: 'Acquired' | 'Closed' | string;
  is_failed: number;
  count: number;
  percentage_of_total: number;
  mean_relationships: number;
  median_relationships: number;
  mean_milestones: number;
  median_milestones: number;
  mean_funding_usd: number;
  median_funding_usd: number;
  mean_funding_rounds: number;
  mean_funding_duration_years: number;
}

export interface FeatureCorrelationItem {
  feature: string;
  display_name: string;
  correlation: number;
  absolute_correlation: number;
  p_value: number;
  is_significant: boolean;
  direction: 'Elevated Failure Association' | 'Protective Association' | string;
}

export interface HistoricalFailureAnalytics {
  dataset: {
    total_startups: number;
    acquired: number;
    closed: number;
    historical_closure_rate: number;
    base_rate_percentage: number;
  };
  by_category: HistoricalCategoryAnalytics[];
  by_funding_stage: HistoricalFundingStageAnalytics[];
  relationships_and_milestones_by_outcome: HistoricalOutcomeMetricComparison[];
  correlations: FeatureCorrelationItem[];
  methodology: {
    dataset_source: string;
    sample_size: number;
    historical_scope: string;
    target_definition: string;
    notes: string[];
  };
}
