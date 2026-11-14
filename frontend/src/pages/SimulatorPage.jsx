import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { careersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  GitFork,
  Target,
  BarChart2,
} from 'lucide-react';

export default function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const initialSource = searchParams.get('source') || '';
  const initialTarget = searchParams.get('target') || '';

  const [careers, setCareers] = useState([]);
  const [sourceCareerId, setSourceCareerId] = useState(initialSource ? parseInt(initialSource) : null);
  const [targetCareerId, setTargetCareerId] = useState(initialTarget ? parseInt(initialTarget) : null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    careersAPI
      .getCareers()
      .then((res) => {
        const list = res.data.results || res.data || [];
        setCareers(list);
        if (list.length >= 2) {
          if (!sourceCareerId) {
            const fs = list.find((c) => c.slug === 'full-stack-developer') || list[1];
            setSourceCareerId(fs.id);
          }
          if (!targetCareerId) {
            const ai = list.find((c) => c.slug === 'ai-engineer') || list[0];
            setTargetCareerId(ai.id);
          }
        }
      })
      .catch((err) => console.error('Failed to load careers for simulation', err));
  }, []);

  const runSimulation = () => {
    if (!sourceCareerId || !targetCareerId) return;

    if (sourceCareerId === targetCareerId) {
      setError('Please select two distinct career pathways to simulate a transition.');
      return;
    }

    setLoading(true);
    setError('');

    careersAPI
      .simulateTransition(sourceCareerId, targetCareerId)
      .then((res) => {
        setSimulation(res.data);
      })
      .catch((err) => {
        console.error('Simulation calculation failed', err);
        setError('Failed to compute career transition simulation.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sourceCareerId && targetCareerId && sourceCareerId !== targetCareerId) {
      runSimulation();
    }
  }, [sourceCareerId, targetCareerId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-pink-400 uppercase tracking-wider">
              Career Transition Modeling
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-pink-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            What-If Career Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate skill transferability, graph intersections, and the exact delta roadmap required to pivot disciplines.
          </p>
        </div>
      </div>

      {/* Dual Selector Bar */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Source Role */}
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-mono text-slate-400 block">Current / Source Discipline:</label>
          <select
            value={sourceCareerId || ''}
            onChange={(e) => setSourceCareerId(parseInt(e.target.value))}
            className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 focus:border-cyan-500 focus:outline-none font-medium"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>

        {/* Transition Arrow */}
        <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-400 flex-shrink-0">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Target Role */}
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-mono text-slate-400 block">Target Pivot Discipline:</label>
          <select
            value={targetCareerId || ''}
            onChange={(e) => setTargetCareerId(parseInt(e.target.value))}
            className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 focus:border-cyan-500 focus:outline-none font-medium"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <LoadingSpinner message="Intersecting career dependency graphs and calculating delta bridge..." />}

      {simulation && !loading && (
        <>
          {/* Key Simulation Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Transferable Skill Overlap</span>
              <div className="text-3xl font-black font-mono text-cyan-400">
                {simulation.metrics.transferable_skill_coverage_pct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, simulation.metrics.transferable_skill_coverage_pct)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                Of target requirements already covered by source role
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Shared Skills Count</span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                {simulation.metrics.shared_skills_count}
              </div>
              <div className="text-[11px] text-slate-400">
                Direct common competencies across both careers
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Additional Delta Skills</span>
              <div className="text-3xl font-black font-mono text-purple-400">
                {simulation.metrics.additional_skills_count}
              </div>
              <div className="text-[11px] text-slate-400">
                New competencies required for target role
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Estimated Pivot Duration</span>
              <div className="text-3xl font-black font-mono text-amber-400">
                ~{simulation.metrics.estimated_months_part_time}{' '}
                <span className="text-sm font-normal text-slate-500">months</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Based on {simulation.metrics.estimated_learning_hours} hrs part-time study
              </div>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>{simulation.metrics.disclaimer}</span>
          </div>

          {/* Dual Comparison Columns: Shared Skills vs Additional Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shared Skills Column */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Immediate Leverage
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                    Shared Skills ({simulation.shared_skills?.length || 0})
                  </h3>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {simulation.shared_skills?.map((s) => (
                  <div
                    key={s.skill_id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.category}</div>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="text-slate-300">
                        Req Lvl: {s.target_min_prof}/4
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Skills Needed Column */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                    New Competencies
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                    Additional Skills ({simulation.additional_skills?.length || 0})
                  </h3>
                </div>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {simulation.additional_skills?.map((s) => (
                  <div
                    key={s.skill_id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.category}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        s.is_core
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {s.is_core ? 'Core' : 'Recommended'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delta Transition Roadmap (Topologically Ordered) */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Transition Bridge
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  Algorithmic Delta Roadmap (
                  {simulation.delta_roadmap?.length || 0} Milestones)
                </h3>
              </div>
              <Link
                to={`/learning-path?career=${simulation.target_career.slug}`}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
              >
                Adopt as Active Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              The exact sequence needed to transition from {simulation.source_career.title} to {simulation.target_career.title}, with prerequisite bridging guaranteed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {simulation.delta_roadmap?.map((step) => (
                <div
                  key={step.skill_id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 font-bold">Step {step.order}</span>
                    <span className="text-slate-400">~{step.estimated_hours} hrs</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{step.name}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{step.category}</span>
                    {step.is_foundational_bridge && (
                      <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Bridge Prereq
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
