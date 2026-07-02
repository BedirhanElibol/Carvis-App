# Sürüş Modu ve EDS/Radar Bildirim Sistemi (Drive Mode & Proximity Alerts)

Müşterinin seyir halindeyken EDS, Radar ve Kasis gibi noktaları fark edebilmesi için statik harita tek başına yetersizdir. GPS tabanlı bir "Sürüş Modu" (Drive Mode) ve bir **Erken Uyarı Sistemi** tasarlanmalıdır.

## Yaratılacak Katmanlar (Orchestration Plan)

### 1. Drive Mode UI (Frontend Specialist)
- **Seyir Modu Butonu:** Harita üzerinde "Sürüşü Başlat" butonu. Tıklandığında harita dinamik olarak kullanıcının `userLocation` verisine kilitlenir.
- **Head-Up Display (HUD) Overlay:** Ekranda anlık hız (GPS bazlı hesaplanabilir), sonraki EDS/Kasis'e kalan mesafe ve EDS tipi (Örn: "Hız Koridoru - 82 km/s") gösterilir.

### 2. Proximity & Geofencing (Backend / Logic Specialist)
- **Haversine Distance Calculator:** Her GPS `userLocation` güncellemesinde, çevredeki EDS noktalarına olan kuş uçuşu (veya tahmini rota) mesafesi hesaplanır.
- **Uyarı Eşikleri (Thresholds):**
  - **1 KM Kala:** Bilgi (Mavi/Sarı görsel uyarı)
  - **500 Metre Kala:** Kritik Uyarı (Kırmızı yanıp sönen HUD paneli)
- **Ortalama Hız Hesaplama:** Hız koridoru başlangıcından geçildiğinde bir zamanlayıcı başlar, anlık ortalama hız hesaplanarak sürücü uyarılır.

### 3. Audio / Visual Alerts (UX & Accessibility)
- Sürücü haritaya bakmıyorken bile fark edebilmesi için **Sesli Asistan (TTS veya basit zil/uyarı sesleri)** entegrasyonu.
- Ekranın kenarlarında parlayan acil durum çerçeveleri (Red/Orange glow).

---

## User Review Required
Lütfen aşağıdaki sorulara karar verelim:
1. Sesli uyarılar (Örn: "500 metre sonra hız koridoru") tarayıcının Web Speech API'si ile (robotik ses) mi okunsun, yoksa standart bir "BİP BİP" alarm sesi mi kullanalım?
2. Sürüş modu arayüzü tam ekran (Full-screen navigasyon stili) mu olsun, yoksa şu anki haritanın üzerine binen bir widget/panel olarak mı kalsın?
