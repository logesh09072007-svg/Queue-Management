import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Timer } from 'lucide-react';
import { api } from '../services/api';

const WaitTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        <p className="text-cyan-400 font-semibold flex items-center justify-between gap-4">
          <span>Est. Wait Time:</span>
          <span>{data.predicted_wait_minutes} minutes</span>
        </p>
        <p className="text-slate-300 flex items-center justify-between gap-4">
          <span>Crowd Level:</span>
          <span className="font-bold">{data.crowd_level}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function WaitTimeChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWaitData() {
      try {
        const slots = await api.getTodayPredictions(0);
        setData(slots);
      } catch (err) {
        console.error("Error loading wait time data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWaitData();
  }, []);

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            Estimated Waiting Time Trend (Minutes)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Service latency predicted across each operational slot today
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Expected Wait
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500/80"></span>
            15m Rush Threshold
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Loading wait time trend...
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                unit="m"
                domain={[0, 'auto']}
              />
              <Tooltip content={<WaitTooltip />} />
              <ReferenceLine y={15} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.7} />
              <Line 
                type="monotone" 
                dataKey="predicted_wait_minutes" 
                stroke="#06b6d4" 
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 6, fill: '#22d3ee' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
