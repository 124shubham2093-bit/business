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

export interface StartupDetails {
  summary: string;
  strengths: string[];
  risks: string[];
  founderBackground: string;
  financialSnapshot: FinancialSnapshot;
  marketOpportunity: string;
  techStackRisk: string;
}

export interface Startup {
  id: string;
  name: string;
  logo: string; // URL or letter
  elevatorPitch: string;
  sector: string;
  investmentScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Approved' | 'Under Review' | 'Flagged';
  dateInvestigated: string;
  metrics: MetricBreakdown;
  details: StartupDetails;
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

export * from './failureIntelligence';
