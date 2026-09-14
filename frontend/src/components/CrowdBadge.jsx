import React from 'react';

export default function CrowdBadge({ level, size = 'md', showDot = true }) {
  const normalized = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      label: 'LOW',
      emoji: '🟢',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dotBg: 'bg-emerald-400',
      pulse: 'animate-pulse',
      desc: '0–30% capacity',
    },
    MEDIUM: {
      label: 'MEDIUM',
      emoji: '🟡',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dotBg: 'bg-amber-400',
      pulse: 'animate-pulse',
      desc: '31–60% capacity',
    },
    HIGH: {
      label: 'HIGH',
      emoji: '🟠',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      dotBg: 'bg-orange-400',
      pulse: 'animate-pulse',
      desc: '61–80% capacity',
    },
    'VERY HIGH': {
      label: 'VERY HIGH',
      emoji: '🔴',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      dotBg: 'bg-rose-400',
      pulse: 'animate-ping',
      desc: '81–100% capacity',
    },
  };

  const cfg = configs[normalized] || configs.LOW;

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${cfg.bg} ${cfg.border} ${cfg.text} font-bold shadow-md backdrop-blur-sm`}>
        <span className="relative flex h-3.5 w-3.5">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotBg} ${cfg.pulse}`}></span>
          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${cfg.dotBg}`}></span>
        </span>
        <span className="text-base tracking-wider uppercase">{cfg.label}</span>
        <span className="text-xs opacity-75 font-normal">({cfg.desc})</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotBg} ${cfg.pulse}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotBg}`}></span>
        </span>
      )}
      <span>{cfg.label}</span>
    </span>
  );
}
