
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Calendar, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../services/storageService';
import { Notification } from '../types';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setList(data);
      // Mark as read when opening page
      await markNotificationsRead();
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar size={20} className="text-primary" />;
      case 'promo': return <Info size={20} className="text-yellow-400" />;
      case 'success': return <CheckCircle2 size={20} className="text-green-400" />;
      case 'alert': return <AlertTriangle size={20} className="text-red-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-primary/10 border-primary/20';
      case 'promo': return 'bg-yellow-400/10 border-yellow-400/20';
      case 'success': return 'bg-green-400/10 border-green-400/20';
      case 'alert': return 'bg-red-400/10 border-red-400/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Notifications</h1>
      </header>

      <div className="px-4 py-4 space-y-3">
        {list.length > 0 ? (
          list.map(notif => (
            <div key={notif.id} className={`p-5 rounded-3xl flex gap-4 transition-all duration-300 ${notif.read ? 'bg-transparent border border-transparent opacity-60 hover:opacity-100 hover:bg-white/5' : 'glass-card border-primary/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getIconBg(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h3>
                  <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap ml-2">
                    {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{notif.message}</p>
                <p className="text-[10px] text-gray-700 font-medium">{new Date(notif.date).toLocaleDateString()}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_5px_rgba(0,227,118,0.5)]"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600 border border-white/5">
              <Bell size={32} />
            </div>
            <h3 className="text-white font-bold text-lg">No notifications yet</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-[200px] mx-auto">We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
};
