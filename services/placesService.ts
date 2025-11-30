
import { Studio, Review, MembershipPlan, ClassSession } from '../types';
import { MOCK_CLASSES, MOCK_REVIEWS } from '../constants';

declare global {
  interface Window {
    google: any;
    isGoogleMapsLoaded: boolean;
  }
}

// Mock data to inject into Google Places results (since API doesn't provide these)
const MOCK_MEMBERSHIPS: MembershipPlan[] = [
  { id: 'm1', name: 'Day Pass', price: '$25', period: 'one time', features: ['Gym Access', 'Locker Use'] },
  { id: 'm2', name: 'Monthly Pro', price: '$89', period: 'per month', features: ['Unlimited Access', 'Group Classes', 'Sauna'], isPopular: true },
  { id: 'm3', name: 'Annual Elite', price: '$950', period: 'per year', features: ['All Access', 'Free Guest Pass', 'Personal Training Session'] },
];

const mapGooglePlaceToStudio = (place: any, lat: number, lng: number): Studio => {
  const placeLoc = place.geometry.location;
  // If we don't have user lat/lng (global search), use the place's own location as reference (distance 0)
  // or default to 0 to avoid NaNs.
  const distKm = (lat && lng) ? getDistanceFromLatLonInKm(lat, lng, placeLoc.lat(), placeLoc.lng()) : 0;
  const distMi = distKm * 0.621371;

  // Get photo URL if available
  let photoUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
  if (place.photos && place.photos.length > 0) {
    photoUrl = place.photos[0].getUrl({ maxWidth: 400 });
  }

  // Handle opening hours safely to avoid open_now deprecation warning where possible
  let isOpen = true; // Default assumption if no info
  if (place.opening_hours) {
      if (typeof place.opening_hours.isOpen === 'function') {
          isOpen = place.opening_hours.isOpen();
      } else if (place.opening_hours.open_now !== undefined) {
          isOpen = place.opening_hours.open_now;
      }
  }

  return {
    id: place.place_id,
    name: place.name,
    type: place.types ? place.types.slice(0, 3).map((t: string) => t.replace('_', ' ')) : ['Gym'],
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    distance: distMi > 0 ? `${distMi.toFixed(1)} mi` : '—',
    address: place.vicinity || place.formatted_address || place.name,
    isVerified: false,
    isOpen: isOpen,
    closingTime: '10:00 PM', 
    priceLevel: place.price_level || 2,
    image: photoUrl,
    gallery: [photoUrl],
    description: `A highly rated fitness destination located at ${place.vicinity || place.formatted_address}.`,
    amenities: ['Cardio', 'Weights', 'Air Conditioning', 'Restrooms', 'Parking', 'WiFi'],
    coordinates: {
      lat: placeLoc.lat(),
      lng: placeLoc.lng()
    },
    phone: 'N/A',
    website: '',
    // Inject detailed mock data for tabs
    membershipPlans: MOCK_MEMBERSHIPS,
    classes: MOCK_CLASSES,
    reviews: [] 
  };
};

export const fetchNearbyGyms = async (lat: number, lng: number, radius: number = 5000): Promise<Studio[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps API not loaded. Falling back to mock data.');
      reject('Google Maps API not loaded');
      return;
    }

    const location = new window.google.maps.LatLng(lat, lng);
    const request = {
      location: location,
      radius: radius, // Set to 5km (5000 meters) for "nearby" relevance
      type: 'gym',
      keyword: 'fitness'
    };

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.nearbySearch(request, (results: any[], status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const studios = results.map(place => mapGooglePlaceToStudio(place, lat, lng));
        resolve(studios);
      } else {
        console.error('Places API Search failed:', status);
        reject(status);
      }
    });
  });
};

