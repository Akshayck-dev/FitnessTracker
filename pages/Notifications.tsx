
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../services/storageService';
import { Notification } from '../types';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Notification[]>([]);

  useEffect(() => {
    setList(getNotifications());
    // Mark as read when opening page
    markNotificationsRead();
  }, []);

  const getIcon = (type: string) => {
      switch(type) {
          case 'booking': return <Calendar size={20} className="text-primary" />;
          case 'promo': return <Info size={20} className="text-yellow-400" />;
          default: return <Bell size={20} className="text-gray-400" />;
      }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">Notifications</h1>
      </header>

      <div className="px-4 py-4 space-y-2">
        {list.length > 0 ? (
            list.map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl flex gap-4 ${notif.read ? 'bg-surface/50' : 'bg-surface border border-primary/20'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-secondary' : 'bg-primary/10'}`}>
                        {getIcon(notif.type)}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold mb-1 ${notif.read ? 'text-gray-300' : 'text-white'}`}>{notif.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-gray-600 mt-2">{new Date(notif.date).toLocaleDateString()} • {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <Bell size={32} />
                </div>
                <h3 className="text-white font-bold">No notifications yet</h3>
                <p className="text-gray-500 text-sm mt-1">We'll notify you when something important happens.</p>
            </div>
        )}
      </div>
    </div>
  );
};
