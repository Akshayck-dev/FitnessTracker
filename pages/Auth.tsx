
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Copy } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { auth, signInWithGoogle } from '../services/firebase';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null); // Fallback to show OTP if email fails

  // ---------------------------------------------------------
  // EMAILJS CONFIGURATION
  // ---------------------------------------------------------
  const EMAILJS_SERVICE_ID = 'service_gmail'; // Change this to your actual Service ID
  const EMAILJS_TEMPLATE_ID = 'template_otp'; // Change this to your actual Template ID
  const EMAILJS_PUBLIC_KEY = 'ri1LtQjX5g5-eyjZ6'; // Your provided key
  // ---------------------------------------------------------

  // Helper to start the OTP sequence
  const startOtpFlow = (userEmail: string) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setTempUserEmail(userEmail);
      
      // Switch UI immediately
      setShowOtpInput(true);
      setLoading(false);

      // Send Email
      sendOtpEmail(userEmail, code);
  };

  const handleAuth = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let userEmail = email;
      if (isLogin) {
        // Sign In
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (userCred.user.email) userEmail = userCred.user.email;
      } else {
        // Sign Up
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (userCred.user.email) userEmail = userCred.user.email;
      }
      
      // Instead of navigating, start OTP flow
      startOtpFlow(userEmail);

    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') msg = "That email is already in use.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
      if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/invalid-api-key') msg = "Firebase config missing. Please check services/firebase.ts";
      setError(msg);
      setLoading(false);
    }
  };

  const sendOtpEmail = async (userEmail: string, otp: string) => {
    // If using placeholder IDs, skip network request and just show code on screen
    if (EMAILJS_SERVICE_ID === 'service_gmail' || EMAILJS_TEMPLATE_ID === 'template_otp') {
        console.warn("EmailJS Service ID is placeholder. Skipping email send.");
        setDevOtp(otp); 
        return;
    }

    try {
        console.log(`[Processing] Sending OTP to ${userEmail}...`);
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: userEmail,
                otp: otp,       // Common variable name
                passcode: otp,  // Alternative variable name
                message: otp,   // Alternative variable name
            },
            EMAILJS_PUBLIC_KEY
        );
        console.log(`[SUCCESS] Email sent to ${userEmail}`);
    } catch (err) {
        console.error("Failed to send email via EmailJS:", err);
        setDevOtp(otp); // Fallback: Show in UI
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    setDevOtp(null);
    
    try {
      const user = await signInWithGoogle();
      
      if (user && user.email) {
          startOtpFlow(user.email);
      } else {
          throw new Error("Could not retrieve email from Google account.");
      }

    } catch (err: any) {
      console.error("Google Login Error:", err);
      setLoading(false);
      
      if (err.code === 'auth/popup-closed-by-user') {
          return; // User just closed the popup, no error needed
      }
      
      if (err.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname || window.location.host || 'localhost';
          setError(`DOMAIN ERROR: "${domain}" is not authorized. Go to Firebase Console > Auth > Settings > Authorized Domains and add it.`);
      } else {
          setError(err.message || "Google sign-in failed. Please try again.");
      }
    }
  };

  const verifyOtp = () => {
      if (enteredOtp === generatedOtp) {
          // Success! Determine destination based on flow (Login -> Dashboard, Signup -> Onboarding)
          // For simplicity, existing users go to dashboard, but we can default to Dashboard for now
          // or Onboarding if it was a new signup. Since we use the same flow, we'll direct to Dashboard
          // unless it was explicitly a signup action, but Onboarding checks profile existence usually.
          // Let's route based on isLogin state captured in closure?
          // Actually, safer to just go to Dashboard (or Onboarding if profile incomplete logic exists later)
          navigate(isLogin ? '/dashboard' : '/onboarding');
      } else {
          setError("Incorrect OTP. Please check the code and try again.");
      }
  };

  // --------------------------------------------------------
  // OTP Verification UI (Overlay)
  // --------------------------------------------------------
  if (showOtpInput) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
            <div className="w-full max-w-md bg-surface border border-secondary p-8 rounded-3xl text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify your Email</h2>
                <p className="text-muted text-sm mb-6">
                    Enter the code sent to <strong>{tempUserEmail}</strong>
                </p>

                {error && <p className="text-red-500 text-sm font-bold mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</p>}

                {/* Fallback Display if Email Not Configured */}
                {devOtp && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-6 text-center animate-pulse">
                        <p className="text-yellow-500 text-xs font-bold uppercase tracking-wide mb-1">
                            Demo Mode / Email Failed
                        </p>
                        <p className="text-gray-400 text-xs mb-2">Use this code to verify:</p>
                        <div className="flex items-center justify-center gap-2">
                             <span className="text-2xl font-mono font-bold text-white tracking-widest">{devOtp}</span>
                             <button 
                               onClick={() => setEnteredOtp(devOtp)}
                               className="p-1 hover:bg-white/10 rounded" 
                               title="Auto-fill"
                             >
                                <Copy size={16} className="text-primary" />
                             </button>
                        </div>
                    </div>
                )}

                <input 
                    type="text" 
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-secondary border border-gray-700 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white focus:border-primary focus:outline-none mb-6 font-mono placeholder-gray-700"
                    autoFocus
                />

                <button 
                    onClick={verifyOtp}
                    disabled={enteredOtp.length !== 6}
                    className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Verify & Continue
                </button>
                
                <button 
                    onClick={() => { setShowOtpInput(false); setEnteredOtp(''); setError(null); }}
                    className="mt-6 text-gray-500 text-sm hover:text-white underline"
                >
                    Cancel / Try Again
                </button>
            </div>
        </div>
      );
  }

  // --------------------------------------------------------
  // Main Login / Signup UI
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 rotate-3">
           <Dumbbell size={40} className="text-black" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          {isLogin ? 'Welcome Back' : 'Join FitSpot'}
        </h1>
        <p className="text-muted mb-8 text-sm">
          {isLogin ? 'Enter your details to access your fitness journey.' : 'Create an account to start your transformation.'}
        </p>

        <div className="w-full space-y-4">
           {error && (
             <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm text-left">
               <AlertCircle size={20} className="shrink-0 mt-0.5" />
               <div className="flex-1 break-words">
                 <span className="font-bold block mb-1">Error</span>
                 <span>{error}</span>
               </div>
             </div>
           )}

           <div className="text-left">
              <label className="text-xs font-semibold text-gray-400 ml-1 mb-2 block">Email Address</label>
              <div className="flex bg-secondary rounded-2xl border border-gray-800 overflow-hidden transition-colors focus-within:border-primary">
                 <div className="px-4 py-4 bg-gray-800/50 flex items-center justify-center border-r border-gray-800 text-gray-400">
                    <Mail size={20} />
                 </div>
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent px-4 text-white placeholder-gray-600 focus:outline-none"
                 />
              </div>
           </div>

           <div className="text-left">
              <label className="text-xs font-semibold text-gray-400 ml-1 mb-2 block">Password</label>
              <div className="flex bg-secondary rounded-2xl border border-gray-800 overflow-hidden transition-colors focus-within:border-primary">
                 <div className="px-4 py-4 bg-gray-800/50 flex items-center justify-center border-r border-gray-800 text-gray-400">
                    <Lock size={20} />
                 </div>
                 <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent px-4 text-white placeholder-gray-600 focus:outline-none"
                 />
                 <button 
                   onClick={() => setShowPassword(!showPassword)}
                   className="px-4 text-gray-500 hover:text-white"
                 >
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
           </div>

           <button 
             onClick={handleAuth}
             disabled={loading}
             className="w-full bg-primary text-black font-bold py-4 rounded-full text-lg mt-2 hover:opacity-90 transition-all shadow-lg shadow-green-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {loading && !error && !isLogin ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'Sign In' : 'Create Account')}
           </button>
        </div>

        <div className="flex items-center gap-4 w-full my-8">
           <div className="h-[1px] bg-gray-800 flex-1"></div>
           <span className="text-gray-500 text-xs">or continue with</span>
           <div className="h-[1px] bg-gray-800 flex-1"></div>
        </div>

        <div className="flex gap-4 w-full">
           <button 
             onClick={handleGoogleLogin}
             disabled={loading}
             className="flex-1 bg-surface border border-gray-800 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {loading && error === null ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  <span className="text-white text-sm font-medium">Google</span>
                </>
              )}
           </button>
           <button className="flex-1 bg-surface border border-gray-800 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5 invert" alt="Apple" />
              <span className="text-white text-sm font-medium">Apple</span>
           </button>
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
           {isLogin ? "Don't have an account?" : "Already have an account?"}
           <button 
             onClick={() => setIsLogin(!isLogin)}
             className="ml-2 text-primary font-bold hover:underline"
           >
             {isLogin ? 'Sign Up' : 'Log In'}
           </button>
        </p>

        <p className="text-[10px] text-gray-600 mt-6 max-w-xs mx-auto">
           By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
