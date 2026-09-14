import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <aside aria-label="Demo mode announcement" className="bg-gradient-to-r from-amber-500/15 via-amber-500/20 to-orange-500/15 border-b border-amber-500/30 px-4 py-2 text-xs md:text-sm text-amber-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-xs tracking-wide">
            <AlertCircle className="w-3.5 h-3.5" />
            DEMO DATA
          </span>
          <p className="text-amber-200/90 font-medium">
            This system is running with <strong className="text-amber-100">Synthetic Demo Data</strong> and pre-trained Random Forest ML models for demonstration and testing.
          </p>
        </div>
        <span className="hidden sm:inline-block text-amber-400/80 text-xs">
          Reproducible Seed: 42
        </span>
      </div>
    </aside>
  );
}
