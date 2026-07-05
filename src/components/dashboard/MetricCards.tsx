import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Startup } from '../../types';
import { Card, CardContent } from '../ui/Card';

interface MetricCardsProps {
  startups: Startup[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ startups }) => {
  // Calculations — preserved 100% exactly
  const totalInvestigations = startups.length;
  
  const avgScore = totalInvestigations > 0 
    ? Math.round(startups.reduce((acc, curr) => acc + curr.investmentScore, 0) / totalInvestigations)
    : 0;
    
  const highRiskCount = startups.filter((s) => s.riskLevel === 'High').length;
  const approvedCount = startups.filter((s) => s.status === 'Approved').length;

  const cardData = [
    {
      title: 'Active Diligence Audits',
      value: totalInvestigations,
      description: 'Active startup audits',
      icon: ClipboardList,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
      progress: 100,
      metricMeta: '100% Active',
    },
    {
      title: 'Portfolio Avg Score',
      value: `${avgScore}/100`,
      description: 'Across all evaluations',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      progress: avgScore,
      metricMeta: 'Target ≥ 75',
    },
    {
      title: 'High-Risk Flagged',
      value: highRiskCount,
      description: 'Priority review needed',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
      progress: totalInvestigations > 0 ? (highRiskCount / totalInvestigations) * 100 : 0,
      alert: highRiskCount > 0,
      metricMeta: `${Math.round(totalInvestigations > 0 ? (highRiskCount / totalInvestigations) * 100 : 0)}% of total`,
    },
    {
      title: 'Committee Approved',
      value: approvedCount,
      description: 'Completed & passed',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      progress: totalInvestigations > 0 ? (approvedCount / totalInvestigations) * 100 : 0,
      metricMeta: `${Math.round(totalInvestigations > 0 ? (approvedCount / totalInvestigations) * 100 : 0)}% pass rate`,
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 15 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cardData.map((card, idx) => (
        <motion.div key={idx} variants={itemVariants}>
          <Card glow={card.alert} className="relative overflow-hidden group hover:border-[var(--text-secondary)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold font-display text-[var(--text-primary)] mt-1.5 tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={`p-2.5 rounded-lg border ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>

              {/* Institutional KPI meta row */}
              <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{card.description}</span>
                <span className="font-mono text-[11px] text-[var(--text-primary)] font-medium">
                  {card.metricMeta}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
export default MetricCards;
