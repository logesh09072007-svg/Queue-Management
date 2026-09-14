import React from 'react';
import { Camera, X, Cpu, ArrowRight, Eye, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FutureCVModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Future Architectural Module</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-2">
              VisionFlow: YOLO Computer Vision Integration
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Planned automated people-counting camera module designed to seamlessly feed queue lengths into QueueSense AI without manual admin logging.
            </p>
          </div>

          {/* Architecture Pipeline Visual */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 text-center">
              Automated Camera → ML Pipeline (Architecture Specification)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <Camera className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-200">1. Canteen CCTV</span>
                <span className="text-[10px] text-slate-400">RTSP Stream (15fps)</span>
              </div>

              <div className="hidden sm:flex justify-center text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 shadow-sm shadow-cyan-500/10">
                <Eye className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-teal-300">2. YOLOv8 Detection</span>
                <span className="text-[10px] text-slate-400">Bounding Box ROI</span>
              </div>

              <div className="hidden sm:flex justify-center text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                <Cpu className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-emerald-300">3. QueueSense AI</span>
                <span className="text-[10px] text-slate-400">Random Forest Predictor</span>
              </div>
            </div>
          </div>

          {/* Engineering Integrity Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-4 h-4" />
              Honest Implementation Status:
            </p>
            <p className="opacity-90">
              In this current production release (v1.0), the canteen admin inputs current queue counts manually through the Admin Portal, or the system utilizes the calibrated synthetic demo generator. This computer vision module is a planned modular hardware extension and is not pretended to be live IoT hardware.
            </p>
          </div>

          {/* Module Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-300">Privacy-First Architecture:</span>
              <p className="text-slate-400 mt-0.5">
                No facial biometric data is stored. Only anonymous head/person bounding boxes and coordinate centroids are counted.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-300">API Decoupling:</span>
              <p className="text-slate-400 mt-0.5">
                Will post counts directly to <code className="text-emerald-400">POST /api/queue/update</code> via secure service token.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Close Blueprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
