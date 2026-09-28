import React from 'react';
import { Cpu, CheckCircle2, Clock, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ModelStatusResponse } from '../../types/failureIntelligence';

interface ModelStatusCardProps {
  modelStatus: ModelStatusResponse | null;
  isLoading?: boolean;
}

export const ModelStatusCard: React.FC<ModelStatusCardProps> = ({ modelStatus, isLoading }) => {
  const isAvailable = Boolean(modelStatus?.model_available);

  return (
    <Card className="border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs relative overflow-hidden">
      <CardHeader className="pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${isAvailable ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <Cpu className={`w-5 h-5 ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-display">Supervised ML Prediction Pipeline</CardTitle>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                Predictive failure classification subsystem
              </p>
            </div>
          </div>

          <Badge
            variant={isAvailable ? 'success' : 'warning'}
            className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
          >
            {isLoading ? (
              'Checking...'
            ) : isAvailable ? (
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Model Available
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Training Pending
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Status Statement */}
        <div className="text-xs text-[var(--text-primary)] leading-relaxed">
          {isAvailable ? (
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">
              Trained machine learning artifact is installed ({modelStatus?.model_name || 'StartupFailureClassifier'} v{modelStatus?.model_version || '1.0.0'}). The model is active and ready to score live startup profiles.
            </p>
          ) : (
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Model artifact not installed yet &mdash; expected development state.
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                The analytics foundation and API contracts are fully operational. Supervised model training will be executed on a dedicated higher-capacity workstation and exported to <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">backend/models/</code>.
              </p>
            </div>
          )}
        </div>

        {/* Pipeline Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono block">Inference Contract</span>
            <span className="text-xs font-bold text-[var(--text-primary)] font-mono mt-0.5 block">POST /api/predict-failure</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono block">Input Feature Matrix</span>
            <span className="text-xs font-bold text-[var(--text-primary)] font-mono mt-0.5 block">42 Predictive Features</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono block">Leakage Guardrail</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">Strict Pre-Outcome</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono block">Target Variable</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">is_failed (0/1)</span>
          </div>
        </div>

        {/* Technical Guidance Note */}
        <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-500/20 flex items-start space-x-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Platform Guarantee:</strong> In accordance with scientific integrity standards, this system does NOT manufacture dummy accuracy rates or fake probabilities. When model weights are placed into <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px]">backend/models/startup_failure_model.joblib</code>, real-time inferences will automatically activate.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelStatusCard;
