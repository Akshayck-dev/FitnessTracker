
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Bookmark, ArrowUp, Sparkles, Utensils, Check, Save, Dumbbell, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFitnessAdvice, generateAIPlan } from '../services/geminiService';
import { savePlan } from '../services/storageService';
import { ChatMessage, GeneratedPlan, PlanPreferences } from '../types';

// Define the steps for the conversation flow
type ChatFlowState = 'IDLE' | 'ASK_AGE' | 'ASK_HEIGHT' | 'ASK_CURRENT_WEIGHT' | 'ASK_TARGET_WEIGHT' | 'ASK_MEDICAL' | 'GENERATING';

// Fallback generator in case AI fails
const getFallbackPlan = (goal: string): GeneratedPlan => {
  const isDiet = goal.toLowerCase().includes('diet') || goal.toLowerCase().includes('weight') || goal.toLowerCase().includes('pcod') || goal.toLowerCase().includes('loss');
  
  if (isDiet) {
    return {
      planName: `${goal} Kickstart`,
      overview: `A balanced 7-day approach to ${goal.toLowerCase()} tailored for your profile. Focuses on nutrient-dense foods to manage energy levels.`,
      schedule: [],
      nutrition: {
        dailyCalories: "1800 - 2000 kcal",
        macros: "40% Protein / 30% Carbs / 30% Fat",
        mealPlan: [
            "Breakfast: Oatmeal with protein powder & berries",
            "Lunch: Grilled chicken breast with quinoa salad",
            "Dinner: Baked salmon with roasted vegetables",
            "Snack: Greek yogurt with almonds"
        ]
      },
      tips: ["Stay hydrated", "Prep meals in advance", "Monitor portion sizes"]
    };
  } else {
    return {
      planName: `${goal} Routine`,
      overview: `A comprehensive workout plan designed to help you with ${goal.toLowerCase()}.`,
      schedule: [
          { day: "Day 1", focus: "Full Body Strength", exercises: [{ name: "Squats", sets: "3", reps: "10" }, { name: "Pushups", sets: "3", reps: "12" }] },
          { day: "Day 2", focus: "Active Recovery", exercises: [] },
          { day: "Day 3", focus: "Upper Body Focus", exercises: [{ name: "Dumbbell Press", sets: "3", reps: "10" }, { name: "Rows", sets: "3", reps: "10" }] },
      ],
      nutrition: {
          dailyCalories: "2200 kcal",
          macros: "30% P / 40% C / 30% F",
          mealPlan: []
      },
      tips: ["Focus on form over weight", "Increase intensity progressively", "Rest is key for growth"]
    };
  }
};

