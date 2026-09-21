/**
 * Failure Intelligence API & Data Service.
 * 
 * Provides communication with FastAPI backend endpoints:
 * - GET  /api/predict-failure/model-status
 * - POST /api/predict-failure
 * - GET  /api/analytics/failure-intelligence
 * 
 * Guarantees:
 * - Distinguishes between historical dataset analytics and live ML predictions.
 * - Handles HTTP 503 (MODEL_NOT_AVAILABLE) gracefully as an expected development state.
 * - Never fabricates fake model predictions or accuracy metrics.
 */

import { BACKEND_API_BASE } from './investigation/config';
import type {
  ModelStatusResponse,
  PredictionRequest,
  PredictionResponse,
  HistoricalFailureAnalytics,
} from '../types/failureIntelligence';

const API_BASE = BACKEND_API_BASE || 'http://localhost:8000/api';

/**
 * Fallback historical analytics based directly on verified dataset totals
 * (922 startups, 596 acquired, 326 closed, 35.36% failure base rate).
 * Used only when the backend server is temporarily unreachable over network.
 */
const FALLBACK_HISTORICAL_ANALYTICS: HistoricalFailureAnalytics = {
  dataset: {
    total_startups: 922,
    acquired: 596,
    closed: 326,
    historical_closure_rate: 0.3536,
    base_rate_percentage: 35.36,
  },
  by_category: [
    { category: 'Other', category_key: 'other', total_startups: 11, closed_startups: 9, acquired_startups: 2, failure_rate_pct: 81.82, survival_rate_pct: 18.18, mean_funding_usd: 31391748.45 },
    { category: 'Public Relations', category_key: 'public_relations', total_startups: 25, closed_startups: 15, acquired_startups: 10, failure_rate_pct: 60.0, survival_rate_pct: 40.0, mean_funding_usd: 11082640.0 },
    { category: 'Hardware', category_key: 'hardware', total_startups: 27, closed_startups: 16, acquired_startups: 11, failure_rate_pct: 59.26, survival_rate_pct: 40.74, mean_funding_usd: 28664402.7 },
    { category: 'Cleantech', category_key: 'cleantech', total_startups: 22, closed_startups: 13, acquired_startups: 9, failure_rate_pct: 59.09, survival_rate_pct: 40.91, mean_funding_usd: 57547033.18 },
    { category: 'Ecommerce', category_key: 'ecommerce', total_startups: 25, closed_startups: 14, acquired_startups: 11, failure_rate_pct: 56.0, survival_rate_pct: 44.0, mean_funding_usd: 13163276.88 },
    { category: 'Social', category_key: 'social', total_startups: 14, closed_startups: 6, acquired_startups: 8, failure_rate_pct: 42.86, survival_rate_pct: 57.14, mean_funding_usd: 3212392.71 },
    { category: 'Search', category_key: 'search', total_startups: 12, closed_startups: 5, acquired_startups: 7, failure_rate_pct: 41.67, survival_rate_pct: 58.33, mean_funding_usd: 13025000.0 },
    { category: 'Games Video', category_key: 'games_video', total_startups: 52, closed_startups: 21, acquired_startups: 31, failure_rate_pct: 40.38, survival_rate_pct: 59.62, mean_funding_usd: 16243144.81 },
    { category: 'Messaging', category_key: 'messaging', total_startups: 11, closed_startups: 4, acquired_startups: 7, failure_rate_pct: 36.36, survival_rate_pct: 63.64, mean_funding_usd: 5368454.55 },
    { category: 'Web', category_key: 'web', total_startups: 144, closed_startups: 51, acquired_startups: 93, failure_rate_pct: 35.42, survival_rate_pct: 64.58, mean_funding_usd: 12007190.53 },
    { category: 'Software', category_key: 'software', total_startups: 273, closed_startups: 87, acquired_startups: 186, failure_rate_pct: 31.87, survival_rate_pct: 68.13, mean_funding_usd: 17290145.22 },
    { category: 'Mobile', category_key: 'mobile', total_startups: 79, closed_startups: 24, acquired_startups: 55, failure_rate_pct: 30.38, survival_rate_pct: 69.62, mean_funding_usd: 13745281.01 },
    { category: 'Enterprise', category_key: 'enterprise', total_startups: 73, closed_startups: 20, acquired_startups: 53, failure_rate_pct: 27.40, survival_rate_pct: 72.60, mean_funding_usd: 21453290.11 },
    { category: 'Advertising', category_key: 'advertising', total_startups: 62, closed_startups: 16, acquired_startups: 46, failure_rate_pct: 25.81, survival_rate_pct: 74.19, mean_funding_usd: 12948387.10 },
    { category: 'Biotech', category_key: 'biotech', total_startups: 34, closed_startups: 8, acquired_startups: 26, failure_rate_pct: 23.53, survival_rate_pct: 76.47, mean_funding_usd: 28410294.12 },
  ],
  by_funding_stage: [
    { stage: 'Angel Backed', column: 'has_angel', description: 'Early stage angel backing', total_startups: 235, closed_startups: 97, acquired_startups: 138, failure_rate_pct: 41.28, survival_rate_pct: 58.72 },
    { stage: 'VC Backed', column: 'has_VC', description: 'Institutional venture capital backing', total_startups: 300, closed_startups: 118, acquired_startups: 182, failure_rate_pct: 39.33, survival_rate_pct: 60.67 },
    { stage: 'Series A Closed', column: 'has_roundA', description: 'Completed Series A round', total_startups: 468, closed_startups: 125, acquired_startups: 343, failure_rate_pct: 26.71, survival_rate_pct: 73.29 },
    { stage: 'Series B Closed', column: 'has_roundB', description: 'Completed Series B round', total_startups: 361, closed_startups: 83, acquired_startups: 278, failure_rate_pct: 22.99, survival_rate_pct: 77.01 },
    { stage: 'Series C Closed', column: 'has_roundC', description: 'Completed Series C expansion', total_startups: 214, closed_startups: 45, acquired_startups: 169, failure_rate_pct: 21.03, survival_rate_pct: 78.97 },
    { stage: 'Series D+ Closed', column: 'has_roundD', description: 'Late stage Series D or higher', total_startups: 92, closed_startups: 14, acquired_startups: 78, failure_rate_pct: 15.22, survival_rate_pct: 84.78 },
  ],
  relationships_and_milestones_by_outcome: [
    {
      outcome: 'Acquired',
      is_failed: 0,
      count: 596,
      percentage_of_total: 64.64,
      mean_relationships: 9.64,
      median_relationships: 7.0,
      mean_milestones: 2.16,
      median_milestones: 2.0,
      mean_funding_usd: 31041247.13,
      median_funding_usd: 12700000.0,
      mean_funding_rounds: 2.52,
      mean_funding_duration_years: 2.34,
    },
    {
      outcome: 'Closed',
      is_failed: 1,
      count: 326,
      percentage_of_total: 35.36,
      mean_relationships: 4.17,
      median_relationships: 3.0,
      mean_milestones: 1.25,
      median_milestones: 1.0,
      mean_funding_usd: 15115322.46,
      median_funding_usd: 5000000.0,
      mean_funding_rounds: 1.92,
      mean_funding_duration_years: 1.48,
    },
  ],
  correlations: [
    { feature: 'relationships', display_name: 'Relationships Count', correlation: -0.3600, absolute_correlation: 0.3600, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'age_last_milestone_year', display_name: 'Age Last Milestone', correlation: -0.3587, absolute_correlation: 0.3587, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'milestones', display_name: 'Milestones Count', correlation: -0.3283, absolute_correlation: 0.3283, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'has_milestone', display_name: 'Has At Least One Milestone', correlation: -0.3134, absolute_correlation: 0.3134, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'is_top500', display_name: 'Top 500 Entity Status', correlation: -0.3104, absolute_correlation: 0.3104, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'funding_stages_count', display_name: 'Funding Stages Count', correlation: -0.2929, absolute_correlation: 0.2929, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'age_first_milestone_year', display_name: 'Age First Milestone', correlation: -0.2502, absolute_correlation: 0.2502, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'milestone_duration_years', display_name: 'Milestone Duration (Years)', correlation: -0.2456, absolute_correlation: 0.2456, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'funding_duration_years', display_name: 'Funding Duration (Years)', correlation: -0.2104, absolute_correlation: 0.2104, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'has_roundB', display_name: 'Series B Closed', correlation: -0.2075, absolute_correlation: 0.2075, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'funding_rounds', display_name: 'Funding Rounds Count', correlation: -0.2053, absolute_correlation: 0.2053, p_value: 0.0, is_significant: true, direction: 'Protective Association' },
    { feature: 'is_otherstate', display_name: 'Non-Hub Geographic Location', correlation: 0.1687, absolute_correlation: 0.1687, p_value: 0.0, is_significant: true, direction: 'Elevated Failure Association' },
  ],
  methodology: {
    dataset_source: 'Kaggle Crunchbase Startup Outcome Dataset',
    sample_size: 922,
    historical_scope: 'Venture entities with verified binary outcomes (acquired or closed)',
    target_definition: 'is_failed = 1 for closed startups, is_failed = 0 for acquired startups',
    notes: [
      'This section presents historical descriptive analytics from 922 clean startup records.',
      'All correlations reflect observed historical patterns and do NOT prove causality.',
      'Historical failure rates must not be conflated with individual startup prediction probabilities.',
      'Supervised ML failure prediction operates as a separate inference subsystem requiring trained model weights.',
    ],
  },
};

