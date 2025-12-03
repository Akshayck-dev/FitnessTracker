import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChevronDown, Coffee, AlignJustify, Utensils, Edit, Sparkles, Share2, CheckSquare, Square, Lightbulb, Salad, Beef, Trash2, Apple, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANNED_MEALS, FOOD_DATABASE } from '../constants';
import { GroceryItem, DailyMealLog, MealItem } from '../types';
import { getGroceries, toggleGroceryItem, addGroceryItem, deleteGroceryItem, getDailyLog, addMealToLog } from '../services/storageService';

import { analyzeFoodImage, getNutritionSuggestions } from '../services/geminiService';
import { FoodAnalysisResult, FoodSuggestion } from '../types';

export const Nutrition: React.FC = () => {
    const navigate = useNavigate();
    const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyMealLog[]>([]);
    const [stats, setStats] = useState({ calories: 0, protein: 0 });

    // AI Vision State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scannedResult, setScannedResult] = useState<FoodAnalysisResult | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // AI Suggestions State
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Food Search Modal State
    const [searchQuery, setSearchQuery] = useState('');
    const [mealCategory, setMealCategory] = useState('Breakfast');

    useEffect(() => {
        const loadData = async () => {
            const loadedGroceries = await getGroceries();
            const loadedLog = await getDailyLog();
            setGroceryList(loadedGroceries);
            setDailyLog(loadedLog);
        };
        loadData();
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

    const handleToggleGrocery = async (id: string) => {
        const item = groceryList.find(i => i.id === id);
        if (item) {
            // Optimistic update
            const updated = groceryList.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
            setGroceryList(updated);
            await toggleGroceryItem(id, item.checked);
        }
    };

    const handleAddGrocery = async () => {
        const name = window.prompt("Enter item name:");
        if (name && name.trim()) {
            const newItem = await addGroceryItem(name.trim());
            setGroceryList([newItem, ...groceryList]);
        }
    };

    const handleDeleteGrocery = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Remove this item?")) {
            // Optimistic update
            setGroceryList(groceryList.filter(i => i.id !== id));
            await deleteGroceryItem(id);
        }
    };

    const handleAddMealFromPlan = async (category: string, item: MealItem) => {
        const updatedLog = await addMealToLog(category, item);
        setDailyLog(updatedLog);
        // Visual feedback could be added here
    };

    // AI Vision Handlers
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const resultJson = await analyzeFoodImage(base64String);
                const result = JSON.parse(resultJson) as FoodAnalysisResult;
                setScannedResult(result);
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Analysis failed", error);
            setIsAnalyzing(false);
            alert("Failed to analyze image. Please try again.");
        }
    };

    const confirmScannedMeal = async () => {
        if (!scannedResult) return;

        const newItem: MealItem = {
            id: Date.now().toString(),
            name: scannedResult.name,
            calories: scannedResult.calories,
            protein: scannedResult.protein,
            notes: `AI Detected: ${scannedResult.items.join(', ')}`
        };

        const hour = new Date().getHours();
        let category = 'Snack';
        if (hour < 11) category = 'Breakfast';
        else if (hour < 15) category = 'Lunch';
        else if (hour < 21) category = 'Dinner';

        const updatedLog = await addMealToLog(category, newItem);
        setDailyLog(updatedLog);
        setScannedResult(null);
    };

    const handleGetSuggestions = async () => {
        const goal = window.prompt("What is your current goal? (e.g., Muscle Gain, Weight Loss, Keto)");
        if (!goal) return;

        setIsLoadingSuggestions(true);
        setIsSuggestionsOpen(true);
        const results = await getNutritionSuggestions(goal);
        try {
            const parsed = JSON.parse(results);
            setSuggestions(parsed);
        } catch (e) {
            console.error("Failed to parse suggestions", e);
            alert("Failed to get suggestions. Please try again.");
            setIsSuggestionsOpen(false);
        }
        setIsLoadingSuggestions(false);
    };

    const filteredFoods = searchQuery.length > 0
        ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : FOOD_DATABASE;

    const getMealIcon = (category: string) => {
        switch (category) {
            case 'Breakfast': return Coffee;
            case 'Lunch': return Salad;
            case 'Dinner': return Beef;
            case 'Snack': return Apple;
            default: return Utensils;
        }
    };

    return (
        <div className="min-h-screen bg-[#05100a] flex flex-col font-sans">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#05100a] z-20">
                <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-white hover:text-primary transition">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-white">Food Search</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleGetSuggestions}
                        className="p-2 text-[#00E376] bg-[#0f291a] rounded-full hover:bg-[#163a25] transition"
                    >
                        <Lightbulb size={20} />
                    </button>
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-[#00E376] bg-[#0f291a] rounded-full hover:bg-[#163a25] transition"
                    >
                        <Sparkles size={20} />
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="px-6 pb-4 space-y-4 bg-[#05100a] z-10">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-[#2d5c40]" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for food, e.g., 'avocado'"
                        className="w-full bg-[#0f291a] border border-transparent rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-[#2d5c40] focus:outline-none focus:border-primary/50 transition"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {['All', 'High Protein', 'Low Carb', 'Veg'].map(filter => (
                        <button
                            key={filter}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                                filter === 'All'
                                    ? 'bg-[#00E376] text-black'
                                    : 'bg-[#0f291a] text-white hover:bg-[#163a25]'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
                {filteredFoods.map((food, idx) => (
                    <FoodCard 
                        key={idx} 
                        food={food} 
                        onLog={(servings) => {
                            const newItem: MealItem = {
                                id: Date.now().toString(),
                                name: food.name,
                                calories: Math.round(food.calories * servings),
                                protein: Math.round(food.protein * servings),
                                carbs: Math.round(food.carbs * servings),
                                fat: Math.round(food.fat * servings),
                                image: food.image
                            };
                            addMealToLog(mealCategory, newItem).then(updated => {
                                setDailyLog(updated);
                                alert(`Logged ${newItem.name}!`); // Simple feedback
                            });
                        }} 
                    />
                ))}
            </div>

            {/* Analysis Modal */}
            {(isAnalyzing || scannedResult) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#0f291a] border border-white/5 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        {isAnalyzing ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-xl font-bold text-white mb-2">Analyzing Food...</h3>
                                <p className="text-gray-400 text-sm">Identifying ingredients and macros</p>
                            </div>
                        ) : scannedResult && (
                            <div className="animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">AI Detected</p>
                                        <h3 className="text-2xl font-bold text-white">{scannedResult.name}</h3>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-full" onClick={() => setScannedResult(null)}>
                                        <Trash2 size={18} className="text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-white">{scannedResult.calories}</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Calories</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-white">{scannedResult.protein}g</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Protein</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-white">{scannedResult.carbs}g</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Carbs</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-white">{scannedResult.fat}g</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Fat</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-xs text-gray-400 mb-2">Ingredients:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {scannedResult.items.map((ing, i) => (
                                            <span key={i} className="text-xs text-white bg-white/10 px-2 py-1 rounded-md">{ing}</span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={confirmScannedMeal}
                                    className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:opacity-90 transition shadow-[0_0_20px_rgba(0,227,118,0.4)] flex items-center justify-center gap-2"
                                >
                                    <CheckSquare size={20} /> Add to Log
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Suggestions Modal */}
            {isSuggestionsOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#0f291a] border border-white/5 rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">AI Suggestions</h3>
                            <button onClick={() => setIsSuggestionsOpen(false)} className="p-1 text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {isLoadingSuggestions ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400 text-sm">Curating healthy options...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestions.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white">{item.name}</h4>
                                            <span className="text-[#00E376] text-xs font-bold">{item.calories} kcal</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-3 italic">"{item.reason}"</p>
                                        <div className="flex gap-2 mb-3">
                                            <div className="bg-black/20 px-2 py-1 rounded text-[10px] text-blue-400 font-bold">P: {item.protein}g</div>
                                            <div className="bg-black/20 px-2 py-1 rounded text-[10px] text-orange-400 font-bold">C: {item.carbs}g</div>
                                            <div className="bg-black/20 px-2 py-1 rounded text-[10px] text-purple-400 font-bold">F: {item.fat}g</div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newItem: MealItem = {
                                                    id: Date.now().toString(),
                                                    name: item.name,
                                                    calories: item.calories,
                                                    protein: item.protein,
                                                    carbs: item.carbs,
                                                    fat: item.fat,
                                                };
                                                addMealToLog(mealCategory, newItem).then(updated => {
                                                    setDailyLog(updated);
                                                    alert(`Logged ${item.name}!`);
                                                    setIsSuggestionsOpen(false);
                                                });
                                            }}
                                            className="w-full bg-[#00E376]/10 text-[#00E376] font-bold py-2 rounded-xl text-sm hover:bg-[#00E376]/20 transition"
                                        >
                                            Add to Log
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const FoodCard = ({ food, onLog }: { food: any, onLog: (servings: number) => void }) => {
    const [servings, setServings] = useState(1);
    
    // Simple logic to generate advice based on macros
    const getAdvice = () => {
        const advice = [];
        if (food.protein > 15) advice.push({ text: "Great for Muscle Gain", color: "text-blue-400", bg: "bg-blue-400/10" });
        if (food.calories < 150) advice.push({ text: "Good for Weight Loss", color: "text-green-400", bg: "bg-green-400/10" });
        if (food.carbs > 30) advice.push({ text: "High Energy / Pre-workout", color: "text-orange-400", bg: "bg-orange-400/10" });
        if (food.fat > 15) advice.push({ text: "Keto Friendly / High Satiety", color: "text-purple-400", bg: "bg-purple-400/10" });
        
        if (advice.length === 0) advice.push({ text: "Balanced Nutrition", color: "text-gray-400", bg: "bg-white/5" });
        return advice;
    };

    const adviceList = getAdvice();

    return (
        <div className="bg-[#0f291a] rounded-3xl p-4 relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 overflow-hidden">
                         {food.image ? <img src={food.image} alt={food.name} className="w-full h-full object-cover" /> : <Utensils className="p-2 text-gray-500"/>}
                    </div>
                    <div>
                        <h4 className="text-white font-bold">{food.name}</h4>
                        <p className="text-[#00E376] text-xs">per 100g</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-white font-bold text-lg">{food.calories}</span>
                    <span className="text-[#00E376] text-xs font-bold ml-1">kcal</span>
                </div>
            </div>
            
            {/* Macros */}
            <div className="flex gap-4 mb-4 pl-16">
                <div className="text-center">
                    <p className="text-blue-400 font-bold text-sm">{food.protein}g</p>
                    <p className="text-[#2d5c40] text-[10px] uppercase font-bold">Protein</p>
                </div>
                <div className="text-center">
                    <p className="text-orange-400 font-bold text-sm">{food.carbs}g</p>
                    <p className="text-[#2d5c40] text-[10px] uppercase font-bold">Carbs</p>
                </div>
                <div className="text-center">
                    <p className="text-purple-400 font-bold text-sm">{food.fat}g</p>
                    <p className="text-[#2d5c40] text-[10px] uppercase font-bold">Fat</p>
                </div>
            </div>

            {/* Dietary Advice */}
            <div className="mb-4 pl-16 flex flex-wrap gap-2">
                {adviceList.map((item, idx) => (
                    <span key={idx} className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.color} ${item.bg}`}>
                        {item.text}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2">
                    <span className="text-[#00E376] text-sm">Serving:</span>
                    <input 
                        type="number" 
                        value={servings} 
                        onChange={e => setServings(Number(e.target.value))}
                        className="w-12 bg-[#14301f] rounded-lg text-center text-white font-bold py-1 focus:outline-none focus:border-primary"
                    />
                    <span className="text-[#2d5c40] text-xs">x 100g</span>
                </div>
                <button 
                    onClick={() => onLog(servings)}
                    className="bg-[#00E376] text-black font-bold px-6 py-2 rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    <Plus size={16} /> Log
                </button>
            </div>
        </div>
    );
};
