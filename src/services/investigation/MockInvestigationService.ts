import type { InvestigationService } from './InvestigationService';
import type { Startup, Activity, GeneratedScores, InvestigationStats, User, Notification, PipelineStepConfig, GraphNodeData, GraphRelationship } from './investigationTypes';
import { mockStartups as initialStartups, mockActivities as initialActivities, currentUser as initialUser, mockNotifications as initialNotifications } from '../../mock/data';
import { mockGraphNodes, mockGraphEdges, mockTimelineEvents, mockGraphDetails, mockGraphRelationships } from '../../mock/knowledgeGraph';
import { pipelineSteps as initialPipelineSteps } from '../../mock/pipeline';
import { generateScores, generateStats } from './mockGenerator';
import { InvestigationEngine } from './InvestigationEngine';
import { ACTIVE_SERVICE_MODE } from './config';
import { BackendInvestigationService } from './BackendInvestigationService';

// In-memory mutable database instances
let startups: Startup[] = [...initialStartups];
let activities: Activity[] = [...initialActivities];
let notifications: Notification[] = [...initialNotifications];

// Utility helper to simulate network latency delay
function delay<T>(value: T, min = 300, max = 1200): Promise<T> {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export const MockInvestigationService = {
  async createInvestigation(startup: Startup): Promise<Startup> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.createInvestigation(startup);
    }
    return (MockInvestigationService as any).createInvestigationLocal(startup);
  },

  async createInvestigationLocal(startup: Startup): Promise<Startup> {
    // Run raw metadata parameters through the InvestigationEngine to compile decisions & evidence
    const engineResult = await InvestigationEngine.runDiligence({
      name: startup.name,
      founderName: startup.details.founderBackground.split(' (')[0] || 'Unknown Founder',
      sector: startup.sector,
      fundingStage: 'Seed',
      websiteUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      description: startup.elevatorPitch,
    });

    const startupWithDecision: Startup = {
      ...startup,
      details: {
        ...startup.details,
        decision: engineResult.startup.details.decision,
        evidenceList: engineResult.startup.details.evidenceList,
      },
    };

    startups = [startupWithDecision, ...startups];
    
    // Log the corresponding activity log
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      type: 'investigation',
      user: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      startupName: startup.name,
      action: 'completed due diligence pipeline assessment',
      timestamp: 'Just now',
    };
    activities = [newAct, ...activities];
    
    return delay(startupWithDecision);
  },

  async updateStartup(updated: Startup): Promise<Startup> {
    const original = startups.find((s) => s.id === updated.id);
    if (original) {
      let actionText = '';
      let type: 'status_change' | 'risk_alert' = 'status_change';
      
      if (original.status !== updated.status) {
        actionText = `updated status to ${updated.status}`;
        type = 'status_change';
      } else if (original.riskLevel !== updated.riskLevel) {
        actionText = `upgraded risk assessment to ${updated.riskLevel}`;
        type = 'risk_alert';
      }
      
      if (actionText) {
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          type,
          user: 'Sarah Jenkins',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          startupName: updated.name,
          action: actionText,
          timestamp: 'Just now',
        };
        activities = [newAct, ...activities];
      }
    }
    
    startups = startups.map((s) => (s.id === updated.id ? updated : s));
    return delay(updated);
  },

  async getAllInvestigations(): Promise<Startup[]> {
    return delay(startups);
  },

  async getInvestigationById(id: string): Promise<Startup | null> {
    const item = startups.find((s) => s.id === id) || null;
    return delay(item);
  },

  async getKnowledgeGraph(name: string): Promise<{ nodes: any[]; edges: any[] }> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.getKnowledgeGraph(name);
    }
    return (MockInvestigationService as any).getKnowledgeGraphLocal(name);
  },

  async getKnowledgeGraphLocal(name: string): Promise<{ nodes: any[]; edges: any[] }> {
    const customNodes = mockGraphNodes.map((node) => {
      if (node.id === 'n-company') {
        return {
          ...node,
          data: {
            ...node.data,
            title: name,
          },
        };
      }
      return node;
    });
    return delay({ nodes: customNodes, edges: mockGraphEdges });
  },

  async getTimeline(name: string): Promise<any[]> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.getTimeline(name);
    }
    return (MockInvestigationService as any).getTimelineLocal(name);
  },

  async getTimelineLocal(_name: string): Promise<any[]> {
    return delay(mockTimelineEvents);
  },

  async getRiskBreakdown(name: string): Promise<any> {
    const scores = generateScores(name, '');
    return delay({
      score: scores.risk,
      level: scores.risk >= 25 ? 'High' : scores.risk >= 18 ? 'Medium' : 'Low',
    });
  },

  async getEvidence(_name: string): Promise<string[]> {
    return delay([
      'Pitch deck details verified',
      'State corporate filings matched',
      'Bank validation checked',
    ]);
  },

  async getRecommendation(name: string): Promise<GeneratedScores> {
    return delay(generateScores(name, ''));
  },

  async getInvestigationStats(name: string): Promise<InvestigationStats> {
    return delay(generateStats(name));
  },

  async getDashboardMetrics(): Promise<{
    totalInvestigations: number;
    averageScore: number;
    highRiskCount: number;
    approvedCount: number;
  }> {
    const total = startups.length;
    const avgScore =
      total > 0
        ? Math.round(startups.reduce((acc, curr) => acc + curr.investmentScore, 0) / total)
        : 0;
    const highRisk = startups.filter((s) => s.riskLevel === 'High').length;
    const approved = startups.filter((s) => s.status === 'Approved').length;
    
    return delay({
      totalInvestigations: total,
      averageScore: avgScore,
      highRiskCount: highRisk,
      approvedCount: approved,
    });
  },

  async getRecentActivity(): Promise<Activity[]> {
    return delay(activities);
  },

  async searchInvestigations(query: string): Promise<Startup[]> {
    const term = query.toLowerCase();
    const filtered = startups.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.sector.toLowerCase().includes(term) ||
        s.elevatorPitch.toLowerCase().includes(term)
    );
    return delay(filtered);
  },

  async getCurrentUser(): Promise<User> {
    return delay(initialUser);
  },

  async getNotifications(): Promise<Notification[]> {
    return delay(notifications);
  },

  async markNotificationsAsRead(): Promise<Notification[]> {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return delay(notifications);
  },

  async getPipelineSteps(): Promise<PipelineStepConfig[]> {
    return delay(initialPipelineSteps);
  },

  async getNodeDetails(nodeId: string): Promise<GraphNodeData | null> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.getNodeDetails(nodeId);
    }
    const details = mockGraphDetails.find((n) => n.id === nodeId);
    return delay(details || null);
  },

  async getRelationshipDetails(edgeId: string): Promise<GraphRelationship | null> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.getRelationshipDetails(edgeId);
    }
    const rel = mockGraphRelationships.find((r) => r.id === edgeId);
    return delay(rel || null);
  }
};

export default MockInvestigationService as InvestigationService;
