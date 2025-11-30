
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getPlanById, deletePlan } from '../services/storageService';
import { SavedPlan } from '../types';
import { PlanDisplay } from '../components/PlanDisplay';

export const SavedPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SavedPlan | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const foundPlan = getPlanById(id);
      setPlan(foundPlan);
    }
  }, [id]);

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this plan?')) {
      deletePlan(id);
      navigate('/dashboard');
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
         <div className="text-center">
             <h2 className="text-xl font-bold text-white mb-2">Plan not found</h2>
             <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
                 Return to Dashboard
             </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Plan Details</h1>
        </div>
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition">
          <Trash2 size={24} />
        </button>
      </header>

      <div className="px-6 py-6">
        <PlanDisplay plan={plan} hideActions={true} />
      </div>
    </div>
  );
};
