import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking } from '../services/storageService';
import { Booking } from '../types';

const BookingCard = ({ booking, onCancel }: { booking: Booking, onCancel: (id: string) => void }) => (
  <div className={`border rounded-3xl p-5 mb-4 transition-all duration-300 ${booking.status === 'cancelled'
    ? 'bg-red-900/5 border-red-900/20 opacity-60 hover:opacity-100'
    : 'glass-card border-white/10 hover:border-primary/30'
    }`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-bold text-white text-lg mb-1">{booking.studioName}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={12} className="text-primary" />
          <span>Downtown Studio</span>
        </div>
      </div>
      <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider flex items-center gap-1 ${booking.status === 'confirmed' ? 'bg-primary/20 text-primary border border-primary/20' :
        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-700/50 text-gray-400 border border-gray-600'
        }`}>
        {booking.status === 'confirmed' && <CheckCircle size={10} />}
        {booking.status === 'cancelled' && <XCircle size={10} />}
        {booking.status}
      </span>
    </div>

    <div className="flex items-center gap-4 text-sm text-gray-300 mb-5 bg-black/20 p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
          <Calendar size={14} />
        </div>
        <span className="font-medium">{booking.date}</span>
      </div>
      <div className="w-px h-8 bg-white/10"></div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
          <Clock size={14} />
        </div>
        <span className="font-medium">{booking.time}</span>
      </div>
    </div>

    {booking.status === 'confirmed' && (
      <button
        onClick={() => onCancel(booking.id)}
        className="w-full py-3 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition flex items-center justify-center gap-2 font-bold"
      >
        <XCircle size={16} /> Cancel Booking
      </button>
    )}
  </div>
);

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookings();
      setBookings(data);
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await cancelBooking(id);
      const data = await getBookings(); // Refresh
      setBookings(data);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status !== 'confirmed');

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">My Bookings</h1>
      </header>

      <div className="px-6 py-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,227,118,0.5)]"></div> Upcoming
        </h2>
        {activeBookings.length > 0 ? (
          activeBookings.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)
        ) : (
          <div className="text-center py-12 glass-card border border-white/10 rounded-3xl mb-8 border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
              <Calendar size={32} />
            </div>
            <p className="text-gray-400 text-sm mb-4">No upcoming bookings.</p>
            <button onClick={() => navigate('/explore')} className="text-primary text-sm font-bold hover:underline">Find a class</button>
          </div>
        )}

        {pastBookings.length > 0 && (
          <>
            <h2 className="text-white font-bold mb-4 mt-8 flex items-center gap-2 text-sm uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div> Past & Cancelled
            </h2>
            {pastBookings.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}
          </>
        )}
      </div>
    </div>
  );
};
