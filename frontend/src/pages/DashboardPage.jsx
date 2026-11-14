import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, learningPathsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Target,
  Award,
  Clock,
  Sparkles,
  GitFork,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Layers,
  Activity,
  Compass,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    analyticsAPI
      .getDashboardMetrics()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard metrics', err);
        setError('Failed to load dashboard intelligence data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating live career intelligence metrics..." />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p>{error || 'No analytics data available.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, recommended_next_skill, career_readiness_ranking, skill_distribution, recent_activities, active_learning_path } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Goal Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl bg-gradient-to-r from-slate-900/90 via-[#0a0f1e]/90 to-purple-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Career Intelligence Control Center
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p className="text-xs text-slate-400">
            Targeting{' '}
            <span className="text-cyan-300 font-semibold font-mono">
              {overview.target_career_title}
            </span>{' '}
            • {overview.total_skills_count} skills modeled in your dependency graph
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/gap-analyzer"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Compass className="w-4 h-4" />
            Analyze Gap
          </Link>
          <Link
            to="/graph"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            <GitFork className="w-4 h-4 text-purple-400" />
            View Graph
          </Link>
        </div>
      </div>

      {/* Recommended Next Strategic Skill Highlight Banner */}
      {recommended_next_skill && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-purple-950/40 to-slate-900 border border-cyan-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
              <Flame className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Recommended Next Milestone
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Prerequisites Satisfied
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                {recommended_next_skill.name}{' '}
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({recommended_next_skill.category})
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{recommended_next_skill.reason}</p>
            </div>
          </div>
          <Link
            to="/learning-path"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono flex items-center gap-1.5 self-start md:self-auto shadow-md transition-all whitespace-nowrap"
          >
            Continue Learning <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Career Readiness</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {overview.career_readiness_score}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overview.career_readiness_score)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Weighted core coverage for {overview.target_career_title}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Demonstrated Skills</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {overview.demonstrated_count}{' '}
            <span className="text-sm font-normal text-slate-500">/ {overview.total_skills_count}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified via projects & competencies
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Roadmap Progress</span>
            <GitFork className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono text-purple-400">
            {overview.learning_path_progress_pct}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overview.learning_path_progress_pct)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {active_learning_path ? `${active_learning_path.completed_steps} of ${active_learning_path.total_steps} steps` : 'Roadmap pending'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Unlocked Careers</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {overview.unlocked_career_count}{' '}
            <span className="text-sm font-normal text-slate-500">/ 11</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Achieved &ge;60% core readiness qualification
          </div>
        </div>
      </div>

      {/* Middle Section: Active Roadmap & Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Learning Roadmap Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                Topological Milestone Sequence
              </span>
              <h2 className="text-lg font-bold text-slate-100">Active Learning Roadmap</h2>
            </div>
            <Link
              to="/learning-path"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Manage Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {active_learning_path ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {active_learning_path.title}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Est. Duration: {active_learning_path.estimated_total_hours} total hours
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400">Milestones: </span>
                  <span className="text-sm font-bold text-cyan-400">
                    {active_learning_path.completed_steps} / {active_learning_path.total_steps}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                Your roadmap uses NetworkX topological sorting to enforce strict dependency
                ordering. Each completed milestone automatically unlocks downstream dependencies.
              </div>

              <div className="pt-2">
                <Link
                  to="/learning-path"
                  className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Clock className="w-4 h-4 text-purple-400" />
                  Resume Active Roadmap
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <GitFork className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                You have not generated a personalized roadmap for your career goal yet.
              </p>
              <Link
                to="/learning-path"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Generate Prerequisite Roadmap
              </Link>
            </div>
          )}
        </div>

        {/* Skill Distribution by Category Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Knowledge Diversity
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">Skill Distribution</h2>
          </div>

          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {skill_distribution && skill_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={skill_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {skill_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d1a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic">No skills added yet.</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            {skill_distribution?.slice(0, 4).map((item) => (
              <div key={item.category} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.category}</span>
                <span className="font-mono text-slate-300 ml-auto">({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: All Careers Readiness Ranking & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Opportunities Readiness Ranking */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Opportunity Matrix
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">Career Readiness Ranking</h2>
            </div>
            <Link
              to="/careers"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Explore All 11 Roles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {career_readiness_ranking?.map((career) => (
              <div
                key={career.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  career.is_target
                    ? 'border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                      {career.title}
                    </h4>
                    {career.is_target && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                        Primary Target
                      </span>
                    )}
                    <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {career.market_demand}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {career.salary_range} • {career.category}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-28 sm:w-36 text-right">
                    <div className="text-xs font-bold font-mono text-cyan-300">
                      {career.coverage_pct}%
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          career.coverage_pct >= 60
                            ? 'bg-emerald-400'
                            : career.coverage_pct >= 30
                            ? 'bg-cyan-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.min(100, career.coverage_pct)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/gap-analyzer?career=${career.slug}`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Analyze Gap"
                  >
                    <Compass className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities Stream */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Audit Stream
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">Recent Activity</h2>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {recent_activities && recent_activities.length > 0 ? (
              recent_activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-mono text-cyan-400 font-semibold">{act.action_type}</span>
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{act.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic text-center py-6">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
