import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const OTPVerification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Try to get confirmationResult from state, fallback to window object
    const confirmationResult = location.state?.confirmationResult || (window as any).confirmationResult;
    const phoneNumber = location.state?.phoneNumber;
    const [enteredOtp, setEnteredOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!confirmationResult) {
            // If still no confirmation result, redirect back
            navigate('/');
        }
    }, [confirmationResult, navigate]);

    const verifyPhoneOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            if (confirmationResult) {
                await confirmationResult.confirm(enteredOtp);
                navigate('/dashboard');
            } else {
                setError("Session expired. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setError("Incorrect code. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md glass-card p-8 rounded-3xl text-center animate-in zoom-in duration-300 relative z-10">
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-muted hover:text-text transition">
                    <ArrowLeft size={24} />
                </button>

                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_15px_rgba(0,227,118,0.3)]">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-text mb-2">Verify Phone</h2>
                <p className="text-muted text-sm mb-6">
                    Enter the code sent to <strong>{phoneNumber}</strong>
                </p>

                <input
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-surface border border-secondary rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-text focus:border-primary focus:outline-none mb-6 font-mono shadow-inner"
                />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={verifyPhoneOtp}
                    disabled={loading}
                    className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg hover:opacity-90 transition shadow-[0_0_20px_rgba(0,227,118,0.4)]"
                >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 text-muted text-sm hover:text-text underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
