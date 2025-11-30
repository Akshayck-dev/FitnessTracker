
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Studio } from '../types';

interface MapViewProps {
  studios: Studio[];
  userLocation: { lat: number; lng: number } | null;
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1c2625" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1c2625" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#121a19" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00e376" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d3748" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b9" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const MapView: React.FC<MapViewProps> = ({ studios, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const lastCenteredPos = useRef<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  
  // Track live location internally
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(userLocation);

  // Sync initial prop - only if we don't have a location yet
  useEffect(() => {
    if (userLocation && !currentLocation) {
        setCurrentLocation(userLocation);
    }
  }, [userLocation]);

  // Real-time location tracking
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const newPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            setCurrentLocation(newPos);
        },
        (error) => console.log('Map Watch Position Error', error),
        { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
        }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    if (mapInstanceRef.current) return;

    // Default center if no location provided initially
    const center = currentLocation || { lat: 37.7749, lng: -122.4194 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
    });
  }, []);

  // Update User Marker & Smart Re-centering
  useEffect(() => {
      if (!mapInstanceRef.current || !window.google || !currentLocation) return;

      // 1. Update User Marker Position
      if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(currentLocation);
      } else {
          userMarkerRef.current = new window.google.maps.Marker({
            position: currentLocation,
            map: mapInstanceRef.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6", // Blue dot
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
            title: "You are here",
            zIndex: 999
          });
      }

      // 2. Smart Re-centering
      // Logic: If map hasn't been centered on user yet, do it.
      // If it has, only do it if user moves significantly (> 500m).
      if (lastCenteredPos.current) {
          const distKm = getDistanceFromLatLonInKm(
              lastCenteredPos.current.lat, 
              lastCenteredPos.current.lng, 
              currentLocation.lat, 
              currentLocation.lng
          );
          
          if (distKm > 0.5) {
              mapInstanceRef.current.panTo(currentLocation);
              lastCenteredPos.current = currentLocation;
          }
      } else {
          // First time centering
          mapInstanceRef.current.panTo(currentLocation);
          lastCenteredPos.current = currentLocation;
      }

  }, [currentLocation]);

  // Update Studio Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    studios.forEach((studio) => {
      const marker = new window.google.maps.Marker({
        position: studio.coordinates,
        map: mapInstanceRef.current,
        title: studio.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#00e376",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#000000",
        },
      });

      const contentString = `
        <div style="color: #000; padding: 4px; min-width: 150px;">
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${studio.name}</h3>
          <p style="font-size: 12px; color: #555;">${studio.distance || 'Nearby'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
             <span style="font-size: 12px; font-weight: bold; color: ${studio.isOpen ? '#059669' : '#dc2626'};">
                ${studio.isOpen ? 'Open' : 'Closed'}
             </span>
             <button id="btn-${studio.id}" style="background: #1c2625; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                Details
             </button>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener("click", () => {
        // Close others
        markersRef.current.forEach(m => m.infoWindow?.close());
        marker.infoWindow = infoWindow; // attach for tracking
        
        infoWindow.open({
          anchor: marker,
          map: mapInstanceRef.current,
        });

        // Attach event listener after DOM is ready
        setTimeout(() => {
            const btn = document.getElementById(`btn-${studio.id}`);
            if (btn) {
                btn.onclick = () => navigate(`/studio/${studio.id}`);
            }
        }, 100);
      });

      markersRef.current.push(marker);
    });

  }, [studios, navigate]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-secondary" />
  );
};
