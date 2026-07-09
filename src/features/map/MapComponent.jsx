import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Resolves default Leaflet icon missing issues in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

/**
 * createProviderIcon Utility
 * Creates a themed marker icon based on partner role and branding.
 */
const createProviderIcon = (provider) => {
  const role = provider.role || "mechanic";
  const avatar = provider.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.full_name || 'C'}`;
  
  // Role-based color palette and shorthand icons
  const roleStyles = {
    valet: { color: "#2563eb", bg: "bg-blue-600", icon: "V" },
    parking: { color: "#059669", bg: "bg-teal-500", icon: "P" },
    mechanic: { color: "#ea580c", bg: "bg-orange-600", icon: "M" },
    parts: { color: "#4f46e5", bg: "bg-primary-600", icon: "S" },
    default: { color: "#475569", bg: "bg-slate-600", icon: "*" }
  };

  const style = roleStyles[role] || roleStyles.default;

  return L.divIcon({
    className: "custom-provider-marker",
    html: `
      <div class="relative w-12 h-12 flex items-center justify-center animate-in zoom-in duration-500">
        <!-- Marker Shape -->
        <div class="absolute inset-0 ${style.bg} rounded-full rotate-45 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-black/20 dark:border-white/20"></div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 ${style.bg} rotate-45 border-r-2 border-b-2 border-black/20 dark:border-white/20"></div>
        
        <!-- Role Indicator Badge -->
        <div class="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-slate-900 z-10">
          <span class="text-[8px] font-black text-slate-950">${style.icon}</span>
        </div>

        <!-- Provider Avatar -->
        <div class="relative z-1 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
          <img src="${avatar}" 
               class="w-full h-full object-cover" 
               alt="Provider" />
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

/**
 * RecenterMap Component
 * Internal component to handle programmatic map recentering.
 */
const RecenterMap = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

/**
 * MapComponent
 * Displays a Leaflet map with user location and nearby service providers.
 */
/**
 * createAlertIcon Utility
 * Creates a custom Leaflet icon for road alerts (radars, speed bumps, accidents, etc.)
 */
const createAlertIcon = (type) => {
  let bgClass = "bg-rose-600";
  let symbol = "R"; // Radar/EDS
  let pulse = "";
  
  if (type === "eds") {
    bgClass = "bg-rose-700 ring-rose-500/50";
    symbol = "EDS";
    pulse = "animate-pulse";
  } else if (type === "radar") {
    bgClass = "bg-rose-500 ring-rose-400/50";
    symbol = "RAD";
    pulse = "animate-pulse";
  } else if (type === "bump") {
    bgClass = "bg-amber-500 ring-amber-400/50";
    symbol = "KSS"; // Kasis
  } else if (type === "fuel") {
    bgClass = "bg-teal-500 ring-emerald-500/50";
    symbol = "AKR"; // Akaryakıt
  } else if (type === "accident") {
    bgClass = "bg-orange-500 ring-orange-400/50";
    symbol = "KZA"; // Kaza
  }

  return L.divIcon({
    className: "custom-alert-marker",
    html: `
      <div class="relative w-10 h-10 flex items-center justify-center ${pulse}">
        <div class="absolute inset-0 ${bgClass} rounded-full rotate-45 shadow-[0_0_10px_rgba(0,0,0,0.3)] border border-white/20"></div>
        <div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 ${bgClass} rotate-45 border-r border-b border-white/20"></div>
        <span class="relative z-10 text-[9px] font-black text-white tracking-tighter uppercase">${symbol}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const MapComponent = ({ userLocation, providers = [], roadAlerts = [], onProviderSelect }) => {
  // CartoDB Dark Matter tiles for premium dark mode aesthetic
  const titleUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  if (!userLocation) return null;

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 animate-fade-in relative">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full grayscale-[0.5] invert-[0.05] brightness-[0.9]"
        zoomControl={false}
      >
        <TileLayer attribution={attribution} url={titleUrl} />
        <RecenterMap center={userLocation} />

        {/* User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="text-center font-bold">Buradasınız</div>
          </Popup>
        </Marker>

        {/* Provider Markers */}
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={[
              provider.lat || userLocation.lat + (Math.random() - 0.5) * 0.01,
              provider.lng || userLocation.lng + (Math.random() - 0.5) * 0.01,
            ]}
            icon={createProviderIcon(provider)}
            eventHandlers={{
              click: () => onProviderSelect?.(provider),
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 min-w-[120px]">
                <h4 className="font-bold text-slate-900 leading-tight">
                  {provider.full_name || "Usta/Dükkan"}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {provider.company_name || "Hızlı Servis"}
                </p>
                <button className="mt-2 w-full bg-primary-600 text-slate-900 dark:text-white text-[9px] font-black uppercase py-1.5 rounded-lg active-scale transition-all">
                  Teklif İste
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Road Alert Markers */}
        {roadAlerts.map((alert) => {
          if (!alert.lat || !alert.lng) return null;
          return (
            <Marker
              key={alert.id}
              position={[Number(alert.lat), Number(alert.lng)]}
              icon={createAlertIcon(alert.type)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1.5 min-w-[160px] text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      alert.type === 'eds' || alert.type === 'radar' ? 'bg-rose-500 animate-pulse' :
                      alert.type === 'bump' ? 'bg-amber-500' :
                      alert.type === 'fuel' ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}></span>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider leading-none">
                      {alert.title}
                    </h4>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-1 leading-normal">
                    {alert.message}
                  </p>
                  {alert.location && (
                    <p className="text-[8px] text-slate-500 dark:text-slate-400 font-mono mt-1 uppercase">
                      📍 {alert.location}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <span>Paylaşan: {alert.reporter || "Sürücü"}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-black">▲ {alert.votes || 1} Oy</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Premium Overlay Gradient */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-[400]"></div>
    </div>
  );
};

export default MapComponent;
