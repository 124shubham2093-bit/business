import type { InvestigationService } from './InvestigationService';
import type { Startup, Activity, GeneratedScores, InvestigationStats, User, Notification, PipelineStepConfig, GraphNodeData, GraphRelationship } from './investigationTypes';
import { mockStartups as initialStartups, mockActivities as initialActivities, currentUser as initialUser, mockNotifications as initialNotifications } from '../../mock/data';
import { mockGraphNodes, mockGraphEdges, mockTimelineEvents, mockGraphDetails, mockGraphRelationships } from '../../mock/knowledgeGraph';
import { pipelineSteps as initialPipelineSteps } from '../../mock/pipeline';
import { generateScores, generateStats } from './mockGenerator';
import { InvestigationEngine } from './InvestigationEngine';
import { ACTIVE_SERVICE_MODE } from './config';
import { BackendInvestigationService } from './BackendInvestigationService';

// In-memory mutable database instances with local storage fallback persistence to prevent data loss on refresh
const LOCAL_STORAGE_KEY = 'investiq_startups';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'investiq_activities';

const FORBIDDEN_LEGACY_NAMES = [
  'helixbio',
  'alphadynamics',
  'alpha dynamics',
  'alpha dynamic',
  'quantumflow',
  'finvantage',
  'nexus devtools',
  'cybershield',
  'alex rivera',
  'sarah jenkins',
  'rahul sharma',
  'peak ventures',
  'dfdf',
];

function containsForbidden(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FORBIDDEN_LEGACY_NAMES.some((term) => lower.includes(term));
}

const loadStartups = (): Startup[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const parsed: Startup[] = JSON.parse(data);
      const cleaned = parsed.filter(
        (s) => !containsForbidden(s.name) && !containsForbidden(s.id) && !containsForbidden(s.elevatorPitch || '')
      );
      if (cleaned.length !== parsed.length) {
        saveStartups(cleaned);
      }
      return cleaned;
    } catch (e) {
      console.error(e);
    }
  }
  return [...initialStartups];
};

const saveStartups = (list: Startup[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
};

const loadActivities = (): Activity[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
  if (data) {
    try {
      const parsed: Activity[] = JSON.parse(data);
      const cleaned = parsed.filter(
        (a) => !containsForbidden(a.startupName || '') && !containsForbidden(a.user || '') && !containsForbidden(a.action || '')
      );
      if (cleaned.length !== parsed.length) {
        saveActivities(cleaned);
      }
      return cleaned;
    } catch (e) {
      console.error(e);
    }
  }
  return [...initialActivities];
};

const saveActivities = (list: Activity[]) => {
  localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(list));
};

