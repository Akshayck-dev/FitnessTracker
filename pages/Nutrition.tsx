
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChevronDown, Coffee, AlignJustify, Utensils, Edit, Sparkles, Share2, CheckSquare, Square, Lightbulb, Salad, Beef, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANNED_MEALS } from '../constants';
import { GroceryItem, DailyMealLog, MealItem } from '../types';
import { getGroceries, toggleGroceryItem, addGroceryItem, deleteGroceryItem, getDailyLog, addMealToLog } from '../services/storageService';

export const Nutrition: React.FC = () => {
  const navigate = useNavigate();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyMealLog[]>([]);
  const [stats, setStats] = useState({ calories: 0, protein: 0 });

  useEffect(() => {
    // Load data from storage
    const loadedGroceries = getGroceries();
    const loadedLog = getDailyLog();
    setGroceryList(loadedGroceries);
    setDailyLog(loadedLog);
  }, []);

  // Update stats whenever dailyLog changes
  useEffect(() => {
    let cal = 0;
    let prot = 0;
    dailyLog.forEach(cat => {
        cat.items.forEach(item => {
            cal += item.calories;
            prot += item.protein || 0;
        });
    });
    setStats({ calories: cal, protein: prot });
  }, [dailyLog]);

  const handleToggleGrocery = (id: string) => {
    const updated = toggleGroceryItem(id);
    setGroceryList(updated);
  };

  const handleAddGrocery = () => {
    const name = window.prompt("Enter item name:");
    if (name && name.trim()) {
        const updated = addGroceryItem(name.trim());
        setGroceryList(updated);
    }
  };

  const handleDeleteGrocery = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Remove this item?")) {
        const updated = deleteGroceryItem(id);
        setGroceryList(updated);
    }
  };

  const handleAddMealFromPlan = (category: string, item: MealItem) => {
    const updatedLog = addMealToLog(category, item);
    setDailyLog(updatedLog);
    // Visual feedback could be added here
  };

  const GroceryItemRow = ({ item }: { item: GroceryItem }) => (
    <div 
      onClick={() => handleToggleGrocery(item.id)}
      className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer transition border-b border-gray-800/50 last:border-0 group"
    >
      <div className="flex items-center gap-3">
        {item.checked ? (
          <div className="bg-primary text-black rounded-md p-0.5">
             <CheckSquare size={18} />
          </div>
        ) : (
          <Square size={20} className="text-gray-500" />
        )}
        <div className="flex flex-col">
            <span className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-white'}`}>
            {item.name}
            </span>
            <span className="text-[10px] text-gray-500">{item.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium bg-secondary px-2 py-1 rounded">{item.quantity}</span>
        <button onClick={(e) => handleDeleteGrocery(e, item.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
            <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const MealRow = ({ icon: Icon, title, description, calories, isLogged, onAdd }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${isLogged ? 'bg-surface border-secondary' : 'bg-transparent border-transparent hover:bg-surface/50'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isLogged ? 'bg-primary/20 text-primary' : 'bg-secondary text-gray-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">{title}</h4>
                <p className="text-xs text-muted max-w-[200px] truncate">{description}</p>
            </div>
        </div>
        {isLogged ? (
            <span className="text-sm font-bold text-white">{calories} kcal</span>
        ) : (
            <button 
                onClick={onAdd}
                className="w-8 h-8 rounded-full bg-secondary border border-gray-700 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition"
            >
                <Plus size={16} />
            </button>
        )}
    </div>
  );

  const getMealIcon = (category: string) => {
      switch(category) {
          case 'Breakfast': return Coffee;
          case 'Lunch': return Salad;
          case 'Dinner': return Beef;
          default: return Utensils;
      }
  };

  const calPercentage = Math.min((stats.calories / 2500) * 100, 100);
  const protPercentage = Math.min((stats.protein / 180) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-background sticky top-0 z-20">
        <div className="flex items-center justify-between mb-6">
           <button onClick={() => navigate('/dashboard')} className="text-white hover:text-primary transition">
             <AlignJustify size={24} />
           </button>
           <h1 className="text-lg font-bold text-white">Nutrition Hub</h1>
           <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden border border-gray-700">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" />
           </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Good morning, Alex!</h2>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface border border-secondary p-5 rounded-3xl relative overflow-hidden">
                <p className="text-xs text-gray-400 font-bold mb-1">Calories</p>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold text-white">{stats.calories}</span>
                    <span className="text-xs text-gray-500">/ 2500 kcal</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${calPercentage}%` }}></div>
                </div>
            </div>

            <div className="bg-surface border border-secondary p-5 rounded-3xl relative overflow-hidden">
                <p className="text-xs text-gray-400 font-bold mb-1">Protein</p>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold text-white">{stats.protein}</span>
                    <span className="text-xs text-gray-500">/ 180 g</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${protPercentage}%` }}></div>
                </div>
            </div>
        </div>
      </header>

      <div className="px-6 space-y-8">
        
        {/* Your Meal Plan */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Your Meal Plan</h3>
                <button className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-medium">
                    This Week <ChevronDown size={14} />
                </button>
            </div>

            <div className="bg-surface border border-secondary rounded-3xl p-2 space-y-1 mb-4">
                <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-500 font-medium">
                    <span>Today's Plan</span>
                    <span>Click + to log</span>
                </div>
                {PLANNED_MEALS.map((meal, idx) => (
                    <MealRow 
                        key={idx}
                        icon={getMealIcon(meal.category)} 
                        title={meal.category} 
                        description={meal.items.map(i => i.name).join(', ')} 
                        onAdd={() => handleAddMealFromPlan(meal.category, meal.items[0])}
                    />
                ))}
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition">
                    <Edit size={16} /> Manage Plan
                </button>
                <button className="flex-1 bg-surface border border-secondary text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-800 transition">
                    <Sparkles size={16} /> AI Suggestions
                </button>
            </div>
        </section>

        {/* Grocery List */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Grocery List</h3>
                <button className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Generate List
                </button>
            </div>

            <div className="bg-surface border border-secondary rounded-3xl p-4">
                <div className="space-y-1 max-h-64 overflow-y-auto hide-scrollbar">
                    {groceryList.map((item) => (
                        <GroceryItemRow key={item.id} item={item} />
                    ))}
                    {groceryList.length === 0 && <p className="text-gray-500 text-sm text-center py-4">List is empty.</p>}
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={handleAddGrocery} className="flex-1 bg-secondary text-white font-bold py-3 rounded-xl text-sm border border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-700">
                        <Plus size={16} /> Add Item
                    </button>
                    <button className="flex-1 bg-secondary text-white font-bold py-3 rounded-xl text-sm border border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-700">
                        <Share2 size={16} /> Share
                    </button>
                </div>
            </div>
        </section>

        {/* Today's Log */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Today's Log</h3>
                <div className="bg-secondary p-1.5 rounded-lg text-gray-400">
                    <AlignJustify size={16} />
                </div>
            </div>
            
            <div className="space-y-3">
                {dailyLog.map((section, idx) => {
                    const Icon = getMealIcon(section.category);
                    return (
                        <MealRow 
                            key={idx}
                            icon={Icon}
                            title={section.category}
                            description={section.items.map(i => i.name).join(', ')}
                            calories={section.totalCalories}
                            isLogged={true}
                        />
                    );
                })}
                {dailyLog.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No meals logged today yet.</p>}
            </div>
        </section>

        {/* Lean Bulk Phase Card */}
        <div className="bg-gradient-to-br from-green-900/40 to-surface border border-primary/20 p-6 rounded-3xl">
            <h3 className="font-bold text-white text-lg mb-2">Lean Bulk Phase 2</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Your current AI-generated diet plan is active. Ends in 4 weeks.
            </p>
            <button className="bg-primary text-black font-bold px-6 py-2 rounded-full text-sm hover:scale-105 transition">
                View Plan
            </button>
        </div>

        {/* AI Insights */}
        <div className="bg-surface border border-secondary p-6 rounded-3xl mb-8">
            <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-primary" size={20} />
                <h3 className="font-bold text-white">AI Coach Insights</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
                {stats.protein > 100 
                  ? "You're consistently hitting your protein goal! Great job. Consider adding a handful of almonds as a snack to boost your healthy fat intake."
                  : "Try to prioritize protein in your next meal to stay on track for your muscle building goals."}
            </p>
        </div>

      </div>
    </div>
  );
};
