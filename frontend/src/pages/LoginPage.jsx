import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Network, Lock, User, Zap, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  const handleFillDemo = async () => {
    setUsername('demouser');
    setPassword('DemoPassword123!');
    setError('');
    setLoading(true);
    const res = await login('demouser', 'DemoPassword123!');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 mb-2">
            <Network className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Sign in to SkillGraph</h2>
          <p className="text-xs text-slate-400">
            Access your personalized skill dependency intelligence dashboard
          </p>
        </div>

        {/* Demo Fast Login Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/30 shadow-lg flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Demo Profile Available
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Prefilled with 13 skills, sample project, and roadmap
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md font-mono transition-all disabled:opacity-50"
          >
            One-Click Login
          </button>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. demouser"
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 pl-9 pr-3 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 pl-9 pr-3 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
