import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldCheck, BrainCircuit, Landmark, AlertCircle } from 'lucide-react';
import type { Startup } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

interface AnalyticsPageProps {
  startups: Startup[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ startups }) => {
  // Map comparative metrics (Founders vs Product/Tech)
  const comparisonData = startups.map((s) => ({
    name: s.name,
    Founders: s.metrics.team,
    ProductTech: s.metrics.product,
    Financials: s.metrics.financials,
  }));

  // Average indexes
  const avgTeam = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.team, 0) / startups.length) : 0;
  const avgProduct = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.product, 0) / startups.length) : 0;
  const avgFinancials = startups.length ? Math.round(startups.reduce((acc, c) => acc + c.metrics.financials, 0) / startups.length) : 0;

  const cardStats = [
    { name: 'Average Founder Index', value: `${avgTeam}/100`, desc: 'Leadership experience & patent power', icon: BrainCircuit },
    { name: 'Average Tech Moat Strength', value: `${avgProduct}/100`, desc: 'Product quality & architecture stability', icon: ShieldCheck },
    { name: 'Average Financial Health', value: `${avgFinancials}/100`, desc: 'Runway efficiency & burn-rate scores', icon: Landmark },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white m-0">
          Diligence & Risk Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Deep-dive portfolio comparisons, scoring distributions, and audit health indices.
        </p>
      </div>

      {/* Average Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardStats.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl">
                <item.icon className="w-6 h-6 text-brand-purple-light" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
                  {item.name}
                </span>
                <span className="text-2xl font-bold text-white block mt-0.5">{item.value}</span>
                <span className="text-xs text-gray-400 block mt-0.5">{item.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recharts Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Founder Index vs Tech Moat Strength</CardTitle>
            <p className="text-xs text-gray-400">Comparing core leadership index against technological maturity rating</p>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {startups.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No data loaded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
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
                  <Bar dataKey="Founders" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ProductTech" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Audit Playbook Standards Card */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Criteria Framework</CardTitle>
            <p className="text-xs text-gray-400">VentureIQ auditing scorecard benchmarks</p>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-gray-300">
            <div className="flex items-start space-x-3 bg-white/2 p-3 rounded-lg border border-white/5">
              <BrainCircuit className="w-5 h-5 text-brand-purple-light flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-white">Founders Index (30% Weight)</h5>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Measures prior startup exits, patent filings, educational pedigree, and leadership references.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/2 p-3 rounded-lg border border-white/5">
              <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-white">Tech Moat Strength (30% Weight)</h5>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Evaluates algorithm patents, cybersecurity frameworks, compute efficiency, and container stability.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/2 p-3 rounded-lg border border-white/5">
              <Landmark className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-white">Financial Auditing (40% Weight)</h5>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Computes ARR quality, burn efficiency factor, capital runway margins, and valuation credibility.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                <strong>Attention:</strong> Tiers are flagged as "High Risk" automatically if the runway index falls below 6 months, regardless of overall scores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
export default AnalyticsPage;