export const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Hi there! I’m your AI Fitness Assistant. I can help with Weight Loss, Weight Gain, PCOD Management, or general fitness advice. What are we working on today?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for conversational flow
  const [flowState, setFlowState] = useState<ChatFlowState>('IDLE');
  const [userProfile, setUserProfile] = useState<Partial<PlanPreferences>>({});
  const [conversationGoal, setConversationGoal] = useState<string>('General Fitness');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const addMessage = (role: 'user' | 'model', text: string, planData?: GeneratedPlan) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date(),
      planData
    }]);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message immediately
    addMessage('user', text);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Handle Active Conversation Flow (Data Collection)
      if (flowState !== 'IDLE') {
        await handleFlowStep(text);
        return;
      }

      // 2. Handle New Requests
      const lowerText = text.toLowerCase();
      
      // TRIGGER: Weight Gain / Bulking
      if (lowerText.includes('weight gain') || lowerText.includes('gain weight') || lowerText.includes('bulk') || lowerText.includes('muscle mass')) {
        setConversationGoal('Weight Gain');
        setFlowState('ASK_AGE');
        setIsLoading(false);
        addMessage('model', "I can help you build a solid weight gain plan! To tailor it to your needs, I need to know a bit about you. First, how old are you?");
        return;
      }

      // TRIGGER: PCOD / PCOS
      if (lowerText.includes('pcod') || lowerText.includes('pcos')) {
        setConversationGoal('PCOD Management');
        setFlowState('ASK_AGE');
        setIsLoading(false);
        addMessage('model', "Managing PCOD through diet and lifestyle is a great step. Let's gather your details to create a safe and effective plan. First, what is your age?");
        return;
      }

      // TRIGGER: Weight Loss / Detailed Diet Request
      if (lowerText.includes('weight loss') || lowerText.includes('lose weight') || lowerText.includes('fat loss')) {
        setConversationGoal('Weight Loss');
        setFlowState('ASK_AGE');
        setIsLoading(false); 
        addMessage('model', "I can definitely help you with a weight loss plan! To make it safe and effective, I need a few details. First, how old are you?");
        return;
      } 
      
      // TRIGGER: Quick Workout Request (Simple, no deep flow)
      if (lowerText.includes('workout') || lowerText.includes('routine') || lowerText.includes('exercise')) {
         const planJson = await generateAIPlan({
             goal: 'General Fitness',
             level: 'Intermediate',
             equipment: 'Full Gym',
             dietaryRestrictions: 'None',
             daysPerWeek: 4
         });
         
         let parsedPlan;
         try {
             parsedPlan = JSON.parse(planJson) as GeneratedPlan;
             if (!parsedPlan.planName) throw new Error();
         } catch(e) {
             parsedPlan = getFallbackPlan("General Workout");
         }

         addMessage('model', "I've designed a workout routine for you. Check out the details below!", parsedPlan);
         setIsLoading(false);
         return;
      } 
      
      // 3. Fallback: Standard Chat
      const responseText = await getFitnessAdvice([...messages, { id: 'temp', role: 'user', text, timestamp: new Date() }]);
      addMessage('model', responseText);

    } catch (error) {
       console.error(error);
       addMessage('model', "I'm having trouble connecting right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowStep = async (userResponse: string) => {
    // Simulate thinking delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 600));

    switch (flowState) {
      case 'ASK_AGE':
        setUserProfile(prev => ({ ...prev, age: userResponse }));
        setFlowState('ASK_HEIGHT');
        addMessage('model', "Got it. What is your height? (e.g., 5'9\" or 175cm)");
        break;

      case 'ASK_HEIGHT':
        setUserProfile(prev => ({ ...prev, height: userResponse }));
        setFlowState('ASK_CURRENT_WEIGHT');
        addMessage('model', "Thanks. What is your current weight?");
        break;

      case 'ASK_CURRENT_WEIGHT':
        setUserProfile(prev => ({ ...prev, currentWeight: userResponse }));
        setFlowState('ASK_TARGET_WEIGHT');
        addMessage('model', "And what is your target weight goal?");
        break;

      case 'ASK_TARGET_WEIGHT':
        setUserProfile(prev => ({ ...prev, targetWeight: userResponse }));
        setFlowState('ASK_MEDICAL');
        addMessage('model', "Almost done! Do you have any allergies or medical conditions I should know about? (e.g., Gluten free, Diabetes, or 'None')");
        break;

      case 'ASK_MEDICAL':
        let medical = userResponse;
        // Auto-inject PCOD if that's the goal and user didn't explicitly say it again
        if (conversationGoal === 'PCOD Management' && !medical.toLowerCase().includes('pcos') && !medical.toLowerCase().includes('pcod')) {
             medical = (medical.toLowerCase() === 'none') ? 'PCOD' : `${medical}, PCOD`;
        }

        const finalProfile = { ...userProfile, medicalConditions: medical };
        setUserProfile(finalProfile);
        setFlowState('IDLE'); // Reset flow
        addMessage('model', `Thank you! I'm generating a personalized ${conversationGoal} plan for you now...`);
        
        // Actually generate the plan now
        setIsLoading(true);
        try {
          const planJson = await generateAIPlan({
            goal: conversationGoal,
            level: 'Intermediate', // Defaulting for this flow, could ask user
            equipment: 'None',     // Defaulting for diet/general focus
            dietaryRestrictions: 'None', // Will be overridden by medical conditions in prompt
            daysPerWeek: 7,
            ...finalProfile
          } as PlanPreferences);

          let parsedPlan = JSON.parse(planJson) as GeneratedPlan;
          // Validate
          if (!parsedPlan || !parsedPlan.planName) throw new Error("Invalid plan");

          setIsLoading(false);
          addMessage('model', `Here is your personalized plan focusing on ${conversationGoal}.`, parsedPlan);
        } catch (e) {
          setIsLoading(false);
          // Fallback to ensure flow completes even if AI fails
          const fallback = getFallbackPlan(conversationGoal);
          addMessage('model', `Here is your personalized plan focusing on ${conversationGoal}.`, fallback);
        }
        break;
      
      default:
        setFlowState('IDLE');
        break;
    }
    setIsLoading(false);
  };

  const handleSavePlan = (plan: GeneratedPlan, type: 'diet' | 'workout') => {
      savePlan(plan, type);
      addMessage('model', `Awesome! I've saved the ${type} plan to your dashboard.`);
  };

  const suggestions = [
    "I want to lose weight",
    "Weight Gain Plan",
    "PCOD Diet Plan",
    "Build Muscle Workout",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">AI Assistant</h1>
        </div>
        <button className="text-gray-400 hover:text-white">
          <Bookmark size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className={`flex items-end gap-3 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                   <div className="w-8 h-8 rounded-full bg-surface border border-secondary flex items-center justify-center flex-shrink-0 overflow-hidden mb-1">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="AI" className="w-full h-full" />
                   </div>
                )}
                
                {/* Message Bubble Wrapper */}
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                    
                    {/* Text Content */}
                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-primary text-black rounded-br-none font-medium' 
                        : 'bg-surface border border-secondary text-gray-100 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>

                    {/* Rich Content: Diet Plan Card */}
                    {msg.planData && msg.planData.nutrition && (
                        <div className="bg-surface border border-secondary rounded-2xl p-5 w-full max-w-sm mt-2 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-secondary">
                                <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center text-orange-400">
                                    <Utensils size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{msg.planData.planName}</h3>
                                    <p className="text-xs text-muted">AI Generated • Just Now</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-secondary rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Daily Calories</p>
                                    <p className="text-lg font-bold text-white">{msg.planData.nutrition.dailyCalories}</p>
                                </div>
                                <div className="bg-secondary rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Macros</p>
                                    <p className="text-xs font-bold text-white mt-1">{msg.planData.nutrition.macros}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase">Suggested Meals</p>
                                {msg.planData.nutrition.mealPlan.slice(0, 3).map((meal, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-200 bg-secondary/30 p-2 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                        {meal}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => handleSavePlan(msg.planData!, 'diet')}
                                className="w-full bg-primary/20 text-primary border border-primary/30 py-3 rounded-xl text-sm font-bold hover:bg-primary hover:text-black transition flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Diet Plan
                            </button>
                        </div>
                    )}

                    {/* Rich Content: Workout Plan Card */}
                    {msg.planData && msg.planData.schedule && msg.planData.schedule.length > 0 && !msg.planData.nutrition && (
                        <div className="bg-surface border border-secondary rounded-2xl p-5 w-full max-w-sm mt-2 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-secondary">
                                <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400">
                                    <Dumbbell size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{msg.planData.planName}</h3>
                                    <p className="text-xs text-muted">AI Generated • Just Now</p>
                                </div>
                            </div>

                            <div className="bg-secondary rounded-xl p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase">Schedule Preview</span>
                                  <Calendar size={14} className="text-gray-500" />
                                </div>
                                <div className="space-y-3">
                                  {msg.planData.schedule.slice(0, 3).map((day, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="text-white font-medium">{day.day}</span>
                                      <span className="text-xs text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded">{day.focus}</span>
                                    </div>
                                  ))}
                                  {msg.planData.schedule.length > 3 && (
                                    <p className="text-[10px] text-center text-gray-500 pt-1">+{msg.planData.schedule.length - 3} more days</p>
                                  )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleSavePlan(msg.planData!, 'workout')}
                                className="w-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-3 rounded-xl text-sm font-bold hover:bg-cyan-400 hover:text-black transition flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Workout
                            </button>
                        </div>
                    )}

                </div>

                {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={16} className="text-indigo-400" />
                   </div>
                )}
             </div>
             <span className={`text-[10px] text-muted mt-1 ${msg.role === 'user' ? 'mr-12' : 'ml-12'}`}>
               {msg.role === 'model' ? 'AI Assistant' : 'You'}
             </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface border border-secondary flex items-center justify-center">
               <Bot size={16} className="text-muted" />
            </div>
            <div className="bg-surface border border-secondary px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Area */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-secondary p-4 z-30">
        
        {/* Suggestions */}
        {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-2">
            {suggestions.map((s, i) => (
                <button 
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap px-4 py-2 bg-secondary border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                {s}
                </button>
            ))}
            </div>
        )}

        {/* Input */}
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Type 'I want to gain weight' or 'PCOD diet'..."
            className="w-full bg-secondary text-white rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 placeholder-gray-500 shadow-lg"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-2 bg-primary rounded-full text-black hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <ArrowUp size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
