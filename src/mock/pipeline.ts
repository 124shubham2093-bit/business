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

export const pipelineSteps: PipelineStepConfig[] = [
  {
    id: 'step-1',
    name: 'Preparing Investigation',
    agent: 'Setup Agent',
    agentStatus: 'Initializing telemetry...',
    agentOutput: 'Diligence logs configured.',
    confidence: 99,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Initializing InvestIQ telemetry logs...',
      '> Checking host diagnostics: 100% OK.',
      '> Audit container status: ONLINE',
      '> Security authorization token verified.'
    ]
  },
  {
    id: 'step-2',
    name: 'Reading Pitch Deck',
    agent: 'Document Analyst',
    agentStatus: 'Parsing PDF layout...',
    agentOutput: 'Extracted executive summaries.',
    confidence: 92,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Loading uploaded pitch deck documents...',
      '> Running layout analysis OCR scan...',
      '> Mapping text content blocks to pitch parameters...',
      '> Pitch deck verified: 16 slides successfully mapped.'
    ]
  },
  {
    id: 'step-3',
    name: 'Reading Financial Statements',
    agent: 'Financial Auditor',
    agentStatus: 'Reading balance sheet...',
    agentOutput: 'Calculated ARR and annual burn rates.',
    confidence: 95,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Auditing corporate cash balances and ledger entries...',
      '> Matching runway claims against bank declarations...',
      '> Financial revenue trends mapped. CAGR: 34% detected.',
      '> Runway calculated: 18 months.'
    ]
  },
  {
    id: 'step-4',
    name: 'Investigating Founders',
    agent: 'Founder Investigator',
    agentStatus: 'Analyzing LinkedIn & Crunchbase...',
    agentOutput: 'Founder credential indexes verified.',
    confidence: 94,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Verifying founder biographical listings and profile links...',
      '> Searching database of academic publications...',
      '> Prior exits: verified 2 successful tech ventures.',
      '> Technical pedigree (Stanford Computer Science) confirmed.'
    ]
  },
  {
    id: 'step-5',
    name: 'Analyzing Technology',
    agent: 'Technical Auditor',
    agentStatus: 'Inspecting architectural stack...',
    agentOutput: 'Technical complexity score calculated.',
    confidence: 89,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Assessing machine learning stack capabilities...',
      '> Analyzing server inference bottlenecks and storage paths...',
      '> GPU container efficiency rated at 88%.',
      '> Patent applications match core algorithmic designs.'
    ]
  },
  {
    id: 'step-6',
    name: 'Checking GitHub',
    agent: 'Code Inspector',
    agentStatus: 'Querying repository metadata...',
    agentOutput: 'Public repository verification evaluated.',
    confidence: 85,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Querying GitHub API for repository metadata...',
      '> Checking public visibility and active repository status...',
      '> Inspecting primary language and topic tags...',
      '> Repository metadata evaluated.'
    ]
  },
  {
    id: 'step-7',
    name: 'Market Analysis',
    agent: 'Market Research Agent',
    agentStatus: 'Sizing market TAM indices...',
    agentOutput: 'TAM opportunity score calculated.',
    confidence: 88,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Fetching macro-economic database entries for tech sectors...',
      '> Estimating Total Addressable Market (TAM): $4.2B.',
      '> Market CAGR validated: 18.2% stable outlook.'
    ]
  },
  {
    id: 'step-8',
    name: 'Competition Analysis',
    agent: 'Competitive Intelligence Agent',
    agentStatus: 'Mapping market competitors...',
    agentOutput: 'Identified 4 secondary market entrants.',
    confidence: 86,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Scouting direct and secondary market competitors...',
      '> Competitor "HealthFlow AI" identified.',
      '> Product differentiation index assessed: High.'
    ]
  },
  {
    id: 'step-9',
    name: 'Financial Analysis',
    agent: 'Financial Auditor',
    agentStatus: 'Auditing capital efficiency...',
    agentOutput: 'Financial health rating calculated.',
    confidence: 93,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Simulating monthly cash burn trajectories...',
      '> Gross profit margin validated: 78%.',
      '> Debt obligations: none.'
    ]
  },
  {
    id: 'step-10',
    name: 'Legal Review',
    agent: 'Legal & Compliance Agent',
    agentStatus: 'Inspecting corporate filings...',
    agentOutput: 'Legal compliance score calculated.',
    confidence: 96,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Scanning corporate state registrations and articles...',
      '> SOC-2 Type II certificate validated.',
      '> Patent IP filings matched: 3 approved utility patents.'
    ]
  },
  {
    id: 'step-11',
    name: 'Building Investigation Knowledge Graph',
    agent: 'Knowledge Engineer',
    agentStatus: 'Injecting semantic nodes...',
    agentOutput: 'Entities and relationships mapped.',
    confidence: 94,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Constructing semantic network curves...',
      '> Mapping 42 nodes and 188 context linkages...',
      '> Knowledge Graph built successfully via Cognee.'
    ]
  },
  {
    id: 'step-12',
    name: 'Cross Referencing Evidence',
    agent: 'Audit Committee Agent',
    agentStatus: 'Verifying cross-checks...',
    agentOutput: 'Anomalies and warning checks clear.',
    confidence: 92,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Cross-referencing pitch metrics against ledger receipts...',
      '> No material accounting disclosures found.',
      '> Verification check: complete.'
    ]
  },
  {
    id: 'step-13',
    name: 'Generating Final Report',
    agent: 'Report Compiler',
    agentStatus: 'Writing PDF diligence report...',
    agentOutput: 'Report compiled successfully.',
    confidence: 98,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Writing executive summary files...',
      '> Compiling section metrics and charts...',
      '> Final due diligence report compiled.'
    ]
  },
  {
    id: 'step-14',
    name: 'Preparing Executive Summary',
    agent: 'Executive Summary Compiler',
    agentStatus: 'Finalizing investor summary...',
    agentOutput: 'Summary card compiled.',
    confidence: 97,
    memoryStatus: 'Connected (Mock)',
    logs: [
      '> Preparing final investor summary dashboard layout...',
      '> Core recommendation set.',
      '> Summary cards ready.'
    ]
  }
];
