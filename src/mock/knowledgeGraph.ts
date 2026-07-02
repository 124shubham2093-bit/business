import type { Node, Edge } from '@xyflow/react';
import type { GraphNodeData, GraphRelationship } from '../services/investigation/investigationTypes';

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

export const mockTimelineEvents: TimelineEvent[] = [
  { time: '09:00', title: 'Pitch Deck Uploaded', description: 'Parser extracted 16 slides of materials.' },
  { time: '09:01', title: 'Founder Profiles Audited', description: 'LinkedIn & Crunchbase credential layers checked.' },
  { time: '09:03', title: 'Technology Validated', description: 'Inference speed and hardware bottlenecks scanned.' },
  { time: '09:04', title: 'GitHub Commits Analyzed', description: '147 checkins audited for security hazards.' },
  { time: '09:05', title: 'Competitors Identified', description: 'Located 2 direct market entrants.' },
  { time: '09:06', title: 'Market Opportunity Estimated', description: 'TAM mapped at $4.2B with CAGR: 18.2%.' },
  { time: '09:08', title: 'FDA Compliance Checked', description: 'Clinical regulatory compliance curves checked.' },
  { time: '09:10', title: 'Diligence Report Generated', description: 'Cognee semantic knowledge graph finalized.' }
];

export const mockInvestigationStats = {
  entities: 42,
  relationships: 188,
  documents: 8,
  evidence: 57,
  signals: 24,
  confidence: '94%'
};

export const mockGraphNodes: Node[] = [
  {
    id: 'n-company',
    type: 'custom',
    position: { x: 250, y: 250 },
    data: { title: 'HelixBio AI', type: 'Company', riskLevel: 'Low', badge: 'Active Startup' }
  },
  {
    id: 'n-founder',
    type: 'custom',
    position: { x: -30, y: 120 },
    data: { title: 'Dr. Evelyn Zhang', type: 'Founder', riskLevel: 'Low', badge: 'Stanford PhD' }
  },
  {
    id: 'n-cofounder',
    type: 'custom',
    position: { x: -120, y: 230 },
    data: { title: 'Mark Sorensen', type: 'Founder', riskLevel: 'Low', badge: 'ex-Genentech VP' }
  },
  {
    id: 'n-funding',
    type: 'custom',
    position: { x: 60, y: 400 },
    data: { title: 'Series A raising', type: 'Finance', riskLevel: 'Medium', badge: '$5.5M Target' }
  },
  {
    id: 'n-investor',
    type: 'custom',
    position: { x: -100, y: 430 },
    data: { title: 'Prime Ventures', type: 'Investor', riskLevel: 'Low', badge: 'Tier-1 VC' }
  },
  {
    id: 'n-tech',
    type: 'custom',
    position: { x: 550, y: 150 },
    data: { title: 'Folding Transformer', type: 'Technology', riskLevel: 'Low', badge: 'Proprietary ML' }
  },
  {
    id: 'n-product',
    type: 'custom',
    position: { x: 780, y: 100 },
    data: { title: 'BioTransformer API', type: 'Technology', riskLevel: 'Low', badge: 'Active Product' }
  },
  {
    id: 'n-github',
    type: 'custom',
    position: { x: 630, y: 250 },
    data: { title: 'helixbio-core', type: 'Technology', riskLevel: 'Low', badge: '147 commits' }
  },
  {
    id: 'n-patent',
    type: 'custom',
    position: { x: 800, y: 200 },
    data: { title: 'Patent US-9012', type: 'Technology', riskLevel: 'Low', badge: 'Approved IP' }
  },
  {
    id: 'n-revenue',
    type: 'custom',
    position: { x: 500, y: 350 },
    data: { title: '$1.2 ARR', type: 'Finance', riskLevel: 'Low', badge: 'Audited ARR' }
  },
  {
    id: 'n-burn',
    type: 'custom',
    position: { x: 690, y: 410 },
    data: { title: '$90k/mo Burn', type: 'Finance', riskLevel: 'Medium', badge: 'Runway: 24mo' }
  },
  {
    id: 'n-market',
    type: 'custom',
    position: { x: 250, y: 10 },
    data: { title: '$45B TAM', type: 'Market', riskLevel: 'Low', badge: 'Bioinformatic' }
  },
  {
    id: 'n-comp1',
    type: 'custom',
    position: { x: 480, y: -40 },
    data: { title: 'BioSim Corp', type: 'Market', riskLevel: 'Medium', badge: 'Direct Rival' }
  },
  {
    id: 'n-comp2',
    type: 'custom',
    position: { x: 50, y: -20 },
    data: { title: 'FoldingWorks', type: 'Market', riskLevel: 'Low', badge: 'Competitor' }
  },
  {
    id: 'n-news',
    type: 'custom',
    position: { x: -280, y: 290 },
    data: { title: 'Nature AI Article', type: 'News', riskLevel: 'Low', badge: 'Media Signal' }
  },
  {
    id: 'n-legal',
    type: 'custom',
    position: { x: 250, y: 500 },
    data: { title: 'FDA Compliance Audit', type: 'Legal', riskLevel: 'High', badge: 'Regulatory Hurdle' }
  },
  {
    id: 'n-partner',
    type: 'custom',
    position: { x: 540, y: 490 },
    data: { title: 'Pfizer Pilot', type: 'Investor', riskLevel: 'Low', badge: 'Active Partner' }
  },
  {
    id: 'n-doc',
    type: 'custom',
    position: { x: -260, y: 50 },
    data: { title: 'Diligence Audit sheet', type: 'Document', riskLevel: 'Low', badge: 'PDF Report' }
  },
  {
    id: 'n-decision',
    type: 'custom',
    position: { x: -250, y: 480 },
    data: { title: 'Diligence Verdict', type: 'Legal', riskLevel: 'Low', badge: 'Approved Status' }
  }
];

