import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@queuesense.ai');
      setPassword('admin123');
    } else {
      setEmail('student@college.edu');
      setPassword('student123');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <LogIn className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to QueueSense</h2>
          <p className="text-xs text-slate-400">
            Access live student forecasts or admin queue management
          </p>
        </div>

        {/* Quick Demo Login Credentials Bar */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            ⚡ Quick Demo Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fill Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Fill Student</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. admin@queuesense.ai"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
