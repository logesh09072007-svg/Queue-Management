import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Timer,
  CheckCircle2,
  AlertCircle,
  Award,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import StatusCard from '../components/StatusCard';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsDashboard();
      setAnalytics(data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400" />
        <p className="text-sm">Calculating operational queue analytics and accuracy metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Canteen Queue & Prediction Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical throughput, peak congestion analysis, and honest model validation metrics
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          icon={Users}
          title="Average Daily Queue"
          value={`${analytics.average_daily_queue} people`}
          subtitle="Mean line length recorded"
          highlight="default"
        />

        <StatusCard
          icon={TrendingUp}
          title="Maximum Recorded Queue"
          value={`${analytics.maximum_queue} people`}
          subtitle="Peak backlog spike"
          highlight="amber"
        />

        <StatusCard
          icon={Timer}
          title="Average Waiting Time"
          value={`${analytics.average_waiting_time} min`}
          subtitle="Per customer transaction"
          highlight="blue"
        />

        <StatusCard
          icon={Award}
          title="Prediction Accuracy"
          value={`${analytics.prediction_accuracy_pct}%`}
          subtitle={`Mean Absolute Error: ${analytics.prediction_mae} min`}
          highlight="emerald"
        />
      </div>

      {/* Peak & Off-Peak Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Highest Traffic Peak Hour</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {analytics.peak_hour}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Recommendation: Staff all 4-5 counters and prepare batch food ahead of time.
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-5 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Lowest Traffic / Best Visit Hour</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {analytics.lowest_crowd_hour}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Ideal student study slump window with under 5-minute queue times.
          </p>
        </div>
      </div>

      {/* Hourly Crowd Distribution Chart */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Hourly Traffic & Wait Distribution
          </h3>
          <p className="text-xs text-slate-400">
            Comparison of expected customer volume and queue delay across time slots
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="predicted_customers" name="Predicted Customers" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estimated_wait_minutes" name="Est. Wait (min)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction vs Actual Wait Time Chart */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Prediction vs Actual Student Feedback
            </h3>
            <p className="text-xs text-slate-400">
              Evaluating predicted wait time vs what students reported in actual post-visit logs
            </p>
          </div>
          <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            Average Error: <strong className="text-emerald-400">±{analytics.prediction_mae} min</strong>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.prediction_vs_actual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="predicted_wait" name="Predicted Wait (min)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="actual_wait" name="Actual Reported Wait (min)" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
