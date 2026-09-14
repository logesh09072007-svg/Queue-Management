import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSuccess, onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">Create an Account</h2>
          <p className="text-xs text-slate-400">
            Register to save preferences and track canteen visit feedback
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Jordan Smith"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              College Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. student@college.edu"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  role === 'student'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  role === 'admin'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Canteen Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
