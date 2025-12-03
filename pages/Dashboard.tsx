import React, { useState, useEffect } from 'react';
import { Bell, Utensils, ChevronRight, Activity, Dumbbell, ChevronDown, ChevronUp, Plus, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { WEEKLY_STATS, MACROS } from '../constants';
import { getPlans, getNotifications, getUserProfile, getDashboardStats } from '../services/storageService';
import { SavedPlan } from '../types';
import { ShareModal } from '../components/ShareModal';
import { seedUserData } from '../services/seedService';

export const Dashboard: React.FC = () => {
   const navigate = useNavigate();
   const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
   const [showAllPlans, setShowAllPlans] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);
   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
   const [isSeeding, setIsSeeding] = useState(false);
   const [userName, setUserName] = useState('User');
   const [stats, setStats] = useState({
      workoutsCount: 0,
      activeTimeStr: '0m',
      nutrition: {
         calories: 0,
         macros: [
            { label: 'Carbs', value: 0, color: '#f97316' },
            { label: 'Protein', value: 0, color: '#3b82f6' },
            { label: 'Fat', value: 0, color: '#10b981' }
         ]
      },
      consistency: [] as any[]
   });

   useEffect(() => {
      const fetchDashboardData = async () => {
         const plans = await getPlans();
         setSavedPlans(plans);

         const notifications = await getNotifications();
         setUnreadCount(notifications.filter(n => !n.read).length);

         const profile = await getUserProfile();
         if (profile?.name) {
            const firstName = profile.name.split(' ')[0];
            setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
         }

         const dashboardStats = await getDashboardStats();

         // Fallback to mock data if no activity is found (New User Experience)
         if (dashboardStats.workoutsCount === 0 && dashboardStats.nutrition.calories === 0) {
            setStats({
               workoutsCount: 5,
               activeTimeStr: '3h 45m',
               nutrition: {
                  calories: 1850,
                  macros: [
                     { label: 'Carbs', value: 45, color: '#f97316' },
                     { label: 'Protein', value: 30, color: '#3b82f6' },
                     { label: 'Fat', value: 25, color: '#10b981' }
                  ]
               },
               consistency: WEEKLY_STATS
            });
         } else {
            setStats(dashboardStats);
         }
      };

      fetchDashboardData();
   }, []);

   const visiblePlans = showAllPlans ? savedPlans : savedPlans.slice(0, 2);

   const getPlanColor = (type: string) => {
      switch (type) {
         case 'diet': return 'bg-accent-blue/20';
         case 'workout': return 'bg-primary/20';
         default: return 'bg-accent-orange/20';
      }
   };

   const getPlanIcon = (type: string) => {
      switch (type) {
         case 'diet': return <Utensils className="text-accent-blue" size={20} />;
         case 'workout': return <Dumbbell className="text-primary" size={20} />;
         default: return <Activity className="text-accent-orange" size={20} />;
      }
   };

   const handleSeed = async () => {
      if (window.confirm("This will add demo data to your account. Continue?")) {
         setIsSeeding(true);
         try {
            await seedUserData();
            // Re-fetch data after seeding
            const plans = await getPlans();
            setSavedPlans(plans);
            const notifications = await getNotifications();
            setUnreadCount(notifications.filter(n => !n.read).length);
            const dashboardStats = await getDashboardStats();
            setStats(dashboardStats);
            alert("Data added! Refreshing...");
            window.location.reload();
         } catch (e) {
            console.error(e);
            alert("Failed to seed data. Make sure you are logged in.");
         } finally {
            setIsSeeding(false);
         }
      }
   };

   return (
      <div className="min-h-screen bg-background pb-28 font-sans">
         {/* Header */}
         <header className="px-6 py-6 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shadow-lg">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Hello, {userName}!</h1>
                  <p className="text-xs text-muted">Monday, Oct 26</p>
               </div>
            </div>
            <div className="flex gap-3">
               <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-white/5 rounded-full transition"
               >
                  <Share2 size={24} />
               </button>
               <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition"
               >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                     <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
                  )}
               </button>
            </div>
         </header>

         <div className="px-6 space-y-6 mt-6">
            {/* Generate AI Plan Button */}
            <Link to="/generate-plan" className="w-full bg-cyan-400 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-[1.02] transition-transform group">
               <Activity size={20} className="text-black" />
               <span className="text-black font-bold text-base">Generate New AI Plan</span>
            </Link>

            {/* Your AI Plans */}
            <div>
               <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white font-bold text-lg">Your AI Plans</h2>
                  {savedPlans.length > 2 && (
                     <button
                        onClick={() => setShowAllPlans(!showAllPlans)}
                        className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                     >
                        {showAllPlans ? 'Show Less' : 'View All'}
                        {showAllPlans ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                     </button>
                  )}
               </div>
               <div className="space-y-3">
                  {savedPlans.length > 0 ? (
                     visiblePlans.map(plan => (
                        <Link key={plan.id} to={`/plan/${plan.id}`} className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl ${getPlanColor(plan.type)} flex items-center justify-center shrink-0`}>
                                 {getPlanIcon(plan.type)}
                              </div>
                              <div className="overflow-hidden">
                                 <h3 className="text-white font-bold truncate pr-4">{plan.planName}</h3>
                                 <p className="text-xs text-muted">View and edit your plan</p>
                              </div>
                           </div>
                           <ChevronRight className="text-gray-600 group-hover:text-white transition shrink-0" size={20} />
                        </Link>
                     ))
                  ) : (
                     <div className="text-center p-6 glass-card rounded-2xl border-dashed border-white/10">
                        <p className="text-muted text-sm mb-2">No plans saved yet.</p>
                        <Link to="/generate-plan" className="text-primary text-sm font-bold">Create your first plan</Link>
                     </div>
                  )}
               </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
               <div className="glass-card p-5 rounded-3xl">
                  <p className="text-xs text-gray-400 font-bold mb-2">Workouts This Week</p>
                  <h3 className="text-3xl font-bold text-white">{stats.workoutsCount} <span className="text-gray-500 text-xl">/ 5</span></h3>
               </div>
               <div className="glass-card p-5 rounded-3xl">
                  <p className="text-xs text-gray-400 font-bold mb-2">Active Time</p>
                  <h3 className="text-3xl font-bold text-white">{stats.activeTimeStr}</h3>
               </div>
            </div>

            {/* Nutrition Card */}
            <div className="glass-card p-6 rounded-3xl">
               <div className="mb-6">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Today's Nutrition</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-2xl font-bold text-white">{stats.nutrition.calories}</h3>
                     <span className="text-gray-500 font-medium">/ 2,400 kcal</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Macronutrient Distribution</p>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  {stats.nutrition.macros.map(macro => (
                     <div key={macro.label} className="flex flex-col items-center">
                        <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="none" />
                              <circle cx="40" cy="40" r="32" stroke={macro.color} strokeWidth="6" fill="none" strokeDasharray="200" strokeDashoffset={200 - (200 * macro.value) / 100} strokeLinecap="round" />
                           </svg>
                           <span className="absolute text-sm font-bold text-white">{macro.value}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{macro.label}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Consistency Chart */}
            <div className="glass-card p-6 rounded-3xl">
               <div className="mb-6">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Weekly Consistency</p>
                  <h3 className="text-2xl font-bold text-white">Last 7 Days</h3>
               </div>

               <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={stats.consistency}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                           {stats.consistency.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.active ? '#22d3ee' : '#1e293b'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            {/* Today's Focus */}
            <div>
               <h2 className="text-white font-bold text-lg mb-3">Today's Focus</h2>
               <div className="space-y-3">
                  {/* Latest Workout */}
                  <div
                     className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition"
                     onClick={() => navigate('/tracker')}
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary border border-white/10">
                           <Dumbbell size={24} />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Latest Workout</p>
                           <h3 className="text-white font-bold">
                              {stats.workoutsCount > 0 ? 'Workout Logged' : 'Log a Workout'}
                           </h3>
                        </div>
                     </div>
                     <ChevronRight size={20} className="text-gray-500" />
                  </div>

                  {/* Latest Meal */}
                  <div
                     className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition"
                     onClick={() => navigate('/nutrition')}
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-orange-400 border border-white/10">
                           <Utensils size={24} />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Nutrition</p>
                           <h3 className="text-white font-bold">
                              {stats.nutrition.calories > 0 ? `${stats.nutrition.calories} kcal consumed` : 'Log your first meal'}
                           </h3>
                        </div>
                     </div>
                     <ChevronRight size={20} className="text-gray-500" />
                  </div>
               </div>
            </div>
         </div>

         {/* Floating Action Button for Quick Add */}
         <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-30">
            <button
               onClick={handleSeed}
               disabled={isSeeding}
               className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:bg-gray-700 transition"
               title="Seed Demo Data"
            >
               <span className="text-xs font-bold text-white">{isSeeding ? '...' : 'DB'}</span>
            </button>
            <button className="w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 transition-transform">
               <Plus size={28} className="text-black" />
            </button>
         </div>

         <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            stats={{ workouts: 5, calories: 2450, minutes: 320 }}
         />
      </div >
   );
};
