import React from 'react';
import { Sparkles, Clock, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

export default function RecommendedTimeCard({ recommendation, onExploreTimeline }) {
  if (!recommendation) {
    return (
      <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 animate-pulse">
        <div className="h-5 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="h-10 w-64 bg-slate-800 rounded mb-2"></div>
        <div className="h-4 w-72 bg-slate-800 rounded"></div>
      </div>
    );
  }

  const { recommended_window, crowd_level, expected_wait_minutes, confidence, why } = recommendation;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/30 border border-emerald-500/30 shadow-xl glow-emerald">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Smart Recommendation</span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400">Best Time to Visit Today</h3>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
              <span>{recommended_window}</span>
              <CrowdBadge level={crowd_level} size="sm" />
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-300 text-sm bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white font-semibold">Why? </strong>
              {why || 'Predicted crowd is lowest with optimal counter throughput.'}
            </p>
          </div>
        </div>

        {/* Right side stats pill */}
        <div className="flex flex-row sm:flex-col lg:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-4 sm:pt-0 sm:pl-6">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Expected Waiting Time</span>
            <p className="text-2xl font-bold text-emerald-300">
              ~{Math.round(expected_wait_minutes)} <span className="text-sm font-normal text-slate-300">min</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">AI Confidence</span>
            <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
              <span className="text-base font-bold text-white">
                {Math.round(confidence * 100)}%
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                High
              </span>
            </div>
          </div>

          {onExploreTimeline && (
            <button
              onClick={onExploreTimeline}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors mt-2"
            >
              <span>View full timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
