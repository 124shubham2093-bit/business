import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Cpu, Landmark, Target,
  FileText, ArrowLeft, Download, Layers, Scale,
  ChevronDown, ChevronUp, ExternalLink, Check, Info, Loader2, ChevronRight,
  Share2, Copy, FileDown, AlertTriangle, ShieldCheck, ShieldAlert, HelpCircle
} from 'lucide-react';

import { MockInvestigationService } from '../services/investigation/MockInvestigationService';
import { generateScores } from '../services/investigation/mockGenerator';
import type { Startup } from '../services/investigation/investigationTypes';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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
    return location.state?.startup || {
      name: 'Alpha Dynamics',
      founderName: 'Alex Rivera',
      sector: 'BioTech AI',
      fundingStage: 'Seed',
      websiteUrl: 'https://alphadynamics.io',
      githubUrl: 'https://github.com/alphadynamics',
      description: 'Dynamic automation platform for genomic engineering pipelines.',
    };
  }, [location.state]);

  const scores = useMemo(() => {
    return generateScores(startupData.name, startupData.sector);
  }, [startupData.name, startupData.sector]);

  // Load results from backend if available
  const [backendData, setBackendData] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (backendData) {
      return {
        score: backendData.investmentScore,
        recommendation: backendData.status === 'Approved' ? 'INVEST' : backendData.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
        riskLevel: backendData.riskLevel,
        reasoning: backendData.details.summary,
        strengths: backendData.details.strengths,
        weaknesses: backendData.details.risks,
        documents: 6,
        entities: 48,
        relationships: 215,
        evidenceCount: backendData.details.evidenceList?.length || 8,
        queries: 40
      };
    }
    return {
      score: scores.investmentScore,
      recommendation: scores.recommendation,
      riskLevel: scores.risk >= 25 ? 'High' : scores.risk >= 18 ? 'Medium' : 'Low',
      reasoning: `Audit engine completed for ${startupData.name} yielding an overall investment score of ${scores.investmentScore}/100. Relational integrity audits match key CS PhD pedigree checks and deep IP custom kernels.`,
      strengths: [
        'Founder possesses high-rank academic PhD publications.',
        'CUDA kernels showcase distinct processing benchmarks.',
        'Market segments TAM size validated at $45B.'
      ],
      weaknesses: [
        'Regulatory trial hurdles represent key deployment delays.',
        'AWS container backup drift risks detected.'
      ],
      documents: 6,
      entities: 48,
      relationships: 215,
      evidenceCount: 8,
      queries: 40
    };
  }, [backendData, scores, startupData]);

  // Build agent committee data models with Source Reliability and Custom Icons
  // AI Investment Partner — 5 evidence-backed investor questions derived from live frontend data
  const investorQuestions = useMemo(() => {
    const questions = [];
    const founderName = startupData.founderName || 'the founding team';

    // Q1 — always generated: cross-document Cognee contradiction
    questions.push({
      category: 'COGNEE MEMORY',
      categoryColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20',
      question: `Cognee detected a contradiction between the pitch deck narrative and GitHub commit activity for ${startupData.name}. How does the team explain this gap?`,
      reasoning: `Cognee's knowledge graph linked pitch deck claims to repository evidence across ${finalSummary.entities} extracted entities. A semantic conflict was flagged between stated engineering velocity and actual commit frequency — a cross-document pattern only detectable with persistent memory.`,
      icon: AlertTriangle,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    });

    // Q2 — technology score driven
    if (scores.technology < 80) {
      questions.push({
        category: 'GITHUB',
        categoryColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/20',
        question: `GitHub repository activity has shown a ${Math.round(100 - scores.technology)}% deviation from stated engineering benchmarks. What is driving this slowdown?`,
        reasoning: `Technology Agent scanned ${finalSummary.documents} documents and found that recent commit velocity does not match the product roadmap milestones described in the pitch deck. Cognee surfaced this discrepancy by linking repository nodes to milestone claim nodes across sessions.`,
        icon: AlertTriangle,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      });
    } else {
      questions.push({
        category: 'GITHUB',
        categoryColor: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/20',
        question: `The codebase shows strong engineering benchmarks, but what is the team's technical hiring plan to sustain this velocity as the product scales?`,
        reasoning: `Technology Agent confirmed high code quality and low redundancy. However, Cognee's memory graph shows no hiring-related entities in the pitch deck, creating an unresolved dependency between current engineering output and future team capacity.`,
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
  }, [startupData, scores, finalSummary]);

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
      summary: 'Assessed leadership pedigree and academic research credentials.',
      strengths: ['Stanford CS PhD verified.', 'Prior software automation exit of $18M.'],
      weaknesses: ['Academic background outweighs executive sales tenure.'],
      risks: ['High key-man developer reliance on early founder core.'],
      reasoning: 'Founder has a high-tier academic rating. Verification confirmed PhD credentials in Stanford registries. The prior exit indicates previous commercial viability.',
      evidence: [
        {
          id: 'ev-founder-1',
          title: 'Stanford Registrar Record',
          source: 'Stanford University API',
          docType: 'Founder Resume',
          confidence: '99%',
          sourceReliability: '99%',
          text: 'Doctor of Philosophy in Computer Science conferred to Alex Rivera, matching specialization thesis in AI Genomics.',
          entities: ['Alex Rivera', 'Stanford University'],
          relatedNode: 'n-founder'
        },
        {
          id: 'ev-founder-2',
          title: 'SEC Filing: AlphaLabs Acquisition',
          source: 'Regulatory Archives',
          docType: 'News Article',
          confidence: '95%',
          sourceReliability: '78%',
          text: 'AlphaLabs Inc. acquired by BioMed Tech for $18,000,000. Alex Rivera listed as lead architecture designer.',
          entities: ['Alex Rivera', 'AlphaLabs Inc.'],
          relatedNode: 'n-founder'
        }
      ],
      graphNodes: ['Founder', 'Alex Rivera']
    },
    {
      id: 'tech',
      name: 'Technology Agent',
      role: 'Code Moat Validation',
      icon: Cpu,
      score: scores.technology,
      confidence: 91,
      time: '1.8s',
      status: 'Completed',
      summary: 'Audited target codebase, repositories, and CUDA processing nodes.',
      strengths: ['Custom CUDA transformer structures.', 'Negligible duplicate script loops.'],
      weaknesses: ['Sparse API schema comments inside controller files.'],
      risks: ['Heavy custom dependency on NVIDIA container configurations.'],
      reasoning: 'The repository scan indicates high-quality engineering benchmarks. Redundancy checks returned an index of 4.2%. Performance tests validate low kernel delays.',
      evidence: [
        {
          id: 'ev-tech-1',
          title: 'GitHub Commit Redundancy Audit',
          source: 'GitHub API Archive',
          docType: 'GitHub Repository',
          confidence: '98%',
          sourceReliability: '98%',
          text: 'Codebase validation completed. Total line duplication measured at 4.2%. Code architecture quality rated: Grade A.',
          entities: ['Alpha Dynamics Repo', 'CUDA Kernels'],
          relatedNode: 'n-tech'
        }
      ],
      graphNodes: ['Technology', 'CUDA Kernels']
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
      summary: 'Audited monthly runway ledgers, burn rates, and recurring contract bookings.',
      strengths: ['24-month cash runway confirmed.', 'Low server hardware overhead ratios.'],
      weaknesses: ['ARR is heavily concentrated in three corporate clients.'],
      risks: ['Churn risk of a single key client could slash ARR by 30%.'],
      reasoning: 'Financial books represent stable growth with low cash burn. Concentration risks are offset by multi-year enterprise contracts.',
      evidence: [
        {
          id: 'ev-finance-1',
          title: 'Q2 Runway Statement',
          source: 'Corporate Bank Ledgers',
          docType: 'Financial Statement',
          confidence: '97%',
          sourceReliability: '97%',
          text: 'Cash balance verified at $2.1M. Burn rate stands at $90k per month. Adjusted runway calculated at 24 months.',
          entities: ['Q2 Ledgers', 'Alpha Dynamics'],
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
      confidence: 89,
      time: '1.5s',
      status: 'Completed',
      summary: 'Scoped sector segments and overall addressable growth sizing.',
      strengths: ['Pharma genome automation TAM is $45B.', 'CAGR average of 18.2%.'],
      weaknesses: ['Buyer adoption cycles in target segments average 9 months.'],
      risks: ['Slow sector adoption timelines might force high customer acquisition costs.'],
      reasoning: 'Total addressable market bounds are massive. Growth CAGR is backed by strong automation tailwinds in biomedical fields.',
      evidence: [
        {
          id: 'ev-market-1',
          title: 'Biotech Automation Segment Survey',
          source: 'Gartner Industry Report',
          docType: 'Market Report',
          confidence: '94%',
          sourceReliability: '93%',
          text: 'The addressable TAM for genomic pipeline automation is estimated to scale past $45B by 2030 at 18.2% CAGR.',
          entities: ['Genomics Automation', 'Pharma market'],
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
      confidence: 86,
      time: '1.3s',
      status: 'Completed',
      summary: 'Audited patent registers and competitor feature sets.',
      strengths: ['Proprietary transformer patents.', 'Rivals do not employ local CUDA custom kernels.'],
      weaknesses: ['Competitors possess larger sales and distribution teams.'],
      risks: ['Rivals might replicate neural structures if IP is not protected.'],
      reasoning: 'The technical patent database validation confirms a defensive moat. Early deployment positions the company well.',
      evidence: [
        {
          id: 'ev-comp-1',
          title: 'Neural Transformer Sequence Moat',
          source: 'USPTO Patent Database',
          docType: 'Patent Filing',
          confidence: '92%',
          sourceReliability: '97%',
          text: 'Patent application #948,284 granted for genomic neural sequencer transformer architectures.',
          entities: ['USPTO Patent #948,284', 'Alpha Dynamics'],
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
      score: 88,
      confidence: 99,
      time: '1.1s',
      status: 'Completed',
      summary: 'Audited articles of incorporation and HIPAA/SOC2 certificates.',
      strengths: ['SOC-2 Type II active.', 'Delaware C-Corp in active standing.'],
      weaknesses: ['State license approvals are pending downstream healthcare certifications.'],
      risks: ['Delays in regulatory approval timelines.'],
      reasoning: 'The corporate registration status is fully active. Core compliance frameworks are in place.',
      evidence: [
        {
          id: 'ev-legal-1',
          title: 'SOC-2 Type II Compliance audit',
          source: 'AICPA Registry Audits',
          docType: 'Regulatory Documents',
          confidence: '99%',
          sourceReliability: '99%',
          text: 'Framework audit completed. HIPAA and SOC2 compliance controls are active and verified.',
          entities: ['AICPA Registry', 'SOC-2 Certificate'],
          relatedNode: 'n-legal'
        }
      ],
      graphNodes: ['Legal']
    }
  ], [scores, startupData]);

  // ─── Evidence-Based Investment Verdict: derived data ───
  const topEvidence = useMemo(() => {
    return agents
      .flatMap(a => a.evidence)
      .sort((a, b) => parseInt(b.confidence) - parseInt(a.confidence))
      .slice(0, 5);
  }, [agents]);

  const keyRisks = useMemo(() => {
    const allRisks = [
      ...finalSummary.weaknesses,
      ...agents.flatMap(a => a.risks)
    ];
    return [...new Set(allRisks)].slice(0, 3);
  }, [finalSummary.weaknesses, agents]);

  const averageConfidence = useMemo(() => {
    return Math.round(agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length);
  }, [agents]);

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

  // Deep linking to Knowledge Graph handler
  const handleDeepLinkGraph = (nodeName: string) => {
    navigate('/knowledge-graph', {
      state: {
        startup: {
          name: startupData.name,
          sector: startupData.sector,
          investmentScore: finalSummary.score,
          recommendation: finalSummary.recommendation,
          riskLevel: finalSummary.riskLevel,
          status: finalSummary.recommendation === 'INVEST' ? 'Approved' : 'Flagged'
        },
        highlightNodeId: nodeName
      }
    });
  };

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
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-purple-light/5 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-6 flex items-center justify-between z-30 flex-shrink-0">
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
            className="h-9 px-3 hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer"
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
                <span className="text-[9px] text-[var(--text-secondary)] block uppercase tracking-widest font-bold font-mono">Cognee Memory Logs</span>
                <div className="grid grid-cols-2 gap-3 text-center font-mono">
                  {[
                    { label: 'Documents', val: finalSummary.documents },
                    { label: 'Entities', val: finalSummary.entities },
                    { label: 'Relations', val: finalSummary.relationships },
                    { label: 'Queries', val: finalSummary.queries }
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
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-2.5 text-xs">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider">Multi-Agent Conflict Detected</span>
              </div>
              <p className="text-[11px] text-[var(--text-primary)] leading-normal text-left font-mono">
                ⚠️ <strong className="text-[var(--text-primary)]">Technology Agent</strong> reports deep IP custom kernel moats, while <strong className="text-[var(--text-primary)]">Competition Agent</strong> reports high risk of larger market rivals replicating neural blocks.
              </p>
              <div className="text-[10px] text-[var(--text-secondary)] font-mono italic">
                Decision Builder consolidated consensus weights, adjusting rating confidence bounds from 91% to 84%.
              </div>
            </Card>

            {/* Decision Builder animated progress card */}
            {!isBuilderDone ? (
              <Card className="border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20 p-5 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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
              <Card glow className="border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20 p-5 flex flex-col space-y-4 relative overflow-hidden flex-shrink-0 text-left">
                {/* Background glows */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

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
                        Compiled from {agents.length} AI agents across {finalSummary.documents} documents
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={finalSummary.recommendation === 'INVEST' ? 'success' : finalSummary.recommendation === 'PASS' ? 'danger' : 'warning'}
                    glow
                    className="font-bold text-xs px-3 py-1 font-mono"
                  >
                    {finalSummary.recommendation}
                  </Badge>
                </div>

                {/* ── B. Score / Confidence / Risk metric strip ── */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">Investment Score</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{finalSummary.score}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">/100</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">AI Confidence</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{averageConfidence}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">%</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl text-center">
                    <span className="text-[8px] text-[var(--text-secondary)] block uppercase font-mono font-medium">Risk Level</span>
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

                {/* ── C. Strongest Evidence Points ── */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-mono block">
                    Strongest Evidence ({topEvidence.length} verified sources)
                  </span>
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

                {/* ── D. Key Risk Factors ── */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest font-mono block">
                    Key Risk Factors
                  </span>
                  <div className="space-y-1.5">
                    {keyRisks.map((risk, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-[var(--text-primary)] leading-relaxed">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── E. Why This Matters ── */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-xl">
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono block mb-1.5">
                    Why This Matters
                  </span>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-mono italic">
                    Based on {finalSummary.entities} entities extracted across {finalSummary.documents} documents, InvestIQ&apos;s {agents.length} AI agents mapped {finalSummary.relationships} entity relationships in the Cognee knowledge graph. {startupData.name} operating in {startupData.sector} at {startupData.fundingStage} stage {finalSummary.recommendation === 'INVEST' ? 'demonstrates strong fundamentals with defensible positioning' : finalSummary.recommendation === 'PASS' ? 'presents significant structural concerns that warrant caution' : 'shows mixed signals requiring further investigation'}. This verdict is backed by cross-document evidence that only a persistent knowledge graph can surface — connecting founder history, technical moats, and financial patterns across multiple ingested sources.
                  </p>
                </div>

                {/* ── F. Suggested Next Actions ── */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                  {finalSummary.recommendation === 'INVEST' ? (
                    <>
                      <Button variant="primary" size="sm" onClick={handleExportJSON} className="flex-1 text-[10px] cursor-pointer hover:shadow-[0_0_12px_rgba(139,92,246,0.35)]">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Export Due Diligence Report
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeepLinkGraph('Founder')} className="flex-1 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Explore Knowledge Graph
                      </Button>
                    </>
                  ) : finalSummary.recommendation === 'PASS' ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex-1 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer">
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        Archive Investigation
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeepLinkGraph('Risk')} className="flex-1 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-500 text-[10px] cursor-pointer">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                        Review Risk Graph
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleDeepLinkGraph('Founder')} className="flex-1 text-[10px] cursor-pointer hover:shadow-[0_0_12px_rgba(139,92,246,0.35)]">
                        <Layers className="w-3.5 h-3.5 mr-1.5" />
                        Deep Dive Knowledge Graph
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex-1 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Export for Partner Review
                      </Button>
                    </>
                  )}
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
                          ? 'border-indigo-500/30 bg-[var(--bg-surface)] shadow-[0_0_12px_rgba(139,92,246,0.08)]'
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
                        ? 'border-indigo-500/40 bg-[var(--bg-surface)] shadow-[0_0_15px_rgba(139,92,246,0.1)]'
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

                            {/* Related graph node tags linking */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono mr-1">Semantic Node Links:</span>
                              {agent.graphNodes.map((node) => (
                                <button
                                  key={node}
                                  onClick={() => handleDeepLinkGraph(node)}
                                  className="text-[9px] font-bold font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all duration-200"
                                >
                                  {node}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
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

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDeepLinkGraph(selectedEvidence.relatedNode)}
                        className="w-full text-[11px] hover:shadow-[0_0_12px_rgba(139,92,246,0.35)] cursor-pointer"
                      >
                        Inspect on Semantic Graph
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
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
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 border border-indigo-400/20 text-white font-mono text-xs px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] flex items-center space-x-2"
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
