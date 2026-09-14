import React, { useState, useEffect } from 'react';
import {
  Users,
  Timer,
  Store,
  Layers,
  Sparkles,
  RefreshCw,
  MessageSquarePlus,
  Info,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import StatusCard from '../components/StatusCard';
import CrowdBadge from '../components/CrowdBadge';
import RecommendedTimeCard from '../components/RecommendedTimeCard';
import PredictionTimeline from '../components/PredictionTimeline';
import CrowdChart from '../components/CrowdChart';
import WaitTimeChart from '../components/WaitTimeChart';
import FeedbackModal from '../components/FeedbackModal';
import FutureCVModal from '../components/FutureCVModal';
import { api } from '../services/api';

export default function StudentDashboard() {
  const [currentQueue, setCurrentQueue] = useState(null);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCVOpen, setIsCVOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadAllData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [qData, upcoming, rec] = await Promise.all([
        api.getCurrentQueue(),
        api.getUpcomingPredictions(6),
        api.getRecommendedTime(),
      ]);
      setCurrentQueue(qData);
      setUpcomingSlots(upcoming);
      setRecommendation(rec);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error loading student dashboard:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => loadAllData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const getCrowdHighlight = (level) => {
    switch ((level || '').toUpperCase()) {
      case 'LOW':
        return 'emerald';
      case 'MEDIUM':
        return 'amber';
      case 'HIGH':
        return 'amber';
      case 'VERY HIGH':
        return 'rose';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Canteen Live Status
            </h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time queue monitoring and machine-learning waiting time estimates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh current queue data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Rate Wait Accuracy</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Queue */}
        <StatusCard
          icon={Users}
          title="Current Queue"
          value={
            currentQueue ? (
              <span>
                {currentQueue.queue_length} <span className="text-sm font-normal text-slate-400">people</span>
              </span>
            ) : '—'
          }
          subtitle={
            currentQueue ? `${currentQueue.orders_pending} orders in preparation` : 'Connecting...'
          }
          highlight="default"
        />

        {/* Card 2: Crowd Level Visual Indicator */}
        <StatusCard
          icon={Store}
          title="Crowd Level"
          value={
            currentQueue ? (
              <div className="mt-1">
                <CrowdBadge level={currentQueue.crowd_level} size="lg" />
              </div>
            ) : '—'
          }
          subtitle={
            currentQueue ? `${Math.round(currentQueue.occupancy_rate * 100)}% capacity utilized` : 'Computing...'
          }
          highlight={getCrowdHighlight(currentQueue?.crowd_level)}
        />

        {/* Card 3: Estimated Wait Time */}
        <StatusCard
          icon={Timer}
          title="Estimated Wait"
          value={
            currentQueue ? (
              <span>
                {Math.round(currentQueue.estimated_wait_minutes)} <span className="text-sm font-normal text-slate-400">min</span>
              </span>
            ) : '—'
          }
          subtitle="Blended ML & Little's Law"
          highlight={
            (currentQueue?.estimated_wait_minutes || 0) > 15 ? 'rose' : 'emerald'
          }
        />

        {/* Card 4: Active Counters */}
        <StatusCard
          icon={Layers}
          title="Active Counters"
          value={
            currentQueue ? (
              <span>
                {currentQueue.active_counters} <span className="text-sm font-normal text-slate-400">counters</span>
              </span>
            ) : '—'
          }
          subtitle={
            currentQueue ? `~${currentQueue.average_service_time} min / customer` : 'Monitoring...'
          }
          highlight="blue"
        />
      </div>

      {/* Prominent Recommendation Card */}
      <RecommendedTimeCard
        recommendation={recommendation}
        onExploreTimeline={() => {
          const el = document.getElementById('timeline-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive Charts: Crowd Volume & Waiting Time Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrowdChart />
        <WaitTimeChart />
      </div>

      {/* Prediction Timeline & Basic Canteen Info Side-by-Side */}
      <div id="timeline-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PredictionTimeline slots={upcomingSlots} loading={loading} />
        </div>

        {/* Basic Canteen Info Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              Canteen Operational Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Operating Hours
                </span>
                <span className="font-semibold text-slate-200">08:00 AM – 08:00 PM</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" /> Seating Capacity
                </span>
                <span className="font-semibold text-slate-200">
                  {currentQueue?.canteen_capacity || 120} seats
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Daily Peak Rush
                </span>
                <span className="font-semibold text-amber-400">12:30 PM – 01:45 PM</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Best Quiet Slump
                </span>
                <span className="font-semibold text-emerald-400">02:30 PM – 04:00 PM</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">💡 Tip for Students:</p>
              <p>Visiting right at the start or tail end of breaks cuts wait time by more than 60%.</p>
            </div>

            <button
              onClick={() => setIsCVOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Future YOLO Vision Blueprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSuccess={() => loadAllData()}
        currentPredictedWait={currentQueue?.estimated_wait_minutes}
      />

      <FutureCVModal
        isOpen={isCVOpen}
        onClose={() => setIsCVOpen(false)}
      />
    </div>
  );
}