let startups: Startup[] = loadStartups();
let activities: Activity[] = loadActivities();
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
      const result = await BackendInvestigationService.createInvestigation(startup);
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        type: 'investigation',
        user: 'Investment Committee',
        startupName: result.name,
        action: 'completed due diligence pipeline assessment',
        timestamp: 'Just now',
      };
      activities = [newAct, ...activities];
      saveActivities(activities);
      return result;
    }
    return (MockInvestigationService as any).createInvestigationLocal(startup);
  },

  async createInvestigationLocal(startup: Startup): Promise<Startup> {
    // Run raw metadata parameters through the InvestigationEngine to compile decisions & evidence
    const engineResult = await InvestigationEngine.runDiligence({
      name: startup.name,
      founderName: startup.details.founderBackground.split(' (')[0] || 'Unknown Founder',
      sector: startup.sector,
      fundingStage: (startup as any).fundingStage || 'Seed',
      websiteUrl: (startup as any).websiteUrl || 'https://example.com',
      githubUrl: (startup as any).githubUrl || 'https://github.com/example',
      description: startup.elevatorPitch + '\n\n' + ((startup as any).pitchDeckText || '') + '\n\n' + ((startup as any).financialsText || ''),
    });

    const startupWithDecision: Startup = {
      ...startup,
      id: engineResult.startup.id,
      investmentScore: engineResult.startup.investmentScore,
      riskLevel: engineResult.startup.riskLevel,
      status: engineResult.startup.status,
      dateInvestigated: engineResult.startup.dateInvestigated,
      metrics: engineResult.startup.metrics,
      details: {
        ...startup.details,
        summary: engineResult.startup.details.summary,
        strengths: engineResult.startup.details.strengths,
        risks: engineResult.startup.details.risks,
        founderBackground: engineResult.startup.details.founderBackground,
        financialSnapshot: engineResult.startup.details.financialSnapshot,
        marketOpportunity: engineResult.startup.details.marketOpportunity,
        techStackRisk: engineResult.startup.details.techStackRisk,
        decision: engineResult.startup.details.decision,
        evidenceList: engineResult.startup.details.evidenceList,
      },
    };

    startups = [startupWithDecision, ...startups];
    saveStartups(startups);
    
    // Log the corresponding activity log
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      type: 'investigation',
      user: 'Investment Committee',
      startupName: startup.name,
      action: 'completed due diligence pipeline assessment',
      timestamp: 'Just now',
    };
    activities = [newAct, ...activities];
    saveActivities(activities);
    
    return delay(startupWithDecision);
  },

  async deleteInvestigation(id: string): Promise<boolean> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.deleteInvestigation(id);
    }
    return (MockInvestigationService as any).deleteInvestigationLocal(id);
  },

  deleteInvestigationLocal(id: string): boolean {
    startups = startups.filter((s) => s.id !== id && s.name.toLowerCase() !== id.toLowerCase());
    saveStartups(startups);
    activities = activities.filter((a) => a.startupName.toLowerCase() !== id.toLowerCase() && a.id !== id);
    saveActivities(activities);
    return true;
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
          user: 'Investment Committee',
          startupName: updated.name,
          action: actionText,
          timestamp: 'Just now',
        };
        activities = [newAct, ...activities];
        saveActivities(activities);
      }
    }
    
    startups = startups.map((s) => (s.id === updated.id ? updated : s));
    saveStartups(startups);
    return delay(updated);
  },

  async getAllInvestigations(): Promise<Startup[]> {
    return delay(startups);
  },

  async getInvestigations(): Promise<Startup[]> {
    if (ACTIVE_SERVICE_MODE === 'backend') {
      return BackendInvestigationService.getInvestigations();
    }
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
    const startup = startups.find(s => s.name === name);
    if (startup) {
      return delay({
        score: 100 - startup.investmentScore,
        level: startup.riskLevel,
      });
    }
    const scores = generateScores(name, '');
    return delay({
      score: scores.risk,
      level: scores.risk >= 25 ? 'High' : scores.risk >= 18 ? 'Medium' : 'Low',
    });
  },

  async getEvidence(name: string): Promise<string[]> {
    const startup = startups.find(s => s.name === name);
    if (startup && startup.details.evidenceList) {
      return delay(startup.details.evidenceList.map((e: any) => e.reason));
    }
    return delay([
      'Pitch deck details verified',
      'State corporate filings matched',
      'Bank validation checked',
    ]);
  },

  async getRecommendation(name: string): Promise<GeneratedScores> {
    const startup = startups.find(s => s.name === name);
    if (startup) {
      return delay({
        investmentScore: startup.investmentScore,
        founder: startup.metrics.team,
        technology: startup.metrics.product,
        market: startup.metrics.marketSize,
        finance: startup.metrics.financials,
        competition: (startup.metrics as any).competition || 80,
        risk: startup.riskLevel === 'High' ? 30 : startup.riskLevel === 'Medium' ? 20 : 10,
        recommendation: startup.status === 'Approved' ? 'INVEST' : startup.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
      });
    }
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
    const details = mockGraphDetails[nodeId];
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
