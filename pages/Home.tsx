
import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Navigation, Loader2, Map as MapIcon, List, Clock, X, ChevronDown, AlertTriangle } from 'lucide-react';
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
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
      setIsUsingMockData(true);
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
    <div className="min-h-screen bg-background pb-24 relative font-sans">
      {/* Location / Manual Entry Modal */}
      {(locationStatus === 'denied' || isLocationModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm p-6 rounded-3xl border border-white/10 text-center animate-in zoom-in duration-300 relative shadow-2xl">

            {/* Close button if simply changing location */}
            {isLocationModalOpen && locationStatus !== 'denied' && (
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            )}

            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-[0_0_15px_rgba(0,227,118,0.2)]">
              <MapPin size={32} />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {locationStatus === 'denied' ? 'Location Needed' : 'Change Location'}
            </h2>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {locationStatus === 'denied'
                ? 'FitSpot uses your location to show you gyms nearby. Please enable access or enter your location manually.'
                : 'Enter a new city or zip code to explore gyms in that area.'}
            </p>

            {locationStatus === 'denied' && (
              <button
                onClick={requestLocation}
                className="w-full bg-primary text-black font-bold py-3 rounded-xl mb-4 hover:opacity-90 transition shadow-[0_0_15px_rgba(0,227,118,0.3)]"
              >
                Allow Location Access
              </button>
            )}

            {locationStatus === 'denied' && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
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
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                />
                {/* Autocomplete Dropdown */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((prediction) => (
                      <div
                        key={prediction.place_id}
                        onClick={() => handleSuggestionClick(prediction.description)}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer border-b border-white/5 last:border-0 transition"
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
                className="bg-surface border border-white/10 text-white px-4 rounded-xl hover:bg-white/5 disabled:opacity-50 transition"
              >
                {isGeocoding ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-6 pb-4 px-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Discover</h1>

          <div
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <span className="text-primary font-bold text-sm">{locationName}</span>
            <MapPin size={14} className="text-primary" />
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search gyms or studios..."
            className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center pb-1">
          <button className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-primary/20 transition">
            <SlidersHorizontal size={14} /> Filter
          </button>

          <button className="flex items-center gap-2 bg-surface text-gray-400 border border-white/10 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:border-white/20 hover:text-white transition">
            <div className="rotate-90"><SlidersHorizontal size={14} /></div> Sort
          </button>

          <button
            onClick={() => setShowOpenOnly(!showOpenOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${showOpenOnly
              ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(0,227,118,0.3)]'
              : 'bg-surface text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
          >
            24/7
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${selectedCategory === cat
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-surface text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Mock Data Warning Banner */}
      {isUsingMockData && (
        <div className="mx-6 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-yellow-500 font-bold text-sm mb-1">Showing Demo Data</h3>
            <p className="text-yellow-500/80 text-xs leading-relaxed">
              Real-time gym search requires a valid Google Maps API Key.
              <br />Add your key in <code className="bg-black/30 px-1 rounded">index.html</code> to see real gyms near you.
            </p>
          </div>
          <button
            onClick={() => setIsUsingMockData(false)}
            className="text-yellow-500/60 hover:text-yellow-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      <main className={`px-6 py-6 ${viewMode === 'map' ? 'h-[calc(100vh-280px)] p-0 px-4' : 'space-y-6'}`}>
        {(locationStatus === 'loading' || isLoadingPlaces || isSearching) && (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-surface border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
            <p className="text-sm font-medium animate-pulse">
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
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,227,118,0.4)] hover:scale-105 transition active:scale-95 text-black"
        >
          {viewMode === 'list' ? <MapIcon size={24} /> : <List size={24} />}
        </button>
      </div>
    </div>
  );
};
