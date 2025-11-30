
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking } from '../services/storageService';
import { Booking } from '../types';

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(id);
      setBookings(getBookings()); // Refresh
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status !== 'confirmed');

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className={`border rounded-2xl p-4 mb-4 ${booking.status === 'cancelled' ? 'bg-red-900/10 border-red-900/30 opacity-75' : 'bg-surface border-secondary'}`}>
       <div className="flex justify-between items-start mb-2">
         <h3 className="font-bold text-white text-lg">{booking.studioName}</h3>
         <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
           booking.status === 'confirmed' ? 'bg-primary/20 text-primary' : 
           booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
         }`}>
           {booking.status}
         </span>
       </div>
       
       <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
          <div className="flex items-center gap-1">
             <Calendar size={14} className="text-gray-500" />
             {booking.date}
          </div>
          <div className="flex items-center gap-1">
             <Clock size={14} className="text-gray-500" />
             {booking.time}
          </div>
       </div>

       {booking.status === 'confirmed' && (
         <button 
           onClick={() => handleCancel(booking.id)}
           className="w-full py-2 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-900/20 transition flex items-center justify-center gap-2"
         >
           <XCircle size={16} /> Cancel Booking
         </button>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-secondary">
        <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">My Bookings</h1>
      </header>

      <div className="px-6 py-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div> Upcoming
        </h2>
        {activeBookings.length > 0 ? (
            activeBookings.map(b => <BookingCard key={b.id} booking={b} />)
        ) : (
            <div className="text-center py-8 bg-surface border border-secondary rounded-2xl mb-8 border-dashed">
                <p className="text-gray-500 text-sm">No upcoming bookings.</p>
                <button onClick={() => navigate('/explore')} className="text-primary text-sm font-bold mt-2">Find a class</button>
            </div>
        )}

        {pastBookings.length > 0 && (
            <>
                <h2 className="text-white font-bold mb-4 mt-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div> Past & Cancelled
                </h2>
                {pastBookings.map(b => <BookingCard key={b.id} booking={b} />) }
            </>
        )}
      </div>
    </div>
  );
};
