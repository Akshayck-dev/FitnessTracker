
import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Navigation, Loader2, Map as MapIcon, List, Clock, X, ChevronDown } from 'lucide-react';
import { STUDIOS } from '../constants';
import { StudioCard } from '../components/StudioCard';
import { MapView } from '../components/MapView';
import { Studio } from '../types';
import { fetchNearbyGyms, searchGyms, geocodeLocation, getPlacePredictions, reverseGeocode } from '../services/placesService';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [localStudios, setLocalStudios] = useState<Studio[]>(STUDIOS);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'manual'>('idle');
  const [locationName, setLocationName] = useState<string>('Select Location');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Manual Location State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const categories = ['All', 'Gym', 'Yoga', 'Pilates', 'CrossFit', 'Swimming'];

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; 
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    setLocationStatus('loading');
    setLocationName('Locating...');
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationName('Location Needed');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        
        // Get address name
        try {
            const name = await reverseGeocode(latitude, longitude);
            setLocationName(name);
        } catch (e) {
            setLocationName('Near You');
        }

        fetchDataForLocation(latitude, longitude);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus('denied');
        setLocationName('Location Denied');
        setLocalStudios(STUDIOS);
      }
    );
  };

  const handleManualLocationChange = async (val: string) => {
      setManualAddress(val);
      if (val.length > 2) {
          try {
              const predictions = await getPlacePredictions(val);
              setLocationSuggestions(predictions);
          } catch (e) {
              console.log(e);
          }
      } else {
          setLocationSuggestions([]);
      }
  };

  const handleSuggestionClick = (description: string) => {
      setManualAddress(description);
      setLocationSuggestions([]);
      handleManualLocationSubmit(description);
  };

  const handleManualLocationSubmit = async (addressOverride?: string) => {
    const addr = addressOverride || manualAddress;
    if (!addr.trim()) return;
    setIsGeocoding(true);
    setLocationSuggestions([]); // Clear suggestions
    try {
      const coords = await geocodeLocation(addr);
      setUserLocation(coords);
      setLocationStatus('manual');
      setLocationName(addr); // Use valid manual address as name
      setIsLocationModalOpen(false); // Close modal on success
      fetchDataForLocation(coords.lat, coords.lng);
    } catch (error) {
      console.error("Geocoding failed", error);
      alert("Could not find that location. Please try a different city or zip code.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const fetchDataForLocation = async (lat: number, lng: number) => {
    try {
      setIsLoadingPlaces(true);
      // Explicitly pass 5000 meters to ensure nearby relevance
      const realGyms = await fetchNearbyGyms(lat, lng, 5000);
      setLocalStudios(realGyms);
    } catch (error) {
      console.log("Google Maps API not available or failed, falling back to mock data.");
      
      // Fallback: Recalculate distance for MOCK data
      const updatedStudios = STUDIOS.map(studio => {
        const distKm = calculateDistance(lat, lng, studio.coordinates.lat, studio.coordinates.lng);
        const distMiles = distKm * 0.621371;
        
        return {
          ...studio,
          distance: `${distMiles.toFixed(1)} mi`,
          rawDistance: distMiles
        };
      }).sort((a, b) => (a.rawDistance || 0) - (b.rawDistance || 0));

      setLocalStudios(updatedStudios);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If cleared, revert to location-based nearby (5km)
      if (userLocation) {
        fetchDataForLocation(userLocation.lat, userLocation.lng);
      }
      return;
    }

    setIsSearching(true);
    try {
      // Pass userLocation if available, otherwise pass undefined to trigger global search
      const results = await searchGyms(
          searchTerm, 
          userLocation?.lat, 
          userLocation?.lng
      );
      setLocalStudios(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  const filteredStudios = useMemo(() => {
    return localStudios.filter(studio => {
      const studioTypeString = studio.type.join(' ').toLowerCase();
      const categoryMatch = selectedCategory === 'All' || 
                            studioTypeString.includes(selectedCategory.toLowerCase());
      
      const openMatch = !showOpenOnly || studio.isOpen;
                            
      return categoryMatch && openMatch;
    });
  }, [selectedCategory, localStudios, showOpenOnly]);

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Location / Manual Entry Modal */}
      {(locationStatus === 'denied' || isLocationModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-surface w-full max-w-sm p-6 rounded-3xl border border-secondary text-center animate-in zoom-in duration-300 relative">
            
            {/* Close button if simply changing location */}
            {isLocationModalOpen && locationStatus !== 'denied' && (
                <button 
                  onClick={() => setIsLocationModalOpen(false)} 
                  className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
            )}

            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
               <MapPin size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
                {locationStatus === 'denied' ? 'Location Needed' : 'Change Location'}
            </h2>
            
            <p className="text-muted text-sm mb-6">
              {locationStatus === 'denied' 
                ? 'FitSpot uses your location to show you gyms nearby. Please enable access or enter your location manually.'
                : 'Enter a new city or zip code to explore gyms in that area.'}
            </p>
            
            {locationStatus === 'denied' && (
                <button 
                onClick={requestLocation} 
                className="w-full bg-primary text-black font-bold py-3 rounded-xl mb-4 hover:opacity-90 transition"
                >
                Allow Location Access
                </button>
            )}

            {locationStatus === 'denied' && (
                <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-2 text-gray-500">Or enter manually</span>
                </div>
                </div>
            )}

            <div className="relative flex gap-2">
               <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={manualAddress}
                        onChange={(e) => handleManualLocationChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                        placeholder="City or Zip Code"
                        className="w-full bg-secondary border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none"
                    />
                    {/* Autocomplete Dropdown */}
                    {locationSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-secondary border border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                            {locationSuggestions.map((prediction) => (
                                <div 
                                    key={prediction.place_id}
                                    onClick={() => handleSuggestionClick(prediction.description)}
                                    className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-800 last:border-0"
                                >
                                    {prediction.description}
                                </div>
                            ))}
                        </div>
                    )}
               </div>

               <button 
                 onClick={() => handleManualLocationSubmit()}
                 disabled={isGeocoding || !manualAddress.trim()}
                 className="bg-secondary border border-gray-700 text-white px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50"
               >
                 {isGeocoding ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-6 pb-4 px-6 border-b border-secondary">
        <div className="flex items-center justify-between mb-6">
           <div 
             className="flex items-center gap-2 text-white cursor-pointer hover:opacity-80 transition" 
             onClick={() => setIsLocationModalOpen(true)}
           >
              <div className={`p-1.5 rounded-full ${locationStatus === 'granted' || locationStatus === 'manual' ? 'bg-primary/20 text-primary' : 'bg-secondary text-gray-400'}`}>
                <MapPin size={16} fill={(locationStatus === 'granted' || locationStatus === 'manual') ? "currentColor" : "none"} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm flex items-center gap-1">
                  {locationName}
                  <ChevronDown size={14} className="text-primary ml-1" />
                </span>
              </div>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-secondary border border-gray-700 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" />
           </div>
        </div>

        <div className="relative mb-4">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
           <input 
             type="text" 
             placeholder="Search gyms (e.g. 'Gold's Gym' or 'Gyms in NY')" 
             className="w-full bg-secondary border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             onKeyDown={handleKeyDown}
           />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
           <button className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap">
              <SlidersHorizontal size={14} /> Filter
           </button>
           
           <button
              onClick={() => setShowOpenOnly(!showOpenOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                showOpenOnly
                  ? 'bg-primary text-black border-primary'
                  : 'bg-secondary text-gray-400 border-gray-800 hover:border-gray-600'
              }`}
           >
              <Clock size={14} /> Open Now
           </button>

           <div className="w-px h-6 bg-secondary mx-1"></div>

           {categories.map(cat => (
             <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                  selectedCategory === cat 
                    ? 'bg-white text-black border-white' 
                    : 'bg-secondary text-gray-400 border-gray-800 hover:border-gray-600'
                }`}
             >
                {cat}
             </button>
           ))}
        </div>
      </header>

      {/* Content */}
      <main className={`px-6 py-6 ${viewMode === 'map' ? 'h-[calc(100vh-280px)] p-0 px-4' : 'space-y-6'}`}>
         {(locationStatus === 'loading' || isLoadingPlaces || isSearching) && (
           <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-2">
             <Loader2 className="animate-spin text-primary" size={32} /> 
             <p className="text-sm">
                 {isSearching ? `Searching Google for "${searchTerm}"...` : 'Locating gyms nearby...'}
             </p>
           </div>
         )}
         
         {!isLoadingPlaces && !isSearching && (
           viewMode === 'list' ? (
              <>
                {filteredStudios.map(studio => (
                  <StudioCard key={studio.id} studio={studio} />
                ))}
                {filteredStudios.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No studios found matching your criteria.</p>
                  </div>
                )}
              </>
           ) : (
             <MapView studios={filteredStudios} userLocation={userLocation} />
           )
         )}
      </main>

      {/* View Toggle - Floating Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
          className="bg-surface border border-secondary text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-gray-800 transition"
        >
          {viewMode === 'list' ? <MapIcon size={18} /> : <List size={18} />}
          <span className="text-sm font-bold">{viewMode === 'list' ? 'Map View' : 'List View'}</span>
        </button>
      </div>
    </div>
  );
};
