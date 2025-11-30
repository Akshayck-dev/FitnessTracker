
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, ChevronRight, Moon, Bell, Ruler, PenSquare, Lock, Shield, FileText, LogOut, Bookmark, Calendar, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getPlans, getUserProfile, saveUserProfile } from '../services/storageService';
import { UserProfile } from '../types';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '', email: '', height: '', weight: '', goal: ''
  });

  useEffect(() => {
    setSavedPlansCount(getPlans().length);
    setProfile(getUserProfile());
  }, []);

  const handleSaveProfile = () => {
    saveUserProfile(profile);
    setIsEditing(false);
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-12 h-7 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${active ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  const MenuItem = ({ icon: Icon, label, value, hasToggle, isRed, onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between py-4 border-b border-secondary last:border-0 group cursor-pointer"
    >
       <div className="flex items-center gap-4">
          <span className={`${isRed ? 'text-red-500' : 'text-gray-300'}`}>{label}</span>
       </div>
       <div className="flex items-center gap-3">
          {value && <span className="text-xs text-muted bg-secondary px-2 py-1 rounded-md">{value}</span>}
          {hasToggle ? (
             <Toggle active={label === 'Push Notifications' ? notifications : darkMode} onToggle={() => label === 'Push Notifications' ? setNotifications(!notifications) : setDarkMode(!darkMode)} />
          ) : (
             !isRed && <ChevronRight size={18} className="text-gray-600 group-hover:text-primary transition" />
          )}
       </div>
    </div>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Profile</h1>
        </div>
        {isEditing ? (
            <button onClick={handleSaveProfile} className="text-primary font-bold text-sm flex items-center gap-1">
                <Check size={16} /> Save
            </button>
        ) : (
            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white">
                <PenSquare size={20} />
            </button>
        )}
      </header>

      <div className="px-6 flex flex-col items-center mb-8">
         <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" className="w-full h-full object-cover" />
            </div>
         </div>
         {isEditing ? (
             <input 
               value={profile.name} 
               onChange={(e) => setProfile({...profile, name: e.target.value})}
               className="bg-secondary text-white text-center font-bold text-lg rounded-lg py-1 px-2 border border-gray-700 w-48 mb-1"
             />
         ) : (
             <h2 className="text-xl font-bold text-white">{profile.name}</h2>
         )}
         <p className="text-sm text-muted">{profile.email}</p>
      </div>

      <div className="px-6 space-y-8">
         {/* Personal Section */}
         <section>
            <div className="flex items-center gap-2 mb-4">
               <h3 className="font-bold text-white">Fitness Profile</h3>
               <User size={14} className="text-gray-500" />
            </div>
            
            <div className="bg-surface border border-secondary px-4 rounded-2xl mb-4">
               <MenuItem 
                 label="My Saved Plans" 
                 value={`${savedPlansCount} Plans`} 
                 onClick={() => navigate('/dashboard')} 
               />
               <MenuItem 
                 label="My Bookings" 
                 onClick={() => navigate('/bookings')} 
               />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="bg-surface border border-secondary p-3 rounded-xl">
                  <span className="text-xs text-muted block mb-1">Height</span>
                  {isEditing ? (
                      <input 
                        value={profile.height} 
                        onChange={(e) => setProfile({...profile, height: e.target.value})}
                        className="bg-secondary text-white w-full rounded p-1 text-sm"
                      />
                  ) : (
                      <span className="text-white font-medium">{profile.height}</span>
                  )}
               </div>
               <div className="bg-surface border border-secondary p-3 rounded-xl">
                  <span className="text-xs text-muted block mb-1">Weight</span>
                  {isEditing ? (
                      <input 
                        value={profile.weight} 
                        onChange={(e) => setProfile({...profile, weight: e.target.value})}
                        className="bg-secondary text-white w-full rounded p-1 text-sm"
                      />
                  ) : (
                      <span className="text-white font-medium">{profile.weight}</span>
                  )}
               </div>
            </div>
            
            <div className="bg-surface border border-secondary p-4 rounded-xl flex justify-between items-center mb-4">
               <div>
                  <span className="text-xs text-muted block mb-1">Fitness Goal</span>
                  {isEditing ? (
                      <select 
                        value={profile.goal}
                        onChange={(e) => setProfile({...profile, goal: e.target.value})}
                        className="bg-secondary text-white rounded p-1 text-sm w-40"
                      >
                          <option>Build Muscle</option>
                          <option>Lose Weight</option>
                          <option>Stay Fit</option>
                      </select>
                  ) : (
                      <span className="text-white font-medium">{profile.goal}</span>
                  )}
               </div>
               {!isEditing && <ChevronRight size={18} className="text-gray-600" />}
            </div>
         </section>

         {/* App Settings */}
         <section>
            <h3 className="font-bold text-white mb-2">Application Settings</h3>
            <div className="bg-surface border border-secondary px-4 rounded-2xl">
               <MenuItem label="Push Notifications" hasToggle />
               <MenuItem label="Dark Mode" hasToggle />
               <MenuItem label="Units" value="Metric" />
            </div>
         </section>

         {/* Account Management */}
         <section>
            <h3 className="font-bold text-white mb-2">Account Management</h3>
            <div className="bg-surface border border-secondary px-4 rounded-2xl">
               <MenuItem label="Change Password" />
               <MenuItem label="Privacy Policy" />
               <MenuItem label="Terms of Service" />
               <MenuItem label="Log Out" isRed onClick={handleLogout} />
            </div>
         </section>
      </div>
      
      <div className="h-8"></div>
    </div>
  );
};
