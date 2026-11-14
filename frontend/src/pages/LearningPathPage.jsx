import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { learningPathsAPI, careersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  GitFork,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';

export default function LearningPathPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const careerParam = searchParams.get('career') || '';

  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Load career options
  useEffect(() => {
    careersAPI
      .getCareers()
      .then((res) => {
        const list = res.data.results || res.data || [];
        setCareers(list);
        if (list.length > 0) {
          const match = careerParam ? list.find((c) => c.slug === careerParam) : list[0];
          setSelectedCareerId(match ? match.id : list[0].id);
        }
      })
      .catch((err) => console.error('Failed to load careers', err));
  }, [careerParam]);

  // Load or generate roadmap
  const loadRoadmap = (careerId, recalculate = false) => {
    if (!careerId) return;

    if (recalculate) setGenerating(true);
    else setLoading(true);
    setError('');

    learningPathsAPI
      .generateLearningPath({ career_id: careerId, recalculate })
      .then((res) => {
        setLearningPath(res.data);
      })
      .catch((err) => {
        console.error('Failed to generate roadmap', err);
        setError('Failed to construct topologically sorted learning path.');
      })
      .finally(() => {
        setLoading(false);
        setGenerating(false);
      });
  };

  useEffect(() => {
    if (selectedCareerId) {
      loadRoadmap(selectedCareerId, false);
    }
  }, [selectedCareerId]);

  const handleStatusChange = async (stepId, newStatus) => {
    try {
      await learningPathsAPI.updateStepStatus(stepId, newStatus);
      // Refresh roadmap steps & progress
      loadRoadmap(selectedCareerId, false);
    } catch (err) {
      console.error('Failed to update milestone status', err);
    }
  };

  if (loading) return <LoadingSpinner message="Constructing DAG-ordered learning roadmap via topological sort..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Controls */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
              Topological Roadmap Engine
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict prerequisite-respecting sequence. No dependent skill is scheduled before its foundational prerequisite.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono">Target Career:</label>
            <select
              value={selectedCareerId || ''}
              onChange={(e) => setSelectedCareerId(parseInt(e.target.value))}
              className="text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none font-medium"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadRoadmap(selectedCareerId, true)}
            disabled={generating}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Recalculating...' : 'Recalculate Roadmap'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {learningPath && (
        <>
          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Total Milestones</span>
              <div className="text-3xl font-black font-mono text-slate-100">
                {learningPath.completed_steps}{' '}
                <span className="text-sm font-normal text-slate-500">
                  / {learningPath.total_steps}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${learningPath.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Estimated Effort</span>
              <div className="text-3xl font-black font-mono text-cyan-400">
                {learningPath.estimated_total_hours}{' '}
                <span className="text-sm font-normal text-slate-500">hours</span>
              </div>
              <div className="text-[11px] text-slate-400">
                ~{Math.round(learningPath.estimated_total_hours / 15)} weeks at 15 hrs/week
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Completion Score</span>
              <div className="text-3xl font-black font-mono text-purple-400">
                {learningPath.progress_percentage}%
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto unlocks downstream steps
              </div>
            </div>
          </div>

          {/* Sequential Milestones List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                Roadmap Milestones ({learningPath.steps?.length || 0})
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Topologically Ordered DAG Sequence
              </span>
            </div>

            <div className="space-y-4">
              {learningPath.steps && learningPath.steps.length > 0 ? (
                learningPath.steps.map((step) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isAvailable = step.status === 'AVAILABLE';
                  const isInProgress = step.status === 'IN_PROGRESS';
                  const isLocked = step.status === 'LOCKED';

                  return (
                    <div
                      key={step.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isInProgress
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                          : isAvailable
                          ? 'bg-slate-900/80 border-cyan-500/40 hover:border-cyan-500/70'
                          : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Step Details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Step {step.sequence_order}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isInProgress
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : isAvailable
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              }`}
                            >
                              {step.status}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              ~{step.estimated_hours} hrs
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              • {step.skill.difficulty_level}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            {step.skill.name}
                            <span className="text-xs font-normal text-slate-400">
                              ({step.skill.category_name})
                            </span>
                          </h4>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.skill.description}
                          </p>

                          {/* Suggested Practical Hands-on Activities */}
                          {step.suggested_activities && step.suggested_activities.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Recommended Hands-on Tasks:
                              </span>
                              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                                {step.suggested_activities.map((act, idx) => (
                                  <li key={idx} className="leading-snug">
                                    {act}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Status Actions */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          {isLocked ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono">
                              <Lock className="w-3.5 h-3.5" /> Prerequisites Pending
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {!isCompleted && (
                                <button
                                  onClick={() => handleStatusChange(step.id, 'IN_PROGRESS')}
                                  disabled={isInProgress}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    isInProgress
                                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 cursor-default'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {isInProgress ? 'In Progress' : 'Start Learning'}
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    step.id,
                                    isCompleted ? 'AVAILABLE' : 'COMPLETED'
                                  )
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isCompleted ? 'Completed (Undo)' : 'Mark Completed'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 glass-card rounded-2xl border border-slate-800">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">All career skills acquired!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You have achieved verified coverage across all requirements for this career.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
