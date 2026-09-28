import type { Node, Edge } from '@xyflow/react';
import type { GraphNodeData, GraphRelationship } from '../services/investigation/investigationTypes';

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

export const mockTimelineEvents: TimelineEvent[] = [];

export const mockInvestigationStats = {
  entities: 0,
  relationships: 0,
  documents: 0,
  evidence: 0,
  signals: 0,
  confidence: '0%'
};

export const mockGraphNodes: Node[] = [];
export const mockGraphEdges: Edge[] = [];
export const mockGraphDetails: Record<string, GraphNodeData> = {};
export const mockGraphRelationships: GraphRelationship[] = [];
