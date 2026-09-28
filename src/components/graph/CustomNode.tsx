import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  User, Cpu, Landmark, Target, Scale, ShieldAlert,
  Coins, FileText, Newspaper, Sparkles, CheckCircle2
} from 'lucide-react';
import type { NodeType } from '../../services/investigation/investigationTypes';

interface CustomNodeProps {
  data: {
    title: string;
    type: NodeType | 'Company' | 'Decision';
    riskLevel: 'Low' | 'Medium' | 'High';
    badge?: string;
  };
  selected?: boolean;
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const { title, type, badge } = data;

  // Category styling details
  const getCategoryStyles = () => {
    switch (type) {
      case 'Company':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
          border: 'border-indigo-200 dark:border-indigo-800/40 hover:border-indigo-400',
        };
      case 'Founder':
        return {
          icon: <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
          border: 'border-blue-200 dark:border-blue-800/40 hover:border-blue-400',
        };
      case 'Technology':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
          iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
          border: 'border-purple-200 dark:border-purple-800/40 hover:border-purple-400',
        };
      case 'Finance':
        return {
          icon: <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
          border: 'border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400',
        };
      case 'Market':
        return {
          icon: <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
          border: 'border-amber-200 dark:border-amber-800/40 hover:border-amber-400',
        };
      case 'Legal':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />,
          iconBg: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/50',
          border: 'border-yellow-200 dark:border-yellow-800/40 hover:border-yellow-400',
        };
      case 'Risk':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
          border: 'border-rose-200 dark:border-rose-800/40 hover:border-rose-400',
        };
      case 'Investor':
        return {
          icon: <Coins className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
          iconBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/50',
          border: 'border-teal-200 dark:border-teal-800/40 hover:border-teal-400',
        };
      case 'Document':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />,
          iconBg: 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700',
          border: 'border-slate-200 dark:border-zinc-700 hover:border-slate-400',
        };
      case 'News':
        return {
          icon: <Newspaper className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />,
          iconBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50',
          border: 'border-orange-200 dark:border-orange-800/40 hover:border-orange-400',
        };
      case 'Decision':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
          border: 'border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-500/20',
        };
      default:
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-slate-500" />,
          iconBg: 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
          border: 'border-slate-200 dark:border-zinc-700',
        };
    }
  };

  const { icon, iconBg, border } = getCategoryStyles();
  const selectedClasses = selected
    ? 'ring-2 ring-indigo-500 border-indigo-600 shadow-md scale-[1.03]'
    : `${border} shadow-xs`;

  return (
    <div className={`relative px-3.5 py-2 rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all duration-200 flex items-center space-x-2.5 select-none ${selectedClasses}`}>
      
      {/* Handles */}
      <Handle type="target" position={Position.Left} style={{ background: '#6366f1', border: '2px solid var(--bg-surface)', width: 8, height: 8, left: -4 }} />
      <Handle type="target" position={Position.Top} style={{ background: '#6366f1', border: '2px solid var(--bg-surface)', width: 8, height: 8, top: -4 }} />
      
      {/* Icon node wrapper */}
      <div className={`flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg border ${iconBg}`}>
        {icon}
      </div>

      <div>
        <h4 className="text-[11px] font-semibold tracking-tight text-[var(--text-primary)] m-0 leading-tight">
          {title}
        </h4>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <span className="text-[8px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider font-mono">
            {type === 'Company' ? 'Startup' : type}
          </span>
          {badge && (
            <>
              <span className="text-[var(--text-secondary)] text-[8px] opacity-40">•</span>
              <span className="text-[var(--text-secondary)] text-[8px] italic">{badge}</span>
            </>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#6366f1', border: '2px solid var(--bg-surface)', width: 8, height: 8, right: -4 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1', border: '2px solid var(--bg-surface)', width: 8, height: 8, bottom: -4 }} />
    </div>
  );
};

export default memo(CustomNode);