export const mockGraphEdges: Edge[] = [
  { id: 'e-founder1', source: 'n-founder', target: 'n-company', label: 'FOUNDER_OF', animated: true, data: { relationId: 'rel-founder1' } },
  { id: 'e-founder2', source: 'n-cofounder', target: 'n-company', label: 'FOUNDER_OF', animated: true, data: { relationId: 'rel-founder2' } },
  { id: 'e-news', source: 'n-news', target: 'n-founder', label: 'FEATURES', animated: false, data: { relationId: 'rel-news' } },
  { id: 'e-doc', source: 'n-doc', target: 'n-founder', label: 'REVIEWS', animated: false, data: { relationId: 'rel-doc' } },
  { id: 'e-tech', source: 'n-company', target: 'n-tech', label: 'DEVELOPED', animated: true, data: { relationId: 'rel-tech' } },
  { id: 'e-product', source: 'n-tech', target: 'n-product', label: 'POWERED_BY', animated: true, data: { relationId: 'rel-product' } },
  { id: 'e-github', source: 'n-tech', target: 'n-github', label: 'SOURCE_CODE', animated: false, data: { relationId: 'rel-github' } },
  { id: 'e-patent', source: 'n-tech', target: 'n-patent', label: 'PATENTED_BY', animated: false, data: { relationId: 'rel-patent' } },
  { id: 'e-revenue', source: 'n-company', target: 'n-revenue', label: 'GENERATES', animated: true, data: { relationId: 'rel-revenue' } },
  { id: 'e-burn', source: 'n-company', target: 'n-burn', label: 'HAS_BURN', animated: false, data: { relationId: 'rel-burn' } },
  { id: 'e-funding', source: 'n-company', target: 'n-funding', label: 'RAISING', animated: true, data: { relationId: 'rel-funding' } },
  { id: 'e-investor', source: 'n-funding', target: 'n-investor', label: 'LEAD_BY', animated: true, data: { relationId: 'rel-investor' } },
  { id: 'e-market', source: 'n-company', target: 'n-market', label: 'TARGETS', animated: false, data: { relationId: 'rel-market' } },
  { id: 'e-comp1', source: 'n-market', target: 'n-comp1', label: 'CONTAINS', animated: false, data: { relationId: 'rel-comp1' } },
  { id: 'e-comp2', source: 'n-market', target: 'n-comp2', label: 'CONTAINS', animated: false, data: { relationId: 'rel-comp2' } },
  { id: 'e-legal', source: 'n-company', target: 'n-legal', label: 'SUBJECT_TO', animated: true, data: { relationId: 'rel-legal' } },
  { id: 'e-partner', source: 'n-company', target: 'n-partner', label: 'PARTNERED_WITH', animated: true, data: { relationId: 'rel-partner' } },
  { id: 'e-decision', source: 'n-company', target: 'n-decision', label: 'DECISION', animated: true, data: { relationId: 'rel-decision' } }
];

