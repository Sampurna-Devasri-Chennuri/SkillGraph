import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Target,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  GitFork,
  Compass,
  X,
  Briefcase,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function CareerExplorerPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeCareerDetail, setActiveCareerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    careersAPI
      .getCareers()
      .then((res) => {
        setCareers(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Failed to load careers', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetail = (careerSlug) => {
    setLoadingDetail(true);
    careersAPI
      .getCareerDetail(careerSlug)
      .then((res) => {
        setActiveCareerDetail(res.data);
      })
      .catch((err) => console.error('Failed to load career detail', err))
      .finally(() => setLoadingDetail(false));
  };

  const categories = ['all', ...new Set(careers.map((c) => c.category))];

  const filteredCareers = careers.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.short_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner message="Loading curated career engineering matrices..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Industry Roles & Demand
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            Career Role Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover 11 specialized software disciplines, verified skill dependencies, and market trajectories.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, technologies..."
              className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 pl-8 pr-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Disciplines' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Career Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCareers.map((c) => (
          <div
            key={c.id}
            className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  {c.category}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    c.market_demand === 'Explosive'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : c.market_demand === 'Very High'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {c.market_demand} Demand
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-100">{c.title}</h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {c.short_description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Avg: {c.salary_range_usd}</span>
                <span className="text-cyan-400 font-bold">
                  {c.core_skill_count} Core • {c.total_skill_count} Total Skills
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => handleOpenDetail(c.slug)}
                className="w-full py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                Inspect Full Dossier & Projects <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to={`/gap-analyzer?career=${c.slug}`}
                  className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-cyan-300 text-center font-medium transition-colors"
                >
                  Analyze Gap
                </Link>
                <Link
                  to={`/graph?career=${c.slug}`}
                  className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-center font-medium transition-colors"
                >
                  View Graph
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Career Full Dossier Modal */}
      {activeCareerDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[85vh] bg-[#0c1222] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 uppercase">
                  {activeCareerDetail.category}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-emerald-400">
                  {activeCareerDetail.salary_range_usd}
                </span>
              </div>
              <button
                onClick={() => setActiveCareerDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-100">
                  {activeCareerDetail.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeCareerDetail.detailed_description}
                </p>
              </div>

              {/* Career Progression Opportunities */}
              {activeCareerDetail.progression_opportunities && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Progression Ladder
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeCareerDetail.progression_opportunities.map((stage, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                          {stage}
                        </span>
                        {idx < activeCareerDetail.progression_opportunities.length - 1 && (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Skills Matrix */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" /> Required Skills & Minimum Proficiency
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCareerDetail.required_skills?.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-200">{req.skill.name}</span>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-slate-400">Min Lvl {req.minimum_proficiency}/4</span>
                        <span
                          className={`px-1.5 py-0.2 rounded border ${
                            req.is_core
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {req.is_core ? 'Core' : 'Rec'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curated Reference Projects */}
              {activeCareerDetail.example_projects && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Benchmark Portfolio Projects
                  </h4>
                  <div className="space-y-2">
                    {activeCareerDetail.example_projects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-slate-200">{proj.title}</div>
                        <p className="text-slate-400">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <Link
                to={`/gap-analyzer?career=${activeCareerDetail.slug}`}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Analyze My Gap
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
