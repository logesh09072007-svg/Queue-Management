import React, { useState } from 'react';
import { Star, X, Check, MessageSquare, Timer, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FeedbackModal({ isOpen, onClose, onSuccess, currentPredictedWait }) {
  const [rating, setRating] = useState(5);
  const [actualWait, setActualWait] = useState(currentPredictedWait ? Math.round(currentPredictedWait) : 10);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.submitFeedback({
        actual_wait_minutes: parseFloat(actualWait),
        rating: parseInt(rating),
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Thank You!</h3>
            <p className="text-xs text-slate-400">
              Your feedback directly tunes our crowd and latency prediction models.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Post-Visit Check-In
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">
                How accurate was the wait time?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Help fellow students and canteen managers refine real-time queue intelligence.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Prediction Accuracy Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-300">
                  {rating === 5 ? 'Very Accurate' : rating === 4 ? 'Mostly Accurate' : rating === 3 ? 'Moderate' : 'Inaccurate'}
                </span>
              </div>
            </div>

            {/* Actual Waiting Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                Actual time you waited (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="120"
                  step="0.5"
                  value={actualWait}
                  onChange={(e) => setActualWait(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. 12"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-500">min</span>
              </div>
              {currentPredictedWait && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Our system predicted ~{Math.round(currentPredictedWait)} minutes.
                </p>
              )}
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Additional Comments (optional)
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., Line moved fast, 3 counters were active..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
