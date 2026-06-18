# ================================================================
# App Store Yükleme Rehberi — Rapidsy
# ================================================================

## Ön Koşullar (Senin Yapman Gerekenler)

- [ ] Apple Developer Program üyeliği ($99/yıl) → https://developer.apple.com/programs/
- [ ] Mac + Xcode 16+ kurulu
- [ ] App Store Connect hesabı → https://appstoreconnect.apple.com

---

## Adım 1: Capacitor Kurulumu (Terminal)

```bash
# Mac'te proje klasöründe çalıştır:
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/splashscreen @capacitor/status-bar @capacitor/push-notifications @capacitor/geolocation @capacitor/camera

# capacitor.config.ts zaten hazır
npx cap init --web-dir dist  # Eğer ios/ klasörü yoksa

# iOS projesi oluştur
npx cap add ios

# Build + Sync
npm run cap:build
```

---

## Adım 2: Xcode Ayarları

```bash
# Xcode'u aç
npm run cap:ios
# veya
npx cap open ios
```

Xcode'da şunları yap:
1. **Bundle ID:** `com.rapidsy.app` (Signing & Capabilities)
2. **Team:** Apple Developer hesabınla bağla
3. **Version:** 1.0.0, Build: 1
4. **ios/Info.plist.additions.xml** dosyasındaki izinleri orijinal `Info.plist`'e ekle
5. **ios/PrivacyInfo.xcprivacy** dosyasını App target'ına ekle (File → Add Files)
6. **Splash screen:** ios/PrivacyInfo.xcprivacy → Build Phases → Copy Bundle Resources
7. App ikonunu **pwa-icon-1024.png** olarak Assets.xcassets/AppIcon'a ekle

---

## Adım 3: TestFlight

1. Xcode → Product → Archive
2. Distribute App → App Store Connect → TestFlight
3. En az 1-2 gün test et
4. Internal testerlarla test ettikten sonra submit et

---

## Adım 4: App Store Connect Metadata

| Alan | İçerik |
|------|--------|
| **App Name** | Rapidsy - Akıllı Araç Platformu |
| **Subtitle** | Servis, Usta, Parça & AI Asistan |
| **Category** | Utilities (Primary), Lifestyle (Secondary) |
| **Age Rating** | 4+ |
| **Privacy Policy URL** | https://[senin-deploy-url]/privacy-policy |
| **Keywords** | araba,servis,usta,otopark,yol yardım,ai mekanik,fren,yağ |
| **Demo Account** | Reviewer için bir test hesabı oluştur |

### App Açıklaması (TR)
```
Rapidsy, Türkiye'nin ilk AI destekli akıllı araç platform uygulamasıdır.

✦ AI Mekanik Asistan: Arıza lambanızı taratalım, anında tanı alalım
✦ Otomotiv Marketplace: Orijinal ve yan sanayi parça kategorileri
✦ Usta Bul: Yakınındaki onaylı servislere teklif gönderin
✦ SOS Yol Yardım: Tek tuşla acil çekici ve yardım çağırın
✦ Araç Takibi: Bakım, muayene ve sigorta hatırlatmaları

Rapidsy Güvencesiyle Alışveriş Yapın.
```

---

## Adım 5: App Store Fotoğrafları (Gerekli Boyutlar)

| Cihaz | Boyut | Adet |
|-------|-------|------|
| iPhone 6.7" (15 Pro Max) | 1290 × 2796 px | min 3 |
| iPhone 6.1" (15) | 1179 × 2556 px | min 3 |
| iPad Pro 12.9" (isteğe bağlı) | 2048 × 2732 px | min 3 |

**İpucu:** Simulator'da çalıştır → Screenshot al → Boyutları kontrol et

---

## Review Notları (App Review ekibine)

```
App requires a user account. Test credentials:
Email: reviewer@rapidsy.app
Password: RapidsyTest2026!

The app is an automotive marketplace and AI mechanic assistant for the Turkish market.
Main features: AI diagnosis, parts marketplace, mechanic booking, roadside SOS.
Location permission is used to show nearby mechanics on the map.
Camera permission is used for AI analysis of dashboard warning lights.
```

---

## Yaygın Red Sebepleri ve Çözümleri

| Sebep | Çözüm |
|-------|-------|
| Wrapper website | Native Capacitor pluginleri aktif yap (push, camera, geo) |
| Missing privacy policy | /privacy-policy sayfası ✅ hazır, deploy et |
| Crashe | TestFlight'ta fiziksel cihazda test et |
| Placeholder içerik | Uygulama içinde gerçek veri olduğundan emin ol |
| Missing permission strings | ios/Info.plist.additions.xml ✅ hazır |
