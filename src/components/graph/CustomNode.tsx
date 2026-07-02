import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  User, Cpu, Landmark, Target, Scale, ShieldAlert,
  Coins, FileText, Newspaper, Sparkles
} from 'lucide-react';
import type { NodeType } from '../../services/investigation/investigationTypes';

interface CustomNodeProps {
  data: {
    title: string;
    type: NodeType | 'Company';
    riskLevel: 'Low' | 'Medium' | 'High';
    badge?: string;
  };
  selected?: boolean;
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const { title, type, badge } = data;

  // Icon mapping by category
  const getIcon = () => {
    switch (type) {
      case 'Company':
        return <Sparkles className="w-4 h-4 text-brand-purple-light" />;
      case 'Founder':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'Technology':
        return <Cpu className="w-4 h-4 text-brand-purple-light" />;
      case 'Finance':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'Market':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'Legal':
        return <Scale className="w-4 h-4 text-yellow-400" />;
      case 'Risk':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Investor':
        return <Coins className="w-4 h-4 text-teal-400" />;
      case 'Document':
        return <FileText className="w-4 h-4 text-gray-300" />;
      case 'News':
        return <Newspaper className="w-4 h-4 text-amber-500" />;
      default:
        return <Cpu className="w-4 h-4 text-gray-400" />;
    }
  };

  // Color classes by category
  const getColorClasses = () => {
    if (selected) {
      return 'border-brand-purple bg-brand-purple/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-[1.03] ring-1 ring-brand-purple';
    }

    switch (type) {
      case 'Company':
        return 'border-brand-purple bg-brand-purple/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]';
      case 'Founder':
        return 'border-blue-500/40 bg-blue-950/20 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'Technology':
        return 'border-brand-purple/40 bg-brand-purple/10 text-brand-purple-light shadow-[0_0_15px_rgba(139,92,246,0.1)]';
      case 'Finance':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'Market':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'Legal':
        return 'border-yellow-500/40 bg-yellow-950/20 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
      case 'Risk':
        return 'border-rose-500/40 bg-rose-950/20 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse';
      case 'Investor':
        return 'border-teal-500/40 bg-teal-950/20 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.1)]';
      case 'Document':
        return 'border-gray-500/30 bg-gray-950/20 text-gray-300 shadow-[0_0_15px_rgba(107,114,128,0.1)]';
      case 'News':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      default:
        return 'border-gray-500/20 bg-gray-950/10 text-gray-400';
    }
  };

  return (
    <div className={`relative px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 flex items-center space-x-3 select-none ${getColorClasses()}`}>
      
      {/* Target and source handles */}
      <Handle type="target" position={Position.Top} className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Left} className="opacity-0 w-2 h-2" />
      
      {/* Icon node wrapper */}
      <div className="flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-white/5 border border-white/5">
        {getIcon()}
      </div>

      <div>
        <h4 className="text-[11px] font-bold tracking-tight text-white m-0">
          {title}
        </h4>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">
            {type}
          </span>
          {badge && (
            <>
              <span className="text-gray-600 text-[8px]">•</span>
              <span className="text-gray-400 text-[8px] italic">{badge}</span>
            </>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="opacity-0 w-2 h-2" />
    </div>
  );
};

export default memo(CustomNode);
