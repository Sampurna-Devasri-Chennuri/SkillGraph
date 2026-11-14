import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { graphAPI, skillsAPI, careersAPI } from '../services/api';
import SkillNode from '../components/SkillNode';
import NodeDetailModal from '../components/NodeDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
  Maximize2,
  CheckCircle2,
  Award,
  Clock,
  Flame,
} from 'lucide-react';

export default function GraphPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCareer = searchParams.get('career') || '';

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categories, setCategories] = useState([]);
  const [careers, setCareers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState(initialCareer);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected node for detail drawer
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [graphSummary, setGraphSummary] = useState(null);

  // Custom node types for React Flow
  const nodeTypes = useMemo(() => ({ skillNode: SkillNode }), []);

  // Fetch categories & careers on mount
  useEffect(() => {
    Promise.all([skillsAPI.getCategories(), careersAPI.getCareers()])
      .then(([catRes, carRes]) => {
        setCategories(catRes.data.results || catRes.data || []);
        setCareers(carRes.data.results || carRes.data || []);
      })
      .catch((err) => console.error('Failed to load filter metadata', err));
  }, []);

  // Fetch graph data when filters change
  const fetchGraphData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedCareer && selectedCareer !== 'all') params.career = selectedCareer;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    graphAPI
      .getGraph(params)
      .then((res) => {
        const rawNodes = res.data.nodes || [];
        const rawEdges = (res.data.edges || []).map((e) => ({
          ...e,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: e.style?.stroke || '#475569',
          },
        }));

        setNodes(rawNodes);
        setEdges(rawEdges);
        setGraphSummary(res.data.summary);
      })
      .catch((err) => {
        console.error('Failed to load graph data', err);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedCareer, searchQuery, setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.data?.skillId || parseInt(node.id));
  }, []);

  const handleSelectSkillFromModal = (newSkillId) => {
    setSelectedNodeId(newSkillId);
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full flex flex-col bg-[#070913] overflow-hidden">
      {/* Top Controls & Filter Bar */}
      <div className="z-10 glass-panel border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Career Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, tags, keywords..."
              className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 pl-8 pr-3 py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Career Filter */}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCareer}
              onChange={(e) => {
                setSelectedCareer(e.target.value);
                setSearchParams(e.target.value ? { career: e.target.value } : {});
              }}
              className="text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Career Scopes (Global Graph)</option>
              {careers.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Stats & Reload */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          {graphSummary && (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-cyan-400 font-bold">{graphSummary.totalNodes} Nodes</span>
              <span>•</span>
              <span className="text-purple-400 font-bold">{graphSummary.totalEdges} Prereqs</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">DAG Verified (Cycle-Free)</span>
            </div>
          )}

          <button
            onClick={fetchGraphData}
            title="Refresh Graph"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative w-full h-full">
        {loading && nodes.length === 0 ? (
          <LoadingSpinner message="Calculating topological DAG levels and layout..." />
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            attributionPosition="bottom-left"
          >
            <Controls className="!bg-[#0f172a] !border-slate-800 !text-slate-300" />
            <Background color="#1e293b" gap={24} size={1} />
          </ReactFlow>
        )}

        {/* Legend Overlay Floating on bottom left */}
        <div className="absolute bottom-5 left-5 z-10 glass-panel p-3 rounded-xl border border-slate-800/90 text-[11px] space-y-1.5 shadow-xl max-w-xs hidden sm:block">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Status Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Demonstrated
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Award className="w-3 h-3" /> Practiced
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <Clock className="w-3 h-3" /> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-3 h-3" /> Target Core
            </span>
          </div>
          <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800">
            Click any node to view detailed prerequisites, downstream unlocked skills, and learning resources.
          </div>
        </div>
      </div>

      {/* Node Detail Slide-Over Drawer */}
      {selectedNodeId && (
        <NodeDetailModal
          skillId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
          onSkillUpdated={fetchGraphData}
          onSelectSkill={handleSelectSkillFromModal}
        />
      )}
    </div>
  );
}
