import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, PersonStanding, Dumbbell, Waves, Timer, Calendar, Flame, Clock, Trophy, TrendingUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Tooltip } from 'recharts';
import { ExerciseChart } from '../components/ExerciseChart';
import { getWorkouts, getExerciseHistory, getPersonalRecords, saveWorkout, updateExerciseHistory, updatePersonalRecord } from '../services/storageService';
import { WorkoutSession, DailyStats } from '../types';
import { WEEKLY_STATS as MOCK_WEEKLY_STATS, RECENT_WORKOUTS as MOCK_RECENT_WORKOUTS, EXERCISE_HISTORY as MOCK_EXERCISE_HISTORY, PERSONAL_RECORDS as MOCK_PRS } from '../constants';

export const Tracker: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, { date: string, weight: number }[]>>({});
  const [personalRecords, setPersonalRecords] = useState<{ exercise: string, weight: string, date: string }[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>(MOCK_WEEKLY_STATS);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState('Weightlifting');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  // Stats Log State
  const [isStatsLogOpen, setIsStatsLogOpen] = useState(false);
  const [statsExercise, setStatsExercise] = useState('Bench Press');
  const [statsWeight, setStatsWeight] = useState('');
  const [statsDate, setStatsDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedWorkouts = await getWorkouts();
        const loadedHistory = await getExerciseHistory();
        const loadedPRs = await getPersonalRecords();

        if (loadedWorkouts.length > 0) setWorkouts(loadedWorkouts);
        else setWorkouts(MOCK_RECENT_WORKOUTS);

        if (Object.keys(loadedHistory).length > 0) setExerciseHistory(loadedHistory);
        else setExerciseHistory(MOCK_EXERCISE_HISTORY);

        if (loadedPRs.length > 0) setPersonalRecords(loadedPRs);
        else setPersonalRecords(MOCK_PRS);

      } catch (error) {
        console.error("Failed to load tracker data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running': return <PersonStanding size={20} />;
      case 'weightlifting': return <Dumbbell size={20} />;
      case 'swimming': return <Waves size={20} />;
      default: return <Timer size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'weightlifting': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'swimming': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const handleSaveWorkout = async () => {
    if (!duration || !calories) return;

    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      type: workoutType,
      duration: `${duration} min`,
      calories: parseInt(calories),
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: workoutType.toLowerCase().includes('run') ? 'run' :
        workoutType.toLowerCase().includes('swim') ? 'swim' :
          workoutType.toLowerCase().includes('lift') ? 'lift' : 'lift'
    };

    setWorkouts([newWorkout, ...workouts]);
    await saveWorkout(newWorkout);

    setIsLogOpen(false);
    setDuration('');
    setCalories('');
  };

  const handleSaveStats = async () => {
    if (!statsWeight) return;

    await updateExerciseHistory(statsExercise, parseFloat(statsWeight), statsDate);
    await updatePersonalRecord({
      exercise: statsExercise,
      weight: `${statsWeight} kg`,
      date: statsDate
    });

    const loadedHistory = await getExerciseHistory();
    const loadedPRs = await getPersonalRecords();
    setExerciseHistory(loadedHistory);
    setPersonalRecords(loadedPRs);

    setIsStatsLogOpen(false);
    setStatsWeight('');
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans relative">

      {/* Log Stats Modal */}
      {isStatsLogOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Log Strength Stats</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Exercise</label>
                <select
                  value={statsExercise}
                  onChange={(e) => setStatsExercise(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                >
                  <option>Bench Press</option>
                  <option>Squat</option>
                  <option>Deadlift</option>
                  <option>Overhead Press</option>
                  <option>Pull Up</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  value={statsWeight}
                  onChange={(e) => setStatsWeight(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Date</label>
                <input
                  type="date"
                  value={statsDate}
                  onChange={(e) => setStatsDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsStatsLogOpen(false)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition">Cancel</button>
                <button onClick={handleSaveStats} className="flex-1 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 transition shadow-[0_0_15px_rgba(0,227,118,0.3)]">Save Stats</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Workout Modal */}
      {isLogOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Log Workout</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Workout Type</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                >
                  <option>Weightlifting</option>
                  <option>Running</option>
                  <option>Swimming</option>
                  <option>Yoga</option>
                  <option>HIIT</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Calories Burned</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsLogOpen(false)}
                  className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className="flex-1 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 transition shadow-[0_0_15px_rgba(0,227,118,0.3)]"
                >
                  Save Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Workout Tracker</h1>
        </div>
        <button className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition">
          <Calendar size={20} />
        </button>
      </header>

      <div className="px-6 space-y-8 mt-4">

        {/* Log Button */}
        <button
          onClick={() => setIsLogOpen(true)}
          className="w-full bg-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,227,118,0.3)] hover:opacity-90 transition transform active:scale-95 group"
        >
          <div className="bg-black/10 p-1 rounded-full group-hover:bg-black/20 transition">
            <Plus size={20} />
          </div>
          <span className="text-lg">Log New Workout</span>
        </button>

        {/* Stats Cards */}
        <div>
          <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            This Week's Progress
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
              <div className="mb-2 p-2 bg-blue-500/10 rounded-full text-blue-400">
                <Dumbbell size={18} />
              </div>
              <h3 className="text-xl font-bold text-white">{workouts.length > 0 ? workouts.length : 0}</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Workouts</p>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
              <div className="mb-2 p-2 bg-purple-500/10 rounded-full text-purple-400">
                <Clock size={18} />
              </div>
              <h3 className="text-xl font-bold text-white">2h 15m</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Duration</p>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
              <div className="mb-2 p-2 bg-orange-500/10 rounded-full text-orange-400">
                <Flame size={18} />
              </div>
              <h3 className="text-xl font-bold text-white">
                {workouts.reduce((acc, curr) => acc + curr.calories, 0)}
              </h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Calories</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Activity</h3>
            <select className="bg-white/5 border border-white/10 text-xs text-gray-300 rounded-lg px-2 py-1 outline-none">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0D1412', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={12}>
                  {weeklyStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.active ? '#00E376' : '#1E293B'}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Strength Progress Chart */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Strength Progress
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="bg-white/5 border border-white/10 text-xs text-white rounded-lg pl-3 pr-8 py-2 outline-none appearance-none cursor-pointer hover:bg-white/10 transition"
                  >
                    {Object.keys(exerciseHistory).map(ex => (
                      <option key={ex} value={ex} className="bg-surface text-white">{ex}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button onClick={() => setIsStatsLogOpen(true)} className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <ExerciseChart
              data={exerciseHistory[selectedExercise] || []}
              color="#00E376"
            />
          </div>

          {/* Personal Records */}
          <div className="mt-8">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              Personal Records
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {personalRecords.map((pr, idx) => (
                <div key={idx} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 transition group">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{pr.exercise}</p>
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition">{pr.weight}</h3>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    <span>{pr.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent List */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-white font-bold text-lg">Recent Workouts</h3>
            <button className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {workouts.map((workout) => (
              <div key={workout.id} className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/30 transition group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getColor(workout.icon)} shadow-lg`}>
                    {getIcon(workout.icon)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold group-hover:text-primary transition">{workout.type}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Clock size={10} /> {workout.duration}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      <span className="flex items-center gap-1"><Flame size={10} /> {workout.calories} kcal</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300 font-medium bg-white/5 px-2 py-1 rounded-lg border border-white/5">{workout.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
