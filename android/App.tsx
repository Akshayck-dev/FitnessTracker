
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { StudioDetails } from './pages/StudioDetails';
import { Profile } from './pages/Profile';
import { Tracker } from './pages/Tracker';
import { Nutrition } from './pages/Nutrition';
import { GeneratePlan } from './pages/GeneratePlan';
import { AIChat } from './pages/AIChat';
import { SavedPlanDetails } from './pages/SavedPlanDetails';
import { Bookings } from './pages/Bookings';
import { Notifications } from './pages/Notifications';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Home as HomeIcon, Compass, Plus, User, Bot, Download, Utensils } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed top-4 right-4 z-50 bg-primary text-black font-bold px-4 py-2 rounded-full shadow-[0_0_15px_rgba(0,227,118,0.4)] flex items-center gap-2 animate-in fade-in slide-in-from-top-4"
    >
      <Download size={16} />
      <span className="text-xs">Install App</span>
    </button>
  );
};

const Navigation = () => {
  const location = useLocation();
  const isAuth = ['/', '/onboarding', '/register', '/verify-otp'].includes(location.pathname);
  // Hide nav on details pages including plan details and bookings
  const isDetail = location.pathname.startsWith('/studio/') ||
    location.pathname === '/generate-plan' ||
    location.pathname === '/ai-coach' ||
    location.pathname.startsWith('/plan/') ||
    location.pathname === '/bookings' ||
    location.pathname === '/notifications';

  if (isAuth || isDetail) return null;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex flex-col items-center gap-1 transition duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}>
        <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 shadow-[0_0_10px_rgba(0,227,118,0.2)]' : ''}`}>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/5 pb-2 pt-2 px-6 shadow-2xl z-[9999] h-20 pointer-events-auto">
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        <NavItem to="/dashboard" icon={HomeIcon} label="Home" />
        <NavItem to="/explore" icon={Compass} label="Discover" />

        {/* Nutrition Center Item */}
        <NavItem to="/nutrition" icon={Utensils} label="Nutrition" />

        <NavItem to="/ai-coach" icon={Bot} label="AI Coach" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
};

import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

import { getToken } from 'firebase/messaging';
import { messaging } from './services/firebase';

import { Register } from './pages/Register';
import { OTPVerification } from './pages/OTPVerification';
import { SettingsProvider } from './contexts/SettingsContext';

const NotificationManager = () => {
  React.useEffect(() => {
    const requestPermission = async () => {
      try {
        const vapidKey = 'BM_U_VAPID_KEY_HERE_REPLACE_ME';

        // Check if VAPID key is still the placeholder
        if (vapidKey === 'BM_U_VAPID_KEY_HERE_REPLACE_ME') {
          console.warn('VAPID key is not configured. Push notifications will be disabled.');
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // Get FCM Token
          const token = await getToken(messaging, {
            vapidKey: vapidKey
          });
          console.log('FCM Token:', token);
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    requestPermission();
  }, []);

  return null;
};

import { CoachVerification } from './pages/CoachVerification';

const AppRoutes = () => {
  return (
    <div className="bg-background text-text min-h-screen font-sans selection:bg-primary selection:text-black">
      <InstallPrompt />
      <NotificationManager />
      <Routes>
        <Route path="/" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />

        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/studio/:id" element={<ProtectedRoute><StudioDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/verify-coach" element={<ProtectedRoute><CoachVerification /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
        <Route path="/generate-plan" element={<ProtectedRoute><GeneratePlan /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/plan/:id" element={<ProtectedRoute><SavedPlanDetails /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
        <Route path="/terms" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
      </Routes>
      <Navigation />
    </div >
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
