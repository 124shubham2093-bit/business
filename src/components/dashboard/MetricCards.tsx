import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Startup } from '../../types';
import { Card, CardContent } from '../ui/Card';

interface MetricCardsProps {
  startups: Startup[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ startups }) => {
  // Calculations
  const totalInvestigations = startups.length;
  
  const avgScore = totalInvestigations > 0 
    ? Math.round(startups.reduce((acc, curr) => acc + curr.investmentScore, 0) / totalInvestigations)
    : 0;
    
  const highRiskCount = startups.filter((s) => s.riskLevel === 'High').length;
  const approvedCount = startups.filter((s) => s.status === 'Approved').length;

  const cardData = [
    {
      title: 'Total Investigations',
      value: totalInvestigations,
      description: 'Active startup audits',
      icon: ClipboardList,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      progress: 100,
    },
    {
      title: 'Avg Diligence Score',
      value: `${avgScore}/100`,
      description: 'Across all active evaluations',
      icon: Award,
      color: 'text-brand-purple-light',
      bgColor: 'bg-brand-purple/10 border-brand-purple/20',
      progress: avgScore,
    },
    {
      title: 'High Risk Startups',
      value: highRiskCount,
      description: 'Requiring priority review',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      progress: totalInvestigations > 0 ? (highRiskCount / totalInvestigations) * 100 : 0,
      alert: highRiskCount > 0,
    },
    {
      title: 'Approved Startups',
      value: approvedCount,
      description: 'Diligence completed & passed',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      progress: totalInvestigations > 0 ? (approvedCount / totalInvestigations) * 100 : 0,
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
          <Card glow={card.alert} className="relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold font-display text-white mt-1">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={`p-2.5 rounded-lg border ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{card.description}</span>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    card.alert ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-brand-purple-dark to-brand-purple-light'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
export default MetricCards;
