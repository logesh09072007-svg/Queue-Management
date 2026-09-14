import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, Calendar } from 'lucide-react';
import { api } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        <p className="text-emerald-400 font-semibold flex items-center justify-between gap-4">
          <span>Predicted Volume:</span>
          <span>{data.predicted_customers} people</span>
        </p>
        <p className="text-slate-300 flex items-center justify-between gap-4">
          <span>Crowd Level:</span>
          <span className="font-bold">{data.crowd_level}</span>
        </p>
        <p className="text-cyan-400 flex items-center justify-between gap-4">
          <span>Est. Wait:</span>
          <span>~{Math.round(data.predicted_wait_minutes)} min</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function CrowdChart() {
  const [selectedRange, setSelectedRange] = useState('today'); // 'today', 'tomorrow', 'next3days'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const fetchData = async (range) => {
    setLoading(true);
    setNotice(null);
    try {
      if (range === 'today') {
        const slots = await api.getTodayPredictions(0);
        setData(slots);
      } else if (range === 'tomorrow') {
        const slots = await api.getTodayPredictions(1);
        setData(slots);
      } else if (range === 'next3days') {
        // Fetch next 3 days aggregated or sampled
        const day1 = await api.getTodayPredictions(1);
        const day2 = await api.getTodayPredictions(2);
        const day3 = await api.getTodayPredictions(3);
        // Combine key peak & lunch slots
        const combined = [
          ...day1.filter((_, i) => i % 2 === 0).map(s => ({ ...s, time: `Day+1 ${s.time}` })),
          ...day2.filter((_, i) => i % 2 === 0).map(s => ({ ...s, time: `Day+2 ${s.time}` })),
          ...day3.filter((_, i) => i % 2 === 0).map(s => ({ ...s, time: `Day+3 ${s.time}` })),
        ];
        setData(combined);
        setNotice("Displaying multi-day forecast synthesized from Random Forest scheduling models.");
      }
    } catch (err) {
      console.error("Error fetching crowd chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange]);

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Predicted Crowd Volume vs Time
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Expected student & staff volume across operational slots
          </p>
        </div>

        {/* Range Selector Buttons */}
        <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedRange('today')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedRange === 'today'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedRange('tomorrow')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedRange === 'tomorrow'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tomorrow
          </button>
          <button
            onClick={() => setSelectedRange('next3days')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedRange === 'next3days'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next 3 Days
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-3 py-2 rounded-lg flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Loading ML crowd trend...
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="predicted_customers" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#crowdGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
