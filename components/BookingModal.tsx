
import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { saveBooking } from '../services/storageService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioName: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, studioName }) => {
  const [step, setStep] = useState<'date' | 'success'>('date');
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM');

  if (!isOpen) return null;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      fullDateString: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: d
    };
  });

  const times = ['07:00 AM', '09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:30 PM'];

  const handleBook = () => {
    saveBooking({
        studioName: studioName,
        date: dates[selectedDate].fullDateString,
        time: selectedTime
    });
    setStep('success');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep('date'), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-secondary p-6 animate-in slide-in-from-bottom duration-300">
        
        {step === 'date' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Book a Visit</h2>
              <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Calendar size={16} /> Select Date
              </h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i)}
                    className={`flex flex-col items-center justify-center min-w-[60px] h-20 rounded-2xl border transition ${
                      selectedDate === i 
                        ? 'bg-primary text-black border-primary' 
                        : 'bg-secondary text-gray-400 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xs font-medium opacity-80">{d.day}</span>
                    <span className="text-xl font-bold">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Clock size={16} /> Select Time
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-3 rounded-xl text-sm font-medium border transition ${
                      selectedTime === t 
                        ? 'bg-primary/20 text-primary border-primary' 
                        : 'bg-secondary text-gray-400 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleBook}
              className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition"
            >
              Confirm Booking
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary animate-in zoom-in duration-300">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              You're all set for <strong>{studioName}</strong> on {dates[selectedDate].day}, {dates[selectedDate].date} at {selectedTime}.
            </p>
            <button 
              onClick={handleClose}
              className="w-full bg-secondary text-white font-bold py-4 rounded-2xl border border-gray-700 hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
