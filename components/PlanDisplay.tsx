
import React from 'react';
import { Dumbbell, Utensils, Trophy, Sparkles, Info, Check } from 'lucide-react';
import { GeneratedPlan } from '../types';

interface PlanDisplayProps {
  plan: GeneratedPlan;
  onSave?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  hideActions?: boolean;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onSave, onClose, isSaving, hideActions }) => {
  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Plan Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{plan.planName}</h2>
        <p className="text-muted text-sm px-4">{plan.overview}</p>
      </div>

      <div className="space-y-10">

        {/* Workout Schedule Content */}
        {plan.schedule && plan.schedule.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Dumbbell size={22} />
              </div>
              <h3 className="font-bold text-xl text-white">Workout Schedule</h3>
            </div>

            <div className="space-y-4">
              {plan.schedule.map((day, idx) => (
                <div key={idx} className="bg-surface border border-secondary rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-secondary/50 px-4 py-3 border-b border-secondary flex justify-between items-center">
                    <h3 className="font-bold text-white">{day.day}</h3>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{day.focus}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {day.exercises.length > 0 ? (
                      day.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-start text-sm border-b border-secondary/50 last:border-0 pb-2 last:pb-0">
                          <span className="text-gray-200 font-medium">{ex.name}</span>
                          <span className="text-gray-400 text-xs whitespace-nowrap ml-4 bg-secondary px-2 py-1 rounded">{ex.sets} x {ex.reps}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic flex items-center gap-2"><Sparkles size={14} /> Active Recovery Day</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(plan.schedule?.length > 0 && plan.nutrition) && <div className="w-full h-px bg-secondary"></div>}

        {/* Nutrition Content */}
        {plan.nutrition && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
                <Utensils size={22} />
              </div>
              <h3 className="font-bold text-xl text-white">Nutrition Guide</h3>
            </div>

            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-secondary p-4 rounded-2xl text-center">
                  <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Daily Target</p>
                  <h3 className="text-xl font-bold text-white">{plan.nutrition.dailyCalories}</h3>
                </div>
                <div className="bg-surface border border-secondary p-4 rounded-2xl text-center">
                  <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Macro Split</p>
                  <h3 className="text-sm font-bold text-white leading-tight">{plan.nutrition.macros}</h3>
                </div>
              </div>

              {/* Meals */}
              {plan.nutrition.mealPlan && plan.nutrition.mealPlan.length > 0 && (
                <div className="bg-surface border border-secondary rounded-2xl p-6">
                  <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-gray-400">Recommended Daily Meals</h4>
                  <ul className="space-y-4">
                    {plan.nutrition.mealPlan.map((meal, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-sm text-gray-200">
                        <div className="w-6 h-6 rounded-full bg-orange-900/30 text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold border border-orange-900/50">
                          {idx + 1}
                        </div>
                        <span className="mt-0.5">{meal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tips Section */}
        {plan.tips && plan.tips.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400">
                <Trophy size={22} />
              </div>
              <h3 className="font-bold text-xl text-white">Coach's Tips</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {plan.tips.map((tip, idx) => (
                <div key={idx} className="bg-surface border border-secondary p-4 rounded-xl flex gap-3">
                  <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {!hideActions && onSave && onClose && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-secondary z-20 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-secondary text-white font-bold py-4 rounded-2xl text-sm hover:bg-gray-800 transition"
          >
            Adjust Profile
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Check size={18} /> Save to Dashboard
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
