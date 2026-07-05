import type { InvestigationService } from './InvestigationService';
import type { Startup, Activity, GeneratedScores, InvestigationStats, User, Notification, PipelineStepConfig, GraphNodeData, GraphRelationship } from './investigationTypes';
import { BACKEND_API_BASE } from './config';
import { MockInvestigationService } from './MockInvestigationService';

export const BackendInvestigationService: InvestigationService = {
  async createInvestigation(startup: Startup): Promise<Startup> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: startup.name,
          founderName: startup.details.founderBackground.split(' (')[0] || 'Alex Rivera',
          sector: startup.sector,
          fundingStage: 'Seed',
          websiteUrl: 'https://example.com',
          githubUrl: 'https://github.com/example',
          description: startup.elevatorPitch,
        }),
      });
      if (!res.ok) {
        console.warn('Backend failed to create startup, falling back to local service.');
        return (MockInvestigationService as any).createInvestigationLocal(startup);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error connecting to backend, falling back to local service:', err);
      return (MockInvestigationService as any).createInvestigationLocal(startup);
    }
  },

  async getKnowledgeGraph(name: string): Promise<{ nodes: any[]; edges: any[] }> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/investigations/${encodeURIComponent(name)}/graph`);
      if (!res.ok) {
        return await (MockInvestigationService as any).getKnowledgeGraphLocal(name);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error fetching graph, using fallback:', err);
      return (MockInvestigationService as any).getKnowledgeGraphLocal(name);
    }
  },

  async getTimeline(name: string): Promise<any[]> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/investigations/${encodeURIComponent(name)}/timeline`);
      if (!res.ok) {
        return await (MockInvestigationService as any).getTimelineLocal(name);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error fetching timeline, using fallback:', err);
      return (MockInvestigationService as any).getTimelineLocal(name);
    }
  },

  // Delegate other state-keeping queries to mock service to maintain visual dashboard stability
  async updateStartup(startup: Startup): Promise<Startup> {
    return MockInvestigationService.updateStartup(startup);
  },

  async getAllInvestigations(): Promise<Startup[]> {
    return MockInvestigationService.getAllInvestigations();
  },

  async getInvestigationById(id: string): Promise<Startup | null> {
    return MockInvestigationService.getInvestigationById(id);
  },

  async getRiskBreakdown(name: string): Promise<any> {
    return MockInvestigationService.getRiskBreakdown(name);
  },

  async getEvidence(name: string): Promise<string[]> {
    return MockInvestigationService.getEvidence(name);
  },

  async getRecommendation(name: string): Promise<GeneratedScores> {
    return MockInvestigationService.getRecommendation(name);
  },

  async getInvestigationStats(name: string): Promise<InvestigationStats> {
    return MockInvestigationService.getInvestigationStats(name);
  },

  async getDashboardMetrics(): Promise<any> {
    return MockInvestigationService.getDashboardMetrics();
  },

  async getRecentActivity(): Promise<Activity[]> {
    return MockInvestigationService.getRecentActivity();
  },

  async searchInvestigations(query: string): Promise<Startup[]> {
    return MockInvestigationService.searchInvestigations(query);
  },

  async getCurrentUser(): Promise<User> {
    return MockInvestigationService.getCurrentUser();
  },

  async getNotifications(): Promise<Notification[]> {
    return MockInvestigationService.getNotifications();
  },

  async markNotificationsAsRead(): Promise<Notification[]> {
    return MockInvestigationService.markNotificationsAsRead();
  },

  async getPipelineSteps(): Promise<PipelineStepConfig[]> {
    return MockInvestigationService.getPipelineSteps();
  },

  async getNodeDetails(nodeId: string): Promise<GraphNodeData | null> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/debug/node/${encodeURIComponent(nodeId)}`);
      if (!res.ok) {
        return MockInvestigationService.getNodeDetails(nodeId);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error fetching node details, using fallback:', err);
      return MockInvestigationService.getNodeDetails(nodeId);
    }
  },

  async getRelationshipDetails(edgeId: string): Promise<GraphRelationship | null> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/debug/edge/${encodeURIComponent(edgeId)}`);
      if (!res.ok) {
        return MockInvestigationService.getRelationshipDetails(edgeId);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error fetching relationship details, using fallback:', err);
      return MockInvestigationService.getRelationshipDetails(edgeId);
    }
  }
};
/**
 * Uploads a pitch deck PDF to the backend and returns extracted text.
 * Returns empty string on any failure so callers can degrade gracefully.
 */
export async function uploadPitchDeck(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BACKEND_API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
      // No Content-Type header — browser sets it automatically with boundary for multipart
    });

    if (!res.ok) {
      console.warn(`Pitch deck upload failed with status ${res.status}. Continuing without extracted text.`);
      return '';
    }

    const data = await res.json();
    return data.extracted_text || '';
  } catch (err) {
    console.warn('Pitch deck upload network error. Continuing without extracted text.', err);
    return '';
  }
}

export interface CrossMemoryInsight {
  label: string;
  type: string;
  relationship: string;
  sourceCount: number;
}

export async function getCrossMemoryInsights(): Promise<CrossMemoryInsight[]> {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/investigations/cross-memory`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export default BackendInvestigationService;

