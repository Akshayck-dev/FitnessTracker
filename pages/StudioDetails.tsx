import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Globe, Check, Calendar, ChevronRight, Share2, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { STUDIOS } from '../constants';

import { saveBooking } from '../services/storageService';

export const StudioDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const studio = STUDIOS.find(s => s.id === id) || STUDIOS[0]; // Fallback for demo
    const [isBooked, setIsBooked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleBook = async () => {
        setIsLoading(true);
        try {
            await saveBooking({
                studioId: studio.id,
                studioName: studio.name,
                date: 'Today', // In a real app, user selects date
                time: '10:00 AM', // In a real app, user selects time
                image: studio.image
            });
            setIsBooked(true);
            setTimeout(() => {
                setIsBooked(false);
                navigate('/bookings');
            }, 2000);
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to book session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 font-sans relative">
            {/* Hero Image */}
            <div className="h-[40vh] w-full relative">
                <img
                    src={studio.image}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>

                {/* Header Actions */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition">
                            <Share2 size={20} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{studio.name}</h1>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin size={14} className="text-primary" />
                            <span>{studio.address}</span>
                        </div>
                    </div>
                    <div className="bg-surface border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-bold">{studio.rating}</span>
                        <span className="text-xs text-gray-500">({studio.reviews})</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
                    {studio.type.map(type => (
                        <span key={type} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 whitespace-nowrap">
                            {type}
                        </span>
                    ))}
                    <span className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${studio.isOpen ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {studio.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                </div>

                {/* About */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3">About</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Experience premium fitness at {studio.name}. State-of-the-art equipment, expert trainers, and a motivating atmosphere designed to help you crush your goals.
                        <span className="text-primary ml-1 font-medium">Read more</span>
                    </p>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['WiFi', 'Showers', 'Lockers', 'Parking', 'Sauna', 'Juice Bar'].map(item => (
                            <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Check size={12} />
                                </div>
                                <span className="text-sm text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location Map Placeholder */}
                <div className="mb-24">
                    <h3 className="text-lg font-bold text-white mb-4">Location</h3>
                    <div className="h-48 w-full rounded-3xl bg-surface border border-white/10 relative overflow-hidden group cursor-pointer">
                        <img
                            src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.006,40.7128,14,0/600x300?access_token=YOUR_TOKEN"
                            alt="Map"
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-surface text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                                <MapPin size={16} className="text-primary" /> Get Directions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-white/10 p-6 z-50">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">$25</span>
                            <span className="text-sm text-gray-500">/ session</span>
                        </div>
                    </div>
                    <button
                        onClick={handleBook}
                        disabled={isBooked || isLoading}
                        className={`flex-1 py-4 rounded-2xl font-bold text-black flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(0,227,118,0.3)] ${isBooked ? 'bg-green-500' : 'bg-primary hover:opacity-90 active:scale-95'}`}
                    >
                        {isLoading ? (
                            <>Booking...</>
                        ) : isBooked ? (
                            <>
                                <Check size={20} /> Booked!
                            </>
                        ) : (
                            <>
                                Book Session <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
