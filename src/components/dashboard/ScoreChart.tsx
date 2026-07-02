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
  // Data for Area Chart: Startup Scores
  const scoreData = startups.map((s) => ({
    name: s.name,
    score: s.investmentScore,
    sector: s.sector,
  }));

  // Data for Radar Chart: Average metrics across all startups
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

  // Custom tooltips for premium glassmorphic style
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 glass-panel border border-brand-purple/30 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-gray-400">
            Sector: <span className="text-gray-200">{data.sector}</span>
          </p>
          <p className="text-brand-purple-light font-semibold mt-1">
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
          <CardTitle>Portfolio Diligence Ratings</CardTitle>
          <p className="text-xs text-gray-400">
            Diligence score comparison across registered startup evaluations
          </p>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          {startups.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No startup data available for charting
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#a78bfa"
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
          <CardTitle>Average Diligence Profile</CardTitle>
          <p className="text-xs text-gray-400">
            Averaged breakdown across critical evaluation variables
          </p>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center pt-2">
          {startups.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No metrics profile available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#9ca3af"
                  fontSize={11}
                  fontWeight={500}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.1)"
                  tick={false}
                />
                <Radar
                  name="Avg Performance"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 glass-panel border border-brand-purple/30 rounded-lg shadow-xl text-xs">
                          <p className="text-gray-200">{payload[0].name}</p>
                          <p className="text-brand-purple-light font-bold">
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
