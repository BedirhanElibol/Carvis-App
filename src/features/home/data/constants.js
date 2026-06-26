import * as Icons from "lucide-react";

export const serviceCategories = [
  { name: "Periyodik Bakım", icon: Icons.Wrench, color: "text-teal-400", bg: "bg-teal-500/10", border: "hover:border-teal-500/30", route: "/app/mechanics" },
  { name: "Fren Sistemi", icon: Icons.Activity, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", route: "/app/mechanics" },
  { name: "Lastik & Rot", icon: Icons.Disc, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
  { name: "Akıllı Vale", icon: Icons.Key, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", route: "/app/valet" },
  { name: "Yedek Parça", icon: Icons.Package, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", route: "/app/parts" },
  { name: "Detaylı Temizlik", icon: Icons.Sparkles, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", route: "/app/mechanics" },
];

export const featuredDeals = [
  {
    id: "deal-1",
    title: "Mobil 1 Yağ Değişim & Check-up Paketi",
    originalPrice: 2200,
    price: 1690,
    rating: 4.9,
    reviewsCount: 124,
    provider: "Maslak Pro Servis",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300",
    badge: "%23 İNDİRİM"
  },
  {
    id: "deal-2",
    title: "Kış Muayenesi & Detaylı Kontrol",
    originalPrice: 950,
    price: 0,
    rating: 4.8,
    reviewsCount: 82,
    provider: "Borusan Oto Maslak",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300",
    badge: "ÜCRETSİZ"
  },
  {
    id: "deal-3",
    title: "Ön Disk & Brembo Balata Değişimi",
    originalPrice: 3800,
    price: 3190,
    rating: 5.0,
    reviewsCount: 46,
    provider: "Ostim Yıldız Otomotiv",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=300",
    badge: "UYUM GARANTİLİ"
  }
];

export const popularProviders = [
  {
    id: "prov-1",
    name: "Maslak Pro Servis",
    distance: "1.2 km",
    rating: 4.9,
    specialty: "BMW, Audi, Mercedes, VW Group",
    address: "Atatürk Oto Sanayi Sitesi 2. Kısım, Maslak",
    features: ["Vale Hizmeti", "Garantili Parça", "7/24 SOS"]
  },
  {
    id: "prov-2",
    name: "Ostim Yıldız Otomotiv",
    distance: "3.1 km",
    rating: 4.8,
    specialty: "Fiat, Renault, Toyota, General Maintenance",
    address: "Ostim Organize Sanayi Bölgesi, Ankara",
    features: ["Hızlı Servis", "Orijinal Yedek Parça"]
  }
];

export const compatibleParts = [
  {
    id: "part-1",
    name: "Castrol EDGE 5W-30 Motor Yağı (4L)",
    brand: "Castrol",
    price: 1620,
    oldPrice: 1850,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=200",
    badge: "Süper Fiyat"
  },
  {
    id: "part-2",
    name: "Bosch Ön Fren Balata Seti (Golf Uyumlu)",
    brand: "Bosch",
    price: 1980,
    oldPrice: 2200,
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200",
    badge: "Uyum Garantili"
  },
  {
    id: "part-3",
    name: "Fil Filtre Periyodik Filtre Seti (Hava/Yağ)",
    brand: "Fil Filtre",
    price: 980,
    oldPrice: 1100,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200",
    badge: "En Popüler"
  }
];
