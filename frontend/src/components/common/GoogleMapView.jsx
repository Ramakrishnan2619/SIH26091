import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  ExternalLink,
  Store,
  Compass,
  Navigation,
  Info,
  Maximize2
} from 'lucide-react';

// Haversine distance calculator in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export function GoogleMapView({
  latitude = 10.0524,
  longitude = 78.3344,
  radiusKm = 10,
  places = [],
  showPlaces = true,
  originName = "Proposed Enterprise",
  interactive = true,
  height = "360px",
  showRadius = true,
  showList = false,
  className = ""
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const circleRef = useRef(null);

  const [mapLayer, setMapLayer] = useState('roadmap'); // 'roadmap' | 'satellite' | 'terrain'
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(null);

  const latNum = Number(latitude) || 10.0524;
  const lngNum = Number(longitude) || 78.3344;

  // Only display shops if explicitly requested and places are provided
  const displayPlaces = (showPlaces && Array.isArray(places) && places.length > 0) ? places : [];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove existing map instance if any
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [latNum, lngNum],
      zoom: 13,
      zoomControl: interactive,
      attributionControl: false,
      scrollWheelZoom: interactive
    });

    leafletMapRef.current = map;

    // Tile URLs (Google Maps standard tiles)
    const tileUrls = {
      roadmap: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Hybrid (satellite + streets)
      terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
    };

    const tileLayer = L.tileLayer(tileUrls[mapLayer] || tileUrls.roadmap, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Add 10km Catchment Circle
    if (showRadius) {
      circleRef.current = L.circle([latNum, lngNum], {
        radius: radiusKm * 1000,
        color: '#009DB3',
        weight: 2,
        dashArray: '5, 8',
        fillColor: '#02C6E1',
        fillOpacity: 0.12
      }).addTo(map);
    }

    // Custom HTML Marker Icons: Proposed Enterprise marked with Red Star Circle as requested
    const originIcon = L.divIcon({
      className: 'custom-origin-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #DC2626; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">
            ★
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const originMarker = L.marker([latNum, lngNum], { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 180px;">
        <div style="font-size: 13px; font-weight: 800; color: #DC2626;">${originName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Your Enterprise Location (GPS Center)</div>
        <div style="margin-top: 6px; font-size: 10px; background: #FEE2E2; color: #DC2626; padding: 3px 6px; border-radius: 6px; font-weight: 700; display: inline-block;">
          Center of ${radiusKm}km Catchment
        </div>
      </div>
    `);

    // Place Markers for Identified Competitor Shops
    markersRef.current = {};
    displayPlaces.forEach((place, idx) => {
      const pLat = Number(place.latitude) || latNum + (Math.sin(idx + 1) * 0.012);
      const pLng = Number(place.longitude) || lngNum + (Math.cos(idx + 1) * 0.012);
      const distance = calculateDistanceKm(latNum, lngNum, pLat, pLng);

      const shopIcon = L.divIcon({
        className: 'custom-shop-icon',
        html: `
          <div style="width: 28px; height: 34px; position: relative; cursor: pointer; transform: translate(-50%, -100%);">
            <svg viewBox="0 0 24 32" width="28" height="34">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#EA4335" stroke="#FFFFFF" stroke-width="1.5" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"/>
              <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
              <circle cx="12" cy="11" r="2.5" fill="#C5221F"/>
            </svg>
            <div style="position: absolute; top: -6px; right: -6px; background: #1e293b; color: #ffffff; border-radius: 10px; font-size: 9px; font-weight: 800; padding: 1px 4px; border: 1px solid white;">
              #${idx + 1}
            </div>
          </div>
        `,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([pLat, pLng], { icon: shopIcon }).addTo(map);

      const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || ''))}`;

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 210px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #EA4335; color: white; border-radius: 4px; padding: 1px 5px; font-size: 10px; font-weight: 800;">#${idx + 1}</span>
            <span style="font-size: 12px; font-weight: 800; color: #0f172a;">${place.name}</span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.3;">${place.address || 'Local Revenue Cluster'}</div>
          <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; border-top: 1px solid #f1f5f9; pt: 4px;">
            <span style="color: #0284c7; font-weight: 700;">${distance} km away</span>
            <span style="color: #64748b; font-size: 10px;">${place.types?.[0] || 'Competitor Shop'}</span>
          </div>
          <div style="margin-top: 8px;">
            <a href="${googleMapsSearchUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #006B7A; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
              Open in Google Maps ↗
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPlaceIndex(idx);
      });

      markersRef.current[idx] = marker;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [latNum, lngNum, radiusKm, mapLayer, showRadius]);

  const handleSelectPlace = (idx) => {
    setSelectedPlaceIndex(idx);
    const place = displayPlaces[idx];
    if (!place || !leafletMapRef.current) return;

    const pLat = Number(place.latitude) || latNum + (Math.sin(idx + 1) * 0.012);
    const pLng = Number(place.longitude) || lngNum + (Math.cos(idx + 1) * 0.012);

    leafletMapRef.current.flyTo([pLat, pLng], 15, { duration: 1 });

    const marker = markersRef.current[idx];
    if (marker) {
      setTimeout(() => marker.openPopup(), 400);
    }
  };

  const handleRecenter = () => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([latNum, lngNum], 13, { duration: 0.8 });
    setSelectedPlaceIndex(null);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border-2 border-[#79E4F3] bg-slate-50 shadow-xs flex flex-col ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#006B7A]">
          <Compass className="w-4 h-4 text-[#009DB3]" />
          <span>{displayPlaces.length > 0 ? `Nearby Business Density & Market Map (${radiusKm} km)` : `Local Market Area (${radiusKm} km Radius)`}</span>
          {displayPlaces.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {displayPlaces.length} Mapped Shops
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMapLayer('roadmap')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                mapLayer === 'roadmap' ? 'bg-white text-[#006B7A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                mapLayer === 'satellite' ? 'bg-white text-[#006B7A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('terrain')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                mapLayer === 'terrain' ? 'bg-white text-[#006B7A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terrain
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#006B7A] hover:bg-slate-50 transition cursor-pointer"
            title="Recenter to Proposed Enterprise"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-white bg-[#006B7A] hover:bg-[#005561] px-2.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. Map Canvas & Optional Side Shop List */}
      <div className="relative flex-1 flex flex-col md:flex-row" style={{ minHeight: height }}>
        {/* Interactive Leaflet Map Canvas */}
        <div className="relative flex-1 h-full min-h-[300px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: height }} />

          {/* Bottom Attribution and GPS Pill */}
          <div className="absolute bottom-2 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs pointer-events-none z-[400]">
            Center: {latNum.toFixed(4)}°N, {lngNum.toFixed(4)}°E • Map data © Google
          </div>
        </div>

        {/* 3. Interactive Shop List (if showList is true or on desktop) */}
        {showList && (
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col max-h-[380px] overflow-y-auto">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Competitor Shops Found</span>
              <span className="text-[10px] text-slate-500">Tap to locate</span>
            </div>
            <div className="divide-y divide-slate-100">
              {displayPlaces.map((shop, idx) => {
                const isSelected = selectedPlaceIndex === idx;
                const pLat = Number(shop.latitude) || latNum + (Math.sin(idx + 1) * 0.012);
                const pLng = Number(shop.longitude) || lngNum + (Math.cos(idx + 1) * 0.012);
                const dist = calculateDistanceKm(latNum, lngNum, pLat, pLng);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPlace(idx)}
                    className={`w-full text-left p-3 transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected ? 'bg-cyan-50/70 border-l-4 border-l-[#006B7A]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs font-black">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{shop.name}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{shop.address || 'Local Cluster'}</div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="font-semibold text-cyan-800">{dist} km away</span>
                        <span className="text-slate-400 capitalize">{shop.types?.[0]?.replace(/_/g, ' ') || 'Shop'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Legend Strip */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] border border-white shadow-xs flex items-center justify-center text-[8px] text-white font-bold">★</span>
            <span>Your Business Location</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
            <span>Nearby Businesses</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full border border-[#009DB3] bg-[#02C6E1]/30" />
            <span>10 km Market Area</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Click any pin or shop to inspect distance and location in Google Maps
        </div>
      </div>
    </div>
  );
}
