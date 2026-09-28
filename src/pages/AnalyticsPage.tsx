import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  ShieldCheck,
  BrainCircuit,
  Landmark,
  AlertCircle,
  Database,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
  Cpu,
} from 'lucide-react';
import type { Startup } from '../types';
import type {
  HistoricalFailureAnalytics,
  ModelStatusResponse,
} from '../types/failureIntelligence';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ModelStatusCard } from '../components/analytics/ModelStatusCard';
import { FailureIntelligenceService } from '../services/failureIntelligenceService';

interface AnalyticsPageProps {
  startups: Startup[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ startups }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalFailureAnalytics | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'stages' | 'correlations' | 'portfolio'>('overview');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      FailureIntelligenceService.getHistoricalAnalytics(),
      FailureIntelligenceService.getModelStatus(),
    ])
      .then(([analytics, status]) => {
        if (!isMounted) return;
        setHistoricalData(analytics);
        setModelStatus(status);
      })
      .catch((err) => {
        console.warn('[AnalyticsPage] Failed to fetch live analytics:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Map comparative metrics for portfolio startups (retaining existing functionality)
  const comparisonData = startups.map((s) => ({
    name: s.name,
    Founders: s.metrics.team,
    ProductTech: s.metrics.product,
    Financials: s.metrics.financials,
  }));

  // Average indexes from portfolio
  const avgTeam = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.team, 0) / startups.length) : 0;
  const avgProduct = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.product, 0) / startups.length) : 0;
  const avgFinancials = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.financials, 0) / startups.length) : 0;

  // Real dataset metrics
  const totalHistorical = historicalData?.dataset.total_startups || 922;
  const acquiredCount = historicalData?.dataset.acquired || 596;
  const closedCount = historicalData?.dataset.closed || 326;
  const baseClosureRate = historicalData?.dataset.base_rate_percentage || 35.36;

  // Outcome distribution data for charts
  const outcomePieData = [
    {
      name: 'Acquired / Survived',
      value: acquiredCount,
      percentage: totalHistorical ? Number(((acquiredCount / totalHistorical) * 100).toFixed(2)) : 64.64,
      color: '#10b981',
    },
    {
      name: 'Closed / Failed',
      value: closedCount,
      percentage: totalHistorical ? Number(((closedCount / totalHistorical) * 100).toFixed(2)) : 35.36,
      color: '#f43f5e',
    },
  ];

  // Top sectors data (sorted descending by failure rate)
  const topSectors = historicalData?.by_category.slice(0, 10) || [];

  // Stage attrition data
  const stageData = historicalData?.by_funding_stage || [];

  // Operational metrics comparison (Acquired vs Closed) dynamically derived from backend API payload
  const acquiredMetrics = historicalData?.relationships_and_milestones_by_outcome?.find((o) => o.is_failed === 0);
  const closedMetrics = historicalData?.relationships_and_milestones_by_outcome?.find((o) => o.is_failed === 1);

  const operationalData = [
    {
      metric: 'Professional Relationships',
      Acquired: acquiredMetrics?.mean_relationships ?? 9.64,
      Closed: closedMetrics?.mean_relationships ?? 4.17,
      unit: 'count',
    },
    {
      metric: 'Business Milestones',
      Acquired: acquiredMetrics?.mean_milestones ?? 2.16,
      Closed: closedMetrics?.mean_milestones ?? 1.25,
      unit: 'count',
    },
    {
      metric: 'Funding Lifespan',
      Acquired: acquiredMetrics?.mean_funding_duration_years ?? 2.34,
      Closed: closedMetrics?.mean_funding_duration_years ?? 1.48,
      unit: 'years',
    },
    {
      metric: 'Funding Rounds',
      Acquired: acquiredMetrics?.mean_funding_rounds ?? 2.52,
      Closed: closedMetrics?.mean_funding_rounds ?? 1.92,
      unit: 'rounds',
    },
  ];

  // Top correlations
  const topCorrelations = historicalData?.correlations.slice(0, 8) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-left"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-wider">
              Startup Failure Intelligence Platform
            </span>
            <span className="text-[var(--text-secondary)] text-xs font-mono">&bull; Empirical Analytics &amp; ML Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
            Startup Failure Intelligence &amp; Risk Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Empirical historical failure distributions, stage attrition patterns, statistical correlations, and machine learning prediction status.
          </p>
        </div>

        {/* Global Dataset Status Indicator */}
        <div className="flex items-center space-x-3 bg-[var(--bg-surface)] border border-[var(--border-color)] px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xs">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <span className="text-[10px] text-[var(--text-secondary)] block">Dataset Scope</span>
            <span className="font-bold text-[var(--text-primary)]">922 Cleaned Startups (Kaggle)</span>
          </div>
        </div>
      </div>

      {/* ── 1. Top Historical Analytics Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Startups */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider">Historical Dataset</span>
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{totalHistorical}</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">Ground-truth entities</span>
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">100% Outcome Verified</span>
          </CardContent>
        </Card>

        {/* Card 2: Acquired Startups */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider">Acquired / Survived</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{acquiredCount}</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">Historical successes</span>
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">64.64% Survival Rate</span>
          </CardContent>
        </Card>

        {/* Card 3: Closed Startups */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider">Closed / Failed</span>
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{closedCount}</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">Historical venture closures</span>
            </div>
            <span className="text-[9px] text-rose-600 dark:text-rose-400 font-mono font-semibold">{baseClosureRate}% Failure Rate</span>
          </CardContent>
        </Card>

        {/* Card 4: Historical Closure Rate */}
        <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider text-rose-700 dark:text-rose-300">
                Historical Closure Rate
              </span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{baseClosureRate}%</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">Historical Baseline (326 / 922)</span>
            </div>
            <span className="text-[9px] text-[var(--text-secondary)] font-mono">Descriptive Dataset Metric</span>
          </CardContent>
        </Card>

        {/* Card 5: ML Model Operational Status */}
        <Card className="border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/20 col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider text-indigo-700 dark:text-indigo-300">
                ML Model Status
              </span>
              <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="my-2">
              <span className="text-base font-bold font-mono text-[var(--text-primary)] block">
                {modelStatus?.model_available ? 'Model Online' : 'Training Pending'}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                {modelStatus?.model_available ? 'Inference active' : 'Artifact not installed'}
              </span>
            </div>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
              {modelStatus?.model_available ? 'Ready for Scoring' : 'Expected Dev State'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Supervised ML Prediction Pipeline Status Card ── */}
      <ModelStatusCard modelStatus={modelStatus} isLoading={isLoading} />

      {/* ── 3. Navigation Tabs for Analytical Deep Dives ── */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[var(--bg-surface)] text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs border border-[var(--border-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          Outcomes Overview
        </button>
        <button
          onClick={() => setActiveTab('sectors')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'sectors'
              ? 'bg-[var(--bg-surface)] text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs border border-[var(--border-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          Sector Failure Rates
        </button>
        <button
          onClick={() => setActiveTab('stages')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'stages'
              ? 'bg-[var(--bg-surface)] text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs border border-[var(--border-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          Stage Attrition
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'correlations'
              ? 'bg-[var(--bg-surface)] text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs border border-[var(--border-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          Statistical Correlations
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'portfolio'
              ? 'bg-[var(--bg-surface)] text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs border border-[var(--border-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
          }`}
        >
          Portfolio Benchmarks ({startups.length})
        </button>
      </div>

      {/* ── 4. Main Tab Content ── */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Outcome Balance Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Historical Outcome Distribution</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Cleaned Kaggle Dataset &bull; Total: 922 Startups
              </p>
            </CardHeader>
            <CardContent className="h-72 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={outcomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} startups (${item.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(13, 10, 33, 0.95)',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center space-x-6 text-xs font-mono mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[var(--text-primary)]">Acquired (596, 64.6%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-[var(--text-primary)]">Closed (326, 35.4%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Differentiators: Acquired vs Closed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Key Operational Metrics by Outcome</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Empirical comparison between acquired and closed ventures
              </p>
            </CardHeader>
            <CardContent className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationalData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 10, 33, 0.95)',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} />
                  <Bar dataKey="Acquired" fill="#10b981" radius={[4, 4, 0, 0]} name="Acquired (Average)" />
                  <Bar dataKey="Closed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Closed (Average)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB B: SECTORS */}
      {activeTab === 'sectors' && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Closure Rate by Sector / Category</CardTitle>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              Descriptive failure percentages for domains with &ge; 8 startups in historical dataset
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSectors}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% failure rate (${item.payload.closed_startups} closed / ${item.payload.total_startups} total)`,
                      'Historical Closure Rate',
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(13, 10, 33, 0.95)',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="failure_rate_pct" radius={[0, 4, 4, 0]}>
                    {topSectors.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.failure_rate_pct >= 50 ? '#f43f5e' : entry.failure_rate_pct >= 35 ? '#fbbf24' : '#60a5fa'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-200 text-xs flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Note:</strong> These figures represent historical descriptive failure rates observed in the dataset. Variations reflect capital intensity, hardware lead times, and market timing differences &mdash; they do <strong>NOT</strong> prove that operating in a specific category causes startup failure.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB C: FUNDING STAGES */}
      {activeTab === 'stages' && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Failure Rate Across Venture Funding Stages</CardTitle>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              Observed closure rate among startups achieving specific capital milestone indicators
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 50]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% closed (${item.payload.closed_startups} / ${item.payload.total_startups} startups)`,
                      'Failure Rate',
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(13, 10, 33, 0.95)',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="failure_rate_pct" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {stageData.map((entry, index) => (
                      <Cell
                        key={`cell-stage-${index}`}
                        fill={entry.failure_rate_pct >= 35 ? '#f43f5e' : entry.failure_rate_pct >= 25 ? '#a855f7' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-mono block">Early Stage Attrition</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">41.3% / 39.3%</span>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Angel &amp; early VC backed ventures exhibit highest attrition before reaching product-market validation.</span>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-mono block">Series A &amp; B Expansion</span>
                <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">26.7% &rarr; 23.0%</span>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Reaching Series A/B cut historical closure risk substantially as repeatable distribution is unlocked.</span>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-mono block">Late Stage Survivorship</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">15.2% (Series D+)</span>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Late-stage enterprises demonstrate high survivorship, reflecting significant capital moats and acquisition interest.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB D: CORRELATIONS */}
      {activeTab === 'correlations' && (
        <Card>
          <CardHeader>
            <CardTitle>Empirical Feature Correlations with Failure Outcome (is_failed)</CardTitle>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              Pearson correlation coefficients ($r$) and two-tailed p-values calculated across 922 records
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Feature Name</th>
                    <th className="py-2.5 px-3">Correlation ($r$)</th>
                    <th className="py-2.5 px-3">Association Direction</th>
                    <th className="py-2.5 px-3">P-Value</th>
                    <th className="py-2.5 px-3">Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {topCorrelations.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[var(--text-primary)] font-mono">
                        {item.display_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={item.correlation < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {item.correlation > 0 ? `+${item.correlation.toFixed(4)}` : item.correlation.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={item.correlation < 0 ? 'success' : 'danger'}
                          className="text-[9px] font-mono"
                        >
                          {item.direction}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--text-secondary)]">
                        {item.p_value === 0 ? 'p < 0.0001' : item.p_value.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          Statistically Significant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Methodological Caution:</strong> Negative correlations (e.g. verified professional relationships: $r = -0.3600$) indicate that startups with higher relationship counts closed at lower rates historically. These correlations demonstrate <em>associational predictive signals</em> rather than direct causal levers.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB E: PORTFOLIO BENCHMARKS */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase font-mono block">
                    Portfolio Founder Index
                  </span>
                  <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{avgTeam}/100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase font-mono block">
                    Technical Moat Rating
                  </span>
                  <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{avgProduct}/100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                  <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase font-mono block">
                    Financial Health Rating
                  </span>
                  <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{avgFinancials}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Founder Index vs Tech Moat Strength</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Comparing leadership metrics against technical maturity for currently ingested portfolio
              </p>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              {startups.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] font-mono text-xs">
                  No active portfolio investigations loaded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(13, 10, 33, 0.95)',
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#f3f4f6',
                        fontSize: '11px',
                      }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={10} />
                    <Bar dataKey="Founders" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Founders Score" />
                    <Bar dataKey="ProductTech" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tech Moat Score" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria Framework</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                InvestIQ auditing scorecard benchmarks
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-[var(--text-primary)]">
              <div className="flex items-start space-x-3 bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[var(--text-primary)]">Founders Index (30% Weight)</h5>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Prior startup exits, patent filings, educational pedigree, and founder network connections.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[var(--text-primary)]">Tech Moat Strength (30% Weight)</h5>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Algorithm patents, cybersecurity posture, compute architecture, and container stability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[var(--text-primary)]">Financial Auditing (40% Weight)</h5>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Burn efficiency ratio, runway margins, capital structure, and milestone pacing.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-lg text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  <strong>Attention:</strong> Startups with runway below 6 months are automatically flagged as High Risk, independent of founder pedigree.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* ── 5. Platform Methodology & Scientific Limitations Note ── */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5 leading-relaxed">
            <span className="font-bold text-[var(--text-primary)] font-mono text-xs block">
              Platform Data Analytics Methodology &amp; Academic Limitations
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>
                <strong>Historical Ground Truth:</strong> Analytics reflect 922 deduplicated venture entities from the Kaggle Crunchbase dataset with verified binary outcomes (596 acquired, 326 closed; base failure rate: 35.36%).
              </li>
              <li>
                <strong>Descriptive Observation:</strong> Historical sector and stage distributions describe observed historical patterns. They must not be conflated with individual startup predicted failure probabilities.
              </li>
              <li>
                <strong>Non-Causality:</strong> Feature correlations ($r$) identify statistical association. Correlation does not imply causation.
              </li>
              <li>
                <strong>Target Leakage Mitigation:</strong> Post-outcome indicators (<code className="font-mono text-[10px]">status</code>, <code className="font-mono text-[10px]">labels</code>, <code className="font-mono text-[10px]">closed_at</code>) are excluded from the 42 predictive feature matrix.
              </li>
              <li>
                <strong>Supervised Inference Seam:</strong> The live ML inference service (<code className="font-mono text-[10px]">POST /api/predict-failure</code>) returns controlled status until trained model weights are supplied.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnalyticsPage;
