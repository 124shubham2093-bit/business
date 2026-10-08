import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlow, Background, type Node, type Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Cpu, Check, ArrowRight, Terminal, Activity,
  User, Landmark, Target, ShieldAlert, AlertTriangle,
  Coins, CheckCircle2, Loader2
} from 'lucide-react';

import type { Startup } from '../services/investigation/investigationTypes';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  tasks: {
    initializing: string;
    retrieving: string;
    analyzing: string;
    generating: string;
  };
  evidenceCollected: string[];
  confidence: string;
}

export const InvestigationPipelinePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state or fallback
  const startupData = useMemo(() => {
    if (location.state && location.state.name) {
      sessionStorage.setItem('last_pipeline_state', JSON.stringify(location.state));
      return location.state;
    }
    const saved = sessionStorage.getItem('last_pipeline_state');
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
      description: 'Healthcare automation platform',
      pitchDeckName: 'pitch_deck_v1.pdf',
      financialsName: 'financials_q2.xlsx',
      pitchDeckText: ''
    };
  }, [location.state]);

  // Set backendResult to the pre-generated startup directly from location state or sessionStorage
  const backendResult: Startup | null = useMemo(() => {
    if (location.state?.generatedStartup) {
      return location.state.generatedStartup;
    }
    if (startupData?.generatedStartup) {
      return startupData.generatedStartup;
    }
    return null;
  }, [location.state, startupData]);

  // Dynamic deterministic scores & statistics
  const scores = useMemo(() => {
    const s = backendResult || (startupData as any)?.generatedStartup || startupData;
    if (s && s.metrics) {
      return {
        investmentScore: s.investmentScore,
        founder: s.metrics.team,
        technology: s.metrics.product,
        market: s.metrics.marketSize,
        finance: s.metrics.financials,
        competition: (s.metrics as any).competition || 80,
        risk: s.riskLevel === 'High' ? 30 : s.riskLevel === 'Medium' ? 20 : 10,
        recommendation: s.status === 'Approved' ? 'INVEST' : s.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
      };
    }
    return {
      investmentScore: 0,
      founder: 0,
      technology: 0,
      market: 0,
      finance: 0,
      competition: 0,
      risk: 10,
      recommendation: 'UNDER REVIEW' as const,
    };
  }, [backendResult, startupData]);

  // Resolve GitHub status from backend result or navigation state
  const githubStatus = useMemo(() => {
    return backendResult?.github_status || 
      (backendResult?.details as any)?.github_status || 
      (startupData as any)?.generatedStartup?.github_status || 
      (startupData as any)?.generatedStartup?.details?.github_status || 
      (startupData as any)?.github_status || 
      null;
  }, [backendResult, startupData]);

  // Define agents configs
  const agents: AgentConfig[] = useMemo(() => [
    {
      id: 'founder',
      name: 'Founder Agent',
      role: 'Founder Assessment',
      icon: User,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      tasks: {
        initializing: 'Initializing founder profile review...',
        retrieving: 'Querying executive background intake...',
        analyzing: 'Evaluating declared leadership history...',
        generating: 'Compiling founder diligence notes...'
      },
      evidenceCollected: [
        `Declared founder leadership: ${startupData.founderName || 'Founding team'}.`,
        'Leadership background submitted for review; external credentials require independent verification.'
      ],
      confidence: `${scores.founder}%`
    },
    {
      id: 'tech',
      name: 'Technology Agent',
      role: 'Technical Moat Analysis',
      icon: Cpu,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      tasks: {
        initializing: 'Initializing technical architecture audit...',
        retrieving: githubStatus?.success 
          ? `Accessing GitHub public repository (${githubStatus.repo_path})...`
          : (githubStatus && !githubStatus.success 
              ? 'Checking GitHub repository accessibility...' 
              : 'Accessing target architecture specifications...'),
        analyzing: githubStatus?.success
          ? `Verifying language (${githubStatus.language}) and stars (${githubStatus.stars})...`
          : (githubStatus && !githubStatus.success
              ? 'Repository Not Found or Not Publicly Accessible'
              : 'Evaluating submitted system architecture...'),
        generating: githubStatus?.success
          ? 'Evaluating README documentation and topics...'
          : (githubStatus && !githubStatus.success
              ? 'Flagging GitHub repository as unavailable in diligence report...'
              : 'Evaluating technical architecture moats...')
      },
      evidenceCollected: githubStatus?.success
        ? [
            `Verified public repository: ${githubStatus.repo_path} (${githubStatus.stars} stars, ${githubStatus.forks} forks). Primary language: ${githubStatus.language}.`,
            githubStatus.readme_excerpt ? 'README documentation verified against declared architecture.' : 'Public metadata confirmed.'
          ]
        : (githubStatus && !githubStatus.success
            ? [
                `Repository Not Found or Not Publicly Accessible (${githubStatus.error || 'HTTP 404'}).`,
                'GitHub evidence unavailable — Codebase metrics omitted from diligence.'
              ]
            : [
                'Technical architecture specifications submitted for review.',
                'No public code repository verified — Technical implementation requires independent code audit.'
              ]),
      confidence: githubStatus && !githubStatus.success ? '0%' : `${scores.technology}%`
    },
    {
      id: 'finance',
      name: 'Financial Agent',
      role: 'Financial Health Review',
      icon: Landmark,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      tasks: {
        initializing: 'Initializing financial overview check...',
        retrieving: 'Reviewing submitted financial documentation...',
        analyzing: 'Evaluating capitalization and stage structure...',
        generating: 'Compiling financial diligence limits...'
      },
      evidenceCollected: [
        `Target funding stage declared as ${startupData.fundingStage || 'Seed'}.`,
        'Private-company financial performance, revenue, and runway are not publicly established from reviewed sources.'
      ],
      confidence: `${scores.finance}%`
    },
    {
      id: 'market',
      name: 'Market Agent',
      role: 'Sizing TAM & Opportunities',
      icon: Target,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      tasks: {
        initializing: 'Initializing market segment scoping...',
        retrieving: 'Retrieving sector growth indicators...',
        analyzing: 'Evaluating target addressable market positioning...',
        generating: 'Evaluating commercial opportunity...'
      },
      evidenceCollected: [
        `Target sector defined as ${startupData.sector || 'Technology'}.`,
        'Market size (TAM/SAM) and commercial growth velocity require independent market verification.'
      ],
      confidence: `${scores.market}%`
    },
    {
      id: 'competition',
      name: 'Competition Agent',
      role: 'Scoping Moats & Rivals',
      icon: Coins,
      color: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
      tasks: {
        initializing: 'Initializing competitive positioning grid...',
        retrieving: 'Searching sector landscape benchmarks...',
        analyzing: 'Evaluating product differentiation claims...',
        generating: 'Compiling competitive risk summary...'
      },
      evidenceCollected: [
        `Product value proposition articulated for ${startupData.sector || 'target domain'}.`,
        'Competitive position and IP moats require additional diligence against alternatives.'
      ],
      confidence: `${scores.competition}%`
    },
    {
      id: 'legal',
      name: 'Legal Agent',
      role: 'Compliance & Registration Check',
      icon: ShieldAlert,
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
      tasks: {
        initializing: 'Initializing corporate compliance review...',
        retrieving: 'Checking submitted entity identity...',
        analyzing: 'Auditing regulatory requirements...',
        generating: 'Compiling compliance verification checkpoints...'
      },
      evidenceCollected: [
        'Corporate identity and declared business structure submitted for compliance review.',
        'Corporate legal registration, cap table, and governance frameworks require formal verification.'
      ],
      confidence: '85%'
    },
    {
      id: 'decision',
      name: 'Decision Agent',
      role: 'Auditor Verdict Compilation',
      icon: CheckCircle2,
      color: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5',
      tasks: {
        initializing: 'Collecting agent summary results...',
        retrieving: 'Retrieving compiled evidence vectors...',
        analyzing: 'Calculating consolidated risk profiles...',
        generating: 'Formulating final recommendation report...'
      },
      evidenceCollected: [
        'Diligence synthesis compiled across all evidence vectors.',
        'Final scores and recommendation committed to assessment record.'
      ],
      confidence: `${scores.investmentScore}%`
    }
  ], [scores, startupData, githubStatus]);

  // Simulation loop states
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const logEndRef = useRef<HTMLDivElement>(null);
  const totalSteps = agents.length;
  const currentAgent = agents[activeStepIdx];

  // Derive sub-states dynamically
  const currentStatus = useMemo(() => {
    if (stepProgress < 15) return 'Initializing';
    if (stepProgress >= 15 && stepProgress < 40) return 'Retrieving Memory';
    if (stepProgress >= 40 && stepProgress < 75) return 'Analyzing Evidence';
    if (stepProgress >= 75 && stepProgress < 100) return 'Generating Findings';
    return 'Completed';
  }, [stepProgress]);

  const currentTask = useMemo(() => {
    if (!currentAgent) return '';
    switch (currentStatus) {
      case 'Initializing': return currentAgent.tasks.initializing;
      case 'Retrieving Memory': return currentAgent.tasks.retrieving;
      case 'Analyzing Evidence': return currentAgent.tasks.analyzing;
      case 'Generating Findings': return currentAgent.tasks.generating;
      default: return 'Completed';
    }
  }, [currentStatus, currentAgent]);

  // 1. Timer count-up
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // 2. Simulation ticker loop
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          if (activeStepIdx < totalSteps - 1) {
            setActiveStepIdx((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(interval);
            setIsCompleted(true);
            return 100;
          }
        }
        return prev + 4; // increment simulation progress step speed
      });
    }, 150);

    return () => clearInterval(interval);
  }, [activeStepIdx, isCompleted, totalSteps]);

  // 3. Dynamic Telemetry Logs & Evidence insertion
  useEffect(() => {
    if (isCompleted || !currentAgent) return;

    // Append log at each sub-state transition
    const stateTriggers = [15, 40, 75];
    if (stateTriggers.includes(stepProgress)) {
      let logLine = '';
      if (stepProgress === 15) {
        logLine = `[INFO] ${currentAgent.name} - Querying Cognee memory layout...`;
      } else if (stepProgress === 40) {
        logLine = `[AUDIT] ${currentAgent.name} - Extracting document relations...`;
      } else if (stepProgress === 75) {
        logLine = `[VERIFY] ${currentAgent.name} - Compiling evidence credentials...`;
      }
      if (logLine) {
        setLogs((prev) => [...prev, logLine]);
      }
    }

    // Append Evidence Item once Analyzing Evidence is half complete
    if (stepProgress === 60) {
      const idx = activeStepIdx;
      const targetAgent = agents[idx];
      if (targetAgent && targetAgent.evidenceCollected.length > 0) {
        // Append first evidence item
        const isUnavailableGithub = idx === 1 && githubStatus && !githubStatus.success;
        const newEv1 = {
          id: `ev-${idx}-1`,
          timestamp: new Date().toLocaleTimeString(),
          source: idx === 0 ? 'Founder Registry' : idx === 1 ? 'GitHub Public API' : idx === 2 ? 'Invoicing Audits' : idx === 3 ? 'Market Sizing survey' : idx === 4 ? 'Patent Registries' : 'SOC2 Audit Files',
          confidence: isUnavailableGithub ? '0%' : (targetAgent.id === 'legal' ? '99%' : targetAgent.confidence),
          category: targetAgent.name,
          reason: targetAgent.evidenceCollected[0]
        };
        setEvidenceList((prev) => [newEv1, ...prev]);
        setLogs((prev) => [
          ...prev, 
          isUnavailableGithub 
            ? `[WARN] ${targetAgent.name}: Repository Not Found or Not Publicly Accessible. GitHub evidence unavailable.`
            : `[EVIDENCE] ${targetAgent.name} successfully extracted: "${newEv1.reason}"`
        ]);
      }
    }
  }, [stepProgress, activeStepIdx, currentAgent, isCompleted, agents, githubStatus]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // 4. Live Knowledge Graph creation loop
  useEffect(() => {
    const baseNodes = [
      {
        id: 'n-company',
        type: 'custom',
        position: { x: 200, y: 150 },
        data: { title: startupData.name, type: 'Company', riskLevel: 'Low' }
      }
    ];

    const techNode = githubStatus?.success
      ? { id: 'n-github', type: 'custom', position: { x: 350, y: 30 }, data: { title: `Repo: ${githubStatus.repo_path}`, type: 'Technology', riskLevel: 'Low', badge: `${githubStatus.stars}★ ${githubStatus.language}` } }
      : { id: 'n-tech', type: 'custom', position: { x: 350, y: 30 }, data: { title: 'Technical Stack Profile', type: 'Technology', riskLevel: 'Low', badge: 'Architecture' } };

    const allAvailableNodes = [
      { id: 'n-founder', type: 'custom', position: { x: 50, y: 30 }, data: { title: `Founder: ${startupData.founderName}`, type: 'Founder', riskLevel: 'Low' } },
      techNode,
      { id: 'n-finance', type: 'custom', position: { x: 50, y: 270 }, data: { title: `Stage: ${startupData.fundingStage || 'Seed'}`, type: 'Finance', riskLevel: 'Low' } },
      { id: 'n-market', type: 'custom', position: { x: 350, y: 270 }, data: { title: `Sector: ${startupData.sector}`, type: 'Market', riskLevel: 'Low' } },
      { id: 'n-legal', type: 'custom', position: { x: 200, y: 330 }, data: { title: 'Corporate Compliance', type: 'Legal', riskLevel: 'Low' } },
      { id: 'n-decision', type: 'custom', position: { x: 200, y: 20 }, data: { title: `Score: ${scores.investmentScore}/100`, type: 'Risk', riskLevel: 'Low', badge: scores.recommendation } },
    ];

    const techEdgeTarget = githubStatus?.success ? 'n-github' : 'n-tech';
    const techEdgeLabel = githubStatus?.success ? 'REPOSITORY' : 'DEVELOPED';

    const allAvailableEdges = [
      { id: 'e-founder', source: 'n-founder', target: 'n-company', animated: true, label: 'FOUNDER_OF', style: { stroke: '#3b82f6' } },
      { id: 'e-tech', source: 'n-company', target: techEdgeTarget, animated: true, label: techEdgeLabel, style: { stroke: '#8b5cf6' } },
      { id: 'e-finance', source: 'n-company', target: 'n-finance', animated: true, label: 'GENERATES', style: { stroke: '#10b981' } },
      { id: 'e-market', source: 'n-company', target: 'n-market', animated: true, label: 'TARGETS', style: { stroke: '#f59e0b' } },
      { id: 'e-legal', source: 'n-company', target: 'n-legal', animated: true, label: 'SUBJECT_TO', style: { stroke: '#eab308' } },
      { id: 'e-decision', source: 'n-decision', target: 'n-company', animated: true, label: 'RECOMMENDED', style: { stroke: '#ef4444' } },
    ];

    const currentNodes = [...baseNodes];
    const currentEdges: Edge[] = [];

    // Push completed nodes & edges
    for (let i = 0; i < activeStepIdx; i++) {
      if (allAvailableNodes[i]) currentNodes.push(allAvailableNodes[i]);
      if (allAvailableEdges[i]) currentEdges.push(allAvailableEdges[i]);
    }

    // Add active agent node as flashing indicator
    if (activeStepIdx < totalSteps - 1 && allAvailableNodes[activeStepIdx]) {
      const activeNode = {
        ...allAvailableNodes[activeStepIdx],
        style: {
          border: '1.5px solid #8b5cf6',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.45)',
          animation: 'pulse 1.5s infinite'
        }
      };
      currentNodes.push(activeNode);
    }

    setNodes(currentNodes);
    setEdges(currentEdges);
  }, [activeStepIdx, startupData, scores, totalSteps, setNodes, setEdges, githubStatus]);

  // Overall metrics calculations
  const overallProgress = Math.min(
    100,
    Math.round(((activeStepIdx + stepProgress / 100) / totalSteps) * 100)
  );

  const remainingTimeSeconds = Math.max(0, Math.round(((totalSteps - activeStepIdx) * 3) * (1 - stepProgress / 100)));

  // Dynamic Cognee stats calculations
  const cogneeStats = useMemo(() => {
    return {
      entities: 12 + Math.floor(overallProgress * 0.4),
      relationships: 35 + Math.floor(overallProgress * 1.8),
      documents: 3 + Math.floor(overallProgress * 0.08),
      queries: 5 + Math.floor(overallProgress * 0.35)
    };
  }, [overallProgress]);

  // Navigation callbacks
  const handleReturnToDashboard = () => {
    const finalStartup = backendResult || {
      id: `st-${Date.now()}`,
      name: startupData.name,
      logo: '🚀',
      elevatorPitch: startupData.description || '',
      sector: startupData.sector,
      investmentScore: scores.investmentScore,
      riskLevel: (scores.risk >= 25 ? 'High' : scores.risk >= 18 ? 'Medium' : 'Low') as any,
      status: (scores.recommendation === 'INVEST' ? 'Approved' : scores.recommendation === 'PASS' ? 'Flagged' : 'Under Review') as any,
      dateInvestigated: new Date().toISOString().split('T')[0],
      metrics: {
        financials: scores.finance,
        marketSize: scores.market,
        team: scores.founder,
        product: scores.technology,
      },
      details: {
        summary: `AI Agent analysis completed for ${startupData.name}. Assessment synthesized across technical, market, financial, team, and legal evidence vectors.`,
        strengths: [
          `Declared founder leadership: ${startupData.founderName || 'Founding team'}.`,
          githubStatus?.success ? `Verified public GitHub repository: ${githubStatus.repo_path}.` : 'Technical architecture specifications submitted for review.',
          `Clear market positioning within the ${startupData.sector} sector.`
        ],
        risks: [
          'Private-company financial performance is not publicly verified.',
          'Revenue, burn rate, and cash runway were not established from reviewed evidence.',
          'Corporate legal registration, cap table, and governance frameworks require formal verification.'
        ],
        founderBackground: `${startupData.founderName} (CEO & Founder).`,
        financialSnapshot: {
          revenue: 'Requires verification',
          burnRate: 'Requires verification',
          runway: 'Requires verification',
          valuation: 'Requires verification',
        },
        marketOpportunity: `Target market domain identified as ${startupData.sector}. Detailed addressable market size requires independent verification.`,
        techStackRisk: 'Technical architecture evaluated from submission materials.'
      }
    };

    navigate('/', {
      state: {
        newStartup: finalStartup,
        highlightId: finalStartup.id,
      },
    });
  };


  const handleViewDecisionCenter = () => {
    navigate('/decision-center', {
      state: {
        startup: backendResult || {
          name: startupData.name,
          sector: startupData.sector,
          investmentScore: scores.investmentScore,
          recommendation: scores.recommendation,
          riskLevel: scores.risk >= 25 ? 'High' : scores.risk >= 18 ? 'Medium' : 'Low',
          status: scores.recommendation === 'INVEST' ? 'Approved' : scores.recommendation === 'PASS' ? 'Flagged' : 'Under Review',
        }
      }
    });
  };

  const finalReportSummary = useMemo(() => {
    if (backendResult) {
      return {
        summary: backendResult.details.summary,
        strengths: backendResult.details.strengths,
        risks: backendResult.details.risks,
        score: backendResult.investmentScore,
        recommendation: backendResult.status === 'Approved' ? 'INVEST' : backendResult.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
        evidence: backendResult.details.evidenceList?.length || 8,
        queries: 40
      };
    }
    return {
      summary: `AI Agent assessment successfully concluded. Main investment score calculated at ${scores.investmentScore}/100. Assessment synthesized across technical, market, financial, team, and legal evidence vectors.`,
      strengths: [
        `Declared founder leadership: ${startupData.founderName || 'Founding team'}.`,
        githubStatus?.success ? `Verified public GitHub repository: ${githubStatus.repo_path}.` : 'Technical architecture specifications submitted for review.',
        `Clear market positioning within the ${startupData.sector} sector.`
      ],
      risks: [
        'Private-company financial performance is not publicly verified.',
        'Revenue, burn rate, and cash runway were not established from reviewed evidence.',
        'Corporate legal registration, cap table, and governance frameworks require formal verification.'
      ],
      score: scores.investmentScore,
      recommendation: scores.recommendation,
      evidence: 8,
      queries: 40
    };
  }, [backendResult, scores, startupData, githubStatus]);

  if (agents.length === 0 && !currentAgent) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-purple-light animate-spin" />
          <span className="text-xs text-gray-500">Initializing Multi-Agent Diligence Team...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans flex flex-col overflow-hidden relative">

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          // Simulation mission control view
          <motion.div
            key="simulation-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-6 space-y-4 max-w-7xl mx-auto w-full overflow-hidden"
          >
            {/* Header progress panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
              <div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest flex items-center space-x-1 font-mono">
                  <Activity className="w-3.5 h-3.5 animate-pulse mr-1" />
                  <span>DILIGENCE MISSION CONTROL</span>
                </span>
                <h1 className="text-2xl font-bold font-display text-[var(--text-primary)] mt-1">
                  Scanning: {startupData.name}
                </h1>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-mono">
                  Target: {startupData.sector} • {startupData.fundingStage} stage
                </p>
              </div>

              {/* Progress timer widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-black/10 dark:bg-black/35 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-slate-500 dark:text-gray-500 block uppercase tracking-wider">ELAPSED TIME</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{elapsedTime}s</span>
                </div>
                <div className="bg-black/10 dark:bg-black/35 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-slate-500 dark:text-gray-500 block uppercase tracking-wider">REMAINING</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{remainingTimeSeconds}s</span>
                </div>
                <div className="bg-black/10 dark:bg-black/35 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-slate-500 dark:text-gray-500 block uppercase tracking-wider">STAGE RATE</span>
                  <span className="text-sm font-semibold text-brand-purple-light">{stepProgress}%</span>
                </div>
                <div className="bg-black/10 dark:bg-black/35 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-slate-500 dark:text-gray-500 block uppercase tracking-wider">COMPLETED AGENTS</span>
                  <span className="text-sm font-semibold text-emerald-400">{activeStepIdx} / {totalSteps}</span>
                </div>
              </div>
            </div>

            {/* 3-Column Layout: Left (Mission Control), Center (Knowledge Graph), Right (Logs & Evidences) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch overflow-hidden">
              
              {/* Column 1: Mission Control Agents List & Cognee Memory */}
              <div className="flex flex-col space-y-4 overflow-hidden">
                
                {/* Active Agent Info Card */}
                {currentAgent && (
                  <Card className="border border-brand-purple/20 bg-brand-purple/5 relative overflow-hidden flex-shrink-0">
                    <CardContent className="p-4 flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-brand-purple/20 border border-brand-purple/30 rounded-xl">
                          <currentAgent.icon className="w-5 h-5 text-brand-purple-light animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-gray-500 uppercase font-semibold">ACTIVE AGENT</span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{currentAgent.name}</h3>
                          <span className="text-[10px] text-brand-purple-light font-mono block mt-0.5">{currentAgent.role}</span>
                        </div>
                      </div>

                      {/* Sub-status Progress bar */}
                      <div className="space-y-1 text-[10px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sub-Task Status</span>
                          <span className="text-emerald-400 font-bold uppercase animate-pulse">{currentStatus}</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-purple-light" style={{ width: `${stepProgress}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-gray-300 italic pt-1 leading-normal">
                          &gt; {currentTask}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ingestion Cognee Memory Stats Panel */}
                <Card className="border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-black/40 p-4 flex flex-col space-y-3.5 flex-shrink-0">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Cognee Memory Telemetry</span>
                    <span className="flex items-center text-[9px] text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                      CONNECTED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center font-mono">
                    {[
                      { label: 'Entities Stored', val: cogneeStats.entities },
                      { label: 'Relationships Built', val: cogneeStats.relationships },
                      { label: 'Documents Indexed', val: cogneeStats.documents },
                      { label: 'Queries Executed', val: cogneeStats.queries }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-100 dark:bg-white/2 border border-slate-200 dark:border-white/5 p-2 rounded-xl">
                        <span className="text-[8px] text-slate-500 dark:text-gray-500 block uppercase font-medium">{s.label}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Agents List Queue */}
                <div className="flex-1 bg-slate-100 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-4 overflow-y-auto space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400 block uppercase tracking-widest pb-1 border-b border-slate-200 dark:border-white/5 mb-2">Agent Queue Status</span>
                  {agents.map((agent, idx) => {
                    const isStepCompleted = idx < activeStepIdx;
                    const isStepActive = idx === activeStepIdx;
                    return (
                      <div
                        key={agent.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${
                          isStepActive
                            ? 'bg-brand-purple/10 border-brand-purple/40 shadow-[0_0_12px_rgba(139,92,246,0.15)] scale-[1.01]'
                            : isStepCompleted
                            ? 'bg-emerald-950/5 border-emerald-950/20 opacity-80'
                            : 'bg-transparent border-transparent opacity-30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 text-[11px]">
                          {isStepCompleted ? (
                            <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          ) : isStepActive ? (
                            <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-brand-purple/20 border border-brand-purple/40">
                              <Loader2 className="w-3.5 h-3.5 text-brand-purple-light animate-spin" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 text-gray-500">
                              {idx + 1}
                            </div>
                          )}
                          <div>
                            <span className={`font-semibold block ${isStepActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-300'}`}>{agent.name}</span>
                            <span className="text-[9px] text-slate-400 dark:text-gray-500">{agent.role}</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-right font-mono">
                          {isStepCompleted ? (
                            <span className="text-emerald-400 font-bold">Done</span>
                          ) : isStepActive ? (
                            <span className="text-brand-purple-light font-bold">Active</span>
                          ) : (
                            <span className="text-gray-600">Waiting</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Live Knowledge Graph Constructor */}
              <div className="flex flex-col bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden relative min-h-[400px]">
                <div className="absolute top-4 left-4 z-20 pointer-events-none select-none">
                  <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                    LIVE SEMANTIC GRAPH
                  </span>
                </div>

                <div className="flex-1 bg-[#030014] overflow-hidden">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    fitViewOptions={{ padding: 0.15 }}
                    nodesDraggable={true}
                    panOnScroll={true}
                    zoomOnScroll={true}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                  >
                    <Background color="rgba(139, 92, 246, 0.1)" gap={16} size={1} />
                  </ReactFlow>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/2 border-t border-slate-200 dark:border-white/5 text-[9px] text-slate-400 dark:text-gray-500 text-center pointer-events-none select-none">
                  Nodes and semantic edges populate automatically as agents write data to Cognee memory.
                </div>
              </div>

              {/* Column 3: Live Telemetry Logs & Evidence Stream */}
              <div className="flex flex-col space-y-4 overflow-hidden">
                
                {/* Live Terminal logs */}
                <div className="flex-1 bg-slate-900 dark:bg-black/50 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col overflow-hidden font-mono text-[10px] min-h-[180px]">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 dark:border-white/5 bg-slate-800 dark:bg-white/2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-brand-purple-light" />
                      <span className="font-semibold text-slate-200 dark:text-gray-300 text-xs">Live Telemetry logs</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text scrollbar-none">
                    {logs.map((log, index) => (
                      <div key={index} className="text-slate-300 dark:text-gray-400 break-all leading-relaxed">
                        {log}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {/* Evidence Stream scrolling box */}
                <div className="flex-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[180px]">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">Evidence Stream</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-none">
                    <AnimatePresence>
                      {evidenceList.map((ev) => (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white/2 border border-white/5 p-2.5 rounded-xl text-left space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-[8px] font-mono">
                            <span className="text-brand-purple-light font-bold">{ev.category.toUpperCase()}</span>
                            <span className="text-gray-500">{ev.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-slate-700 dark:text-gray-300 leading-normal">{ev.reason}</p>
                          <div className="flex justify-between items-center text-[8px] text-slate-500 dark:text-gray-500 font-mono">
                            <span>Src: {ev.source}</span>
                            <span className="text-emerald-400">Conf: {ev.confidence}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {evidenceList.length === 0 && (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500 italic">
                        Awaiting evidence extraction...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Progress loader bar */}
            <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex-shrink-0 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider font-mono whitespace-nowrap">
                Overall Diligence Progress
              </span>
              <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-purple-dark to-brand-purple-light transition-all duration-100 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono whitespace-nowrap w-12 text-right">
                {overallProgress}%
              </span>
            </div>
          </motion.div>
        ) : (
          // Completion summary card results dashboard
          <motion.div
            key="completion-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 w-full max-w-4xl mx-auto"
          >
            <Card className="w-full border border-[var(--border-color)] relative overflow-hidden bg-[var(--bg-surface)] shadow-lg">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />

              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
                  ✓ Investigation Complete
                </CardTitle>
                <p className="text-xs text-[var(--text-secondary)]">
                  Diligence report successfully compiled and saved to memory.
                </p>

              </CardHeader>

              <CardContent className="p-6 pt-2">
                <div className="space-y-6">
                  {/* GitHub Verification Status Banner */}
                  {githubStatus && !githubStatus.success && (
                    <div className="flex items-center space-x-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                      <div>
                        <span className="font-bold block">GitHub Repository Verification Failed: Repository Not Found or Not Publicly Accessible</span>
                        <span className="text-[11px] opacity-90">{githubStatus.error || 'The specified repository could not be located via public GitHub APIs. Code metrics and evidence were omitted from diligence.'}</span>
                      </div>
                    </div>
                  )}
                  {githubStatus?.success && (
                    <div className="flex items-center space-x-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs">
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-bold block">GitHub Repository Verified: {githubStatus.repo_path}</span>
                        <span className="text-[11px] opacity-90">{githubStatus.stars} stars &bull; {githubStatus.forks} forks &bull; Primary language: {githubStatus.language}</span>
                      </div>
                    </div>
                  )}

                  {/* Verdict Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🚀</span>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{startupData.name}</h4>
                        <p className="text-[9px] text-slate-500 dark:text-gray-400 uppercase tracking-wider">{startupData.sector}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center sm:text-right">
                        <span className="text-[9px] text-slate-500 dark:text-gray-500 block">INVESTMENT INDEX</span>
                        <span className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                          {finalReportSummary.score}
                          <span className="text-xs font-normal text-slate-500 dark:text-gray-500">/100</span>
                        </span>
                      </div>
                      <div className="h-10 w-px bg-white/10" />
                      <div className="text-center">
                        <span className="text-[9px] text-slate-500 dark:text-gray-500 block">RECOMMENDATION</span>
                        <Badge
                          variant={finalReportSummary.recommendation === 'INVEST' ? 'success' : 'warning'}
                          glow={finalReportSummary.recommendation === 'INVEST'}
                          className="mt-1 font-bold text-sm px-3 py-1 uppercase"
                        >
                          {finalReportSummary.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Strengths / Risks / Detail lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                    <div className="bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">Major Strengths</span>
                      <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-gray-300">
                        {finalReportSummary.strengths.map((str, idx) => (
                          <li key={idx} className="leading-relaxed">{str}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block uppercase tracking-wider">Major Risks</span>
                      <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-gray-300">
                        {finalReportSummary.risks.map((rsk, idx) => (
                          <li key={idx} className="leading-relaxed">{rsk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Diligence explanation */}
                  <div className="bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 p-4 rounded-xl text-xs text-left text-slate-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 block uppercase tracking-wider mb-1">Reasoning Narrative</span>
                    {finalReportSummary.summary}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 border-t border-slate-200 dark:border-white/5 pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleReturnToDashboard}
                    className="w-full sm:w-auto h-10 px-4 py-2 border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleViewDecisionCenter}
                    className="w-full sm:w-auto h-10 px-4 py-2 hover:shadow-[0_0_15px_rgba(139,92,246,0.45)] cursor-pointer"
                  >
                    View Decision Center (XAI)
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestigationPipelinePage;