export const mockGraphDetails: GraphNodeData[] = [
  {
    id: 'n-company',
    title: 'HelixBio AI',
    type: 'News',
    riskLevel: 'Low',
    confidence: '94%',
    description: 'Generative AI platform accelerating protein folding and drug discovery pipelines.',
    connectedNodes: [
      { id: 'n-founder', relation: 'FOUNDER', name: 'Dr. Evelyn Zhang' },
      { id: 'n-cofounder', relation: 'COFOUNDER', name: 'Mark Sorensen' },
      { id: 'n-tech', relation: 'DEVELOPED', name: 'Folding Transformer' },
      { id: 'n-revenue', relation: 'REVENUE', name: '$1.2M ARR' },
      { id: 'n-funding', relation: 'FUNDING', name: 'Series A raising' }
    ],
    evidence: ['Pitch deck details verified', 'State corporate filings matched', 'Bank validation checked'],
    relatedDocuments: ['pitch_deck_executive.pdf', 'corporate_charter.pdf'],
    timeline: 'Diligence process started 3 days ago. Mapped 5 structural nodes.'
  },
  {
    id: 'n-founder',
    title: 'Dr. Evelyn Zhang',
    type: 'Founder',
    riskLevel: 'Low',
    confidence: '96%',
    description: 'CEO and Founder of HelixBio AI. PhD in Bio-informatics from Stanford with 10+ core publications on molecular folding.',
    connectedNodes: [
      { id: 'n-company', relation: 'FOUNDER_OF', name: 'HelixBio AI' },
      { id: 'n-news', relation: 'FEATURED_IN', name: 'Nature AI Article' }
    ],
    evidence: ['Verified PhD dissertation from Stanford Registrar', 'Reference check completed: ex-Google Brain managers'],
    relatedDocuments: ['academic_pedigree.pdf', 'zhang_resume.pdf'],
    timeline: 'Profile audited: 2026-06-28. Verification status: APPROVED.'
  },
  {
    id: 'n-cofounder',
    title: 'Mark Sorensen',
    type: 'Founder',
    riskLevel: 'Low',
    confidence: '92%',
    description: 'Co-Founder & VP of Engineering. Formerly VP of Drug Engineering at Genentech with 15+ years experience in automated chemistry.',
    connectedNodes: [
      { id: 'n-company', relation: 'COFOUNDER_OF', name: 'HelixBio AI' }
    ],
    evidence: ['Reference checks with Genentech VP verified', 'Prior patents validated'],
    relatedDocuments: ['executive_reference_sheets.pdf'],
    timeline: 'Profile audited: 2026-06-28. Verification status: APPROVED.'
  },
  {
    id: 'n-tech',
    title: 'Folding Transformer',
    type: 'Technology',
    riskLevel: 'Low',
    confidence: '90%',
    description: 'Custom deep neural net trained on unique biological sequence datasets. Compiles and infers secondary protein structures.',
    connectedNodes: [
      { id: 'n-company', relation: 'DEVELOPED_BY', name: 'HelixBio AI' },
      { id: 'n-product', relation: 'POWERS', name: 'BioTransformer API' },
      { id: 'n-github', relation: 'CODEBASE', name: 'helixbio-core' },
      { id: 'n-patent', relation: 'PATENT', name: 'Patent US-9012' }
    ],
    evidence: ['Architecture benchmarks audited', 'Inference latency tests passed (< 22ms)', 'Compute budgets verified'],
    relatedDocuments: ['folding_architectural_specs.pdf', 'latency_benchmarks.xlsx'],
    timeline: 'Technical audit completed: 2026-06-29.'
  },
  {
    id: 'n-product',
    title: 'BioTransformer API',
    type: 'Technology',
    riskLevel: 'Low',
    confidence: '91%',
    description: 'Commercial enterprise endpoint allowing third-party lab clients to run sequence predictions.',
    connectedNodes: [
      { id: 'n-tech', relation: 'POWERED_BY', name: 'Folding Transformer' }
    ],
    evidence: ['Endpoint API documentation verified', 'Three pilot partners currently querying weekly.'],
    relatedDocuments: ['api_developer_guide.pdf'],
    timeline: 'API audited: 2026-06-29.'
  },
  {
    id: 'n-github',
    title: 'helixbio-core',
    type: 'Technology',
    riskLevel: 'Low',
    confidence: '95%',
    description: 'GitHub repository holding model definitions, custom kernels, and database connectors.',
    connectedNodes: [
      { id: 'n-tech', relation: 'SOURCE_CODE_OF', name: 'Folding Transformer' }
    ],
    evidence: ['147 commits scanned', 'Dependency check completed: no security warning flags', 'Code redundancy check: 4.2%'],
    relatedDocuments: ['github_remediation_summary.pdf'],
    timeline: 'GitHub repository scanned: 2026-07-01.'
  },
  {
    id: 'n-patent',
    title: 'Patent US-9012',
    type: 'Technology',
    riskLevel: 'Low',
    confidence: '99%',
    description: 'Approved USPTO utility patent protecting sequence transformer architectures and neural molecular representation layers.',
    connectedNodes: [
      { id: 'n-tech', relation: 'PATENT_OF', name: 'Folding Transformer' }
    ],
    evidence: ['USPTO registry validated: Active status', 'IP ownership assigned to HelixBio AI Inc.'],
    relatedDocuments: ['uspto_patent_9012_filing.pdf'],
    timeline: 'IP check completed: 2026-06-25.'
  },
  {
    id: 'n-revenue',
    title: '$1.2 ARR',
    type: 'Finance',
    riskLevel: 'Low',
    confidence: '94%',
    description: 'Audited Annual Recurring Revenue. Consists of 3 mid-market software contract licenses and 2 research retainers.',
    connectedNodes: [
      { id: 'n-company', relation: 'REVENUE_OF', name: 'HelixBio AI' }
    ],
    evidence: ['SaaS customer invoices verified', 'Revenue ledger audit complete', 'Customer ARR verified'],
    relatedDocuments: ['financial_ledger_2026.xlsx', 'customer_contracts.pdf'],
    timeline: 'Revenue verified: 2026-06-30.'
  },
  {
    id: 'n-burn',
    title: '$90k/mo Burn',
    type: 'Finance',
    riskLevel: 'Medium',
    confidence: '93%',
    description: 'Net monthly burn rate. Primary cost centers: AWS compute clusters (60%), salary (30%), administrative (10%).',
    connectedNodes: [
      { id: 'n-company', relation: 'BURN_OF', name: 'HelixBio AI' }
    ],
    evidence: ['Compute ledger logs cross-referenced', 'Payroll accounts verified'],
    relatedDocuments: ['operating_expense_breakdowns.xlsx'],
    timeline: 'Runway verified at 24 months. Audit date: 2026-06-30.'
  },
  {
    id: 'n-funding',
    title: 'Series A raising',
    type: 'Finance',
    riskLevel: 'Medium',
    confidence: '88%',
    description: 'Series A funding round target. Currently raising $5.5M at a target pre-money valuation of $20M.',
    connectedNodes: [
      { id: 'n-company', relation: 'RAISING_BY', name: 'HelixBio AI' },
      { id: 'n-investor', relation: 'LEAD_INVESTOR', name: 'Prime Ventures' }
    ],
    evidence: ['Term sheet details parsed', 'Lead terms verified'],
    relatedDocuments: ['series_a_term_sheet.pdf'],
    timeline: 'Funding round checked: 2026-06-28.'
  },
  {
    id: 'n-investor',
    title: 'Prime Ventures',
    type: 'Investor',
    riskLevel: 'Low',
    confidence: '95%',
    description: 'Tier-1 venture capital firm specializing in deep tech and biotech therapeutics.',
    connectedNodes: [
      { id: 'n-funding', relation: 'LEADS_ROUND', name: 'Series A raising' }
    ],
    evidence: ['Securities filings verified', 'Prior portfolio exits match reputation ratings'],
    relatedDocuments: ['prime_ventures_profile.pdf'],
    timeline: 'Diligence checked: 2026-06-28.'
  },
  {
    id: 'n-market',
    title: '$45B TAM',
    type: 'Market',
    riskLevel: 'Low',
    confidence: '85%',
    description: 'Estimated addressable market for automated protein folding and pharmaceutical discovery pipelines.',
    connectedNodes: [
      { id: 'n-company', relation: 'TARGETED_BY', name: 'HelixBio AI' },
      { id: 'n-comp1', relation: 'COMPETITOR', name: 'BioSim Corp' },
      { id: 'n-comp2', relation: 'COMPETITOR', name: 'FoldingWorks' }
    ],
    evidence: ['Market sizing surveys parsed', 'CAGR curves validated: 18.2%'],
    relatedDocuments: ['personal_medicine_forecast_2026.pdf'],
    timeline: 'Market analysis date: 2026-06-29.'
  },
  {
    id: 'n-comp1',
    title: 'BioSim Corp',
    type: 'Market',
    riskLevel: 'Medium',
    confidence: '80%',
    description: 'Rival venture offering standard cloud molecular simulation services. Product is less optimized for sequence transformers.',
    connectedNodes: [
      { id: 'n-market', relation: 'COMPETES_IN', name: '$45B TAM' }
    ],
    evidence: ['Competitive pitch deck parsed', 'Customer comparisons mapped'],
    relatedDocuments: ['biosim_competitor_profile.pdf'],
    timeline: 'Competitor checked: 2026-06-29.'
  },
  {
    id: 'n-comp2',
    title: 'FoldingWorks',
    type: 'Market',
    riskLevel: 'Low',
    confidence: '86%',
    description: 'Open source protein database aggregator. Represents indirect competitive threat but lacks lab synthesis integration.',
    connectedNodes: [
      { id: 'n-market', relation: 'COMPETES_IN', name: '$45B TAM' }
    ],
    evidence: ['GitHub repository traffic audited'],
    relatedDocuments: ['foldingworks_market_eval.pdf'],
    timeline: 'Competitor checked: 2026-06-29.'
  },
  {
    id: 'n-legal',
    title: 'FDA Compliance Audit',
    type: 'Legal',
    riskLevel: 'High',
    confidence: '96%',
    description: 'Clinical trial regulatory compliance reviews required before molecular designs can navigate therapeutic pipelines.',
    connectedNodes: [
      { id: 'n-company', relation: 'REGULATED_BY', name: 'HelixBio AI' }
    ],
    evidence: ['Regulatory compliance filings checked', 'Security clearance audit passed'],
    relatedDocuments: ['fda_preclinical_guide.pdf', 'soc2_compliance_audit.pdf'],
    timeline: 'Compliance checked: 2026-06-22. Flag: REGULATORY RISK HIGH.'
  },
  {
    id: 'n-partner',
    title: 'Pfizer Pilot',
    type: 'Investor',
    riskLevel: 'Low',
    confidence: '91%',
    description: 'Pre-clinical contract pilot for targeted cancer therapeutic sequences.',
    connectedNodes: [
      { id: 'n-company', relation: 'PARTNER_WITH', name: 'HelixBio AI' }
    ],
    evidence: ['Signed Master Service Agreement (MSA) verified', 'Milestone schedules mapped'],
    relatedDocuments: ['pfizer_statement_of_work.pdf'],
    timeline: 'Partnership checked: 2026-06-29.'
  },
  {
    id: 'n-doc',
    title: 'Diligence Audit sheet',
    type: 'Document',
    riskLevel: 'Low',
    confidence: '99%',
    description: 'Completed diligence files compile including all telemetry reports and validation checks.',
    connectedNodes: [
      { id: 'n-founder', relation: 'REVIEWS', name: 'Dr. Evelyn Zhang' }
    ],
    evidence: ['Document signed and locked'],
    relatedDocuments: ['audit_final_bundle.pdf'],
    timeline: 'Diligence report locked: 2026-07-02.'
  },
  {
    id: 'n-decision',
    title: 'Diligence Verdict',
    type: 'Legal',
    riskLevel: 'Low',
    confidence: '98%',
    description: 'Diligence analysis completed. Committee decision: APPROVED for investment allocation.',
    connectedNodes: [
      { id: 'n-company', relation: 'RECOMMENDS', name: 'HelixBio AI' }
    ],
    evidence: ['Final scorecard criteria checked: score 88/100', 'Runway risk tier: Approved'],
    relatedDocuments: ['investment_committee_minutes.pdf'],
    timeline: 'Verdict signed: 2026-07-02.'
  }
];

