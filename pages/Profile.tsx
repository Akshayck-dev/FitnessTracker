import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, ChevronRight, Moon, Bell, Ruler, PenSquare, Lock, Shield, FileText, LogOut, Check, Mail, Calendar, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getPlans, getUserProfile, saveUserProfile } from '../services/storageService';
import { UserProfile } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, units, toggleUnits, notificationsEnabled, toggleNotifications } = useSettings();
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '', email: '', height: '', weight: '', goal: '', isCoach: false, coachVerificationStatus: 'none'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plans = await getPlans();
        setSavedPlansCount(plans.length);
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } catch (error: any) {
        console.error("Failed to load profile data:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <Shield size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    await saveUserProfile(profile);
    setIsEditing(false);
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-12 h-7 rounded-full relative transition-colors ${active ? 'bg-primary shadow-[0_0_10px_rgba(0,227,118,0.4)]' : 'bg-secondary border border-secondary'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${active ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  const MenuItem = ({ icon: Icon, label, value, hasToggle, isRed, onClick, toggleValue, onToggle }: any) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-4 border-b border-secondary last:border-0 group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {Icon && <div className={`p-2 rounded-xl ${isRed ? 'bg-red-500/10 text-red-500' : 'bg-secondary text-muted group-hover:text-text group-hover:bg-secondary/80'} transition`}>
          <Icon size={18} />
        </div>}
        <span className={`${isRed ? 'text-red-500 font-medium' : 'text-text font-medium group-hover:text-primary transition'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-xs text-muted bg-secondary px-2 py-1 rounded-md border border-secondary">{value}</span>}
        {hasToggle ? (
          <Toggle active={toggleValue} onToggle={onToggle} />
        ) : (
          !isRed && <ChevronRight size={18} className="text-muted group-hover:text-primary transition" />
        )}
      </div>
    </div>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation is handled by ProtectedRoute in App.tsx
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans">
      <header className="px-6 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-text hover:text-primary transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text tracking-tight">Profile</h1>
        </div>
        {isEditing ? (
          <button onClick={handleSaveProfile} className="text-primary font-bold text-sm flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition">
            <Check size={16} /> Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-muted hover:text-text p-2 hover:bg-secondary rounded-full transition">
            <PenSquare size={20} />
          </button>
        )}
      </header>

      <div className="px-6 flex flex-col items-center mb-8 mt-4">
        <div className="relative mb-4 group">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface shadow-2xl shadow-black/50 group-hover:border-primary/50 transition duration-500">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'User'}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full border-4 border-background shadow-lg">
            <User size={16} />
          </div>
        </div>

        {isEditing ? (
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="bg-surface text-text text-center font-bold text-2xl rounded-xl py-2 px-4 border border-primary/50 w-64 mb-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        ) : (
          <h2 className="text-2xl font-bold text-text mb-1">{profile.name}</h2>
        )}
        <p className="text-sm text-muted flex items-center gap-1"><Mail size={12} /> {profile.email}</p>
      </div>

      <div className="px-6 space-y-8">
        {/* Personal Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="font-bold text-text text-sm uppercase tracking-wider">Fitness Profile</h3>
          </div>

          <div className="glass-card px-5 rounded-3xl mb-4">
            <MenuItem
              icon={FileText}
              label="My Saved Plans"
              value={`${savedPlansCount} Plans`}
              onClick={() => navigate('/dashboard')}
            />
            <MenuItem
              icon={Calendar}
              label="My Bookings"
              onClick={() => navigate('/bookings')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass-card p-4 rounded-3xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted block mb-2 uppercase font-bold tracking-wider">Height</span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="bg-surface border border-secondary text-text w-16 rounded-lg p-2 text-center text-lg font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-text font-bold text-xl">{profile.height || '--'}</span>
              )}
            </div>
            <div className="glass-card p-4 rounded-3xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted block mb-2 uppercase font-bold tracking-wider">Weight</span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="bg-surface border border-secondary text-text w-16 rounded-lg p-2 text-center text-lg font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-text font-bold text-xl">{profile.weight || '--'}</span>
              )}
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl flex justify-between items-center mb-4">
            <div>
              <span className="text-xs text-muted block mb-1 uppercase font-bold tracking-wider">Fitness Goal</span>
              {isEditing ? (
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                  className="bg-surface border border-secondary text-text rounded-lg p-2 text-sm w-40 focus:border-primary focus:outline-none mt-1"
                >
                  <option>Build Muscle</option>
                  <option>Lose Weight</option>
                  <option>Stay Fit</option>
                </select>
              ) : (
                <span className="text-text font-bold text-lg">{profile.goal}</span>
              )}
            </div>
            {!isEditing && <ChevronRight size={20} className="text-muted" />}
          </div>
        </section>

        {/* Coach Zone */}
        <section>
          <h3 className="font-bold text-text text-sm uppercase tracking-wider mb-4 px-1">Coach Zone</h3>
          <div className="glass-card px-5 rounded-3xl mb-4">
            {profile.isCoach ? (
              <MenuItem icon={Check} label="Coach Dashboard" onClick={() => alert("Coming Soon!")} />
            ) : profile.coachVerificationStatus === 'pending' ? (
              <MenuItem icon={Clock} label="Verification Pending" value="Under Review" />
            ) : (
              <MenuItem icon={Award} label="Become a Coach" onClick={() => navigate('/verify-coach')} />
            )}
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h3 className="font-bold text-text text-sm uppercase tracking-wider mb-4 px-1">Settings</h3>
          <div className="glass-card px-5 rounded-3xl">
            <MenuItem
              icon={Bell}
              label="Push Notifications"
              hasToggle
              toggleValue={notificationsEnabled}
              onToggle={toggleNotifications}
            />
            <MenuItem
              icon={Moon}
              label="Dark Mode"
              hasToggle
              toggleValue={darkMode}
              onToggle={toggleDarkMode}
            />
            <MenuItem
              icon={Ruler}
              label="Units"
              value={units === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}
              onClick={toggleUnits}
            />
          </div>
        </section>

        {/* Account Management */}
        <section>
          <h3 className="font-bold text-text text-sm uppercase tracking-wider mb-4 px-1">Account</h3>
          <div className="glass-card px-5 rounded-3xl">
            <MenuItem icon={Lock} label="Change Password" onClick={() => setIsChangePasswordOpen(true)} />
            <MenuItem icon={Shield} label="Privacy Policy" onClick={() => navigate('/privacy')} />
            <MenuItem icon={FileText} label="Terms of Service" onClick={() => navigate('/terms')} />
            <MenuItem icon={LogOut} label="Log Out" isRed onClick={handleLogout} />
          </div>
        </section>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
