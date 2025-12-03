
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Dumbbell, Apple, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAIPlan } from '../services/geminiService';
import { savePlan } from '../services/storageService';
import { PlanPreferences, GeneratedPlan } from '../types';
import { PlanDisplay } from '../components/PlanDisplay';

const OptionButton: React.FC<{ label: string, selected: boolean, onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all duration-300 ${selected
      ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,227,118,0.4)]'
      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
      }`}
  >
    {label}
  </button>
);

export const GeneratePlan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [prefs, setPrefs] = useState<PlanPreferences>({
    goal: 'Build Muscle',
    level: 'Intermediate',
    equipment: 'Full Gym',
    dietaryRestrictions: 'None',
    daysPerWeek: 4
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const planJson = await generateAIPlan(prefs);
      const parsedPlan = JSON.parse(planJson) as GeneratedPlan;
      if (!parsedPlan.planName) throw new Error("Invalid response structure");
      setResult(parsedPlan);
    } catch (e) {
      console.error(e);
      setError("We couldn't generate a plan right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await savePlan(result, 'comprehensive');
      navigate('/dashboard');
    } catch (e) {
      console.error("Failed to save plan", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => result ? setResult(null) : navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {result ? 'Your Custom Plan' : 'Create AI Plan'}
          </h1>
        </div>
      </header>

      <div className="px-6 py-6">
        {!result ? (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,227,118,0.3)]">
                <Sparkles size={40} className="text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Let's personalize it</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">Tell us your preferences and our AI will craft the perfect routine for you.</p>
            </div>

            {/* Goal */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Dumbbell size={16} className="text-primary" /> Fitness Goal
              </label>
              <div className="flex flex-wrap gap-3">
                {['Lose Weight', 'Build Muscle', 'Endurance', 'Flexibility'].map(g => (
                  <OptionButton
                    key={g}
                    label={g}
                    selected={prefs.goal === g}
                    onClick={() => setPrefs({ ...prefs, goal: g })}
                  />
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                Level
              </label>
              <div className="flex flex-wrap gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                  <OptionButton
                    key={l}
                    label={l}
                    selected={prefs.level === l}
                    onClick={() => setPrefs({ ...prefs, level: l })}
                  />
                ))}
              </div>
            </div>

            {/* Days */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Calendar size={16} className="text-primary" /> Days Per Week
              </label>
              <div className="glass-card border border-white/10 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase">Frequency</span>
                  <span className="text-primary font-bold text-xl">{prefs.daysPerWeek} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={prefs.daysPerWeek}
                  onChange={(e) => setPrefs({ ...prefs, daysPerWeek: parseInt(e.target.value) })}
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold uppercase">
                  <span>1 Day</span>
                  <span>7 Days</span>
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white uppercase tracking-wider">Equipment Available</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-primary appearance-none font-medium"
                  value={prefs.equipment}
                  onChange={(e) => setPrefs({ ...prefs, equipment: e.target.value })}
                >
                  <option>Full Gym</option>
                  <option>Dumbbells Only</option>
                  <option>Bodyweight Only</option>
                  <option>Home Gym (Basic)</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none rotate-90" size={20} />
              </div>
            </div>

            {/* Diet */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Apple size={16} className="text-primary" /> Dietary Restrictions
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-primary appearance-none font-medium"
                  value={prefs.dietaryRestrictions}
                  onChange={(e) => setPrefs({ ...prefs, dietaryRestrictions: e.target.value })}
                >
                  <option>None</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Keto</option>
                  <option>Paleo</option>
                  <option>Gluten Free</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none rotate-90" size={20} />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition shadow-[0_0_20px_rgba(0,227,118,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 mt-8 active:scale-95 transform duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Generate Plan
                </>
              )}
            </button>
          </div>
        ) : (
          <PlanDisplay
            plan={result}
            onSave={handleSave}
            onClose={() => setResult(null)}
            isSaving={isSaving}
          />
        )}
      </div>
    </div >
  );
};
