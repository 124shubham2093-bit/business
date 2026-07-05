import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { Startup } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface ScoreChartProps {
  startups: Startup[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ startups }) => {
  // Data for Area Chart: Startup Scores — preserved 100% exactly
  const scoreData = startups.map((s) => ({
    name: s.name,
    score: s.investmentScore,
    sector: s.sector,
  }));

  // Data for Radar Chart: Average metrics across all startups — preserved 100% exactly
  const averageMetrics = startups.reduce(
    (acc, curr) => {
      acc.Financials += curr.metrics.financials;
      acc.MarketSize += curr.metrics.marketSize;
      acc.Team += curr.metrics.team;
      acc.Product += curr.metrics.product;
      return acc;
    },
    { Financials: 0, MarketSize: 0, Team: 0, Product: 0 }
  );

  const count = startups.length || 1;
  const radarData = [
    { subject: 'Financials', value: Math.round(averageMetrics.Financials / count), fullMark: 100 },
    { subject: 'Market TAM', value: Math.round(averageMetrics.MarketSize / count), fullMark: 100 },
    { subject: 'Founders', value: Math.round(averageMetrics.Team / count), fullMark: 100 },
    { subject: 'Product/Tech', value: Math.round(averageMetrics.Product / count), fullMark: 100 },
  ];

  // Custom tooltips for institutional Carta/PitchBook style
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-xl text-xs backdrop-blur-md">
          <p className="font-bold text-[var(--text-primary)] mb-1 font-display">{data.name}</p>
          <p className="text-[var(--text-secondary)]">
            Sector: <span className="text-[var(--text-primary)] font-medium">{data.sector}</span>
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold mt-1">
            Diligence Score: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Diligence Scores Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Diligence Benchmarking</CardTitle>
          <p className="text-xs text-[var(--text-secondary)]">
            Comparative due diligence ratings across active startup evaluations
          </p>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          {startups.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] font-mono text-xs">
              No startup data available for benchmarking
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Averaged Diligence Vector Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Axis Evaluation Profile</CardTitle>
          <p className="text-xs text-[var(--text-secondary)]">
            Averaged institutional breakdown across core audit criteria
          </p>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center pt-2">
          {startups.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] font-mono text-xs">
              No evaluation profile available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(113, 113, 122, 0.35)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#a1a1aa"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="monospace"
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="rgba(113, 113, 122, 0.25)"
                  tick={false}
                />
                <Radar
                  name="Avg Performance"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.2}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-xl text-xs backdrop-blur-md">
                          <p className="text-[var(--text-primary)] font-medium">{payload[0].name}</p>
                          <p className="text-indigo-600 dark:text-indigo-400 font-mono font-bold mt-0.5">
                            Score: {payload[0].value}/100
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ScoreChart;
