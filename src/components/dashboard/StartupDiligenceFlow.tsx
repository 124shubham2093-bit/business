import React, { useMemo } from 'react';
import { ReactFlow, Background, Position, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Startup } from '../../types';

interface StartupDiligenceFlowProps {
  startup: Startup;
}

export const StartupDiligenceFlow: React.FC<StartupDiligenceFlowProps> = ({ startup }) => {
  const { metrics, riskLevel, status, name } = startup;

  const nodeColor = (score: number) => {
    if (score >= 80) return 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
    if (score >= 60) return 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20';
    return 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20';
  };

  const riskColor = (level: string) => {
    if (level === 'Low') return 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
    if (level === 'Medium') return 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20';
    return 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse';
  };

  const statusColor = (val: string) => {
    if (val === 'Approved') return 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/35 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (val === 'Under Review') return 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/35';
    return 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/35';
  };

  const { nodes, edges } = useMemo(() => {
    const nodesList: Node[] = [
      {
        id: 'team',
        type: 'input',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Founders</span>
              <span className="font-semibold text-[var(--text-primary)]">{metrics.team}/100</span>
            </div>
          ),
        },
        position: { x: 40, y: 30 },
        sourcePosition: Position.Right,
        className: `rounded-lg border px-3 py-2 text-center text-xs font-medium backdrop-blur-md glass-panel ${nodeColor(metrics.team)}`,
      },
      {
        id: 'market',
        type: 'input',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Market TAM</span>
              <span className="font-semibold text-[var(--text-primary)]">{metrics.marketSize}/100</span>
            </div>
          ),
        },
        position: { x: 40, y: 150 },
        sourcePosition: Position.Right,
        className: `rounded-lg border px-3 py-2 text-center text-xs font-medium backdrop-blur-md glass-panel ${nodeColor(metrics.marketSize)}`,
      },
      {
        id: 'product',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Product & Tech</span>
              <span className="font-semibold text-[var(--text-primary)]">{metrics.product}/100</span>
            </div>
          ),
        },
        position: { x: 230, y: 90 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        className: `rounded-lg border px-3 py-2 text-center text-xs font-medium backdrop-blur-md glass-panel ${nodeColor(metrics.product)}`,
      },
      {
        id: 'financials',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Financial Health</span>
              <span className="font-semibold text-[var(--text-primary)]">{metrics.financials}/100</span>
            </div>
          ),
        },
        position: { x: 420, y: 90 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        className: `rounded-lg border px-3 py-2 text-center text-xs font-medium backdrop-blur-md glass-panel ${nodeColor(metrics.financials)}`,
      },
      {
        id: 'risk',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Diligence Risk</span>
              <span className="font-bold text-[var(--text-primary)]">{riskLevel} Risk</span>
            </div>
          ),
        },
        position: { x: 610, y: 90 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        className: `rounded-lg border px-3 py-2 text-center text-xs font-medium backdrop-blur-md glass-panel ${riskColor(riskLevel)}`,
      },
      {
        id: 'decision',
        type: 'output',
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Committee Decision</span>
              <span className="font-bold text-[var(--text-primary)] tracking-wide">{status}</span>
            </div>
          ),
        },
        position: { x: 800, y: 90 },
        targetPosition: Position.Left,
        className: `rounded-lg border-2 px-4 py-2.5 text-center text-sm font-semibold backdrop-blur-md glass-panel ${statusColor(status)}`,
      },
    ];

    const edgesList: Edge[] = [
      { id: 'e1', source: 'team', target: 'product', animated: true },
      { id: 'e2', source: 'market', target: 'product', animated: true },
      { id: 'e3', source: 'product', target: 'financials', animated: true },
      { id: 'e4', source: 'financials', target: 'risk', animated: true },
      { id: 'e5', source: 'risk', target: 'decision', animated: status === 'Approved' },
    ];

    return { nodes: nodesList, edges: edgesList };
  }, [metrics, riskLevel, status]);

  return (
    <div className="w-full h-[240px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] overflow-hidden relative">
      <div className="absolute top-3 left-4 z-10">
        <h4 className="text-xs font-semibold text-[var(--text-primary)]">Diligence Evaluation Graph: {name}</h4>
        <p className="text-[10px] text-[var(--text-secondary)]">Visual dependency pipeline of investigation nodes</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        panOnDrag={false}
        zoomOnPinch={false}
        preventScrolling={true}
      >
        <Background color="rgba(139, 92, 246, 0.15)" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};
export default StartupDiligenceFlow;
