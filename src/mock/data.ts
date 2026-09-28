import type { Startup, Activity, Notification, User } from '../types';

export const currentUser: User = {
  name: 'InvestIQ Workspace',
  role: 'Investment Committee',
  email: 'diligence@investiq.internal',
  avatar: '',
};

export const mockNotifications: Notification[] = [];

export const mockActivities: Activity[] = [];

export const mockStartups: Startup[] = [
  {
    id: 'st-5',
    name: 'Veritas Legal',
    logo: '⚖️',
    elevatorPitch: 'Automated contract negotiation assistant designed specifically for enterprise procurement.',
    sector: 'LegalTech',
    investmentScore: 82,
    riskLevel: 'Medium',
    status: 'Approved',
    dateInvestigated: '2026-06-25',
    metrics: {
      financials: 85,
      marketSize: 78,
      team: 83,
      product: 82,
    },
    details: {
      summary: 'Veritas Legal automates standard legal markups for NDAs, vendor terms, and master service agreements. By checking proposed edits against a company\'s internal playbook, it speeds up negotiation by 70%. The platform is high-margin (88%) and has successfully signed three Fortune 500 contracts.',
      strengths: [
        'Strong gross margins (88%) since LLM wrapper logic is highly optimized.',
        'Clear ROI: customers report sales cycle speedups of over 40%.',
        'Multi-year contracts signed with blue-chip buyers.',
      ],
      risks: [
        'Accuracy constraints; hallucinations in legal language carry liability risks.',
        'Vulnerability to new LLM releases that natively handle document editing context structures.',
      ],
      founderBackground: 'Charlotte King (JD Harvard, corporate counsel for 8 years) & Liam Gallagher (ex-VP of engineering at DocuSign).',
      financialSnapshot: {
        revenue: '$2.1M ARR',
        burnRate: '$110k/mo',
        runway: '16 months',
        valuation: '$32M Post-Money',
      },
      marketOpportunity: 'Enterprise contract lifecycle management (CLM) market is $4.2B, with a 14% growth rate.',
      techStackRisk: 'Medium. Implements complex retrieval-augmented generation (RAG) which needs continuous vector database updates.',
    },
  },
  {
    id: 'st-7',
    name: 'EduSphere',
    logo: '🎓',
    elevatorPitch: 'AI math and physics tutor that maps cognitive paths and adapts in real-time.',
    sector: 'EdTech AI',
    investmentScore: 85,
    riskLevel: 'Low',
    status: 'Approved',
    dateInvestigated: '2026-06-29',
    metrics: {
      financials: 88,
      marketSize: 82,
      team: 86,
      product: 84,
    },
    details: {
      summary: 'EduSphere is a direct-to-consumer mobile application that models a student\'s understanding. Using structured state spaces, it identifies conceptual gaps (e.g. struggles with trigonometry stem from a fraction misunderstanding) and designs custom practice drills. Customer retention is unusually high for EdTech apps.',
      strengths: [
        'Remarkable LTV/CAC ratio of 5.2x due to organic referrals.',
        'Strong learning outcome metrics validated by third-party educational reviews.',
        'High-quality gamification hooks that boost engagement.',
      ],
      risks: [
        'D2C marketing acquisition costs are subject to app store bid volatility.',
        'High pressure to produce localized curriculum content for global markets.',
      ],
      founderBackground: 'Dr. Jean Piaget III (PhD in Educational Psychology from Oxford) & Kenji Sato (former Lead App Architect at Duolingo).',
      financialSnapshot: {
        revenue: '$4.2M ARR',
        burnRate: '$160k/mo',
        runway: '28 months',
        valuation: '$55M Post-Money',
      },
      marketOpportunity: 'Global personalized K-12 EdTech market is $18B, accelerating with remote learning adoption.',
      techStackRisk: 'Low. Standard mobile client communicating with serverless endpoints; utilizes high-performance graph databases.',
    },
  },
  {
    id: 'st-8',
    name: 'CarbonSentry',
    logo: '🌱',
    elevatorPitch: 'Satellite spectral imaging and IoT mesh network that verifies carbon offset integrity.',
    sector: 'ClimateTech',
    investmentScore: 59,
    riskLevel: 'High',
    status: 'Flagged',
    dateInvestigated: '2026-06-18',
    metrics: {
      financials: 38,
      marketSize: 88,
      team: 62,
      product: 48,
    },
    details: {
      summary: 'CarbonSentry monitors forestry carbon credit zones. By combining satellite imagery with ground-level IoT soil and moisture sensors, they try to prevent greenwashing. While the market opportunity is large due to corporate Net-Zero goals, the product is hardware-heavy, and they are burning capital quickly.',
      strengths: [
        'Offers critical integrity checks in an offset market plagued by fraud.',
        'Unique integration of satellite data with hardware nodes.',
      ],
      risks: [
        'Hardware deployment in remote environments is highly capital-intensive.',
        'High replacement rate of sensors damaged by weather or animals.',
        'Carbon credit regulations are unstable and subject to political shifts.',
      ],
      founderBackground: 'Alice Thorne (former hardware designer at Tesla) & Dr. Carlos Mendoza (Climate scientist, 15 years research at NOAA).',
      financialSnapshot: {
        revenue: '$120k ARR',
        burnRate: '$320k/mo',
        runway: '4.8 months',
        valuation: '$8M Pre-Money',
      },
      marketOpportunity: 'Carbon credit verification market is $1.5B, projected to expand to $10B if regulatory standards consolidate.',
      techStackRisk: 'High. LoRaWAN hardware mesh network is unstable under thick forest canopies; high battery failures.',
    },
  }
];
