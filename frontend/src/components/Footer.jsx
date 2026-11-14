import React from 'react';
import { Link } from 'react-router-dom';
import { Network, GitBranch, Shield, Terminal, Cpu, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070e] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-base text-slate-100">SkillGraph</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Career intelligence and skill dependency engine built on NetworkX graph theory and topological dependency resolution.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Intelligence Engine Active (DAG Verified)
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 font-mono">
            Platform Modules
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/graph" className="hover:text-cyan-400 transition-colors">Interactive Skill Graph</Link></li>
            <li><Link to="/gap-analyzer" className="hover:text-cyan-400 transition-colors">Weighted Skill Gap Analyzer</Link></li>
            <li><Link to="/learning-path" className="hover:text-cyan-400 transition-colors">Personalized Learning Roadmap</Link></li>
            <li><Link to="/careers" className="hover:text-cyan-400 transition-colors">Career Exploration Matrix</Link></li>
            <li><Link to="/simulator" className="hover:text-cyan-400 transition-colors">What-If Career Simulator</Link></li>
            <li><Link to="/projects" className="hover:text-cyan-400 transition-colors">NLP Project-to-Skill Mapping</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 font-mono">
            Architecture & Tech
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900 border border-slate-800">
              <Terminal className="w-3 h-3 text-cyan-400" /> Django DRF
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900 border border-slate-800">
              <Cpu className="w-3 h-3 text-purple-400" /> NetworkX DAG
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900 border border-slate-800">
              <Database className="w-3 h-3 text-pink-400" /> PostgreSQL
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-900 border border-slate-800">
              <Network className="w-3 h-3 text-blue-400" /> React Flow
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-normal">
            Every career requirement and prerequisite relationship is validated strictly against cyclic violations.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 font-mono">
            Guarantees
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            SkillGraph delivers true topological prerequisite scheduling, authentic project evidence extraction, and transparent weighted scoring.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-medium">Demo Profile Available:</span><br />
            Sign in with <code className="text-slate-300 bg-slate-800 px-1 rounded">demouser</code> / <code className="text-slate-300 bg-slate-800 px-1 rounded">DemoPassword123!</code>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} SkillGraph Platform. Built for serious engineers and high-impact careers.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 transition-colors">Privacy & Terms</span>
          <span className="hover:text-slate-400 transition-colors">API Docs</span>
          <span className="hover:text-slate-400 transition-colors">System Status</span>
        </div>
      </div>
    </footer>
  );
}
