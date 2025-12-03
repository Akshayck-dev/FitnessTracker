
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Share2, Download } from 'lucide-react';
import { getPlanById, deletePlan } from '../services/storageService';
import { SavedPlan } from '../types';
import { PlanDisplay } from '../components/PlanDisplay';

export const SavedPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SavedPlan | undefined>(undefined);

  useEffect(() => {
    const fetchPlan = async () => {
      if (id) {
        const foundPlan = await getPlanById(id);
        setPlan(foundPlan);
      }
    };
    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id);
      navigate('/dashboard');
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Plan not found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline font-bold">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Plan Details</h1>
        </div>
        <div className="flex gap-3">
          <button className="text-gray-400 hover:text-white transition">
            <Share2 size={20} />
          </button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        <PlanDisplay plan={plan} hideActions={true} />

        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
            <Download size={20} /> Export PDF
          </button>
          <button className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_15px_rgba(0,227,118,0.3)]">
            Start Plan
          </button>
        </div>
      </div>
    </div>
  );
};