export const mockGraphRelationships: GraphRelationship[] = [
  {
    id: 'e-founder1',
    source: 'n-founder',
    target: 'n-company',
    type: 'FOUNDER_OF',
    confidence: '99%',
    reason: 'Verified through corporate filings and SEC disclosures.'
  },
  {
    id: 'e-founder2',
    source: 'n-cofounder',
    target: 'n-company',
    type: 'FOUNDER_OF',
    confidence: '98%',
    reason: 'Verified via articles of incorporation and seed allocation spreadsheets.'
  },
  {
    id: 'e-news',
    source: 'n-news',
    target: 'n-founder',
    type: 'FEATURES',
    confidence: '92%',
    reason: 'Nature Editorial staff profile index verified.'
  },
  {
    id: 'e-doc',
    source: 'n-doc',
    target: 'n-founder',
    type: 'REVIEWS',
    confidence: '99%',
    reason: 'Digital signature matches verification check tags.'
  },
  {
    id: 'e-tech',
    source: 'n-company',
    target: 'n-tech',
    type: 'DEVELOPED',
    confidence: '94%',
    reason: 'Inhouse code repository ownership confirmed.'
  },
  {
    id: 'e-product',
    source: 'n-tech',
    target: 'n-product',
    type: 'POWERED_BY',
    confidence: '93%',
    reason: 'API routing logs access sequence models directly.'
  },
  {
    id: 'e-github',
    source: 'n-tech',
    target: 'n-github',
    type: 'SOURCE_CODE',
    confidence: '95%',
    reason: 'Git origin links match technical architectures.'
  },
  {
    id: 'e-patent',
    source: 'n-tech',
    target: 'n-patent',
    type: 'PATENTED_BY',
    confidence: '99%',
    reason: 'USPTO database validation: registered patents assigned to startup.'
  },
  {
    id: 'e-revenue',
    source: 'n-company',
    target: 'n-revenue',
    type: 'GENERATES',
    confidence: '94%',
    reason: 'Audited contract ledger confirms revenue.'
  },
  {
    id: 'e-burn',
    source: 'n-company',
    target: 'n-burn',
    type: 'HAS_BURN',
    confidence: '93%',
    reason: 'Computed operational invoices and compute billing records.'
  },
  {
    id: 'e-funding',
    source: 'n-company',
    target: 'n-funding',
    type: 'RAISING',
    confidence: '88%',
    reason: 'Term sheets and VC investor presentations verified.'
  },
  {
    id: 'e-investor',
    source: 'n-funding',
    target: 'n-investor',
    type: 'LEAD_BY',
    confidence: '95%',
    reason: 'Signed Lead Investor Agreement verified.'
  },
  {
    id: 'e-market',
    source: 'n-company',
    target: 'n-market',
    type: 'TARGETS',
    confidence: '85%',
    reason: 'Pitch disclosures match addressable biosimulation benchmarks.'
  },
  {
    id: 'e-comp1',
    source: 'n-market',
    target: 'n-comp1',
    type: 'CONTAINS',
    confidence: '80%',
    reason: 'Rival provides standard SaaS tool mapping similar sequence databases.'
  },
  {
    id: 'e-comp2',
    source: 'n-market',
    target: 'n-comp2',
    type: 'CONTAINS',
    confidence: '86%',
    reason: 'Open source portal hosts public folding datasets.'
  },
  {
    id: 'e-legal',
    source: 'n-company',
    target: 'n-legal',
    type: 'SUBJECT_TO',
    confidence: '96%',
    reason: 'FDA preclinical filing guidelines check matches Biotech therapeutics.'
  },
  {
    id: 'e-partner',
    source: 'n-company',
    target: 'n-partner',
    type: 'PARTNERED_WITH',
    confidence: '91%',
    reason: 'Signed statements of work and pilot retainers verified.'
  },
  {
    id: 'e-decision',
    source: 'n-company',
    target: 'n-decision',
    type: 'EVALUATED_AS',
    confidence: '98%',
    reason: 'Diligence scores exceed thresholds; committee signed authorization.'
  }
];
