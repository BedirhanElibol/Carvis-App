import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Star } from "lucide-react";
import { useUI } from "../../context/UIContext";

// Fix for default Leaflet icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Icon generator for different provider types
const createCustomIcon = (type, isHovered) => {
  let colorClass = "bg-orange-500";
  if (type === "Oto Yıkama") colorClass = "bg-blue-500";
  else if (type === "EDS") colorClass = "bg-red-600 animate-pulse";
  
  const ringClass = isHovered 
    ? (type === "EDS" ? "ring-4 ring-red-500/50 scale-125" : "ring-4 ring-orange-500/50 scale-125") 
    : "ring-2 ring-white dark:ring-slate-900";
  
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div class="w-4 h-4 rounded-full ${colorClass} ${ringClass} shadow-lg transition-transform duration-300"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
};

const LocationMap = ({ 
  center = { lat: 41.0082, lng: 28.9784 }, 
  markers = [], 
  hoveredPin = null,
  zoom = 12,
  className = "w-full h-full rounded-xl"
}) => {
  const { t } = useUI();
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* CSS to enable dark mode map via filters */}
      <style>{`
        .dark .leaflet-layer,
        .dark .leaflet-control-zoom-in,
        .dark .leaflet-control-zoom-out,
        .dark .leaflet-control-attribution {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-container {
          background-color: transparent !important;
          font-family: inherit !important;
        }
      `}</style>

      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile}
        tap={!L.Browser.mobile}
        className="w-full h-full z-0"
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Location Center Pin (Virtual) */}
        <Marker 
          position={[center.lat, center.lng]}
          icon={L.divIcon({
            className: "custom-leaflet-marker",
            html: `<div class="w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center ring-4 ring-slate-900/20 dark:ring-white/20 z-50">
                     <div class="w-2 h-2 rounded-full bg-white dark:bg-slate-900"></div>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup className="custom-popup">
            <div className="text-center font-bold text-slate-900">{t.selectedLocationLabel || "Seçili Konum"}</div>
          </Popup>
        </Marker>

        {/* Real Providers Pins */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.id}-${index}`}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type, hoveredPin === marker.id)}
            zIndexOffset={hoveredPin === marker.id ? 1000 : 0}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[150px]">
                <div className={`text-xs font-black uppercase tracking-widest ${marker.type === "EDS" ? "text-red-500" : "text-orange-500"} mb-1`}>{marker.type}</div>
                <div className="font-bold text-slate-900 mb-2">{marker.name}</div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>{marker.distance || "Resmi EDS"}</span>
                  </div>
                  {marker.rating && (
                    <div className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{marker.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Overlay Gradient to blend with background smoothly */}
      <div className="absolute inset-0 pointer-events-none rounded-xl border border-black/5 dark:border-white/5 z-10" />
    </div>
  );
};

export default LocationMap;
