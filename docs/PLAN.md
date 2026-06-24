# Carvis App - Revizyon ve İyileştirme Planı

Bu belge, kullanıcının talepleri doğrultusunda uygulamanın "gerçekçi, sade ve
sorunsuz" bir yapıya kavuşturulması için yapılacak değişiklikleri içerir.

## 1. Tema ve Renk Düzenlemeleri (Frontend Specialist)

- **Sorun:** Yazılar arka plan renklerinden dolayı okunmuyor ve Aydınlık Mod
  (Light Mode) çalışmıyor.
- **Çözüm:**
  - `tailwind.config.js` ve global CSS dosyaları kontrol edilecek.
  - HTML tag'ine `dark` class'ının doğru eklenip çıkarıldığından emin olunacak
    (`UIContext.jsx`).
  - Metinlerin arka planla olan kontrastı artırılacak.
  - Her sayfa düzenindeki dark ve aydınlık yapabilen buton kontrol edilecek her
    sayfa için doğru çalıştığı onaylanacak tıpkı anasayfaki gibi.

## 2. Simülasyon ,Demo ve "AI" İbarelerinin Kaldırılması (Frontend & Backend Specialist)

- **Sorun:** Araç girilmeden sahte veriler gösteriliyor ve her yerde AI ibaresi
  var.
- **Çözüm:**
  - "Demo" veya "Mock" olarak gösterilen tüm araç sağlığı, lastik durumu vb.
    sahte veriler kaldırılacak. Araç eklenmediyse "Lütfen aracınızı ekleyin"
    şeklinde boş durum (empty state) gösterilecek.
  - Uygulama genelindeki "Yapay Zeka", "AI", "Akıllı" gibi pazarlama ibareleri
    arayüzden temizlenecek.

## 3. Canlı Akaryakıt Fiyatları Widget'ının (Frontend Specialist)

- **Sorun:** Güncelliğini yitirme ihtimali olan "Canlı Akaryakıt" gösterge
  paneli uygulamayı basit (oyuncak) gösteriyor.
- **Çözüm:**
  - İlgili widget (bileşen) ana sayfadan (`CustomerHome.jsx`) ve ilgili dosyalar
    düzenlenecek ücretsiz ve güncel kalacak her gün 1 kez güncellenecek.

## 4. Yakıt Takip Sisteminin Entegrasyonu (Database Architect & Backend Specialist)

- **Sorun:** Kullanıcılar kendi aldıkları yakıtları kaydedemiyor.
- **Çözüm:**
  - "Yakıt Takip Sistemi" (Kullanıcının aldığı litre, ödediği tutar, kilometre
    bilgisini girebildiği ve geçmişini görebildiği) sayfa aktif edilecek
    (`FuelScreen.jsx`).
  - Gerekirse Supabase üzerinde `fuel_logs` (veya benzeri) tablo yapısı
    doğrulanacak/oluşturulacak.

## 5. Mesajlaşma Ekranı Çökme (Crash) Hatasının Çözümü (Test Engineer & Debugger)

- **Sorun:** Mesajlar bölümüne girildiğinde uygulama çöküyor.
- **Çözüm:**
  - `MessageScreen.jsx`, `MessageListScreen.jsx` ve `MessageContext.jsx`
    dosyalarındaki veri çekme veya undefined state hataları (cannot read
    properties of null vb.) tespit edilecek.
  - Çökmeyi engelleyecek hata yakalama (Error Boundary / try-catch / optional
    chaining) mekanizmaları kurulacak.

---

## ⏳ Onay Bekleniyor

Kullanıcıdan bu plan için onay alındıktan sonra, **Phase 2 (Implementation)**
aşamasına geçilecek ve paralel ajanlar çalıştırılacaktır.
