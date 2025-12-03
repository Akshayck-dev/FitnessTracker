import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, User, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleRegister = async () => {
        setError(null);
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 0. Update Auth Profile
            await updateProfile(user, {
                displayName: name
            });

            // 1. Create root user document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
                onboardingCompleted: false,
                preferences: {
                    units: 'metric',
                    theme: 'dark',
                    notifications: true
                }
            });

            // 2. Create profile document (for Profile.tsx)
            await setDoc(doc(db, `users/${user.uid}/profile`, 'main'), {
                name: name,
                email: email,
                height: '',
                weight: '',
                goal: ''
            });

            // 3. Send Verification Email
            await sendEmailVerification(user);

            // 4. Sign out to prevent auto-redirect by PublicRoute
            await signOut(auth);

            setVerificationSent(true);
            setLoading(false);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <Mail size={40} className="text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-text mb-4">Verify Your Email</h2>
                <p className="text-muted mb-8 max-w-sm">
                    We've sent a verification link to <span className="text-text font-bold">{email}</span>.<br />
                    Please check your inbox and verify your account to continue.
                </p>
                <div className="space-y-4 w-full max-w-xs">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg hover:opacity-90 transition shadow-[0_0_20px_rgba(0,227,118,0.3)]"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-primary text-sm font-bold hover:underline"
                    >
                        Resend Email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
                <button onClick={() => navigate(-1)} className="absolute top-0 left-0 text-muted hover:text-text transition">
                    <ArrowLeft size={24} />
                </button>

                <h1 className="text-3xl font-bold text-text mb-2 mt-8">Create Account</h1>
                <p className="text-muted mb-8 text-sm">Join us to start your fitness journey</p>

                <div className="w-full space-y-4">
                    <div className="text-left">
                        <label className="text-xs font-bold text-muted ml-1 mb-2 block uppercase tracking-wider">Full Name</label>
                        <div className="flex bg-surface rounded-2xl border border-secondary overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 shadow-lg">
                            <div className="px-4 py-4 bg-secondary/50 flex items-center justify-center border-r border-secondary text-muted">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="flex-1 bg-transparent px-4 text-text placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="text-left">
                        <label className="text-xs font-bold text-muted ml-1 mb-2 block uppercase tracking-wider">Email Address</label>
                        <div className="flex bg-surface rounded-2xl border border-secondary overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 shadow-lg">
                            <div className="px-4 py-4 bg-secondary/50 flex items-center justify-center border-r border-secondary text-muted">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="flex-1 bg-transparent px-4 text-text placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="text-left">
                        <label className="text-xs font-bold text-muted ml-1 mb-2 block uppercase tracking-wider">Password</label>
                        <div className="flex bg-surface rounded-2xl border border-secondary overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 shadow-lg">
                            <div className="px-4 py-4 bg-secondary/50 flex items-center justify-center border-r border-secondary text-muted">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="flex-1 bg-transparent px-4 text-text placeholder-gray-500 focus:outline-none"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="px-4 text-muted hover:text-text transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-left">
                        <label className="text-xs font-bold text-muted ml-1 mb-2 block uppercase tracking-wider">Confirm Password</label>
                        <div className="flex bg-surface rounded-2xl border border-secondary overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 shadow-lg">
                            <div className="px-4 py-4 bg-secondary/50 flex items-center justify-center border-r border-secondary text-muted">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="flex-1 bg-transparent px-4 text-text placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg mt-4 hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,227,118,0.3)] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Create Account'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/" className="text-primary font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
