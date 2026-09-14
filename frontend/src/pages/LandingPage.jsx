import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, Users, ShieldCheck, Cpu, ChevronRight, CheckCircle2, Timer } from 'lucide-react';
import CrowdBadge from '../components/CrowdBadge';
import { api } from '../services/api';

export default function LandingPage({ onCheckQueue, onAdminLogin, onOpenCV }) {
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await api.getCurrentQueue();
        setCurrentStatus(data);
      } catch (err) {
        console.error("Error loading current queue for landing page:", err);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven College Canteen Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            QueueSense<span className="text-emerald-400">.AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-tight">
            Know the queue before you go.
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An AI-powered system that predicts canteen crowd levels and waiting times so students can choose the best time to visit and avoid standing in endless lunch lines.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onCheckQueue}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all group"
            >
              <span>Check Live Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onAdminLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Live Status Ticker Bar */}
        {currentStatus && (
          <div className="mt-12 max-w-xl mx-auto bg-slate-950/70 backdrop-blur-md rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Current Canteen Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-white text-sm">
                    {currentStatus.queue_length} people in line
                  </span>
                  <CrowdBadge level={currentStatus.crowd_level} size="sm" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Est. Wait Time</p>
              <p className="text-sm font-extrabold text-emerald-300 mt-0.5">
                ~{Math.round(currentStatus.estimated_wait_minutes)} minutes
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Visual Workflow Section: Current Queue → AI Prediction → Best Time */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How QueueSense Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From current line conditions to machine learning forecasts in real time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 glass-panel-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Current Queue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active counter count, pending kitchen orders, and line length are tracked through operational logs and camera integrations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400/90 font-medium">
              Queue Records & Throughput
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-emerald-500/30 glow-emerald flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black">
                2
              </div>
              <h3 className="text-lg font-bold text-white">AI Prediction Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Random Forest regressors evaluate day-of-week, hour, exam schedules, and cyclical traffic to forecast upcoming crowd density.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
              Trained Machine Learning Model
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 glass-panel-hover flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-black">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Best Time Recommendation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students receive optimal 30-minute arrival windows with guaranteed shortest wait times and high model confidence.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-teal-400/90 font-medium">
              Zero-Wait Student Experience
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Clock className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Save 15-20 Min Daily</h4>
          <p className="text-xs text-slate-400 mt-1">
            Skip congested lunch rushes by heading down during low-crowd slots.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Users className="w-5 h-5 text-teal-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Crowd Density Alerts</h4>
          <p className="text-xs text-slate-400 mt-1">
            Visual 4-stage color alerts (LOW, MEDIUM, HIGH, VERY HIGH) for quick glances.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Queuing Theory Blending</h4>
          <p className="text-xs text-slate-400 mt-1">
            Combines Little's Law service rates with ML models for realistic wait times.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Admin Optimization</h4>
          <p className="text-xs text-slate-400 mt-1">
            Canteen staff see peak times in advance to staff counters appropriately.
          </p>
        </div>
      </section>

      {/* Future CV Banner Link */}
      <section className="rounded-2xl p-6 bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Future Vision: YOLO Object Detection Architecture</h4>
            <p className="text-xs text-slate-400">Explore the planned camera-based automated people counting pipeline</p>
          </div>
        </div>
        <button
          onClick={onOpenCV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors whitespace-nowrap"
        >
          View Vision Architecture
        </button>
      </section>
    </div>
  );
}
