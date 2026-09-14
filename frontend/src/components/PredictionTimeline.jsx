import React from 'react';
import { Clock, Users, Timer, Sparkles } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

export default function PredictionTimeline({ slots, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
        <p>No upcoming slots available for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-md overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Upcoming Crowd & Wait Forecast
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic 30-minute machine learning predictions
          </p>
        </div>
        <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700/60">
          Next {slots.length} Slots
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800/80">
            <tr>
              <th scope="col" className="px-5 py-3">Time Slot</th>
              <th scope="col" className="px-5 py-3">Predicted Crowd</th>
              <th scope="col" className="px-5 py-3">Expected Wait</th>
              <th scope="col" className="px-5 py-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {slots.map((slot, idx) => {
              const isBest = slot.crowd_level === 'LOW';
              return (
                <tr 
                  key={idx}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isBest ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 font-bold text-slate-200 flex items-center gap-2">
                    <span>{slot.time}</span>
                    {isBest && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 rounded uppercase">
                        Low Rush
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <CrowdBadge level={slot.crowd_level} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-slate-400" />
                      <span>{Math.round(slot.predicted_wait_minutes)} min</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-400">
                    <span className="text-xs bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 text-slate-300">
                      {Math.round(slot.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
