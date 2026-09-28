import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ScoreChart } from '../components/dashboard/ScoreChart';
import { StartupList } from '../components/dashboard/StartupList';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CrossMemoryInsights } from '../components/dashboard/CrossMemoryInsights';
import { FailureIntelligenceService } from '../services/failureIntelligenceService';
import type { ModelStatusResponse } from '../types/failureIntelligence';
import type { Startup, Activity } from '../types';

interface DashboardPageProps {
  startups: Startup[];
  activities: Activity[];
  searchQuery: string;
  onSelectStartup: (startup: Startup) => void;
  newlyCreatedId?: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  startups,
  activities,
  searchQuery,
  onSelectStartup,
  newlyCreatedId,
}) => {
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    FailureIntelligenceService.getModelStatus()
      .then((status) => {
        if (isMounted) setModelStatus(status);
      })
      .catch((err) => {
        console.warn('[DashboardPage] Could not fetch ML model status:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
            Portfolio Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Startup investigations, portfolio analytics, and failure intelligence.
          </p>
        </div>

        {/* Failure Intelligence Status Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/analytics"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors text-xs font-mono group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Baseline Closure Rate: <strong>35.4%</strong> (922 Startups)</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform font-bold">&rarr;</span>
          </Link>
          {modelStatus?.model_available ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs font-mono text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Failure Model: <strong>Active</strong> {modelStatus.model_name ? `(${modelStatus.model_name}${modelStatus.model_version ? ` · v${modelStatus.model_version}` : ''})` : ''}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Failure Model: <strong>Training Pending</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Summaries */}
      <MetricCards startups={startups} />

      {/* Cognee Cross-Investigation Memory Signals */}
      <CrossMemoryInsights />

      {/* Analytics Visualization charts */}
      <ScoreChart startups={startups} />

      {/* Main Database Table & Timeline Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table List of audits */}
        <div className="xl:col-span-2">
          <StartupList
            startups={startups}
            searchQuery={searchQuery}
            onSelectStartup={onSelectStartup}
            newlyCreatedId={newlyCreatedId}
          />
        </div>

        {/* Timeline Log Feed */}
        <div className="xl:col-span-1 h-full">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </motion.div>
  );
};
export default DashboardPage;
