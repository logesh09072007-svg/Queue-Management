import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FutureCVModal from './components/FutureCVModal';
import { Sparkles, Heart, Shield, Cpu } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onCheckQueue={() => setActiveTab('student')}
            onAdminLogin={() => setActiveTab(isAdmin ? 'admin' : 'login')}
            onOpenCV={() => setIsCVModalOpen(true)}
          />
        );
      case 'student':
        return <StudentDashboard />;
      case 'admin':
        return (
          <AdminDashboard
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToAnalytics={() => setActiveTab('analytics')}
          />
        );
      case 'analytics':
        return <AdminAnalytics />;
      case 'login':
        return (
          <LoginPage
            onSuccess={(user) => {
              if (user.role === 'admin') setActiveTab('admin');
              else setActiveTab('student');
            }}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onSuccess={() => setActiveTab('login')}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        );
      default:
        return <LandingPage onCheckQueue={() => setActiveTab('student')} onAdminLogin={() => setActiveTab('login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Explicit Synthetic Demo Banner */}
      <DemoBanner />

      {/* Modern Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Future CV Modal */}
      <FutureCVModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">QueueSense AI</span>
            <span>— Smart Canteen Queue Prediction & Management System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsCVModalOpen(true)}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>YOLO Vision Blueprint</span>
            </button>
            <span>•</span>
            <span>FastAPI + React + Scikit-Learn</span>
            <span>•</span>
            <span className="text-emerald-400/90 font-medium">Demo Mode Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
