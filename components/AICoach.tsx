
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, User, ArrowUp } from 'lucide-react';
import { getFitnessAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AICoach: React.FC<{ context?: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Hi there! I’m your AI Fitness Assistant. What are we working on today? Choose a goal below or ask me anything.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const responseText = await getFitnessAdvice(updatedMessages, context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-surface rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 z-40"
        >
          <MessageSquare size={26} fill="currentColor" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] sm:rounded-3xl sm:border sm:border-secondary sm:shadow-2xl">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-secondary bg-background/95 backdrop-blur-md rounded-t-3xl">
            <div className="flex items-center gap-3">
               <button onClick={() => setIsOpen(false)} className="sm:hidden text-muted hover:text-white">
                <ArrowUp className="-rotate-90" size={24} />
               </button>
               <h3 className="font-bold text-lg">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hidden sm:block text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-end gap-2 max-w-[85%]">
                     {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-surface border border-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="AI" className="w-full h-full" />
                        </div>
                     )}
                     
                     <div className={`p-4 rounded-2xl text-[15px] leading-relaxed ${
                       msg.role === 'user' 
                         ? 'bg-primary text-black rounded-br-none font-medium' 
                         : 'bg-secondary text-gray-100 rounded-bl-none'
                     }`}>
                       {msg.text}
                     </div>

                     {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
                           <User size={16} className="text-indigo-800" />
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
                 <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
               <button onClick={() => handleSend("Can you give me a weight loss diet plan?")} className="whitespace-nowrap px-4 py-2 bg-secondary border border-gray-700 rounded-full text-sm hover:bg-gray-800 transition">
                  Weight Loss Diet
               </button>
               <button onClick={() => handleSend("Give me a muscle building workout")} className="whitespace-nowrap px-4 py-2 bg-secondary border border-gray-700 rounded-full text-sm hover:bg-gray-800 transition">
                  Build Muscle Workout
               </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-surface border-t border-secondary rounded-b-3xl">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask for a workout or diet plan..."
                className="w-full bg-secondary text-white rounded-full pl-5 pr-12 py-4 focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-500 text-sm"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="absolute right-2 top-2 p-2 bg-primary rounded-full text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