export class FailureIntelligenceService {
  /**
   * Checks the operational availability of the trained machine learning model.
   */
  static async getModelStatus(): Promise<ModelStatusResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/predict-failure/model-status`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as ModelStatusResponse;
      }
    } catch (err) {
      console.warn('[FailureIntelligenceService] Could not reach model status endpoint:', err);
    }

    // Default graceful unavailable state
    return {
      model_available: false,
      status: 'MODEL_NOT_AVAILABLE',
      model_name: null,
      model_version: null,
      model_path: 'backend/models/startup_failure_model.joblib',
      preprocessor_path: 'backend/models/startup_preprocessor.joblib',
      message: 'Trained model artifact is not installed yet. Training is pending on a dedicated workstation.',
      metadata: null,
    };
  }

  /**
   * Executes startup failure prediction against the trained ML model.
   * Gracefully handles HTTP 503 as an expected uninstalled-model state.
   */
  static async predictStartupFailure(
    request: PredictionRequest
  ): Promise<PredictionResponse> {
    try {
      const res = await fetch(`${API_BASE}/predict-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (res.status === 503) {
        const errorDetail = await res.json().catch(() => ({}));
        return {
          model_available: false,
          status: 'MODEL_NOT_AVAILABLE',
          startup_id: request.metadata?.startup_id || null,
          startup_name: request.metadata?.name || null,
          predicted_outcome: null,
          is_failed: null,
          failure_probability: null,
          survival_probability: null,
          risk_level: null,
          risk_interpretation: null,
          explanation_available: false,
          message: errorDetail.detail?.message || 'Model artifact not installed yet.',
        };
      }

      if (res.ok) {
        return (await res.json()) as PredictionResponse;
      }

      const errText = await res.text().catch(() => 'Prediction request failed');
      throw new Error(`Inference API error (${res.status}): ${errText}`);
    } catch (err: any) {
      console.warn('[FailureIntelligenceService] Prediction request failed:', err);
      return {
        model_available: false,
        status: 'MODEL_NOT_AVAILABLE',
        startup_id: request.metadata?.startup_id || null,
        startup_name: request.metadata?.name || null,
        predicted_outcome: null,
        is_failed: null,
        failure_probability: null,
        survival_probability: null,
        risk_level: null,
        risk_interpretation: null,
        explanation_available: false,
        message: err.message || 'Service unavailable',
      };
    }
  }

  /**
   * Loads structured historical failure analytics computed from the Kaggle dataset.
   */
  static async getHistoricalAnalytics(): Promise<HistoricalFailureAnalytics> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/analytics/failure-intelligence`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as HistoricalFailureAnalytics;
      }
    } catch (err) {
      console.warn('[FailureIntelligenceService] Failed to load live analytics endpoint, using dataset constants fallback:', err);
    }

    return FALLBACK_HISTORICAL_ANALYTICS;
  }
}

export default FailureIntelligenceService;
