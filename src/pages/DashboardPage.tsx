import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ScoreChart } from '../components/dashboard/ScoreChart';
import { StartupList } from '../components/dashboard/StartupList';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CrossMemoryInsights } from '../components/dashboard/CrossMemoryInsights';
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Cognee Graph Active
            </span>
            <span className="text-[var(--text-secondary)] text-xs font-mono">• Live Portfolio Engine</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
            Startup Failure Intelligence &amp; Diligence Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Empirical startup failure analytics, portfolio risk monitoring, AI evidence synthesis, and predictive infrastructure.
          </p>
        </div>

        {/* Failure Intelligence Status Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/analytics"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/15 transition-colors text-xs font-mono group"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Historical Closure Rate: <strong>35.4%</strong> (922 Startups)</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform font-bold">&rarr;</span>
          </Link>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>ML Model: <strong>Training Pending</strong></span>
          </div>
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
