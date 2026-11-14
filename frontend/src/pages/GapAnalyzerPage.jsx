import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { graphAPI, careersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  GitFork,
  Target,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';

export default function GapAnalyzerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCareer = searchParams.get('career') || '';

  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(initialCareer);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Load career options
  useEffect(() => {
    careersAPI.getCareers().then((res) => {
      const list = res.data.results || res.data || [];
      setCareers(list);
      if (!selectedCareer && list.length > 0) {
        setSelectedCareer(list[0].slug);
      }
    });
  }, [selectedCareer]);

  // Load gap analysis
  useEffect(() => {
    if (!selectedCareer) return;

    setLoading(true);
    graphAPI
      .getGapAnalysis({ career: selectedCareer })
      .then((res) => {
        setAnalysis(res.data);
      })
      .catch((err) => {
        console.error('Failed to run gap analysis', err);
      })
      .finally(() => setLoading(false));
  }, [selectedCareer]);

  const handleCareerChange = (slug) => {
    setSelectedCareer(slug);
    setSearchParams({ career: slug });
  };

  if (loading) return <LoadingSpinner message="Calculating weighted competency gap and prerequisite chains..." />;

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Compass className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <p>No gap analysis data could be calculated.</p>
      </div>
    );
  }

  const { career, summary, demonstrated_skills, partially_developed_skills, missing_skills, missing_foundational_prereqs, priority_recommendations, category_breakdown } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Target Role Selector */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Diagnostic Engine
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            Skill Gap Analyzer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent weighted analysis comparing your demonstrated proficiency against industry requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono">Target Career:</label>
            <select
              value={selectedCareer}
              onChange={(e) => handleCareerChange(e.target.value)}
              className="text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none font-medium"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <Link
            to={`/learning-path?career=${career.slug}`}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <GitFork className="w-4 h-4" />
            Build Roadmap
          </Link>
        </div>
      </div>

      {/* Prerequisite Alert Banner if foundational skills are unmet */}
      {missing_foundational_prereqs && missing_foundational_prereqs.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 shadow-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-300">
              {missing_foundational_prereqs.length} Foundational Prerequisite(s) Blocked
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are missing foundational skills required before starting core curriculum targets:
              {' '}
              <span className="font-semibold text-amber-200">
                {missing_foundational_prereqs.map((f) => f.name).join(', ')}
              </span>
              . Our roadmap generator will sequence these first to ensure healthy learning progression.
            </p>
          </div>
        </div>
      )}

      {/* Scoring KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Coverage Score */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Core Skill Coverage</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {summary.core_coverage_pct}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.core_coverage_pct)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Weighted demonstrated / Total required core
          </div>
        </div>

        {/* Demonstrated Count */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Demonstrated Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {summary.demonstrated_count}{' '}
            <span className="text-sm font-normal text-slate-500">
              / {summary.total_required_skills}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Met required proficiency level</div>
        </div>

        {/* Partially Developed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Needs Improvement</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {summary.partially_developed_count}
          </div>
          <div className="text-[11px] text-slate-400">Practiced, but below target expectation</div>
        </div>

        {/* Missing Core Skills */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Missing Core Skills</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">
            {summary.missing_count}
          </div>
          <div className="text-[11px] text-slate-400">Required competencies yet to start</div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown Radar & Priority Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Coverage Radar / Bar */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Discipline Breakdown
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-0.5">Competency by Category</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={category_breakdown}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" width={110} stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d1a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val) => [`${val}%`, 'Coverage']}
                />
                <Bar dataKey="coverage_pct" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Strategic Recommendations */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
              Strategic Ordering
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-0.5">Priority Recommendations</h3>
          </div>

          <div className="space-y-2.5">
            {priority_recommendations && priority_recommendations.length > 0 ? (
              priority_recommendations.map((rec) => (
                <div
                  key={rec.skill_id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{rec.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({rec.category})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{rec.reason}</p>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap border ${
                      rec.readiness === 'READY_TO_LEARN'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {rec.readiness === 'READY_TO_LEARN' ? 'Ready to Learn' : 'Prereqs Blocked'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic py-6 text-center">
                All prioritized skills have been met!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Skill Breakdown Lists with Tabs */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Curriculum Skill Inventory</h3>
            <p className="text-xs text-slate-400">
              Inspection of each technical skill required for {career.title}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({summary.total_required_skills})
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'missing' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Missing ({summary.missing_count})
            </button>
            <button
              onClick={() => setActiveTab('partial')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'partial' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Work ({summary.partially_developed_count})
            </button>
            <button
              onClick={() => setActiveTab('demonstrated')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'demonstrated' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Demonstrated ({summary.demonstrated_count})
            </button>
          </div>
        </div>

        {/* Skill Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(activeTab === 'all' || activeTab === 'missing' ? missing_skills : [])
            .concat(activeTab === 'all' || activeTab === 'partial' ? partially_developed_skills : [])
            .concat(activeTab === 'all' || activeTab === 'demonstrated' ? demonstrated_skills : [])
            .map((item) => (
              <div
                key={item.skill_id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {item.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        item.is_core
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      }`}
                    >
                      {item.is_core ? 'Core' : 'Recommended'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    Lvl {item.user_proficiency} / Req {item.required_proficiency}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      item.user_proficiency >= item.required_proficiency
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : item.user_proficiency > 0
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {item.user_proficiency >= item.required_proficiency
                      ? 'Demonstrated'
                      : item.user_proficiency > 0
                      ? 'Partially Met'
                      : 'Unacquired'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
