export type NodeType =
  | 'Founder'
  | 'Technology'
  | 'Finance'
  | 'Market'
  | 'Legal'
  | 'Risk'
  | 'Investor'
  | 'Document'
  | 'News';

export interface Evidence {
  source: string;
  confidence: string;
  reason: string;
  linkedEntities: string[];
  timestamp: string;
}

export interface Decision {
  recommendation: 'INVEST' | 'UNDER REVIEW' | 'PASS';
  confidence: string;
  reasoning: string;
  supportingEvidence: Evidence[];
  riskFactors: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface GraphNodeData {
  id: string;
  title: string;
  type: NodeType | 'Company';
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: string;
  description: string;
  connectedNodes: Array<{ id: string; relation: string; name: string }>;
  evidence: string[];
  relatedDocuments: string[];
  timeline: string;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: string;
  reason: string;
}

export interface MetricBreakdown {
  financials: number; // 0-100
  marketSize: number; // 0-100
  team: number;       // 0-100
  product: number;    // 0-100
}

export interface FinancialSnapshot {
  revenue: string;
  burnRate: string;
  runway: string;
  valuation: string;
}

export interface GitHubStatus {
  success: boolean;
  error?: string | null;
  repo_path?: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  topics?: string[];
  readme_excerpt?: string;
}

export interface StartupDetails {
  summary: string;
  strengths: string[];
  risks: string[];
  founderBackground: string;
  financialSnapshot: FinancialSnapshot;
  marketOpportunity: string;
  techStackRisk: string;
  
  // Custom decision and evidence extensions
  decision?: Decision;
  evidenceList?: Evidence[];
  github_status?: GitHubStatus | null;
}

export interface Startup {
  id: string;
  name: string;
  logo: string;
  elevatorPitch: string;
  sector: string;
  investmentScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Approved' | 'Under Review' | 'Flagged';
  dateInvestigated: string;
  metrics: MetricBreakdown;
  details: StartupDetails;
  github_status?: GitHubStatus | null;
  githubUrl?: string;
}

export interface Activity {
  id: string;
  type: 'investigation' | 'status_change' | 'note' | 'risk_alert';
  user: string;
  avatarUrl?: string;
  startupName: string;
  action: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  text: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

export interface User {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface GeneratedScores {
  investmentScore: number;
  founder: number;
  technology: number;
  market: number;
  finance: number;
  competition: number;
  risk: number;
  recommendation: 'INVEST' | 'UNDER REVIEW' | 'PASS';
}

export interface InvestigationStats {
  entities: number;
  relationships: number;
  documents: number;
  signals: number;
  confidence: string;
}

export interface PipelineStepConfig {
  id: string;
  name: string;
  agent: string;
  agentStatus: string;
  agentOutput: string;
  confidence: number;
  memoryStatus: string;
  logs: string[];
}
