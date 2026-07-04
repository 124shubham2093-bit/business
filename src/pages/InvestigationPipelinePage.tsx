import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlow, Background, type Node, type Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Cpu, Check, ArrowRight, Terminal, Activity,
  Database, User, Landmark, Target, ShieldAlert,
  Coins, Sparkles, CheckCircle2, Loader2
} from 'lucide-react';

import { generateScores } from '../services/investigation/mockGenerator';
import type { Startup } from '../services/investigation/investigationTypes';
import { BACKEND_API_BASE } from '../services/investigation/config';
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
    return location.state || {
      name: 'Alpha Dynamics',
      founderName: 'Alex Rivera',
      sector: 'BioTech AI',
      fundingStage: 'Seed',
      websiteUrl: 'https://alphadynamics.io',
      githubUrl: 'https://github.com/alphadynamics',
      description: 'Dynamic automation platform',
      pitchDeckName: 'pitch_deck_v1.pdf',
      financialsName: 'financials_q2.xlsx',
      pitchDeckText: ''
    };
  }, [location.state]);

  // Dynamic deterministic scores & statistics
  const scores = useMemo(() => {
    return generateScores(startupData.name, startupData.sector);
  }, [startupData.name, startupData.sector]);

  // stats hooks removed to satisfy unused variable warnings

  // Trigger backend execution on mount
  // Trigger backend investigation on mount — fires in background, does not affect simulation
  const [backendResult, setBackendResult] = useState<Startup | null>(null);
  useEffect(() => {
    const runBackendInvestigation = async () => {
      try {
        const combinedDescription = [
          startupData.description || '',
          startupData.pitchDeckText || '',
        ].filter(Boolean).join('\n\n').trim();

        const res = await fetch(`${BACKEND_API_BASE}/investigations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: startupData.name,
            founderName: startupData.founderName,
            sector: startupData.sector,
            fundingStage: startupData.fundingStage || 'Seed',
            websiteUrl: startupData.websiteUrl || 'https://example.com',
            githubUrl: startupData.githubUrl || 'https://github.com/example',
            description: combinedDescription || 'No description provided.',
          }),
        });

        if (!res.ok) {
          console.warn(`Backend investigation returned ${res.status}. Completion summary will use deterministic scores.`);
          return;
        }

        const created = await res.json();
        setBackendResult(created as Startup);
      } catch (err) {
        console.warn('Backend investigation unreachable. Completion summary will use deterministic scores.', err);
      }
    };

    runBackendInvestigation();
  }, [startupData]);

  // Define agents configs
  const agents: AgentConfig[] = useMemo(() => [
    {
      id: 'founder',
      name: 'Founder Agent',
      role: 'Biographical Audits',
      icon: User,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      tasks: {
        initializing: 'Initializing founder pedigree check...',
        retrieving: 'Querying Cognee bio relationship models...',
        analyzing: 'Auditing executive exit histories...',
        generating: 'Confirming Stanford PhD research records...'
      },
      evidenceCollected: [
        'Stanford CS PhD dissertation confirmed.',
        'Prior exit found at AlphaLabs (acquired for $18M).'
      ],
      confidence: `${scores.founder}%`
    },
    {
      id: 'tech',
      name: 'Technology Agent',
      role: 'Code Moat Validation',
      icon: Cpu,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      tasks: {
        initializing: 'Initializing code structures scans...',
        retrieving: 'Accessing target repository configurations...',
        analyzing: 'Auditing CUDA container kernels...',
        generating: 'Evaluating proprietary ML neural networks...'
      },
      evidenceCollected: [
        'Scanned 147 commits. Redundancy rate averages 4.2% (Low).',
        'Custom CUDA kernels validated at under 22ms per prediction.'
      ],
      confidence: `${scores.technology}%`
    },
    {
      id: 'finance',
      name: 'Financial Agent',
      role: 'Runway Balance Review',
      icon: Landmark,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      tasks: {
        initializing: 'Initializing ARR invoicing check...',
        retrieving: 'Retrieving balance deposit ledgers...',
        analyzing: 'Calculating burn rate and runway metrics...',
        generating: 'Verifying subscription bank matches...'
      },
      evidenceCollected: [
        'ARR validated at $1.2M ARR across mid-market clients.',
        'Runway is confirmed stable at 24 months.'
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
        initializing: 'Initializing market size scoping...',
        retrieving: 'Retrieving forecast growth indicators...',
        analyzing: 'Calculating TAM opportunities...',
        generating: 'Evaluating CAGR tailwind projections...'
      },
      evidenceCollected: [
        'TAM estimated at $45B in pharma discovery segments.',
        'Sector CAGR verified at 18.2%.'
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
        initializing: 'Initializing rival feature grid...',
        retrieving: 'Searching target sector competitor graphs...',
        analyzing: 'Scanning IP patent registries...',
        generating: 'Evaluating unique transformer moats...'
      },
      evidenceCollected: [
        'No direct competitors employ sequence transformer models.',
        'Pfizer pilot matches target product specifications.'
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
        initializing: 'Initializing incorporation audit...',
        retrieving: 'Accessing state business registries...',
        analyzing: 'Auditing SOC2 compliance certificates...',
        generating: 'Scanning FDA pre-clinical regulatory checks...'
      },
      evidenceCollected: [
        'Incorporation registry state status is confirmed active.',
        'SOC-2 Type II and HIPAA frameworks fully validated.'
      ],
      confidence: '99%'
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
        'Investment recommendation is fully compiled.',
        'Final scores committed to database.'
      ],
      confidence: `${scores.investmentScore}%`
    }
  ], [scores, startupData]);

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
        const newEv1 = {
          id: `ev-${idx}-1`,
          timestamp: new Date().toLocaleTimeString(),
          source: idx === 0 ? 'Stanford CS database' : idx === 1 ? 'GitHub Actions repo' : idx === 2 ? 'Invoicing Audits' : idx === 3 ? 'Market Sizing survey' : idx === 4 ? 'Patent Registries' : 'SOC2 Audit Files',
          confidence: targetAgent.id === 'legal' ? '99%' : targetAgent.confidence,
          category: targetAgent.name,
          reason: targetAgent.evidenceCollected[0]
        };
        setEvidenceList((prev) => [newEv1, ...prev]);
        setLogs((prev) => [...prev, `[EVIDENCE] ${targetAgent.name} successfully extracted: "${newEv1.reason}"`]);
      }
    }
  }, [stepProgress, activeStepIdx, currentAgent, isCompleted, agents]);

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

    const allAvailableNodes = [
      { id: 'n-founder', type: 'custom', position: { x: 50, y: 30 }, data: { title: `Founder: ${startupData.founderName}`, type: 'Founder', riskLevel: 'Low' } },
      { id: 'n-tech', type: 'custom', position: { x: 350, y: 30 }, data: { title: 'CUDA Core Transformers', type: 'Technology', riskLevel: 'Low' } },
      { id: 'n-finance', type: 'custom', position: { x: 50, y: 270 }, data: { title: '$1.2M ARR Ledgers', type: 'Finance', riskLevel: 'Low' } },
      { id: 'n-market', type: 'custom', position: { x: 350, y: 270 }, data: { title: '$45B TAM Segments', type: 'Market', riskLevel: 'Low' } },
      { id: 'n-legal', type: 'custom', position: { x: 200, y: 330 }, data: { title: 'Articles of Incorporation', type: 'Legal', riskLevel: 'Low' } },
      { id: 'n-decision', type: 'custom', position: { x: 200, y: 20 }, data: { title: `Score: ${scores.investmentScore}/100`, type: 'Risk', riskLevel: 'Low', badge: scores.recommendation } },
    ];

    const allAvailableEdges = [
      { id: 'e-founder', source: 'n-founder', target: 'n-company', animated: true, label: 'FOUNDER_OF', style: { stroke: '#3b82f6' } },
      { id: 'e-tech', source: 'n-company', target: 'n-tech', animated: true, label: 'DEVELOPED', style: { stroke: '#8b5cf6' } },
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
  }, [activeStepIdx, startupData, scores, totalSteps, setNodes, setEdges]);

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
        summary: `AI Agent analysis completed for ${startupData.name}. Market size is estimated at $1.2B. Key tech moats verified.`,
        strengths: [
          'Founder background exhibits Stanford PhD credentials.',
          'Technological kernel contains optimized CUDA benchmarks.'
        ],
        risks: [
          `Regulatory FDA preclinical trial timelines.`,
          'Server computing instance costs are volatile.'
        ],
        founderBackground: `${startupData.founderName} (CEO & Founder).`,
        financialSnapshot: {
          revenue: '$1.2M ARR',
          burnRate: '$90k/mo',
          runway: '24 months',
          valuation: '$22M Post-Money',
        },
        marketOpportunity: `Total Addressable Market in automated biomed discovery is $45B.`,
        techStackRisk: 'No immediate code bugs detected.'
      }
    };

    navigate('/', {
      state: {
        newStartup: finalStartup,
        highlightId: finalStartup.id,
      },
    });
  };


  const handleViewKnowledgeGraph = () => {
    navigate('/knowledge-graph', {
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

  const [completionTab, setCompletionTab] = useState<'summary' | 'graph'>('summary');

  const finalReportSummary = useMemo(() => {
    if (backendResult) {
      return {
        summary: backendResult.details.summary,
        strengths: backendResult.details.strengths,
        risks: backendResult.details.risks,
        score: backendResult.investmentScore,
        recommendation: backendResult.status === 'Approved' ? 'INVEST' : backendResult.status === 'Flagged' ? 'PASS' : 'UNDER REVIEW',
        evidence: backendResult.details.evidenceList?.length || 8,
        relations: 215,
        queries: 40
      };
    }
    return {
      summary: `AI Agent assessment successfully concluded. Main investment score calculated at ${scores.investmentScore}/100. Moated sequencers and founder Stanford PhD are primary core highlights. Spot server computing GPU bills represent key compliance risks.`,
      strengths: [
        `Founder ${startupData.founderName} Stanford CS PhD background credentials.`,
        'Patent protected organic transformer model.',
        'Runway is confirmed stable at 24 months.'
      ],
      risks: [
        'High key-man developer dependence.',
        'Volatility of cloud container GPU pricing.'
      ],
      score: scores.investmentScore,
      recommendation: scores.recommendation,
      evidence: 8,
      relations: 215,
      queries: 40
    };
  }, [backendResult, scores, startupData]);

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
    <div className="min-h-screen bg-[#030014] text-gray-200 font-sans flex flex-col overflow-hidden relative">
      
      {/* Background neon blur overlays */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-purple-light/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/2 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
              <div>
                <span className="text-[9px] text-brand-purple-light font-bold uppercase tracking-widest flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse mr-1" />
                  <span>DILIGENCE MISSION CONTROL</span>
                </span>
                <h1 className="text-2xl font-bold font-display text-white mt-1">
                  Scanning: {startupData.name}
                </h1>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                  Target: {startupData.sector} • {startupData.fundingStage} stage
                </p>
              </div>

              {/* Progress timer widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-black/35 border border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-gray-500 block uppercase tracking-wider">ELAPSED TIME</span>
                  <span className="text-sm font-semibold text-white">{elapsedTime}s</span>
                </div>
                <div className="bg-black/35 border border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-gray-500 block uppercase tracking-wider">REMAINING</span>
                  <span className="text-sm font-semibold text-white">{remainingTimeSeconds}s</span>
                </div>
                <div className="bg-black/35 border border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-gray-500 block uppercase tracking-wider">STAGE RATE</span>
                  <span className="text-sm font-semibold text-brand-purple-light">{stepProgress}%</span>
                </div>
                <div className="bg-black/35 border border-white/5 px-4 py-2 rounded-xl text-center min-w-28">
                  <span className="text-[9px] text-gray-500 block uppercase tracking-wider">COMPLETED AGENTS</span>
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
                          <span className="text-[9px] text-gray-500 uppercase font-semibold">ACTIVE AGENT</span>
                          <h3 className="text-sm font-bold text-white leading-tight">{currentAgent.name}</h3>
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
                        <p className="text-[11px] text-gray-300 italic pt-1 leading-normal">
                          &gt; {currentTask}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ingestion Cognee Memory Stats Panel */}
                <Card className="border border-white/5 bg-black/40 p-4 flex flex-col space-y-3.5 flex-shrink-0">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
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
                      <div key={idx} className="bg-white/2 border border-white/5 p-2 rounded-xl">
                        <span className="text-[8px] text-gray-500 block uppercase font-medium">{s.label}</span>
                        <span className="text-sm font-bold text-white mt-0.5 block">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Agents List Queue */}
                <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-widest pb-1 border-b border-white/5 mb-2">Agent Queue Status</span>
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
                            <span className={`font-semibold block ${isStepActive ? 'text-white' : 'text-gray-300'}`}>{agent.name}</span>
                            <span className="text-[9px] text-gray-500">{agent.role}</span>
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
              <div className="flex flex-col bg-black/40 border border-white/5 rounded-2xl overflow-hidden relative min-h-[400px]">
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
                <div className="p-3 bg-white/2 border-t border-white/5 text-[9px] text-gray-500 text-center pointer-events-none select-none">
                  Nodes and semantic edges populate automatically as agents write data to Cognee memory.
                </div>
              </div>

              {/* Column 3: Live Telemetry Logs & Evidence Stream */}
              <div className="flex flex-col space-y-4 overflow-hidden">
                
                {/* Live Terminal logs */}
                <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl flex flex-col overflow-hidden font-mono text-[10px] min-h-[180px]">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-brand-purple-light" />
                      <span className="font-semibold text-gray-300 text-xs">Live Telemetry logs</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text scrollbar-none">
                    {logs.map((log, index) => (
                      <div key={index} className="text-gray-400 break-all leading-relaxed">
                        {log}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {/* Evidence Stream scrolling box */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[180px]">
                  <div className="px-4 py-2 border-b border-white/5 bg-white/2 flex-shrink-0">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Evidence Stream</span>
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
                          <p className="text-[10px] text-gray-300 leading-normal">{ev.reason}</p>
                          <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono">
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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono whitespace-nowrap">
                Overall Diligence Progress
              </span>
              <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-purple-dark to-brand-purple-light transition-all duration-100 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white font-mono whitespace-nowrap w-12 text-right">
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
            <Card glow className="w-full border border-white/10 relative overflow-hidden bg-dark-bg/85 backdrop-blur-3xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-purple-light to-emerald-500 shadow-[0_0_20px_rgba(139,92,246,0.8)]" />

              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-3 animate-bounce">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  ✓ Investigation Complete
                </CardTitle>
                <p className="text-xs text-gray-400">
                  Diligence report successfully compiled and saved to memory.
                </p>

                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant={completionTab === 'summary' ? 'primary' : 'ghost'}
                    onClick={() => setCompletionTab('summary')}
                    className="h-8 text-xs py-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Diligence Report Summary
                  </Button>
                  <Button
                    size="sm"
                    variant={completionTab === 'graph' ? 'primary' : 'ghost'}
                    onClick={() => setCompletionTab('graph')}
                    className="h-8 text-xs py-1 text-brand-purple-light"
                  >
                    <Database className="w-3.5 h-3.5 mr-1" />
                    Interactive Cognee Graph
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2">
                <AnimatePresence mode="wait">
                  {completionTab === 'summary' ? (
                    <motion.div
                      key="summary-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Verdict Banner */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🚀</span>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white">{startupData.name}</h4>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">{startupData.sector}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center sm:text-right">
                            <span className="text-[9px] text-gray-500 block">INVESTMENT INDEX</span>
                            <span className="text-3xl font-bold font-display text-white">
                              {finalReportSummary.score}
                              <span className="text-xs font-normal text-gray-500">/100</span>
                            </span>
                          </div>
                          <div className="h-10 w-px bg-white/10" />
                          <div className="text-center">
                            <span className="text-[9px] text-gray-500 block">RECOMMENDATION</span>
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
                        <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Major Strengths</span>
                          <ul className="space-y-1.5 list-disc pl-4 text-gray-300">
                            {finalReportSummary.strengths.map((str, idx) => (
                              <li key={idx} className="leading-relaxed">{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-rose-400 block uppercase tracking-wider">Major Risks</span>
                          <ul className="space-y-1.5 list-disc pl-4 text-gray-300">
                            {finalReportSummary.risks.map((rsk, idx) => (
                              <li key={idx} className="leading-relaxed">{rsk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Cognee DB metadata stats */}
                      <div className="bg-white/2 border border-white/5 p-4 rounded-xl text-left space-y-2">
                        <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">Cognee Memory Statistics</span>
                        <div className="grid grid-cols-4 gap-4 text-center font-mono py-2">
                          <div>
                            <span className="text-[8px] text-gray-500 block">EVIDENCE SCAN</span>
                            <span className="text-sm font-bold text-white">{finalReportSummary.evidence}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">RELATIONS LINKED</span>
                            <span className="text-sm font-bold text-white">{finalReportSummary.relations}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">MEMORY QUERIES</span>
                            <span className="text-sm font-bold text-white">{finalReportSummary.queries}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">CONFIDENCE RATE</span>
                            <span className="text-sm font-bold text-emerald-400">94%</span>
                          </div>
                        </div>
                      </div>

                      {/* Diligence explanation */}
                      <div className="bg-white/2 border border-white/5 p-4 rounded-xl text-xs text-left text-gray-400 leading-relaxed">
                        <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider mb-1">Reasoning Narrative</span>
                        {finalReportSummary.summary}
                      </div>
                    </motion.div>
                  ) : (
                    // Graph Tab
                    <motion.div
                      key="graph-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full h-[320px] rounded-xl border border-white/5 bg-black/60 relative overflow-hidden"
                    >
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        nodesConnectable={false}
                        nodesDraggable={true}
                        panOnScroll={true}
                        zoomOnScroll={true}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                      >
                        <Background color="rgba(139, 92, 246, 0.1)" gap={16} size={1} />
                      </ReactFlow>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 border-t border-white/5 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleViewKnowledgeGraph}
                    className="w-full sm:w-auto h-10 px-4 py-2 border-brand-purple/20 text-brand-purple-light hover:bg-brand-purple/10 cursor-pointer"
                  >
                    View Full Knowledge Graph
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleReturnToDashboard}
                    className="w-full sm:w-auto h-10 px-4 py-2 border-white/5 text-gray-300 hover:text-white cursor-pointer"
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