export const searchGyms = async (query: string, lat?: number, lng?: number): Promise<Studio[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject('Google Maps API not loaded');
      return;
    }

    const request: any = {
      query: query,
    };

    // Only add location bias if coordinates are provided
    if (lat && lng) {
        const location = new window.google.maps.LatLng(lat, lng);
        request.location = location;
        request.radius = 5000;
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.textSearch(request, (results: any[], status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Pass lat/lng if available for distance calc, otherwise 0
        const studios = results.map(place => mapGooglePlaceToStudio(place, lat || 0, lng || 0));
        resolve(studios);
      } else {
        console.error('Places API Text Search failed:', status);
        // If ZERO_RESULTS, resolve empty array instead of rejecting
        if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(status);
        }
      }
    });
  });
};

export const fetchGymDetails = async (placeId: string): Promise<Studio> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject('Google Maps API not loaded');
      return;
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    const request = {
      placeId: placeId,
      fields: [
        'name', 'rating', 'user_ratings_total', 'formatted_address', 
        'formatted_phone_number', 'website', 'photos', 'opening_hours', 
        'geometry', 'types', 'reviews', 'price_level', 'utc_offset_minutes'
      ]
    };

    service.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        
        // Process Photos
        const gallery = place.photos 
          ? place.photos.map((p: any) => p.getUrl({ maxWidth: 800 })) 
          : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'];

        // Determine open status and closing time
        let isOpen = false;
        let closingTime = 'N/A';
        
        if (place.opening_hours) {
           isOpen = place.opening_hours.isOpen ? place.opening_hours.isOpen() : false;
           closingTime = isOpen ? 'Later' : 'Closed';
        }

        // Map Google Reviews to our Interface
        const reviews: Review[] = place.reviews ? place.reviews.map((r: any, idx: number) => ({
            id: `g_review_${idx}`,
            userName: r.author_name,
            userImage: r.profile_photo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + idx,
            rating: r.rating,
            date: r.relative_time_description,
            text: r.text,
            helpfulCount: 0
        })) : MOCK_REVIEWS;

        const studio: Studio = {
          id: placeId,
          name: place.name,
          type: place.types ? place.types.slice(0, 3).map((t: string) => t.replace('_', ' ')) : ['Gym'],
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          distance: '', // Cannot calculate without user loc, will remain empty or handle in UI
          address: place.formatted_address,
          isVerified: false,
          isOpen: isOpen,
          closingTime: closingTime,
          priceLevel: place.price_level || 2,
          image: gallery[0],
          gallery: gallery,
          description: `Welcome to ${place.name}. Located at ${place.formatted_address}, we offer top-tier fitness facilities for all levels.`,
          amenities: ['Cardio', 'Weights', 'Air Conditioning', 'Restrooms', 'Parking', 'WiFi'],
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          phone: place.formatted_phone_number || 'N/A',
          website: place.website || '',
          // Inject detailed mock data for tabs
          membershipPlans: MOCK_MEMBERSHIPS,
          classes: MOCK_CLASSES,
          reviews: reviews
        };
        
        resolve(studio);
      } else {
        reject(status);
      }
    });
  });
};

export const geocodeLocation = async (address: string): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject('Google Maps API not loaded');
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        reject(status);
      }
    });
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject('Google Maps API not loaded');
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
         // Try to construct a readable address: City, State
         let city = '';
         let state = '';
         
         for (const component of results[0].address_components) {
             if (component.types.includes('locality')) {
                 city = component.short_name;
             }
             if (component.types.includes('administrative_area_level_1')) {
                 state = component.short_name;
             }
         }
         
         if (city) {
             resolve(state ? `${city}, ${state}` : city);
         } else {
             // Fallback to formatted address's first part (usually street or area)
             const fallback = results[0].formatted_address.split(',')[0];
             resolve(fallback);
         }
      } else {
        reject(status);
      }
    });
  });
};

export const getPlacePredictions = async (input: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject('Google Maps API not loaded');
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    // Use (regions) or (cities) to filter predictions to geographical locations
    service.getPlacePredictions({ input, types: ['(cities)'] }, (predictions: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        resolve(predictions);
      } else {
        // Resolve empty if no results or error to handle gracefully in UI
        resolve([]);
      }
    });
  });
};

// Helper for distance calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
