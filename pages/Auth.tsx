
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, signInWithGoogle } from '../services/firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (authMethod === 'phone' && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      setPhoneError(err.message || "Failed to send code. Make sure phone auth is enabled in Firebase.");
      setLoading(false);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  }, [authMethod]);

  const handlePhoneLogin = async () => {
    setPhoneError(null);
    if (!phoneNumber || phoneNumber.length < 8 || !phoneNumber.includes('+')) {
      setPhoneError('Please enter a valid phone number with country code (e.g., +91...)');
      return;
    }

    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      const formattedNumber = phoneNumber;

      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      window.confirmationResult = confirmation; // Store in window to avoid serialization error
      setLoading(false);
      navigate('/verify-otp', { state: { phoneNumber } });
    } catch (err: any) {
      console.error(err);
      setPhoneError(err.message || "Failed to send code. Make sure phone auth is enabled in Firebase.");
      setLoading(false);
      // Do not clear verifier on error to allow retries
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError('Please verify your email address before logging in.');
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div id="recaptcha-container"></div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-surface border border-secondary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-black/50 rotate-3 backdrop-blur-md">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,227,118,0.4)]">
            <Dumbbell size={40} className="text-black" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text mb-3 leading-tight tracking-tight">
          Your AI Fitness<br />Partner Awaits
        </h1>
        <p className="text-muted mb-10 text-sm max-w-xs mx-auto leading-relaxed">
          {authMethod === 'phone' ? 'Enter your phone number to start your personalized fitness journey.' : 'Enter your email to sign in.'}
        </p>

        <div className="w-full space-y-4">
          {/* PHONE AUTH UI */}
          {authMethod === 'phone' && (
            <>
              <div className="text-left">
                <label className="text-xs font-bold text-muted ml-1 mb-2 block uppercase tracking-wider">Phone Number</label>
                <div className="flex bg-surface rounded-2xl border border-secondary overflow-hidden transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 shadow-lg">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 bg-transparent px-4 py-4 text-text placeholder-gray-500 focus:outline-none font-medium"
                  />
                </div>
                <p className="text-[10px] text-muted mt-1 ml-1">Include country code (e.g., +91 for India)</p>
                {phoneError && <p className="text-red-500 text-xs mt-2 ml-1 flex items-center gap-1"><ShieldCheck size={12} /> {phoneError}</p>}
              </div>

              <button
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg mt-4 hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,227,118,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Send Code'}
              </button>

              <div className="text-center mt-4">
                <p className="text-muted text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* EMAIL AUTH UI */}
          {authMethod === 'email' && (
            <>
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

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg mt-4 hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,227,118,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
              </button>

              <div className="text-center mt-4">
                <p className="text-muted text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 w-full my-8">
          <div className="h-[1px] bg-secondary flex-1"></div>
          <span className="text-muted text-xs font-medium uppercase tracking-wider">Or continue with</span>
          <div className="h-[1px] bg-secondary flex-1"></div>
        </div>

        <div className="flex gap-4 w-full">
          <button
            onClick={handleGoogleLogin}
            className="flex-1 bg-surface border border-secondary py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-secondary/50 transition shadow-lg"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="text-text text-sm font-bold">Google</span>
          </button>
          <button className="flex-1 bg-surface border border-secondary py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-secondary/50 transition shadow-lg">
            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5 dark:invert" alt="Apple" />
            <span className="text-text text-sm font-bold">Apple</span>
          </button>
        </div>

        <button
          onClick={() => setAuthMethod(authMethod === 'phone' ? 'email' : 'phone')}
          className="mt-8 text-primary font-bold hover:underline text-sm tracking-wide"
        >
          {authMethod === 'phone' ? 'Use Email Instead' : 'Use Phone Instead'}
        </button>

        <p className="text-[10px] text-muted mt-8 max-w-xs mx-auto leading-normal">
          By continuing, you agree to our <span className="text-text underline cursor-pointer">Terms of Service</span> and <span className="text-text underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div >
  );
};
