# Performans Optimizasyonu ve Takılma (Stutter/Freeze) Çözüm Planı

Uygulamadaki takılma ve yavaşlamaların (özellikle `CustomerHome.jsx` sayfasında) temel nedenleri:
1. **Devasa Component Boyutu (1384 satır):** Tüm arayüz (arama, harita, kampanyalar, yakıt fiyatları) tek bir component içinde.
2. **Gereksiz Re-render'lar:** Haritadaki bir pin'in üzerine gelindiğinde (`hoveredPin` state değişimi) veya arama kutusuna yazı yazıldığında tüm sayfa (ve harita/diğer ağır bileşenler) baştan render ediliyor.
3. **Ağır Effect'ler:** Yakıt fiyatları için yazılan karmaşık `setInterval` ve proxy zinciri doğrudan UI thread'i ve state'i meşgul ediyor.

## Proposed Changes

### src/features/home/
#### [MODIFY] CustomerHome.jsx
- Component içi devasa JSX blokları (`searchAndCategoriesPanel`, `featuredDealsPanel`, `popularProvidersPanel`, vb.) ayrı bileşenlere taşınacak.
- State'ler (`searchQuery`, `hoveredPin`, `fuelPrices`) ilgili alt bileşenlere veya custom hook'lara dağıtılacak. Böylece biri değiştiğinde hepsi render edilmeyecek.

#### [NEW] components/SearchAndCategoriesPanel.jsx
- Arama kutusu ve kategorileri içerecek. Sadece arama state'i değiştiğinde kendisi güncellenecek. `React.memo` ile sarılacak.

#### [NEW] components/PopularProvidersPanel.jsx
- Harita ve servis noktası listesi buraya taşınacak.
- `hoveredPin` state'i sadece bu bileşeni etkileyecek, tüm sayfayı dondurmayacak.

#### [NEW] components/FeaturedDealsPanel.jsx
- Fırsatlar ve kampanyalar kısmı. `React.memo` ile optimize edilecek.

#### [NEW] components/HowItWorksPanel.jsx
- Statik bilgi paneli. Gereksiz renderları önlemek için `React.memo` kullanılacak.

### src/hooks/
#### [NEW] useFuelPrices.js
- `CustomerHome` içindeki 100+ satırlık yakıt fiyatı çekme ve proxy (yedekleme) mantığı bağımsız bir hook'a taşınacak.
- Effect temizlikleri (cleanup) ve interval yönetimi daha stabil hale getirilecek.

## Verification Plan
- `CustomerHome` sayfasında haritadaki pinler üzerinde mouse ile gezinildiğinde (hover) sayfanın geri kalanının donup donmadığı test edilecek.
- Arama kutusuna hızlıca yazı yazıldığında klavye gecikmesi (input lag) olup olmadığı kontrol edilecek.
