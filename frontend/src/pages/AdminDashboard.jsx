import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Edit3,
  Layers,
  Users,
  Timer,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Sliders,
  Camera,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CrowdBadge from '../components/CrowdBadge';

export default function AdminDashboard({ onNavigateToLogin, onNavigateToAnalytics }) {
  const { user, isAdmin, isAuthenticated } = useAuth();

  // Active view: 'live_manager', 'history', 'settings', 'vision'
  const [subTab, setSubTab] = useState('live_manager');

  // Live queue form state
  const [queueLength, setQueueLength] = useState(24);
  const [activeCounters, setActiveCounters] = useState(3);
  const [ordersPending, setOrdersPending] = useState(5);
  const [customersServed, setCustomersServed] = useState(65);
  const [avgServiceTime, setAvgServiceTime] = useState(1.5);
  const [notes, setNotes] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // History state
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState({
    canteen_capacity: 120,
    default_active_counters: 3,
    service_time_seconds: 90,
    opening_hour: 8,
    closing_hour: 20,
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Current status
  const [currentStatus, setCurrentStatus] = useState(null);

  const loadCurrentStatus = async () => {
    try {
      const data = await api.getCurrentQueue();
      setCurrentStatus(data);
      setQueueLength(data.queue_length);
      setActiveCounters(data.active_counters);
      setOrdersPending(data.orders_pending);
      setCustomersServed(data.customers_served);
      setAvgServiceTime(data.average_service_time);
    } catch (err) {
      console.error("Error loading current queue status:", err);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const records = await api.getQueueHistory(0, 30);
      setHistoryRecords(records);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettingsData(s);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    loadCurrentStatus();
    loadSettings();
    if (subTab === 'history') {
      loadHistory();
    }
  }, [subTab]);

  // Form submit handler
  const handleUpdateQueue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (queueLength < 0) {
      setErrorMsg('Queue length must be >= 0');
      setLoading(false);
      return;
    }
    if (activeCounters < 1) {
      setErrorMsg('Active counters must be >= 1');
      setLoading(false);
      return;
    }
    if (avgServiceTime <= 0) {
      setErrorMsg('Average service time must be > 0');
      setLoading(false);
      return;
    }

    try {
      await api.updateQueue({
        queue_length: parseInt(queueLength),
        active_counters: parseInt(activeCounters),
        orders_pending: parseInt(ordersPending),
        customers_served: parseInt(customersServed),
        average_service_time: parseFloat(avgServiceTime),
        notes: notes.trim() || undefined,
      });

      setSuccessMsg('Current queue conditions updated successfully! Live student views refreshed.');
      await loadCurrentStatus();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update queue status.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Simulation presets
  const applyPreset = (type) => {
    switch (type) {
      case 'calm':
        setQueueLength(6);
        setActiveCounters(2);
        setOrdersPending(1);
        setAvgServiceTime(1.2);
        setNotes('Off-peak calm period preset');
        break;
      case 'breakfast':
        setQueueLength(18);
        setActiveCounters(3);
        setOrdersPending(4);
        setAvgServiceTime(1.4);
        setNotes('Breakfast rush calibration preset');
        break;
      case 'lunch_peak':
        setQueueLength(55);
        setActiveCounters(4);
        setOrdersPending(12);
        setAvgServiceTime(1.8);
        setNotes('Major lunch peak rush preset');
        break;
      case 'afternoon_slump':
        setQueueLength(4);
        setActiveCounters(2);
        setOrdersPending(0);
        setAvgServiceTime(1.1);
        setNotes('Afternoon quiet slump preset');
        break;
      default:
        break;
    }
  };

  // Delete history record
  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this historical queue record?')) return;
    try {
      await api.deleteQueueRecord(id);
      setHistoryRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Save settings handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsData);
      setSettingsData(res);
      setSettingsSuccess('Canteen operational configuration saved!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Admin Authentication Required</h2>
        <p className="text-xs text-slate-400">
          You must be signed in with an authorized Canteen Admin account to access real-time queue inputs and operational parameters.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Canteen Admin Console
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control live queue parameters, log counter throughput, and configure capacity.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('live_manager')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === 'live_manager'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Queue Manager
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historical Logs
          </button>
          <button
            onClick={() => setSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacity & Settings
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Live Queue Manager */}
      {subTab === 'live_manager' && (
        <div className="space-y-6">
          {/* Live Status Summary Card */}
          {currentStatus && (
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Current Operational State</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black text-white">
                      {currentStatus.queue_length} People in Line
                    </span>
                    <CrowdBadge level={currentStatus.crowd_level} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Est. Wait Time:</span>
                  <span className="font-bold text-base text-emerald-400">
                    ~{Math.round(currentStatus.estimated_wait_minutes)} min
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Counters:</span>
                  <span className="font-bold text-base text-cyan-400">
                    {currentStatus.active_counters} / 5
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kitchen Pending:</span>
                  <span className="font-bold text-base text-amber-400">
                    {currentStatus.orders_pending} orders
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Simulation Presets */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Demo Scenario Presets:
              </span>
              <span className="text-[10px] text-slate-500">Auto-populates realistic values below</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => applyPreset('calm')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-emerald-500/30 transition-colors"
              >
                🌿 Calm / Off-Peak (6 people)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('breakfast')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 border border-amber-500/30 transition-colors"
              >
                ☕ Breakfast Rush (18 people)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('lunch_peak')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-rose-300 border border-rose-500/30 transition-colors"
              >
                🔥 Heavy Lunch Peak (55 people)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('afternoon_slump')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-cyan-500/30 transition-colors"
              >
                💤 Afternoon Quiet Slump (4 people)
              </button>
            </div>
          </div>

          {/* Update Queue Form */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Update Live Canteen Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Changes immediately feed the ML inference pipeline and student dashboard
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateQueue} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Queue Length */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Queue Length (People in line) *</span>
                    <span className="text-[10px] text-slate-500">Must be ≥ 0</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={queueLength}
                    onChange={(e) => setQueueLength(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 25"
                  />
                </div>

                {/* Active Counters */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Active Counters *</span>
                    <span className="text-[10px] text-slate-500">Must be ≥ 1</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={activeCounters}
                    onChange={(e) => setActiveCounters(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 3"
                  />
                </div>

                {/* Pending Orders */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Orders Pending in Kitchen</span>
                    <span className="text-[10px] text-slate-500">In preparation</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={ordersPending}
                    onChange={(e) => setOrdersPending(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 5"
                  />
                </div>

                {/* Customers Served */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Customers Served This Period</span>
                    <span className="text-[10px] text-slate-500">Completed meals</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={customersServed}
                    onChange={(e) => setCustomersServed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Average Service Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Average Service Time (Minutes) *</span>
                    <span className="text-[10px] text-slate-500">Must be &gt; 0</span>
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={avgServiceTime}
                    onChange={(e) => setAvgServiceTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 1.5"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operational Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Counter 2 temporarily restocking"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Recording Update...' : 'Update Current Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Historical Logs Table */}
      {subTab === 'history' && (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Historical Queue Logs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of recorded canteen queue measurements
              </p>
            </div>
            <button
              onClick={loadHistory}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800/80">
                <tr>
                  <th scope="col" className="px-5 py-3">Timestamp</th>
                  <th scope="col" className="px-5 py-3">Queue Length</th>
                  <th scope="col" className="px-5 py-3">Counters</th>
                  <th scope="col" className="px-5 py-3">Orders Pending</th>
                  <th scope="col" className="px-5 py-3">Avg Service Time</th>
                  <th scope="col" className="px-5 py-3">Notes</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-xs text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  historyRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-300 text-xs">
                        {new Date(rec.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-bold text-white">
                        {rec.queue_length} people
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {rec.active_counters}
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {rec.orders_pending}
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {rec.average_service_time}m
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {rec.notes || '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Capacity & Operational Settings */}
      {subTab === 'settings' && (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Operational Canteen Configuration</h3>
              <p className="text-xs text-slate-400">
                Adjust capacity thresholds and baseline operational timings (Not hard-coded)
              </p>
            </div>
          </div>

          {settingsSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Total Seating Capacity (Seats)
              </label>
              <input
                type="number"
                min="20"
                max="1000"
                value={settingsData.canteen_capacity}
                onChange={(e) => setSettingsData({ ...settingsData, canteen_capacity: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500">Controls dynamic LOW/MEDIUM/HIGH/VERY HIGH thresholds.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Active Counters
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settingsData.default_active_counters}
                onChange={(e) => setSettingsData({ ...settingsData, default_active_counters: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Target Service Time (Seconds per customer)
              </label>
              <input
                type="number"
                min="30"
                max="600"
                value={settingsData.service_time_seconds}
                onChange={(e) => setSettingsData({ ...settingsData, service_time_seconds: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Opening Hour (24h)</label>
                <input
                  type="number"
                  min="6"
                  max="12"
                  value={settingsData.opening_hour}
                  onChange={(e) => setSettingsData({ ...settingsData, opening_hour: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Closing Hour (24h)</label>
                <input
                  type="number"
                  min="14"
                  max="23"
                  value={settingsData.closing_hour}
                  onChange={(e) => setSettingsData({ ...settingsData, closing_hour: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
