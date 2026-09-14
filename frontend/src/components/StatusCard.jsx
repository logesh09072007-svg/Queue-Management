import React from 'react';

export default function StatusCard({ icon: Icon, title, value, subtitle, highlight = 'default', badge }) {
  const highlightStyles = {
    default: 'border-slate-800 hover:border-slate-700 bg-slate-900/60',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
    amber: 'border-amber-500/30 hover:border-amber-500/50 bg-amber-950/20 text-amber-300',
    rose: 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/20 text-rose-300',
    blue: 'border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
  };

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80',
    emerald: 'text-emerald-400 bg-emerald-500/15',
    amber: 'text-amber-400 bg-amber-500/15',
    rose: 'text-rose-400 bg-rose-500/15',
    blue: 'text-cyan-400 bg-cyan-500/15',
  };

  return (
    <div className={`rounded-2xl p-5 border backdrop-blur-md transition-all duration-200 glass-panel-hover ${highlightStyles[highlight] || highlightStyles.default}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconColors[highlight] || iconColors.default}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && <div>{badge}</div>}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-1.5">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5 font-normal flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
