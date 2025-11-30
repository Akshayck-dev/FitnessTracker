
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Dumbbell, Apple, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAIPlan } from '../services/geminiService';
import { savePlan } from '../services/storageService';
import { PlanPreferences, GeneratedPlan } from '../types';
import { PlanDisplay } from '../components/PlanDisplay';

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

  const handleSave = () => {
    if (!result) return;
    setIsSaving(true);
    // Simulate short delay
    setTimeout(() => {
      savePlan(result, 'comprehensive');
      setIsSaving(false);
      navigate('/dashboard');
    }, 500);
  };

  const OptionButton = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
        selected 
          ? 'bg-primary text-black border-primary' 
          : 'bg-surface border-secondary text-gray-400 hover:border-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <div className="flex items-center gap-4">
          <button onClick={() => result ? setResult(null) : navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {result ? 'Your Custom Plan' : 'Create AI Plan'}
          </h1>
        </div>
      </header>

      <div className="px-6 py-6">
        {!result ? (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-400 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                <Sparkles size={32} className="text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Let's personalize it</h2>
              <p className="text-muted text-sm">Tell us your preferences and our AI will craft the perfect routine for you.</p>
            </div>

            {/* Goal */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell size={16} className="text-primary" /> Fitness Goal
              </label>
              <div className="flex flex-wrap gap-3">
                {['Lose Weight', 'Build Muscle', 'Endurance', 'Flexibility'].map(g => (
                  <OptionButton 
                    key={g} 
                    label={g} 
                    selected={prefs.goal === g} 
                    onClick={() => setPrefs({...prefs, goal: g})} 
                  />
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                 Level
              </label>
              <div className="flex flex-wrap gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                  <OptionButton 
                    key={l} 
                    label={l} 
                    selected={prefs.level === l} 
                    onClick={() => setPrefs({...prefs, level: l})} 
                  />
                ))}
              </div>
            </div>

            {/* Days */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Days Per Week
              </label>
              <div className="flex items-center gap-4 bg-surface border border-secondary p-4 rounded-xl">
                 <input 
                   type="range" 
                   min="1" 
                   max="7" 
                   value={prefs.daysPerWeek}
                   onChange={(e) => setPrefs({...prefs, daysPerWeek: parseInt(e.target.value)})}
                   className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                 />
                 <span className="text-white font-bold text-lg w-8">{prefs.daysPerWeek}</span>
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-3">
               <label className="text-sm font-bold text-white">Equipment Available</label>
               <select 
                 className="w-full bg-surface border border-secondary text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary appearance-none"
                 value={prefs.equipment}
                 onChange={(e) => setPrefs({...prefs, equipment: e.target.value})}
               >
                 <option>Full Gym</option>
                 <option>Dumbbells Only</option>
                 <option>Bodyweight Only</option>
                 <option>Home Gym (Basic)</option>
               </select>
            </div>

             {/* Diet */}
             <div className="space-y-3">
               <label className="text-sm font-bold text-white flex items-center gap-2">
                 <Apple size={16} className="text-primary" /> Dietary Restrictions
               </label>
               <select 
                 className="w-full bg-surface border border-secondary text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary appearance-none"
                 value={prefs.dietaryRestrictions}
                 onChange={(e) => setPrefs({...prefs, dietaryRestrictions: e.target.value})}
               >
                 <option>None</option>
                 <option>Vegetarian</option>
                 <option>Vegan</option>
                 <option>Keto</option>
                 <option>Paleo</option>
                 <option>Gluten Free</option>
               </select>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
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
    </div>
  );
};
