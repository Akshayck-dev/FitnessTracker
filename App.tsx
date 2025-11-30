
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import { Home as HomeIcon, Compass, Plus, User, Bot } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();
    const isAuth = ['/', '/onboarding'].includes(location.pathname);
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
            <Link to={to} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-secondary pb-safe pt-2 px-6 shadow-2xl z-40 h-20">
            <div className="flex justify-between items-center max-w-md mx-auto relative">
                <NavItem to="/dashboard" icon={HomeIcon} label="Home" />
                <NavItem to="/explore" icon={Compass} label="Discover" />
                
                {/* Floating Action Button Center */}
                <div className="-mt-8">
                   <Link to="/generate-plan" className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 transition">
                      <Plus size={28} className="text-black" />
                   </Link>
                </div>

                <NavItem to="/ai-coach" icon={Bot} label="AI Coach" />
                <NavItem to="/profile" icon={User} label="Profile" />
            </div>
        </nav>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="bg-background text-text min-h-screen font-sans selection:bg-primary selection:text-black">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Home />} />
          <Route path="/studio/:id" element={<StudioDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/generate-plan" element={<GeneratePlan />} />
          <Route path="/ai-coach" element={<AIChat />} />
          <Route path="/plan/:id" element={<SavedPlanDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;
