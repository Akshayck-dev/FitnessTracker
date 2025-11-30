
import React, { useState, useEffect } from 'react';
import { Bell, Utensils, ShoppingBag, ChevronRight, Activity, Dumbbell, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { WEEKLY_STATS, MACROS } from '../constants';
import { getPlans, getNotifications } from '../services/storageService';
import { SavedPlan } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setSavedPlans(getPlans());
    // Count unread notifications
    const notifs = getNotifications();
    setUnreadCount(notifs.filter(n => !n.read).length);
  }, []);

  const getPlanIcon = (type: string) => {
      switch(type) {
          case 'diet': return <Utensils className="text-blue-500" size={20} />;
          case 'workout': return <Dumbbell className="text-teal-500" size={20} />;
          default: return <FileText className="text-purple-500" size={20} />;
      }
  };

  const getPlanColor = (type: string) => {
    switch(type) {
        case 'diet': return 'bg-blue-500/10';
        case 'workout': return 'bg-teal-500/10';
        default: return 'bg-purple-500/10';
    }
  };

  const visiblePlans = showAllPlans ? savedPlans : savedPlans.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-6 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-sm z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-white">Hello, Alex!</h1>
            </div>
         </div>
         <button 
           onClick={() => navigate('/notifications')}
           className="relative p-2 text-white hover:bg-secondary rounded-full transition"
         >
            <Bell size={24} />
            {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            )}
         </button>
      </header>

      <div className="px-6 space-y-6">
         <p className="text-muted text-sm">Monday, Oct 26. You're on a great streak! Keep it up.</p>
         
         {/* AI Plan Button */}
         <Link to="/generate-plan" className="w-full bg-gradient-to-r from-cyan-400 to-primary p-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition group">
             <div className="bg-black/20 p-1 rounded-full group-hover:scale-110 transition-transform"><Activity size={16} className="text-black" /></div>
             <span className="text-black font-bold text-sm">Generate New AI Plan</span>
         </Link>

         <div className="flex justify-between items-center mt-2">
            <h2 className="text-white font-bold text-lg">Your AI Plans</h2>
            {savedPlans.length > 3 && (
              <button 
                onClick={() => setShowAllPlans(!showAllPlans)}
                className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
              >
                {showAllPlans ? 'Show Less' : 'View All'}
                {showAllPlans ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
         </div>

         {/* Saved Plan Cards */}
         <div className="space-y-3">
            {savedPlans.length > 0 ? (
                <>
                  {visiblePlans.map(plan => (
                      <Link key={plan.id} to={`/plan/${plan.id}`} className="bg-surface border border-secondary p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full ${getPlanColor(plan.type)} flex items-center justify-center shrink-0`}>
                                  {getPlanIcon(plan.type)}
                              </div>
                              <div className="overflow-hidden">
                                  <h3 className="text-white font-bold truncate pr-4">{plan.planName}</h3>
                                  <p className="text-xs text-muted">Created {new Date(plan.createdAt).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <ChevronRight className="text-gray-600 group-hover:text-white transition shrink-0" size={20} />
                      </Link>
                  ))}
                </>
            ) : (
                <div className="text-center p-4 bg-surface border border-secondary rounded-2xl border-dashed">
                    <p className="text-muted text-sm mb-2">No plans saved yet.</p>
                    <Link to="/generate-plan" className="text-primary text-sm font-bold">Create your first plan</Link>
                </div>
            )}
            
            {/* Standard Tracker Links (Always visible as fallback/quick access) */}
            <Link to="/nutrition" className="bg-surface border border-secondary p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                     <Utensils className="text-gray-400" size={20} />
                  </div>
                  <div>
                     <h3 className="text-white font-bold">Daily Food Tracker</h3>
                     <p className="text-xs text-muted">Log meals</p>
                  </div>
               </div>
               <ChevronRight className="text-gray-600 group-hover:text-white transition" size={20} />
            </Link>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-secondary p-4 rounded-2xl">
               <p className="text-xs text-muted mb-1">Workouts This Week</p>
               <h3 className="text-2xl font-bold text-white">3 / 5</h3>
            </div>
            <div className="bg-surface border border-secondary p-4 rounded-2xl">
               <p className="text-xs text-muted mb-1">Active Time</p>
               <h3 className="text-2xl font-bold text-white">4h 15m</h3>
            </div>
         </div>

         {/* Nutrition Card */}
         <div className="bg-surface border border-secondary p-5 rounded-2xl">
             <div className="mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Weekly Nutrition</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-xl font-bold text-white">Avg. 2,150</h3>
                   <span className="text-gray-500">/ 2,400 kcal</span>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-2">
                 {MACROS.map(macro => (
                     <div key={macro.label} className="flex flex-col items-center">
                         <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                             <svg className="w-full h-full transform -rotate-90">
                                 <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                                 <circle cx="32" cy="32" r="28" stroke={macro.color} strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * macro.value) / 100} strokeLinecap="round" />
                             </svg>
                             <span className="absolute text-xs font-bold text-white">{macro.value}%</span>
                         </div>
                         <span className="text-xs text-gray-400">{macro.label}</span>
                     </div>
                 ))}
             </div>
         </div>

         {/* Consistency Chart */}
         <div className="bg-surface border border-secondary p-5 rounded-2xl">
            <div className="mb-6">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Weekly Consistency</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-white">85% Adherence</h3>
                </div>
                <p className="text-xs text-primary mt-1">Last 7 Days +5%</p>
            </div>
            
            <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_STATS}>
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                     <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                        {WEEKLY_STATS.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.active ? '#00E376' : '#1e293b'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
