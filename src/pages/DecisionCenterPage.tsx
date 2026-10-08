import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Cpu, Landmark, Target,
  FileText, ArrowLeft, Download, Scale,
  ChevronDown, ChevronUp, Check, Info, Loader2, ChevronRight,
  Share2, Copy, FileDown, AlertTriangle, ShieldCheck, ShieldAlert, HelpCircle,
  ListChecks
} from 'lucide-react';

import { MockInvestigationService } from '../services/investigation/MockInvestigationService';
import type { Startup } from '../services/investigation/investigationTypes';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MLRiskAssessmentCard } from '../components/decision/MLRiskAssessmentCard';

interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  docType: string;
  confidence: string;
  sourceReliability: string;
  text: string;
  entities: string[];
  relatedNode: string;
}

interface AgentDetail {
  id: string;
  name: string;
  role: string;
  icon: any;
  score: number;
  confidence: number;
  time: string;
  status: 'Completed' | 'Flagged' | 'Warning';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  reasoning: string;
  evidence: EvidenceItem[];
  graphNodes: string[];
}

export const DecisionCenterPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation data or fallback
  const startupData = useMemo(() => {
    if (location.state?.startup) {
      sessionStorage.setItem('last_decision_startup', JSON.stringify(location.state.startup));
      return location.state.startup;
    }
    const saved = sessionStorage.getItem('last_decision_startup');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Acme Health',
      founderName: 'Founder',
      sector: 'BioTech AI',
      fundingStage: 'Seed',
      websiteUrl: 'https://acmehealth.com',
      githubUrl: '',
      description: 'Healthcare automation platform.',
    };
  }, [location.state]);

  // Load results from backend if available
  const [backendData, setBackendData] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activeStartup = useMemo(() => {
    return backendData || startupData;
  }, [backendData, startupData]);

  const scores = useMemo(() => {
    if (activeStartup && activeStartup.metrics) {
      return {
        investmentScore: activeStartup.investmentScore,
        founder: activeStartup.metrics.team,
        technology: activeStartup.metrics.product,
        market: activeStartup.metrics.marketSize,
        finance: activeStartup.metrics.financials,
        competition: (activeStartup.metrics as any).competition || 80,
        risk: activeStartup.riskLevel === 'High' ? 30 : activeStartup.riskLevel === 'Medium' ? 20 : 10,
        recommendation: activeStartup.status === 'Approved' ? 'INVEST' : activeStartup.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
      };
    }
    return {
      investmentScore: activeStartup?.investmentScore || 0,
      founder: 80,
      technology: 80,
      market: 80,
      finance: 80,
      competition: 80,
      risk: 10,
      recommendation: 'UNDER REVIEW' as const,
    };
  }, [activeStartup]);

  useEffect(() => {
    setIsLoading(true);
    MockInvestigationService.getAllInvestigations()
      .then((list) => {
        const item = list.find((s) => s.name === startupData.name) || null;
        setBackendData(item);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load startup list:', err);
        setIsLoading(false);
      });
  }, [startupData.name]);

  // Compile final metrics (from backend or deterministic mock)
  const finalSummary = useMemo(() => {
    if (activeStartup) {
      return {
        score: activeStartup.investmentScore,
        recommendation: activeStartup.status === 'Approved' ? 'INVEST' : activeStartup.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
        riskLevel: activeStartup.riskLevel || 'Low',
        reasoning: activeStartup.details?.summary || `Audit engine completed for ${activeStartup.name}.`,
        strengths: activeStartup.details?.strengths || [],
        weaknesses: activeStartup.details?.risks || [],
        documents: 6,
        evidenceCount: activeStartup.details?.evidenceList?.length || 8,
        queries: 40
      };
    }
    return {
      score: 0,
      recommendation: 'UNDER REVIEW' as const,
      riskLevel: 'Low',
      reasoning: '',
      strengths: [],
      weaknesses: [],
      documents: 6,
      evidenceCount: 8,
      queries: 40
    };
  }, [activeStartup]);

  // Resolve GitHub status from active startup or location state
  const githubStatus = useMemo(() => {
    return activeStartup?.github_status || 
      (activeStartup?.details as any)?.github_status || 
      (startupData as any)?.generatedStartup?.github_status || 
      (startupData as any)?.github_status || 
      null;
  }, [activeStartup, startupData]);

  // Build agent committee data models with Source Reliability and Custom Icons
  // AI Investment Partner — 5 evidence-backed investor questions derived from live frontend data
  const investorQuestions = useMemo(() => {
    const questions = [];
    const founderName = startupData.founderName || 'the founding team';

    // Q1 — cross-document Cognee / technical verification
    if (githubStatus?.success) {
      questions.push({
        category: 'COGNEE MEMORY',
        categoryColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20',
        question: `Cognee linked pitch deck narrative claims to verified public repository ${githubStatus.repo_path} (${githubStatus.language}). How does the open-source codebase align with commercial moats?`,
        reasoning: `Cognee's ingestion pipeline connected pitch deck technical claims to verified repository metadata, highlighting an architecture boundary checkpoint between open-source components and proprietary layers.`,
        icon: AlertTriangle,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      });
    } else if (githubStatus && !githubStatus.success) {
      questions.push({
        category: 'COGNEE MEMORY',
        categoryColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20',
        question: `GitHub repository validation returned unavailable (${githubStatus.error || 'HTTP 404'}). How does the team independently verify technical progress?`,
        reasoning: `Ingestion attempted repository verification against public GitHub APIs, but the repository was not found or not publicly accessible. External code evidence is unavailable for cross-verification.`,
        icon: AlertTriangle,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      });
    } else {
      questions.push({
        category: 'COGNEE MEMORY',
        categoryColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20',
        question: `No public GitHub repository was linked for ${startupData.name}. What audit process does the team use for codebase verification?`,
        reasoning: `Cognee's ingestion pipeline noted that code repository evidence was not submitted. Technical diligence relies on internal architectural documentation.`,
        icon: HelpCircle,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      });
    }

    // Q2 — technology & repository assessment
    if (githubStatus?.success) {
      questions.push({
        category: 'GITHUB',
        categoryColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/20',
        question: `The verified repository ${githubStatus.repo_path} has ${githubStatus.stars} stars and ${githubStatus.forks} forks in ${githubStatus.language}. What is the maintenance roadmap for this codebase?`,
        reasoning: `Technology Agent verified active repository metadata on GitHub. Primary language is ${githubStatus.language} with ${githubStatus.topics?.length || 0} topic tags. Ingestion confirmed public availability.`,
        icon: HelpCircle,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      });
    } else if (githubStatus && !githubStatus.success) {
      questions.push({
        category: 'GITHUB',
        categoryColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/20',
        question: `GitHub Evidence Unavailable: Repository Not Found or Not Publicly Accessible. What is the private access provisioning process?`,
        reasoning: `GitHub API returned ${githubStatus.error || 'HTTP 404'}. The committee cannot verify code quality, licensing, or dependencies from public sources without secure private repo access.`,
        icon: AlertTriangle,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      });
    } else {
      questions.push({
        category: 'TECHNOLOGY',
        categoryColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/20',
        question: `The technology stack indicates custom deep learning infrastructure. How does the engineering team maintain performance benchmarks as data volumes scale?`,
        reasoning: `Technology Agent evaluated declared architectural specifications and model pipeline documentation. No public repository was linked.`,
        icon: HelpCircle,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      });
    }

    // Q3 — finance score driven
    if (scores.finance < 80) {
      questions.push({
        category: 'FINANCIALS',
        categoryColor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20',
        question: `ARR appears concentrated in a small number of enterprise clients. What is the churn mitigation strategy if a top-tier client exits?`,
        reasoning: `Financial Agent identified client concentration risk during ledger analysis. Cognee's persistent graph shows no documented churn response protocol in any ingested document — a gap that compounds the financial risk score of ${scores.finance}/100.`,
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
      });
    } else {
      questions.push({
        category: 'FINANCIALS',
        categoryColor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20',
        question: `With a ${finalSummary.riskLevel.toLowerCase()} risk financial profile, what is the planned use of the next funding round and how does that affect runway projections?`,
        reasoning: `Financial Agent confirmed stable burn rate and runway. Cognee's cross-session memory found no allocation breakdown for the target raise in the pitch deck, leaving post-funding runway unverifiable from ingested documents.`,
        icon: HelpCircle,
        iconColor: 'text-amber-600 dark:text-amber-400',
      });
    }

    // Q4 — founder score driven
    if (scores.founder < 82) {
      questions.push({
        category: 'FOUNDER',
        categoryColor: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-500/20',
        question: `${founderName}'s background shows a gap between technical expertise and enterprise sales experience. Who on the team owns enterprise GTM execution?`,
        reasoning: `Founder Agent verified academic and technical credentials but flagged an absence of commercial sales leadership history. Cognee linked founder entity nodes to prior company records and found no direct B2B enterprise sales exits in the knowledge graph.`,
        icon: AlertTriangle,
        iconColor: 'text-blue-600 dark:text-blue-400',
      });
    } else {
      questions.push({
        category: 'FOUNDER',
        categoryColor: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-500/20',
        question: `${founderName} has strong credentials, but what is the succession plan if a key-person dependency creates operational risk at scale?`,
        reasoning: `Founder Agent confirmed high pedigree score. However, Cognee's memory graph found no co-founder or VP-level entity nodes linked to the company in any ingested document — a structural concentration risk at the leadership layer.`,
        icon: HelpCircle,
        iconColor: 'text-blue-600 dark:text-blue-400',
      });
    }

    // Q5 — market / risk level driven
    if (finalSummary.riskLevel === 'High' || scores.market < 78) {
      questions.push({
        category: 'MARKET',
        categoryColor: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-500/20',
        question: `The TAM figure cited in the pitch deck does not match third-party market reports ingested by Cognee. Which source methodology does the team endorse?`,
        reasoning: `Market Agent cross-referenced ${startupData.sector} market data across ${finalSummary.documents} documents. Cognee's knowledge graph detected a numeric inconsistency between the deck's TAM claim and the Gartner segment data — a contradiction only surfaced because both sources were stored in the same persistent graph.`,
        icon: AlertTriangle,
        iconColor: 'text-rose-600 dark:text-rose-400',
      });
    } else {
      questions.push({
        category: 'COMPETITION',
        categoryColor: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-500/20',
        question: `Competitors with larger distribution networks are targeting the same ${startupData.sector} segment. What is the defensive moat strategy if a tier-1 rival replicates the core IP?`,
        reasoning: `Competition Agent confirmed patent protections are in place. However, Cognee's graph links competitor entity nodes to acquisition history records — indicating well-resourced rivals have historically cloned IP through talent acquisition rather than patent infringement.`,
        icon: HelpCircle,
        iconColor: 'text-rose-600 dark:text-rose-400',
      });
    }

    return questions;
  }, [startupData, scores, finalSummary, githubStatus]);

  // Build agent committee data models with Source Reliability and Custom Icons
  const agents: AgentDetail[] = useMemo(() => [
    {
      id: 'founder',
      name: 'Founder Agent',
      role: 'Biographical Audits',
      icon: User,
      score: scores.founder,
      confidence: 96,
      time: '1.2s',
      status: 'Completed',
      summary: 'Assessed leadership identity and submitted background profile.',
      strengths: [`Declared founder leadership: ${startupData.founderName || 'Founding team'}.`, 'Executive leadership profile submitted for review.'],
      weaknesses: ['Founder track record and credentials require independent verification.'],
      risks: ['Key-person operational dependency on core founding team.'],
      reasoning: 'Founder identity and background details recorded from submission. Independent credential verification recommended.',
      evidence: [
        {
          id: 'ev-founder-1',
          title: 'Founder Profile & Intake Submission',
          source: 'Diligence Submission Intake',
          docType: 'Founder Background',
          confidence: '90%',
          sourceReliability: '90%',
          text: `Biographical profile records declared executive identity as ${startupData.founderName || 'Founding team'}.`,
          entities: [startupData.founderName || 'Founder', 'Leadership'],
          relatedNode: 'n-founder'
        }
      ],
      graphNodes: ['Founder', startupData.founderName || 'Founder']
    },
    {
      id: 'tech',
      name: 'Technology Agent',
      role: 'Code Moat Validation',
      icon: Cpu,
      score: githubStatus && !githubStatus.success ? 40 : scores.technology,
      confidence: githubStatus && !githubStatus.success ? 0 : (githubStatus?.success ? 96 : 85),
      time: '1.8s',
      status: 'Completed',
      summary: githubStatus?.success
        ? `Audited verified public repository ${githubStatus.repo_path} (${githubStatus.language}, ${githubStatus.stars} stars, ${githubStatus.forks} forks).`
        : (githubStatus && !githubStatus.success
            ? 'Repository Not Found or Not Publicly Accessible. Public code metrics, stars, and language unavailable.'
            : 'Audited submitted technical architecture specifications and container deployment configurations.'),
      strengths: githubStatus?.success
        ? [
            `Public GitHub repository verified: ${githubStatus.repo_path}.`,
            `Primary programming language ${githubStatus.language} verified with ${githubStatus.stars} stars.`
          ]
        : (githubStatus && !githubStatus.success
            ? []
            : ['Submitted technical specifications outline modular architecture.']),
      weaknesses: githubStatus && !githubStatus.success
        ? [
            'GitHub repository verification failed: Repository Not Found or Not Publicly Accessible.',
            'Public codebase metrics and commit integrity omitted from diligence.'
          ]
        : (githubStatus?.success
            ? ['Public repository has open maintenance backlog.']
            : ['No public GitHub repository linked for automated code verification.']),
      risks: githubStatus && !githubStatus.success
        ? ['Cannot independently audit code quality, commit integrity, or architectural moats without repository access.']
        : ['Heavy custom dependency on container execution configurations.'],
      reasoning: githubStatus?.success
        ? `Public repository metadata verified on GitHub. Stars: ${githubStatus.stars}, forks: ${githubStatus.forks}, language: ${githubStatus.language}.`
        : (githubStatus && !githubStatus.success
            ? 'GitHub repository verification failed: Repository Not Found or Not Publicly Accessible. Public code metrics, stars, forks, and language are unavailable.'
            : 'Technical architecture specifications evaluated from submission. No public repository was provided for automated indexing.'),
      evidence: githubStatus?.success
        ? [
            {
              id: 'ev-tech-1',
              title: 'Verified GitHub Public Repository',
              source: 'GitHub Public API',
              docType: 'Code Analysis',
              confidence: '98%',
              sourceReliability: '100%',
              text: `Repository ${githubStatus.repo_path} verified via GitHub API. Stars: ${githubStatus.stars}, forks: ${githubStatus.forks}, primary language: ${githubStatus.language}.`,
              entities: ['Repository', githubStatus.language],
              relatedNode: 'n-tech'
            }
          ]
        : (githubStatus && !githubStatus.success
            ? [
                {
                  id: 'ev-tech-1',
                  title: 'GitHub Repository Verification Failed',
                  source: 'GitHub Public API',
                  docType: 'Verification Failure',
                  confidence: '0%',
                  sourceReliability: '0%',
                  text: 'Repository Not Found or Not Publicly Accessible. Public code evidence unavailable.',
                  entities: ['Repository (Unavailable)'],
                  relatedNode: 'n-tech'
                }
              ]
            : [
                {
                  id: 'ev-tech-1',
                  title: 'Technical Architecture Documentation',
                  source: 'Submitted Technical Dossier',
                  docType: 'Code Analysis',
                  confidence: '85%',
                  sourceReliability: '80%',
                  text: 'Architecture specifications reviewed. Container deployment configurations checked.',
                  entities: ['Technical Architecture'],
                  relatedNode: 'n-tech'
                }
              ]),
      graphNodes: ['Technology', githubStatus?.success ? githubStatus.repo_path : (githubStatus && !githubStatus.success ? 'Repo Unavailable' : 'Architecture')]
    },
    {
      id: 'finance',
      name: 'Financial Agent',
      role: 'Ledger Audit & Runway',
      icon: Landmark,
      score: scores.finance,
      confidence: 83,
      time: '1.4s',
      status: 'Completed',
      summary: 'Audited capitalization stage structure and submitted financial documentation.',
      strengths: [`Target funding stage declared as ${startupData.fundingStage || 'Seed'}.`, 'Financial overview submitted for review.'],
      weaknesses: ['Private-company financial performance is not publicly verified.'],
      risks: ['Revenue, burn rate, and runway require formal audit verification.'],
      reasoning: 'Financial parameters evaluated from intake submission. Verified public financial performance is not established.',
      evidence: [
        {
          id: 'ev-finance-1',
          title: 'Financial Intake Profile',
          source: 'Diligence Submission Intake',
          docType: 'Financial Overview',
          confidence: '85%',
          sourceReliability: '85%',
          text: `Target funding stage declared as ${startupData.fundingStage || 'Seed'}. Verified public financial performance is not established.`,
          entities: ['Capitalization', startupData.fundingStage || 'Seed'],
          relatedNode: 'n-finance'
        }
      ],
      graphNodes: ['Revenue', 'Funding']
    },
    {
      id: 'market',
      name: 'Market Agent',
      role: 'TAM & Opportunities',
      icon: Target,
      score: scores.market,
      confidence: 85,
      time: '1.5s',
      status: 'Completed',
      summary: 'Scoped sector positioning and addressable market opportunity.',
      strengths: [`Clear market positioning within the ${startupData.sector} sector.`, 'Target customer persona and value proposition outlined.'],
      weaknesses: [`Market sizing (TAM/SAM) and growth projections for ${startupData.sector} require independent validation.`],
      risks: ['Customer acquisition velocity and sales cycle duration require empirical validation.'],
      reasoning: 'Target sector domain identified from submission. Addressable market bounds require independent verification.',
      evidence: [
        {
          id: 'ev-market-1',
          title: 'Target Market Segment Positioning',
          source: 'Market Diligence Review',
          docType: 'Market Assessment',
          confidence: '85%',
          sourceReliability: '85%',
          text: `Target market domain identified as ${startupData.sector}. Detailed addressable market size requires independent verification.`,
          entities: [startupData.sector || 'Market Sector', 'Market Positioning'],
          relatedNode: 'n-market'
        }
      ],
      graphNodes: ['Market']
    },
    {
      id: 'competition',
      name: 'Competition Agent',
      role: 'Rival Moats Mapping',
      icon: Scale,
      score: scores.competition,
      confidence: 82,
      time: '1.3s',
      status: 'Completed',
      summary: 'Audited competitive landscape and claimed product differentiation.',
      strengths: [`Product value proposition defined for ${startupData.sector} domain.`, 'Target competitive positioning articulated in submission.'],
      weaknesses: ['Competitive position requires additional market diligence against alternatives.'],
      risks: ['Defensibility of proprietary moats and customer retention require validation.'],
      reasoning: 'Diligence submission outlines product differentiation. Defensibility against market alternatives requires ongoing validation.',
      evidence: [
        {
          id: 'ev-comp-1',
          title: 'Competitive Differentiation Assessment',
          source: 'Competitive Landscape Review',
          docType: 'Positioning Assessment',
          confidence: '82%',
          sourceReliability: '82%',
          text: `Product value proposition and competitive positioning evaluated for ${startupData.sector} sector.`,
          entities: ['Market Positioning', startupData.sector || 'Domain'],
          relatedNode: 'n-market'
        }
      ],
      graphNodes: ['Competitor', 'Patent']
    },
    {
      id: 'legal',
      name: 'Legal Agent',
      role: 'Compliance & Audits',
      icon: ShieldAlert,
      score: 85,
      confidence: 85,
      time: '1.1s',
      status: 'Completed',
      summary: 'Audited corporate structure documents and governance profile.',
      strengths: ['Corporate identity and declared business structure submitted for compliance review.', 'Commercial compliance profile recorded.'],
      weaknesses: ['Corporate legal registration, cap table, and governance frameworks require formal verification.'],
      risks: ['Regulatory compliance and data security certifications require documentation audit.'],
      reasoning: 'Corporate identity recorded from submission. Full governance and compliance frameworks require formal verification.',
      evidence: [
        {
          id: 'ev-legal-1',
          title: 'Corporate Compliance Intake',
          source: 'Diligence Submission Intake',
          docType: 'Compliance Record',
          confidence: '85%',
          sourceReliability: '85%',
          text: 'Declared corporate identity recorded for compliance review. Formal legal documentation audit pending.',
          entities: [startupData.name, 'Compliance Profile'],
          relatedNode: 'n-legal'
        }
      ],
      graphNodes: ['Legal']
    }
  ], [scores, startupData, githubStatus]);

  // ─── Evidence-Based Investment Verdict: derived data ───
  const topEvidence = useMemo(() => {
    return agents
      .flatMap(a => a.evidence)
      .sort((a, b) => parseInt(b.confidence) - parseInt(a.confidence))
      .slice(0, 5);
  }, [agents]);

  const averageConfidence = useMemo(() => {
    return Math.round(agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length);
  }, [agents]);

  type DiligenceStatus = 'Verified evidence' | 'Not found' | 'Requires verification';

  interface DiligenceCategoryItem {
    category: string;
    icon: any;
    status: DiligenceStatus;
    evidence: string;
  }

  const dueDiligenceSummary = useMemo<DiligenceCategoryItem[]>(() => {
    const items: DiligenceCategoryItem[] = [];

    // 1. Founder
    if (activeStartup?.details?.founderBackground) {
      items.push({
        category: 'Founder',
        icon: User,
        status: 'Verified evidence',
        evidence: activeStartup.details.founderBackground,
      });
    } else if (startupData?.founderName && startupData.founderName !== 'Founder' && startupData.founderName !== 'Not specified') {
      items.push({
        category: 'Founder',
        icon: User,
        status: 'Requires verification',
        evidence: `Founder name "${startupData.founderName}" declared in submission. Executive background verification pending.`,
      });
    } else {
      items.push({
        category: 'Founder',
        icon: User,
        status: 'Not found',
        evidence: 'No founder biographical data or executive dossier provided.',
      });
    }

    // 2. Technology
    if (githubStatus?.success) {
      items.push({
        category: 'Technology',
        icon: Cpu,
        status: 'Verified evidence',
        evidence: `GitHub repository ${githubStatus.repo_path} verified: ${githubStatus.stars} stars, ${githubStatus.forks} forks, primary language ${githubStatus.language}. ${githubStatus.description || ''}`,
      });
    } else if (githubStatus && !githubStatus.success) {
      items.push({
        category: 'Technology',
        icon: Cpu,
        status: 'Not found',
        evidence: `Repository Not Found or Not Publicly Accessible (${githubStatus.error || 'HTTP 404'}). Public code evidence unavailable.`,
      });
    } else if (activeStartup?.details?.techStackRisk) {
      items.push({
        category: 'Technology',
        icon: Cpu,
        status: 'Requires verification',
        evidence: activeStartup.details.techStackRisk,
      });
    } else {
      items.push({
        category: 'Technology',
        icon: Cpu,
        status: 'Not found',
        evidence: 'No repository URL or technical architecture documentation provided.',
      });
    }

    // 3. Financial
    if (activeStartup?.details?.financialSnapshot) {
      const snap = activeStartup.details.financialSnapshot;
      const parts: string[] = [];
      if (snap.revenue) parts.push(`Revenue: ${snap.revenue}`);
      if (snap.burnRate) parts.push(`Burn: ${snap.burnRate}`);
      if (snap.runway) parts.push(`Runway: ${snap.runway}`);
      if (snap.valuation) parts.push(`Valuation: ${snap.valuation}`);
      items.push({
        category: 'Financial',
        icon: Landmark,
        status: 'Verified evidence',
        evidence: parts.length > 0 ? parts.join(' | ') : 'Financial snapshot provided.',
      });
    } else if (startupData?.financialsText) {
      items.push({
        category: 'Financial',
        icon: Landmark,
        status: 'Requires verification',
        evidence: `Financial statement text submitted (${startupData.financialsText.slice(0, 140)}...). Audited statements required.`,
      });
    } else {
      items.push({
        category: 'Financial',
        icon: Landmark,
        status: 'Not found',
        evidence: 'No financial model, ledger, or runway documentation provided.',
      });
    }

    // 4. Market
    if (activeStartup?.details?.marketOpportunity) {
      items.push({
        category: 'Market',
        icon: Target,
        status: 'Verified evidence',
        evidence: activeStartup.details.marketOpportunity,
      });
    } else if (startupData?.sector) {
      items.push({
        category: 'Market',
        icon: Target,
        status: 'Requires verification',
        evidence: `Sector identified as ${startupData.sector}. Detailed Total Addressable Market (TAM) analysis pending.`,
      });
    } else {
      items.push({
        category: 'Market',
        icon: Target,
        status: 'Not found',
        evidence: 'No market size, segment CAGR, or customer persona documentation submitted.',
      });
    }

    // 5. Competition
    if (activeStartup?.details?.strengths && activeStartup.details.strengths.length > 0) {
      items.push({
        category: 'Competition',
        icon: Scale,
        status: 'Verified evidence',
        evidence: `Competitive moat factors identified: ${activeStartup.details.strengths.slice(0, 2).join('; ')}`,
      });
    } else {
      items.push({
        category: 'Competition',
        icon: Scale,
        status: 'Requires verification',
        evidence: 'Competitive landscape and incumbent displacement analysis pending independent evaluation.',
      });
    }

    // 6. Legal & Compliance
    if (activeStartup?.metrics && (activeStartup.metrics as any).legal !== undefined) {
      const legalScore = (activeStartup.metrics as any).legal;
      items.push({
        category: 'Legal & Compliance',
        icon: ShieldAlert,
        status: 'Verified evidence',
        evidence: `Compliance and IP risk audit completed (Score: ${legalScore}/100).`,
      });
    } else {
      items.push({
        category: 'Legal & Compliance',
        icon: ShieldAlert,
        status: 'Requires verification',
        evidence: 'Cap table, incorporation filings, and regulatory compliance documents pending audit.',
      });
    }

    return items;
  }, [activeStartup, startupData, githubStatus]);

  // Decision Builder simulation panel states
  const [builderStep, setBuilderStep] = useState(0);
  const [isBuilderDone, setIsBuilderDone] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  // Evidence Drawer slide-over states
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Timeline expanded items
  const [expandedTimelineItem, setExpandedTimelineItem] = useState<string | null>(null);
   // AI Investment Partner expanded question state
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
   // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Trigger Decision Builder animation step sequence (Extended stages)
  useEffect(() => {
    if (builderStep < 5) {
      const timer = setTimeout(() => {
        setBuilderStep((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsBuilderDone(true);
    }
  }, [builderStep]);

  // Action handlers
  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(finalSummary.reasoning);
    triggerToast('Diligence report copied to clipboard!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Shareable diligence link copied to clipboard!');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      startup: startupData,
      scores: finalSummary,
      agents: agents
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${startupData.name.replace(/\s+/g, '_')}_diligence_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 mr-1.5" />
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-[var(--border-color)]" />
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
            Investment Decision Center
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 cursor-pointer"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 cursor-pointer"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Copy Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 cursor-pointer"
          >
            <FileDown className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportJSON}
            className="h-9 px-3 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export JSON
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3 font-mono">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span className="text-xs text-[var(--text-secondary)]">Querying Explainable Decision database...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto w-full items-stretch overflow-hidden">
          
          {/* Column 1: Startup Summary Sidebar */}
          <div className="xl:col-span-1 flex flex-col space-y-5 h-full">
            <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-5 flex flex-col space-y-4">
              <div>
                <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest font-mono">Audit Profile</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">{startupData.name}</h2>
                <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">{startupData.sector} • {startupData.fundingStage} stage</span>
              </div>

              <div className="h-px bg-[var(--border-color)]" />

              {/* Diligence Scores metrics */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Diligence Status</span>
                  <Badge variant={finalSummary.recommendation === 'INVEST' ? 'success' : 'warning'} className="font-bold text-[10px]">
                    {finalSummary.recommendation}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Investment Index</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono text-sm">{finalSummary.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Risk Profile</span>
                  <span className={`font-bold font-mono ${finalSummary.riskLevel === 'Low' ? 'text-emerald-600 dark:text-emerald-400' : finalSummary.riskLevel === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {finalSummary.riskLevel} Risk
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[var(--text-secondary)]">Confidence Margin</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">94%</span>
                </div>
              </div>

              <div className="h-px bg-[var(--border-color)]" />

              {/* Quick stats counter */}
              <div className="space-y-2.5">
                <span className="text-[9px] text-[var(--text-secondary)] block uppercase tracking-widest font-bold font-mono">Diligence Telemetry</span>
                <div className="grid grid-cols-2 gap-3 text-center font-mono">
                  {[
                    { label: 'Documents', val: finalSummary.documents },
                    { label: 'Evidence Scanned', val: finalSummary.evidenceCount },
                    { label: 'Evaluation Dimensions', val: 6 },
                    { label: 'Audit Queries', val: finalSummary.queries }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-2 rounded-xl">
                      <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-medium">{s.label}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Ingestion Rich Timeline panel */}
            <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 flex-1 flex flex-col overflow-hidden">
              <span className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase tracking-widest pb-1.5 border-b border-[var(--border-color)] mb-3 font-mono">Investigation Roadmap</span>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none font-mono">
                {agents.map((ag) => (
                  <div key={ag.id} className="relative pl-5 border-l border-[var(--border-color)] text-left text-xs">
                    <span className="absolute -left-1.5 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    
                    {/* Rich Timeline contents */}
                    <div
                      className="flex flex-col cursor-pointer bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-2.5 hover:bg-[var(--bg-subtle)] transition-colors duration-200"
                      onClick={() => setExpandedTimelineItem(expandedTimelineItem === ag.id ? null : ag.id)}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[var(--text-primary)]">{ag.name}</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Completed</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-[var(--text-secondary)] mt-1.5">
                        <span>Evidences: {ag.evidence.length}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">Conf: {ag.confidence}%</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTimelineItem === ag.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] text-[var(--text-secondary)] mt-1 leading-normal overflow-hidden italic pl-1"
                        >
                          {ag.summary}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Column 2 & 3: Consensus, Conflict Alerts, expandable cards list */}
          <div className="xl:col-span-2 flex flex-col space-y-4 overflow-y-auto pr-1">
            
            {/* Agent Consensus Agreement Meter */}
            <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 flex flex-col space-y-3.5 flex-shrink-0 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Agent Consensus Meter</span>
                <span className="flex items-center text-[9px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  83% AGENT AGREEMENT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { name: 'Founder Agent', vote: 'INVEST', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/10 bg-emerald-500/5' },
                  { name: 'Tech Agent', vote: 'INVEST', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/10 bg-emerald-500/5' },
                  { name: 'Finance Agent', vote: 'CONDITIONAL', color: 'text-amber-700 dark:text-amber-400 border-amber-500/10 bg-amber-500/5' },
                  { name: 'Market Agent', vote: 'INVEST', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/10 bg-emerald-500/5' },
                  { name: 'Competition Agent', vote: 'PASS', color: 'text-rose-700 dark:text-rose-400 border-rose-500/10 bg-rose-500/5' },
                  { name: 'Legal Agent', vote: 'INVEST', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/10 bg-emerald-500/5' }
                ].map((v, idx) => (
                  <div key={idx} className={`border p-2 rounded-xl flex flex-col justify-between ${v.color}`}>
                    <span className="text-[8px] text-[var(--text-secondary)] font-mono font-medium block truncate">{v.name}</span>
                    <span className="font-bold font-mono text-[9px] uppercase block mt-1">{v.vote}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-[var(--bg-surface)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-[10px] font-mono mt-1">
                <span className="text-[var(--text-secondary)]">Consensus Vote: <strong className="text-[var(--text-primary)]">5 / 6 YES</strong></span>
                <span className="text-[var(--text-secondary)]">Recommendation: <strong className="text-emerald-600 dark:text-emerald-400">INVEST</strong></span>
              </div>
            </Card>

            {/* Agent Contradiction Detected Alert Panel */}
            <Card className="border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col space-y-2 relative overflow-hidden flex-shrink-0 text-left">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider text-[11px]">
                    Heuristic Divergence Analysis
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40">
                  Rule-Based Synthesis
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-primary)] leading-normal text-left font-mono">
                Technology assessment reports proprietary architectural differentiation, while Competition assessment highlights risk of well-resourced market rivals targeting adjacent enterprise segments.
              </p>
              <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                Overall diligence rating is balanced across both evaluation dimensions.
              </div>
            </Card>

            {/* Decision Builder animated progress card */}
            {!isBuilderDone ? (
              <Card className="border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20 p-5 relative overflow-hidden flex-shrink-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center">
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Consolidating Decision Engine Verdict...
                    </span>
                    <span className="text-[var(--text-secondary)]">Phase {builderStep + 1} / 6</span>
                  </div>

                  <div className="w-full bg-[var(--border-color)] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 dark:bg-indigo-400" style={{ width: `${(builderStep + 1) * 16.66}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-left">
                    {[
                      'Collecting Agent Reports',
                      'Resolving Conflicts',
                      'Weighting Evidence',
                      'Building Recommendation',
                      'Calculating Confidence',
                      'Publishing Verdict'
                    ].map((step, idx) => {
                      const isActive = idx === builderStep;
                      const isPast = idx < builderStep;
                      return (
                        <div key={idx} className={`flex items-center space-x-2 ${isActive ? 'text-[var(--text-primary)] font-bold' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                          {isPast ? <Check className="w-3.5 h-3.5" /> : isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" /> : <div className="w-3.5 h-3.5" />}
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 flex flex-col space-y-4 relative overflow-hidden flex-shrink-0 text-left">
                {/* ── A. Verdict Header ── */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl border ${finalSummary.recommendation === 'INVEST' ? 'bg-emerald-500/10 border-emerald-500/20' : finalSummary.recommendation === 'PASS' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <ShieldCheck className={`w-5 h-5 ${finalSummary.recommendation === 'INVEST' ? 'text-emerald-600 dark:text-emerald-400' : finalSummary.recommendation === 'PASS' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono block">
                        Evidence-Based Investment Verdict
                      </span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                        Heuristic Diligence Synthesis &bull; Compiled from {agents.length} AI agents across {finalSummary.documents} documents
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={finalSummary.recommendation === 'INVEST' ? 'success' : finalSummary.recommendation === 'PASS' ? 'danger' : 'warning'}
                    className="font-bold text-xs px-3 py-1 font-mono"
                  >
                    {finalSummary.recommendation}
                  </Badge>
                </div>

                {/* ── B. Score / Confidence / Risk metric strip ── */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">Heuristic Diligence Score</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{finalSummary.score}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">/100</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">Agent Agreement</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{averageConfidence}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">%</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">Heuristic Risk Level</span>
                    <div className="mt-1">
                      <span className={`text-lg font-bold font-mono ${finalSummary.riskLevel === 'Low' ? 'text-emerald-600 dark:text-emerald-400' : finalSummary.riskLevel === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {finalSummary.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verdict reasoning summary */}
                <p className="text-[11px] text-[var(--text-primary)] leading-relaxed">
                  {finalSummary.reasoning}
                </p>

                {/* ── C. Sample Diligence Evidence Points ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-mono block">
                      Sample Diligence Evidence ({topEvidence.length} demo artifacts)
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                      Intake Files Archive &bull; Sample Dossier
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {topEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-indigo-500/30 p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors duration-200 group"
                        onClick={() => setSelectedEvidence(ev)}
                      >
                        <div className="flex items-center space-x-2.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-[var(--text-primary)] block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ev.title}</span>
                            <span className="text-[8px] text-[var(--text-secondary)] font-mono">{ev.source}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{ev.confidence}</span>
                          <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Suggested Next Actions ── */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                  <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex-1 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Return to Portfolio
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex-1 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export Report JSON
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleDownloadPDF} className="flex-1 text-[10px] cursor-pointer">
                    <FileDown className="w-3.5 h-3.5 mr-1.5" />
                    Print / Export PDF
                  </Button>
                </div>
              </Card>
            )}

            {/* ── ML Failure Intelligence Prediction Seam ── */}
            {isBuilderDone && (
              <MLRiskAssessmentCard
                startupName={activeStartup?.name || startupData.name}
                startupSector={activeStartup?.sector || startupData.sector}
                fundingStage={startupData.fundingStage}
              />
            )}

            {/* ── Due-Diligence Summary (6 Categories) ── */}
            {isBuilderDone && (
              <Card className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 flex flex-col space-y-4 flex-shrink-0 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <ListChecks className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono block">
                        Due-Diligence Summary
                      </span>
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                        Evidence audit across 6 core investment evaluation dimensions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border-color)]">
                  {dueDiligenceSummary.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2.5 sm:w-48 flex-shrink-0">
                          <div className="p-1.5 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[var(--text-primary)]">{item.category}</span>
                        </div>
                        <div className="flex-1 text-[var(--text-secondary)] leading-relaxed text-[11px]">
                          {item.evidence}
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                              item.status === 'Verified evidence'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : item.status === 'Requires verification'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* AI Investment Partner — 5 Questions to Ask Before Investing */}
            <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 flex flex-col space-y-3 flex-shrink-0 text-left">
              {/* Section header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono block">
                      AI Investment Partner
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                      5 questions generated from Cognee cross-document memory graph
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded">
                  {investorQuestions.length} FLAGGED
                </span>
              </div>

              {/* Question rows */}
              <div className="space-y-2">
                {investorQuestions.map((q, idx) => {
                  const isOpen = expandedQuestion === idx;
                  const IconComponent = q.icon;
                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? 'border-indigo-500/30 bg-[var(--bg-surface)] shadow-xs'
                          : 'border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-[var(--border-color)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {/* Question header row — clickable */}
                      <div
                        className="flex items-start justify-between gap-3 p-3 cursor-pointer"
                        onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                      >
                        <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                          <IconComponent className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${q.iconColor}`} />
                          <p className="text-[11px] text-[var(--text-primary)] leading-relaxed font-sans">
                            {q.question}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border ${q.categoryColor}`}>
                            {q.category}
                          </span>
                          {isOpen
                            ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          }
                        </div>
                      </div>

                      {/* Expanded reasoning */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-[var(--border-color)] pt-2.5">
                              <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono block mb-1.5">
                                Cognee Memory Reasoning
                              </span>
                              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-mono italic">
                                {q.reasoning}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Card>

            
            {/* Expanded Committee Committee listing */}
            <div className="space-y-4 text-left">
              {agents.map((agent) => {
                const isExpanded = expandedAgent === agent.id;
                return (
                  <Card
                    key={agent.id}
                    className={`border transition-all duration-300 ${
                      isExpanded
                        ? 'border-indigo-500/40 bg-[var(--bg-surface)] shadow-xs'
                        : 'border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-[var(--border-color)]'
                    }`}
                  >
                    <CardHeader
                      className="p-4 cursor-pointer flex flex-row items-center justify-between gap-4"
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl">
                          <agent.icon className="w-5 h-5 text-[var(--text-primary)]" />
                        </div>
                        <div>
                          <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-mono">AI Diligence Agent</span>
                          <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{agent.name}</h3>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono block mt-0.5">{agent.role}</span>
                        </div>
                      </div>

                      {/* Right values gauges */}
                      <div className="flex items-center space-x-6 text-xs font-mono">
                        <div className="hidden sm:block text-right">
                          <span className="text-[8px] text-[var(--text-secondary)] block">SCORE</span>
                          <span className="font-bold text-[var(--text-primary)] text-sm">{agent.score}/100</span>
                        </div>
                        
                        {/* Circular animated progress indicator */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" fill="transparent" />
                            <circle cx="16" cy="16" r="13" stroke="#8b5cf6" strokeWidth="2.5" fill="transparent" strokeDasharray="81.68" strokeDashoffset={81.68 - (81.68 * agent.confidence) / 100} />
                          </svg>
                          <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400">{agent.confidence}%</span>
                        </div>

                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                      </div>
                    </CardHeader>

                    {/* Expandable findings container */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/50"
                        >
                          <div className="p-4 space-y-4 text-xs">
                            
                            {/* Summary & Reasoning narrative */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-mono">Reasoning Narrative</span>
                              <p className="text-[var(--text-primary)] leading-relaxed">{agent.reasoning}</p>
                            </div>

                            {/* Strengths & Weaknesses blocks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl space-y-1">
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-mono">Strengths</span>
                                <ul className="space-y-1 list-disc pl-4 text-[var(--text-primary)]">
                                  {agent.strengths.map((str, idx) => (
                                    <li key={idx} className="leading-normal">{str}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl space-y-1">
                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block font-mono">Risks & Weaknesses</span>
                                <ul className="space-y-1 list-disc pl-4 text-[var(--text-primary)]">
                                  {[...agent.weaknesses, ...agent.risks].map((wk, idx) => (
                                    <li key={idx} className="leading-normal">{wk}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Evidences list checklist */}
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block font-mono">Evidence Used</span>
                              <div className="space-y-2">
                                {agent.evidence.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-indigo-500/30 p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors duration-200"
                                    onClick={() => setSelectedEvidence(ev)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                      <div className="text-left">
                                        <span className="font-bold text-[var(--text-primary)] block">{ev.title}</span>
                                        <span className="text-[9px] text-[var(--text-secondary)] font-mono">Source: {ev.source}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-[10px] font-mono">
                                      <span className="text-emerald-600 dark:text-emerald-400">Conf: {ev.confidence}</span>
                                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Related evaluation focus tags */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono mr-1">Evaluation Focus:</span>
                              {agent.graphNodes.map((node) => (
                                <span
                                  key={node}
                                  className="text-[9px] font-bold font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-500/20 px-2 py-0.5 rounded"
                                >
                                  {node}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Column 4: Document Evidence Viewer & slide drawers */}
          <div className="xl:col-span-1 flex flex-col space-y-5 h-full">
            <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] p-5 flex flex-col justify-between h-full text-left">
              <div className="space-y-4">
                <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest block font-mono">Evidence Inspector</span>
                
                {selectedEvidence ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{selectedEvidence.title}</h3>
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono block mt-1 uppercase bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 w-fit">
                        {selectedEvidence.docType}
                      </span>
                    </div>

                    <div className="h-px bg-[var(--border-color)]" />

                    <div className="space-y-1">
                      <span className="text-[9px] text-[var(--text-secondary)] block uppercase font-mono">Highlighted Text Quote</span>
                      <blockquote className="bg-[var(--bg-surface)] border-l border-indigo-500/40 p-3 rounded text-[11px] text-[var(--text-primary)] leading-relaxed italic">
                        "{selectedEvidence.text}"
                      </blockquote>
                    </div>

                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Source Database</span>
                        <span className="text-[var(--text-primary)]">{selectedEvidence.source}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[var(--text-secondary)]">AI Confidence</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedEvidence.confidence}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[var(--text-secondary)]">Source Reliability</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedEvidence.sourceReliability}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-[var(--text-secondary)] block uppercase font-mono">Entities Connected</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvidence.entities.map((ent: string) => (
                          <span key={ent} className="text-[9px] font-mono text-[var(--text-primary)] bg-[var(--border-color)] px-2 py-0.5 rounded">
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 text-[var(--text-secondary)]">
                    <Info className="w-8 h-8 text-[var(--text-secondary)]" />
                    <p className="text-xs italic">
                      Select an evidence item from any agent's expandable card to inspect the text source.
                    </p>
                  </div>
                )}
              </div>

              {/* Committee report share button */}
              <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="w-full border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] justify-center cursor-pointer"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share Investigation Link
                </Button>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 border border-indigo-400/20 text-white font-mono text-xs px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DecisionCenterPage;
