import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth } from '../services/firebase';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // In a real app, save these details to Firestore linked to auth.currentUser.uid
    if (auth.currentUser) {
        console.log("Saving profile for:", auth.currentUser.email);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <header className="flex items-center gap-4 mb-8">
         <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
         </button>
         <h1 className="text-xl font-bold text-white">Create Your Profile</h1>
      </header>
      
      {/* Progress Bar */}
      <div className="flex gap-2 mb-10">
         <div className="h-1 flex-1 bg-primary rounded-full"></div>
         <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
         <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
      </div>

      <div className="flex-1">
         <h2 className="text-3xl font-bold text-white mb-2">Let's Get Started</h2>
         <p className="text-muted mb-8">Tell us a bit about yourself to personalize your AI fitness plan.</p>

         <div className="space-y-6">
            <div>
               <label className="text-sm font-medium text-gray-300 block mb-2">Full Name</label>
               <input 
                 type="text" 
                 defaultValue="Jane Doe"
                 className="w-full bg-secondary border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
               />
            </div>

            <div>
               <label className="text-sm font-medium text-gray-300 block mb-2">Age</label>
               <input 
                 type="number" 
                 placeholder="Enter your age"
                 className="w-full bg-secondary border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
               />
            </div>

            <div>
               <label className="text-sm font-medium text-gray-300 block mb-2">Phone Number</label>
               <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="+1 234 567 8900"
                    className="w-full bg-secondary border border-primary/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                  />
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
               </div>
            </div>
         </div>
      </div>

      <button 
        onClick={handleContinue}
        className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg mt-8 hover:opacity-90 transition shadow-lg shadow-green-500/20"
      >
        Continue
      </button>
    </div>
  );
};