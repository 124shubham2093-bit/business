import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Search, Layers, Database, ShieldAlert,
  Coins, FileText, CheckCircle2, X, Info, Activity, Loader2
} from 'lucide-react';

import { MockInvestigationService } from '../services/investigation/MockInvestigationService';
import type { GraphNodeData, GraphRelationship } from '../services/investigation/investigationTypes';
import CustomNode from '../components/graph/CustomNode';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// Register custom node type mapping
const nodeTypes = {
  custom: CustomNode,
};

export const KnowledgeGraphPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state details or default to HelixBio AI
  const startupData = useMemo(() => {
    return location.state?.startup || {
      name: 'HelixBio AI',
      sector: 'BioTech AI',
      investmentScore: 88,
      recommendation: 'INVEST',
      riskLevel: 'Low',
      status: 'Approved',
    };
  }, [location.state]);

  // UI state filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedRelation, setSelectedRelation] = useState<string>('All');
  
  // Custom boolean filters
  const [showOnlyRisks, setShowOnlyRisks] = useState(false);
  const [showOnlyFinancials, setShowOnlyFinancials] = useState(false);
  const [hideIsolated, setHideIsolated] = useState(false);

  // Active interaction states
  const [nodeDetails, setNodeDetails] = useState<GraphNodeData | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<GraphRelationship | null>(null);
  
  // Hover states
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Async data states
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // React Flow hooks state
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Initial nodes and edges configuration loaded from service
  const [rawNodes, setRawNodes] = useState<any[]>([]);
  const [rawEdges, setRawEdges] = useState<any[]>([]);

  // Load knowledge graph, timeline, and stats asynchronously
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      MockInvestigationService.getKnowledgeGraph(startupData.name),
      MockInvestigationService.getTimeline(startupData.name),
      MockInvestigationService.getInvestigationStats(startupData.name)
    ]).then(([graph, timelineData, statsData]) => {
      setRawNodes(graph.nodes);
      setRawEdges(graph.edges);
      setTimeline(timelineData);
      setStats(statsData);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Failed to load graph data:', err);
      setIsLoading(false);
    });
  }, [startupData.name]);

  // Deep-link highlight handler for selected nodes navigated from Decision Center
  useEffect(() => {
    if (rawNodes.length > 0 && location.state?.highlightNodeId) {
      const nodeId = location.state.highlightNodeId;
      const targetNode = rawNodes.find(
        (n) => n.id === nodeId || (n.data?.title && n.data.title.toLowerCase().includes(nodeId.toLowerCase()))
      );
      if (targetNode) {
        setHoveredNodeId(targetNode.id);
        setSearchQuery(targetNode.data.title);
        MockInvestigationService.getNodeDetails(targetNode.id)
          .then(setNodeDetails)
          .catch(console.error);
      }
    }
  }, [rawNodes, location.state]);

  // 1. Dynamic filtering logic for nodes
  const filteredNodes = useMemo(() => {
    return rawNodes.filter((node) => {
      const data = node.data as any;
      const type = data.type as string;
      const risk = data.riskLevel as string;
      const title = data.title as string;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match = title.toLowerCase().includes(query) || type.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Filter by Category
      if (selectedType !== 'All' && type !== selectedType) {
        return false;
      }

      // Filter by Risk level
      if (selectedRisk !== 'All' && risk !== selectedRisk) {
        return false;
      }

      // Show Only Risks (Risk type or High Risk nodes)
      if (showOnlyRisks && type !== 'Risk' && risk !== 'High') {
        return false;
      }

      // Show Only Financials
      if (showOnlyFinancials && type !== 'Finance' && type !== 'Investor') {
        return false;
      }

      return true;
    });
  }, [rawNodes, searchQuery, selectedType, selectedRisk, showOnlyRisks, showOnlyFinancials]);

  // 2. Dynamic filtering logic for edges
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return rawEdges.filter((edge) => {
      const isVisible = visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
      if (!isVisible) return false;

      // Filter by Relationship type
      if (selectedRelation !== 'All' && edge.label !== selectedRelation) {
        return false;
      }

      return true;
    });
  }, [filteredNodes, rawEdges, selectedRelation]);

  // 3. Hide Isolated nodes filter implementation
  const displayNodes = useMemo(() => {
    let finalNodes = filteredNodes;
    if (hideIsolated) {
      const activeEndpoints = new Set<string>();
      filteredEdges.forEach((edge) => {
        activeEndpoints.add(edge.source);
        activeEndpoints.add(edge.target);
      });
      finalNodes = filteredNodes.filter((n) => activeEndpoints.has(n.id) || n.id === 'n-company');
    }

    // Apply hovered/faded highlights
    return finalNodes.map((node) => {
      let faded = false;
      let searched = false;
      const title = (node.data as any).title || '';

      // Highlight if matches search query exactly
      if (searchQuery && title.toLowerCase().includes(searchQuery.toLowerCase())) {
        searched = true;
      }

      if (hoveredNodeId) {
        const isSelf = node.id === hoveredNodeId;
        const isConnected = rawEdges.some(
          (edge) =>
            (edge.source === hoveredNodeId && edge.target === node.id) ||
            (edge.target === hoveredNodeId && edge.source === node.id)
        );
        if (!isSelf && !isConnected) {
          faded = true;
        }
      }

      return {
        ...node,
        style: {
          ...node.style,
          opacity: faded ? 0.2 : 1,
          border: searched ? '2px solid #8b5cf6' : undefined,
          boxShadow: searched ? '0 0 25px rgba(139, 92, 246, 0.6)' : undefined,
          transition: 'all 0.25s ease-in-out',
        },
      };
    });
  }, [filteredNodes, filteredEdges, hideIsolated, hoveredNodeId, searchQuery, rawEdges]);

  // 4. Highlight hovered edges
  const displayEdges = useMemo(() => {
    return filteredEdges.map((edge) => {
      let highlighted = false;
      let faded = false;

      if (hoveredNodeId) {
        if (edge.source === hoveredNodeId || edge.target === hoveredNodeId) {
          highlighted = true;
        } else {
          faded = true;
        }
      }

      if (hoveredEdgeId) {
        if (edge.id === hoveredEdgeId) {
          highlighted = true;
        } else {
          faded = true;
        }
      }

      return {
        ...edge,
        animated: highlighted || edge.animated,
        style: {
          ...edge.style,
          stroke: highlighted
            ? '#c084fc'
            : faded
            ? 'rgba(139, 92, 246, 0.04)'
            : 'rgba(139, 92, 246, 0.35)',
          strokeWidth: highlighted ? 3.5 : 1.5,
          transition: 'all 0.25s ease-in-out',
        },
      };
    });
  }, [filteredEdges, hoveredNodeId, hoveredEdgeId]);

  // Click handlers
  const handleNodeClick = useCallback(async (_event: any, node: any) => {
    setSelectedRelationship(null);
    
    try {
      const details = await MockInvestigationService.getNodeDetails(node.id);
      setNodeDetails(details);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleEdgeClick = useCallback(async (_event: any, edge: any) => {
    setNodeDetails(null);
    
    try {
      const relationship = await MockInvestigationService.getRelationshipDetails(edge.id);
      setSelectedRelationship(relationship);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handlePaneClick = useCallback(() => {
    setNodeDetails(null);
    setSelectedRelationship(null);
  }, []);

  // Sync React Flow nodes when displayNodes recalculates
  useEffect(() => {
    if (displayNodes.length > 0 || !isLoading) {
      setNodes(displayNodes);
    }
  }, [displayNodes, setNodes, isLoading]);

  useEffect(() => {
    if (displayEdges.length > 0 || !isLoading) {
      setEdges(displayEdges);
    }
  }, [displayEdges, setEdges, isLoading]);

  // Legend categories configurations
  const legendItems = [
    { type: 'Founder', color: 'bg-blue-500' },
    { type: 'Technology', color: 'bg-brand-purple' },
    { type: 'Finance', color: 'bg-emerald-500' },
    { type: 'Market', color: 'bg-amber-500' },
    { type: 'Legal', color: 'bg-yellow-500' },
    { type: 'Risk', color: 'bg-rose-500' },
    { type: 'Investor', color: 'bg-teal-500' },
    { type: 'Document', color: 'bg-gray-500' },
    { type: 'News', color: 'bg-amber-600' }
  ];

  const graphStats = stats || {
    entities: 0,
    relationships: 0,
    documents: 0,
    evidence: 0,
    signals: 0,
    confidence: '0%'
  };

  if (isLoading && rawNodes.length === 0) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-purple-light animate-spin" />
          <span className="text-xs text-gray-500">Querying semantic due diligence graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-gray-200 font-sans flex flex-col overflow-hidden relative">
      
      {/* Top Title Bar */}
      <header className="h-16 border-b border-white/5 bg-dark-bg/40 backdrop-blur-md px-6 flex items-center justify-between z-30 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-brand-purple-light animate-pulse" />
            <span className="text-sm font-bold font-display text-white">
              VentureIQ Semantic Auditor
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-gray-400">
          <span>Target Workspace:</span>
          <span className="bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 px-2 py-0.5 rounded font-mono font-bold">
            {startupData.name}
          </span>
        </div>
      </header>

      {/* Main 3-Column Workspace Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Investigation Summary & Metrics */}
        <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-5 flex flex-col space-y-6 overflow-y-auto z-10">
          {/* Audit summary */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple-light">
              Audit Summary Card
            </h3>
            
            <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Startup</span>
                <span className="font-semibold text-white">{startupData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sector</span>
                <span className="text-gray-300">{startupData.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Diligence Score</span>
                <span className="font-bold text-emerald-400">{startupData.investmentScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verdict Recommendation</span>
                <Badge
                  variant={startupData.recommendation === 'INVEST' ? 'success' : 'warning'}
                  glow={startupData.recommendation === 'INVEST'}
                  className="text-[9px] px-2 py-0.5"
                >
                  {startupData.recommendation}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Risk Profile</span>
                <Badge
                  variant={startupData.riskLevel === 'Low' ? 'success' : startupData.riskLevel === 'Medium' ? 'warning' : 'danger'}
                  glow={startupData.riskLevel === 'High'}
                  className="text-[9px] px-2 py-0.5"
                >
                  {startupData.riskLevel} Risk
                </Badge>
              </div>
            </div>
          </div>

          {/* Graph stats */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Graph Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { name: 'Entities', val: graphStats.entities },
                { name: 'Relationships', val: graphStats.relationships },
                { name: 'Documents', val: graphStats.documents },
                { name: 'Evidence Files', val: graphStats.signals }, // mapped signals as evidence files count
                { name: 'Key Signals', val: 24 },
                { name: 'Confidence', val: graphStats.confidence, glow: true },
              ].map((s, idx) => (
                <div key={idx} className="bg-white/2 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] text-gray-500 block uppercase font-medium">{s.name}</span>
                  <span className={`text-base font-bold mt-1 block font-mono ${s.glow ? 'text-emerald-400' : 'text-white'}`}>
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex items-start space-x-2 text-[10px] text-gray-400 leading-relaxed">
            <Info className="w-4 h-4 text-brand-purple-light flex-shrink-0 mt-0.5" />
            <p>Hover nodes or connections in the workspace to highlight direct associations and path routes.</p>
          </div>
        </aside>

        {/* Center Panel: Graph canvas with toolbar and legend */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Floating Graph Toolbar */}
          <div className="absolute top-4 left-6 right-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 z-20 pointer-events-none select-none">
            {/* Search Input bar */}
            <div className="relative w-full max-w-xs pointer-events-auto">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search graph entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-dark-bg/95 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 shadow-2xl transition-colors"
              />
            </div>

            {/* Selector Filters toolbar */}
            <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-dark-bg/95 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-2xl text-[10px]">
              
              {/* Category selector */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                <span className="text-gray-500">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0b0821] text-gray-200">All Types</option>
                  <option value="Founder" className="bg-[#0b0821] text-gray-200">Founder</option>
                  <option value="Technology" className="bg-[#0b0821] text-gray-200">Technology</option>
                  <option value="Finance" className="bg-[#0b0821] text-gray-200">Finance</option>
                  <option value="Market" className="bg-[#0b0821] text-gray-200">Market</option>
                  <option value="Legal" className="bg-[#0b0821] text-gray-200">Legal</option>
                  <option value="Investor" className="bg-[#0b0821] text-gray-200">Investor</option>
                  <option value="Document" className="bg-[#0b0821] text-gray-200">Document</option>
                  <option value="News" className="bg-[#0b0821] text-gray-200">News</option>
                </select>
              </div>

              {/* Risk Level selector */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                <span className="text-gray-500">Risk:</span>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0b0821] text-gray-200">All Risks</option>
                  <option value="Low" className="bg-[#0b0821] text-gray-200">Low Risk</option>
                  <option value="Medium" className="bg-[#0b0821] text-gray-200">Medium Risk</option>
                  <option value="High" className="bg-[#0b0821] text-gray-200">High Risk</option>
                </select>
              </div>

              {/* Relation selector */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                <span className="text-gray-500">Relation:</span>
                <select
                  value={selectedRelation}
                  onChange={(e) => setSelectedRelation(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0b0821] text-gray-200">All Relations</option>
                  <option value="FOUNDER_OF" className="bg-[#0b0821] text-gray-200">FOUNDER_OF</option>
                  <option value="DEVELOPED" className="bg-[#0b0821] text-gray-200">DEVELOPED</option>
                  <option value="POWERED_BY" className="bg-[#0b0821] text-gray-200">POWERED_BY</option>
                  <option value="SOURCE_CODE" className="bg-[#0b0821] text-gray-200">SOURCE_CODE</option>
                  <option value="PATENTED_BY" className="bg-[#0b0821] text-gray-200">PATENTED_BY</option>
                  <option value="GENERATES" className="bg-[#0b0821] text-gray-200">GENERATES</option>
                  <option value="HAS_BURN" className="bg-[#0b0821] text-gray-200">HAS_BURN</option>
                  <option value="RAISING" className="bg-[#0b0821] text-gray-200">RAISING</option>
                  <option value="LEAD_BY" className="bg-[#0b0821] text-gray-200">LEAD_BY</option>
                  <option value="TARGETS" className="bg-[#0b0821] text-gray-200">TARGETS</option>
                  <option value="SUBJECT_TO" className="bg-[#0b0821] text-gray-200">SUBJECT_TO</option>
                  <option value="PARTNERED_WITH" className="bg-[#0b0821] text-gray-200">PARTNERED_WITH</option>
                </select>
              </div>

              {/* Boolean buttons */}
              <button
                onClick={() => setShowOnlyRisks(!showOnlyRisks)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  showOnlyRisks ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-transparent text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <ShieldAlert className="w-3 h-3 mr-0.5" />
                Only Risks
              </button>

              <button
                onClick={() => showOnlyFinancials ? setShowOnlyFinancials(false) : (setShowOnlyFinancials(true), setShowOnlyRisks(false))}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  showOnlyFinancials ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Coins className="w-3 h-3 mr-0.5" />
                Only Financials
              </button>

              <button
                onClick={() => setHideIsolated(!hideIsolated)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  hideIsolated ? 'bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30' : 'bg-transparent text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Layers className="w-3 h-3 mr-0.5" />
                Hide Isolated
              </button>
            </div>
          </div>

          {/* Canvas Board */}
          <div className="flex-1 bg-[#030014] overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              onNodeMouseEnter={(_e, node) => setHoveredNodeId(node.id)}
              onNodeMouseLeave={() => setHoveredNodeId(null)}
              onEdgeMouseEnter={(_e, edge) => setHoveredEdgeId(edge.id)}
              onEdgeMouseLeave={() => setHoveredEdgeId(null)}
              panOnScroll={true}
              zoomOnScroll={true}
            >
              <Background color="rgba(139, 92, 246, 0.12)" gap={16} size={1} />
              <Controls className="bg-dark-bg/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden [&_button]:border-white/5" />
              <MiniMap
                nodeColor={() => 'rgba(139, 92, 246, 0.15)'}
                maskColor="rgba(3, 0, 20, 0.75)"
                className="bg-dark-bg/95 border border-white/10 rounded-xl overflow-hidden"
              />
            </ReactFlow>
          </div>

          {/* Floating Edge clicked detail overlay dialog */}
          <AnimatePresence>
            {selectedRelationship && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-24 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 max-w-md w-full bg-dark-bg/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-30"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-brand-purple-light" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Semantic Connection Details</span>
                  </div>
                  <button
                    onClick={() => setSelectedRelationship(null)}
                    className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-3 text-xs space-y-2">
                  <div className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-gray-500 font-medium">Relationship Type</span>
                    <Badge variant="info" className="font-bold font-mono text-[9px]">{selectedRelationship.type}</Badge>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-gray-500 font-medium">Verification Confidence</span>
                    <span className="font-bold text-emerald-400">{selectedRelationship.confidence}</span>
                  </div>
                  <div className="bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-gray-500 font-medium block">Auditor Verification Reason</span>
                    <p className="text-gray-300 mt-1 leading-relaxed text-[11px]">{selectedRelationship.reason}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Graph Category Legend */}
          <div className="absolute bottom-24 left-6 bg-dark-bg/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-4 text-[9px] font-semibold text-gray-400">
            <span className="text-white border-r border-white/10 pr-3 mr-1 uppercase">Legend</span>
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-lg`} />
                <span>{item.type}</span>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar: Dynamic selected Node Details panel */}
        <AnimatePresence>
          {nodeDetails && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl p-5 flex flex-col space-y-5 overflow-y-auto z-20"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    {nodeDetails.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[9px] text-brand-purple-light font-bold uppercase tracking-wider">
                      {nodeDetails.type}
                    </span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-emerald-400 font-mono text-[9px] font-bold">
                      {nodeDetails.confidence} Conf.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setNodeDetails(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div className="text-xs space-y-1">
                <span className="text-gray-500 font-semibold block uppercase text-[9px]">Semantic Description</span>
                <p className="text-gray-300 leading-relaxed bg-white/2 p-3 rounded-lg border border-white/5">
                  {nodeDetails.description}
                </p>
              </div>

              {/* Connected edges list */}
              <div className="text-xs space-y-2">
                <span className="text-gray-500 font-semibold block uppercase text-[9px]">Linked Entities</span>
                <div className="space-y-1.5">
                  {nodeDetails.connectedNodes.map((n, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded bg-white/2 border border-white/5 hover:bg-brand-purple/5 transition-colors animate-fade-in"
                    >
                      <span className="font-semibold text-white">{n.name}</span>
                      <span className="text-[9px] text-gray-500 uppercase font-mono">{n.relation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence checkpoints */}
              <div className="text-xs space-y-2">
                <span className="text-gray-500 font-semibold block uppercase text-[9px]">Verification Evidence</span>
                <div className="space-y-1.5">
                  {nodeDetails.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 p-2 rounded bg-white/2 border border-white/5 text-[10px] text-gray-300 leading-normal animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related filings */}
              <div className="text-xs space-y-2">
                <span className="text-gray-500 font-semibold block uppercase text-[9px]">Related Filings</span>
                <div className="space-y-1.5">
                  {nodeDetails.relatedDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 p-2 rounded bg-white/2 border border-white/5 text-[10px] text-gray-300 animate-fade-in">
                      <FileText className="w-3.5 h-3.5 text-brand-purple-light" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel: Audit Timeline logs */}
      <footer className="h-20 border-t border-white/5 bg-black/50 backdrop-blur-xl px-6 flex items-center z-10">
        <div className="flex items-center space-x-3 pr-6 border-r border-white/5 mr-4 flex-shrink-0">
          <Activity className="w-5 h-5 text-brand-purple-light animate-pulse" />
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider">Telemetry Path</span>
            <span className="text-xs text-white font-semibold block">Diligence Timeline</span>
          </div>
        </div>

        {/* Scrolling horizontal timeline dots */}
        <div className="flex-1 overflow-x-auto flex items-center space-x-8 py-2 relative scrollbar-none">
          {timeline.map((evt, idx) => (
            <div key={idx} className="flex items-center space-x-8 flex-shrink-0 select-none group">
              <div className="flex flex-col text-[10px]">
                <span className="text-brand-purple-light font-bold font-mono">{evt.time}</span>
                <span className="text-white font-semibold mt-0.5">{evt.title}</span>
                <span className="text-[9px] text-gray-500 mt-0.5">{evt.description}</span>
              </div>
              {idx < timeline.length - 1 && (
                <div className="h-0.5 w-8 bg-gradient-to-r from-brand-purple to-white/10 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default KnowledgeGraphPage;
