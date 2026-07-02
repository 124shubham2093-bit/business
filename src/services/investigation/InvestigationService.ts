import type { Startup, Activity, GeneratedScores, InvestigationStats, User, Notification, PipelineStepConfig, GraphNodeData, GraphRelationship } from './investigationTypes';

export interface InvestigationService {
  createInvestigation(startup: Startup): Promise<Startup>;
  updateStartup(startup: Startup): Promise<Startup>;
  getAllInvestigations(): Promise<Startup[]>;
  getInvestigationById(id: string): Promise<Startup | null>;
  getKnowledgeGraph(name: string): Promise<{ nodes: any[]; edges: any[] }>;
  getTimeline(name: string): Promise<any[]>;
  getRiskBreakdown(name: string): Promise<any>;
  getEvidence(name: string): Promise<string[]>;
  getRecommendation(name: string): Promise<GeneratedScores>;
  getInvestigationStats(name: string): Promise<InvestigationStats>;
  getDashboardMetrics(): Promise<{
    totalInvestigations: number;
    averageScore: number;
    highRiskCount: number;
    approvedCount: number;
  }>;
  getRecentActivity(): Promise<Activity[]>;
  searchInvestigations(query: string): Promise<Startup[]>;
  getCurrentUser(): Promise<User>;
  getNotifications(): Promise<Notification[]>;
  markNotificationsAsRead(): Promise<Notification[]>;
  getPipelineSteps(): Promise<PipelineStepConfig[]>;
  getNodeDetails(nodeId: string): Promise<GraphNodeData | null>;
  getRelationshipDetails(edgeId: string): Promise<GraphRelationship | null>;
}
