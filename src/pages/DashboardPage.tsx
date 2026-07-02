import React from 'react';
import { motion } from 'framer-motion';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ScoreChart } from '../components/dashboard/ScoreChart';
import { StartupList } from '../components/dashboard/StartupList';
import { RecentActivity } from '../components/dashboard/RecentActivity';
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
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white m-0">
          Diligence Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Review automated risk assessments, investment criteria, and portfolio auditing.
        </p>
      </div>

      {/* Metric Summaries */}
      <MetricCards startups={startups} />

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
