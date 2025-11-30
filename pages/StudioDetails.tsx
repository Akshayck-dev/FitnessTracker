
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Star, MapPin, Clock, Phone, Globe, CheckCircle2, Navigation as NavIcon, Loader2, Dumbbell, Wifi, Droplets, Car, Lock, Check } from 'lucide-react';
import { STUDIOS, MOCK_CLASSES, MOCK_REVIEWS, MOCK_MEMBERSHIPS } from '../constants';
import { fetchGymDetails } from '../services/placesService';
import { toggleFavorite, isStudioFavorite } from '../services/storageService';
import { Studio } from '../types';
import { BookingModal } from '../components/BookingModal';

type TabType = 'Overview' | 'Facilities' | 'Classes' | 'Membership' | 'Reviews';

export const StudioDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const loadStudio = async () => {
      if (!id) return;

      // Check fav status
      setIsFav(isStudioFavorite(id));

      // 1. Check Mock Data First
      const mockStudio = STUDIOS.find(s => s.id === id);
      if (mockStudio) {
        // Hydrate mock studio with extra data if missing (for the tabs)
        setStudio({
            ...mockStudio,
            classes: MOCK_CLASSES,
            membershipPlans: MOCK_MEMBERSHIPS,
            reviews: MOCK_REVIEWS
        });
        setLoading(false);
        return;
      }

      // 2. Fetch from Google Places API
      try {
        const data = await fetchGymDetails(id);
        setStudio(data);
      } catch (err) {
        console.error("Failed to fetch studio details", err);
        setError("Could not load studio details. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, [id]);

  const handleToggleFav = () => {
    if (id) {
        const newState = toggleFavorite(id);
        setIsFav(newState);
    }
  };

  const ActionButton = ({ icon: Icon, label, onClick, href }: { icon: any, label: string, onClick?: () => void, href?: string }) => {
    const innerContent = (
       <>
       <div className="w-12 h-12 rounded-full bg-secondary border border-gray-700 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
          <Icon size={20} />
       </div>
       <span className="text-[10px] text-gray-400">{label}</span>
       </>
    );

    if (href) {
        return (
            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex flex-col items-center gap-2 group">
                {innerContent}
            </a>
        );
    }

    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            {innerContent}
        </button>
    );
  };

  const handleDirections = () => {
    if (studio) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${studio.coordinates.lat},${studio.coordinates.lng}`, '_blank');
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4 text-primary" size={40} />
        <p>Loading studio details...</p>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p className="text-muted mb-6">{error || "Studio not found"}</p>
        <button onClick={() => navigate('/explore')} className="text-primary hover:underline">
          Go to Discovery
        </button>
      </div>
    );
  }

  // Prepare links
  const phoneLink = studio.phone && studio.phone !== 'N/A' ? `tel:${studio.phone.replace(/[^\d+]/g, '')}` : undefined;
  const websiteLink = studio.website && studio.website !== '' ? studio.website : undefined;

  const renderTabContent = () => {
      switch(activeTab) {
        case 'Overview':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Location Card */}
                    <div className="bg-surface border border-secondary p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight mb-1">{studio.address}</p>
                            <button onClick={handleDirections} className="text-xs text-blue-400 font-medium">Get Directions</button>
                        </div>
                    </div>

                    {/* Hours Card */}
                    <div className="bg-surface border border-secondary p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight mb-1">
                                <span className={`${studio.isOpen ? 'text-primary' : 'text-red-500'}`}>
                                    {studio.isOpen ? 'Open now' : 'Closed'}
                                </span> 
                                {studio.isOpen && ` • Closes ${studio.closingTime}`}
                            </p>
                            <button className="text-xs text-gray-400 font-medium">View all hours</button>
                        </div>
                    </div>

                    {/* About Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-white">About</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{studio.description}</p>
                    </div>

                    {/* Quick Amenities Preview */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-white">Highlights</h3>
                        <div className="flex flex-wrap gap-2">
                            {studio.amenities.slice(0, 5).map((item, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-lg bg-secondary text-gray-300 text-xs font-medium border border-gray-700">
                                    {item}
                                </span>
                            ))}
                            {studio.amenities.length > 5 && (
                                <span className="px-3 py-1.5 rounded-lg bg-secondary text-gray-400 text-xs font-medium border border-gray-700">
                                    +{studio.amenities.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Gallery Preview */}
                    {studio.gallery && studio.gallery.length > 1 && (
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-white">Gallery</h3>
                            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                                {studio.gallery.slice(1).map((img, idx) => (
                                    <img key={idx} src={img} alt="Gallery" className="w-40 h-28 object-cover rounded-xl border border-secondary shrink-0" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        
        case 'Facilities':
            const facilityIcons: any = { 'WiFi': Wifi, 'Showers': Droplets, 'Parking': Car, 'Lockers': Lock };
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-surface border border-secondary rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-4">Equipment & Areas</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Dumbbell className="text-primary mt-1" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-white">Strength Training</h4>
                                    <p className="text-xs text-gray-400">Free weights, squat racks, resistance machines</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="text-primary mt-1" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-white">Cardio Zone</h4>
                                    <p className="text-xs text-gray-400">Treadmills, ellipticals, rowing machines</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-surface border border-secondary rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {studio.amenities.map((amenity, idx) => {
                                const Icon = facilityIcons[amenity] || Check;
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                        <Icon size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-200">{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );

        case 'Classes':
            return (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-white">Today's Schedule</h3>
                       <button className="text-xs text-primary font-bold">View Full Week</button>
                   </div>
                   {studio.classes?.map((session) => (
                       <div key={session.id} className="bg-surface border border-secondary p-4 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                               <div className="flex flex-col items-center justify-center w-14 h-14 bg-secondary rounded-xl border border-gray-700">
                                   <span className="text-xs font-bold text-white">{session.time.split(' ')[0]}</span>
                                   <span className="text-[10px] text-gray-400">{session.time.split(' ')[1]}</span>
                               </div>
                               <div>
                                   <h4 className="font-bold text-white text-sm">{session.name}</h4>
                                   <p className="text-xs text-gray-400">{session.instructor} • {session.duration}</p>
                                   <div className="flex items-center gap-2 mt-1">
                                       <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                           session.intensity === 'High' ? 'bg-red-900/40 text-red-400' : 
                                           session.intensity === 'Medium' ? 'bg-orange-900/40 text-orange-400' : 
                                           'bg-green-900/40 text-green-400'
                                       }`}>{session.intensity}</span>
                                       <span className="text-[10px] text-gray-500">{session.spotsLeft} spots left</span>
                                   </div>
                               </div>
                           </div>
                           <button onClick={() => setIsBookingOpen(true)} className="bg-primary text-black text-xs font-bold px-4 py-2 rounded-full hover:opacity-90">
                               Book
                           </button>
                       </div>
                   ))}
                </div>
            );

        case 'Membership':
            return (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {studio.membershipPlans?.map((plan) => (
                        <div key={plan.id} className={`bg-surface border p-5 rounded-2xl relative overflow-hidden ${plan.isPopular ? 'border-primary' : 'border-secondary'}`}>
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    POPULAR
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                                    <p className="text-xs text-gray-400">{plan.features.length} features included</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-white">{plan.price}</span>
                                    <span className="text-xs text-gray-500 block">{plan.period}</span>
                                </div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle2 size={14} className="text-primary" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-3 rounded-xl font-bold text-sm transition ${plan.isPopular ? 'bg-primary text-black hover:opacity-90' : 'bg-secondary text-white hover:bg-gray-700'}`}>
                                Choose Plan
                            </button>
                        </div>
                    ))}
                </div>
            );

        case 'Reviews':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Summary */}
                    <div className="bg-surface border border-secondary p-5 rounded-2xl flex items-center justify-between">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white">{studio.rating}</h3>
                            <div className="flex text-yellow-400 justify-center my-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < Math.floor(studio.rating) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">{studio.reviewCount} Reviews</p>
                        </div>
                        <div className="w-px h-12 bg-secondary"></div>
                        <div className="space-y-1 flex-1 pl-6">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 w-2">{star}</span>
                                    <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-400" 
                                            style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {studio.reviews?.map((review) => (
                            <div key={review.id} className="bg-surface border border-secondary p-4 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <img src={review.userImage} alt={review.userName} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{review.userName}</h4>
                                            <p className="text-[10px] text-gray-400">{review.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-white">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed mb-3">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
      }
  };

  return (
    <div className="bg-background min-h-screen pb-24 text-white">
      {/* Header Image */}
      <div className="relative h-64">
        <img src={studio.image} alt={studio.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pt-8 z-[50]">
          <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition cursor-pointer z-50" onClick={handleBack}>
            <ArrowLeft size={20} />
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition cursor-pointer">
                <Share2 size={20} />
            </button>
            <button 
                onClick={handleToggleFav}
                className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition cursor-pointer ${isFav ? 'bg-red-500 text-white' : 'bg-black/40 hover:bg-black/60'}`}
            >
                <Heart size={20} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-10">
        <h1 className="text-2xl font-bold mb-2 text-white">{studio.name}</h1>
        
        <div className="flex items-center gap-3 mb-6">
           {studio.isVerified && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
               <CheckCircle2 size={12} /> Verified
             </span>
           )}
           <div className="flex items-center gap-1 text-yellow-400">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-bold">{studio.rating}</span>
              <span className="text-xs text-gray-400">({studio.reviewCount})</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between px-2 mb-6">
           <ActionButton icon={Phone} label="Call" href={phoneLink} onClick={!phoneLink ? () => alert('Phone number not available') : undefined} />
           <ActionButton icon={Globe} label="Website" href={websiteLink} onClick={!websiteLink ? () => {} : undefined} />
           <ActionButton icon={NavIcon} label="Directions" onClick={handleDirections} />
           <ActionButton icon={Share2} label="Share" onClick={() => {}} />
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 bg-background pt-2 pb-4 -mx-6 px-6 border-b border-secondary mb-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-6 min-w-max">
                {['Overview', 'Facilities', 'Classes', 'Membership', 'Reviews'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as TabType)}
                        className={`text-sm font-medium pb-2 transition relative ${
                            activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Content */}
        {renderTabContent()}

      </div>

      {/* Footer Action Button - Replaces Booking */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-secondary z-30">
         <button 
           onClick={handleDirections}
           className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
         >
            <NavIcon size={20} fill="currentColor" />
            Start Navigation
         </button>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        studioName={studio.name} 
      />
    </div>
  );
};
