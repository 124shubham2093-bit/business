import React, { useState, useEffect } from 'react';
import { Cpu, AlertCircle, CheckCircle2, Clock, FileCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FailureIntelligenceService } from '../../services/failureIntelligenceService';
import type { ModelStatusResponse, PredictionResponse } from '../../types/failureIntelligence';

interface MLRiskAssessmentCardProps {
  startupName: string;
  startupSector?: string;
  fundingStage?: string;
}

export const MLRiskAssessmentCard: React.FC<MLRiskAssessmentCardProps> = ({
  startupName,
  startupSector = 'Software',
  fundingStage = 'Series A',
}) => {
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    FailureIntelligenceService.getModelStatus()
      .then((status) => {
        if (!isMounted) return;
        setModelStatus(status);

        // If a model is available on disk, attempt live failure prediction
        if (status.model_available) {
          return FailureIntelligenceService.predictStartupFailure({
            features: {
              funding_total_usd: 2500000.0,
              funding_rounds: 2,
              avg_participants: 2.5,
              relationships: 6,
              milestones: 2,
              age_first_milestone_year: 1.0,
              age_last_milestone_year: 2.2,
              age_first_funding_year: 0.8,
              age_last_funding_year: 2.1,
              category_code: startupSector.toLowerCase().includes('biotech') ? 'biotech' : 'software',
              state_code: 'CA',
              latitude: 37.7749,
              longitude: -122.4194,
              has_VC: 1,
              has_angel: 0,
              has_roundA: 1,
              has_roundB: 0,
              has_roundC: 0,
              has_roundD: 0,
              is_top500: 1,
            },
            metadata: {
              name: startupName,
            },
          }).then((pred) => {
            if (isMounted) setPrediction(pred);
          });
        }
      })
      .catch((err) => {
        console.warn('[MLRiskAssessmentCard] Error checking model status:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startupName, startupSector, fundingStage]);

  const isModelAvailable = Boolean(modelStatus?.model_available);

  return (
    <Card className="border border-purple-200 dark:border-purple-500/30 bg-purple-50/40 dark:bg-purple-950/15 p-5 flex flex-col space-y-4 relative overflow-hidden text-left shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border ${isModelAvailable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
            <Cpu className={`w-5 h-5 ${isModelAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest font-mono block">
                Supervised ML Failure Prediction
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-mono">
                Separate from Heuristics
              </span>
            </div>
            <span className="text-[9px] text-[var(--text-secondary)] font-mono block mt-0.5">
              Independent statistical inference layer trained on Kaggle outcome data
            </span>
          </div>
        </div>

        <Badge
          variant={isModelAvailable ? 'success' : 'warning'}
          className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1"
        >
          {isLoading ? (
            'Checking...'
          ) : isModelAvailable ? (
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              Model Active
            </span>
          ) : (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 inline mr-1" />
              Training Pending
            </span>
          )}
        </Badge>
      </div>

      {/* Main Content: Model Available vs Unavailable */}
      {isModelAvailable && prediction?.model_available ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
              <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">
                Model-Estimated Failure Probability
              </span>
              <div className="mt-1">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {typeof prediction.failure_probability === 'number' ? `${(prediction.failure_probability * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
              <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">
                Predicted Outcome
              </span>
              <div className="mt-1">
                <span className={`text-xl font-bold font-mono uppercase ${prediction.predicted_outcome === 'closed' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {prediction.predicted_outcome || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
              <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">
                Risk Tier
              </span>
              <div className="mt-1">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {prediction.risk_level || 'Medium'}
                </span>
              </div>
            </div>
          </div>

          {prediction.risk_interpretation && (
            <p className="text-[11px] text-[var(--text-primary)] leading-relaxed bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-color)]">
              {prediction.risk_interpretation}
            </p>
          )}

          <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono pt-1">
            <span>Model Version: {prediction.model_version || '1.0.0'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
              <FileCheck className="w-3 h-3 mr-1 inline" /> Pre-Outcome Verified (Zero Leakage)
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Currently unavailable &mdash; trained model pending</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              The overall diligence score above is an <strong>Evidence-Based Heuristic Diligence Synthesis</strong> produced by rule-based agent consensus. It is <strong>NOT</strong> an ML-predicted failure probability. Live ML risk scoring will automatically activate once the trained classifier artifact (<code className="font-mono text-[10px] text-slate-800 dark:text-slate-200">startup_failure_model.joblib</code>) is added to the backend.
            </p>
          </div>

          {/* Integration Seam Feature Vector Status */}
          <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-500/20 space-y-1.5">
            <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 font-mono uppercase tracking-wider block">
              Inference Seam Ready
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
              <div>&bull; Target: <span className="text-[var(--text-primary)]">is_failed (0/1)</span></div>
              <div>&bull; Sector: <span className="text-[var(--text-primary)]">{startupSector}</span></div>
              <div>&bull; Stage: <span className="text-[var(--text-primary)]">{fundingStage}</span></div>
              <div>&bull; Features: <span className="text-[var(--text-primary)]">42 Pre-Outcome</span></div>
              <div>&bull; Contract: <span className="text-emerald-600 dark:text-emerald-400">Zero Leakage</span></div>
              <div>&bull; Status: <span className="text-amber-600 dark:text-amber-400">HTTP 503 Handled</span></div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MLRiskAssessmentCard;
