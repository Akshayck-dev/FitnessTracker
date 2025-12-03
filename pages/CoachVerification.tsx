import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../services/storageService';
import { UserProfile } from '../types';

export const CoachVerification: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const profile = await getUserProfile();
            const updatedProfile: UserProfile = {
                ...profile,
                coachVerificationStatus: 'pending'
            };
            await saveUserProfile(updatedProfile);
            setStatus('success');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Coach Verification</h1>
            </header>

            <div className="max-w-md mx-auto">
                <div className="bg-surface border border-white/10 rounded-3xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-2">Become a Certified Coach</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Upload your fitness certification to get verified. Verified coaches can create public plans and get featured.
                    </p>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition mb-6"
                    >
                        {file ? (
                            <div className="text-center">
                                <CheckCircle size={40} className="text-primary mb-2 mx-auto" />
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload size={40} className="text-gray-400 mb-2 mx-auto" />
                                <p className="text-gray-300 font-medium">Click to Upload Certificate</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {status === 'success' && (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <CheckCircle size={20} className="text-primary" />
                            <p className="text-sm text-primary">Application submitted successfully! Redirecting...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-500" />
                            <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!file || loading || status === 'success'}
                        className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:opacity-90 transition shadow-[0_0_20px_rgba(0,227,118,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};
