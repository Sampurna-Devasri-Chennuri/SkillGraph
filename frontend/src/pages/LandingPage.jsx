import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { careersAPI } from '../services/api';
import {
  Network,
  Compass,
  GitFork,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  ArrowRight,
  Target,
  Terminal,
  Zap,
  Cpu,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [demoLoggingIn, setDemoLoggingIn] = useState(false);

  useEffect(() => {
    careersAPI
      .getCareers()
      .then((res) => {
        setCareers(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Failed to fetch careers', err));
  }, []);

  const handleDemoSignIn = async () => {
    setDemoLoggingIn(true);
    const res = await login('demouser', 'DemoPassword123!');
    if (res.success) {
      navigate('/dashboard');
    }
    setDemoLoggingIn(false);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing backdrop circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-xs font-mono text-cyan-400 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Graph-Theoretic Career Intelligence • NetworkX DAG</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          Navigate Your Tech Career Through{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            True Skill Dependencies
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop guessing your next career step. SkillGraph models 50+ technical disciplines as an
          interactive dependency graph, quantifies your weighted competency gap, and generates
          guaranteed prerequisite-first roadmaps.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-600/25 flex items-center gap-2 group transition-all"
            >
              Go to Your Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-600/25 flex items-center gap-2 group transition-all"
              >
                Start Free Career Plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleDemoSignIn}
                disabled={demoLoggingIn}
                className="px-6 py-3 text-sm font-semibold text-cyan-300 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 flex items-center gap-2 shadow-lg hover:border-cyan-500/60 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                {demoLoggingIn ? 'Launching Demo...' : 'Instant Demo Login'}
              </button>
            </>
          )}
          <Link
            to="/graph"
            className="px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 flex items-center gap-2 transition-all"
          >
            <Network className="w-4 h-4 text-blue-400" />
            Explore Skill Graph
          </Link>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-2xl font-bold font-mono text-cyan-400">50+</div>
            <div className="text-xs text-slate-400 mt-0.5">Interconnected Skills</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-2xl font-bold font-mono text-purple-400">11 Roles</div>
            <div className="text-xs text-slate-400 mt-0.5">Curated Industry Careers</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-2xl font-bold font-mono text-emerald-400">100% DAG</div>
            <div className="text-xs text-slate-400 mt-0.5">Cycle-Free Ordering</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-2xl font-bold font-mono text-amber-400">NLP Powered</div>
            <div className="text-xs text-slate-400 mt-0.5">Project Evidence Scoring</div>
          </div>
        </div>
      </section>

      {/* Interactive Core Feature Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Core Engine Architecture
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-1">
                Visualizing Real Dependency Chains
              </h2>
            </div>
            <Link
              to="/graph"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              Open Full Interactive Graph <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive DAG Preview Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 py-6 px-4 bg-[#05070e] rounded-xl border border-slate-800/80 overflow-x-auto">
            {[
              { name: 'Python', cat: 'Language', status: 'DEMONSTRATED', icon: 'Code', step: 1 },
              { name: 'NumPy', cat: 'Math', status: 'DEMONSTRATED', icon: 'Cpu', step: 2 },
              { name: 'Pandas', cat: 'Data', status: 'PRACTICED', icon: 'Table', step: 3 },
              { name: 'Machine Learning', cat: 'AI', status: 'PRACTICED', icon: 'Brain', step: 4 },
              { name: 'Deep Learning', cat: 'Neural', status: 'LEARNING', icon: 'Sparkles', step: 5 },
              { name: 'AI Engineer', cat: 'Target', status: 'TARGET_REQUIRED', icon: 'Target', step: 6 },
            ].map((node, i) => (
              <div key={node.name} className="relative flex flex-col items-center">
                <div
                  className={`w-full p-3 rounded-lg border text-center transition-all ${
                    node.status === 'DEMONSTRATED'
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : node.status === 'PRACTICED'
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : node.status === 'LEARNING'
                      ? 'border-purple-500/60 bg-purple-950/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                      : 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    Step 0{node.step}
                  </span>
                  <div className="text-xs font-bold text-slate-100">{node.name}</div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                    {node.cat}
                  </span>
                </div>
                {i < 5 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-4 h-4 text-cyan-500/70" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Demonstrated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Practiced
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Target Career
              </span>
            </div>
            <span className="font-mono text-slate-500">
              Valid Topological Order Guaranteed: no dependent recommended before prerequisites.
            </span>
          </div>
        </div>
      </section>

      {/* Main Platform Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-100">
            Engineered for Precision Career Discovery
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Move beyond static checklists and generic course recommendations with genuine graph
            intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Interactive Knowledge Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore dynamic nodes, prerequisite links, and category clusters with React Flow.
              Inspect detailed requirements and unlock downstream options.
            </p>
            <Link
              to="/graph"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 pt-2"
            >
              Launch Graph <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Weighted Skill Gap Analyzer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare your current competencies against real job expectations. Calculates weighted
              coverage and highlights unmet foundational dependencies.
            </p>
            <Link
              to="/gap-analyzer"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 pt-2"
            >
              Analyze Your Gap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Personalized Learning Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithmic topological sorting constructs an ordered roadmap. Mark completed
              milestones and automatically unlock downstream skills.
            </p>
            <Link
              to="/learning-path"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 pt-2"
            >
              Generate Roadmap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">What-If Career Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate pivoting from Full-Stack Development to AI Engineering. Identifies shared
              skills, transferable percentages, and the delta roadmap needed.
            </p>
            <Link
              to="/simulator"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 inline-flex items-center gap-1 pt-2"
            >
              Run Simulator <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 5 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Project-to-Skill Evidence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              NLP engine scans project descriptions and GitHub repositories to evaluate demonstrated
              skills, assigning evidence confidence scores from 1 to 5.
            </p>
            <Link
              to="/projects"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 pt-2"
            >
              Map Projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 6 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Career Explorer Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse 11 top tech careers across AI, Cloud, DevOps, IoT, and Data with expected salary
              ranges, demand metrics, and progression ladders.
            </p>
            <Link
              to="/careers"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-2"
            >
              Explore Careers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">How SkillGraph Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            A deterministic, graph-driven methodology for measurable software engineering growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Select Career Goal',
              desc: 'Choose from 11 curated industry targets or configure your custom dream pathway.',
            },
            {
              num: '02',
              title: 'Graph Gap Analysis',
              desc: 'NetworkX identifies missing skills, unmet foundational prerequisites, and weighted coverage.',
            },
            {
              num: '03',
              title: 'Topological Roadmap',
              desc: 'Our engine generates a prerequisite-first milestone sequence with estimated hours.',
            },
            {
              num: '04',
              title: 'Evidenced Mastery',
              desc: 'Link real portfolio projects and verify competency through our NLP skill extractor.',
            },
          ].map((s) => (
            <div key={s.num} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl font-black font-mono text-cyan-400 mb-2">{s.num}</div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-blue-950/40 via-purple-950/20 to-[#070913] border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Ready to Master Your Skill Graph?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Join students and engineering professionals discovering precise skill prerequisites and
              unlocking real opportunities.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/20 transition-all"
              >
                Create Free Account
              </Link>
              <button
                onClick={handleDemoSignIn}
                className="px-6 py-3 text-sm font-semibold text-cyan-300 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 transition-all"
              >
                Launch Demo Profile
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
