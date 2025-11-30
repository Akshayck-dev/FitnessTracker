import React from 'react';
import { ArrowLeft, Plus, PersonStanding, Dumbbell, Waves, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';
import { WEEKLY_STATS, RECENT_WORKOUTS } from '../constants';

export const Tracker: React.FC = () => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch(type) {
      case 'run': return <PersonStanding size={20} />;
      case 'lift': return <Dumbbell size={20} />;
      case 'swim': return <Waves size={20} />;
      default: return <Timer size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'run': return 'text-orange-400 bg-orange-900/30';
      case 'lift': return 'text-cyan-400 bg-cyan-900/30';
      case 'swim': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Workout Tracker</h1>
        </div>
      </header>

      <div className="px-6 space-y-6">
        
        {/* Log Button */}
        <button className="w-full bg-primary text-black font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:opacity-90 transition transform active:scale-95">
          <Plus size={20} />
          <span>Log New Workout</span>
        </button>

        {/* Stats Cards */}
        <div>
          <h2 className="text-white font-bold text-lg mb-3">This Week's Progress</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-surface border border-secondary p-4 rounded-2xl">
              <p className="text-xs text-muted mb-1">Workouts</p>
              <h3 className="text-2xl font-bold text-white">3/5</h3>
            </div>
            <div className="bg-surface border border-secondary p-4 rounded-2xl">
              <p className="text-xs text-muted mb-1">Total Time</p>
              <h3 className="text-2xl font-bold text-white">2h 15m</h3>
            </div>
            <div className="bg-surface border border-secondary p-4 rounded-2xl">
              <p className="text-xs text-muted mb-1">Avg. Calories</p>
              <h3 className="text-2xl font-bold text-white">350</h3>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-surface border border-secondary p-5 rounded-2xl">
          <h3 className="text-white font-bold text-lg mb-6">Daily Activity</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_STATS}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {WEEKLY_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.active ? '#00E376' : '#2d3748'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-4 px-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Recent List */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {RECENT_WORKOUTS.map((workout) => (
              <div key={workout.id} className="bg-surface border border-secondary p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColor(workout.icon)}`}>
                    {getIcon(workout.icon)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{workout.type}</h4>
                    <p className="text-xs text-muted">{workout.duration} • {workout.calories} kcal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white font-medium">{workout.date}</p>
                  <p className="text-[10px] text-gray-500">{workout.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
