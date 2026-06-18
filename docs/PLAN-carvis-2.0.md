# 📋 Carvis 2.0 (Pro Max) Teknik Uygulama Planı

Bu plan; Garajım 2.0, Akıllı Servis Talebi, Canlı Yol Yardım, Araç Geçmiş Raporu (PDF) ve Maliyet Zekası gibi platformu pazar liderliğine taşıyacak gelişmiş özellikleri kapsayan veritabanı, backend ve frontend mimarisini tanımlar.

---

## 🔍 Faz 1: Veritabanı Genişletmesi & Tablo Tasarımları

Tüm veritabanı güncellemeleri, geriye dönük uyumluluk (backward compatibility) bozulmayacak şekilde `public.vehicles`, `public.service_requests` ve `public.emergency_requests` tablolarını genişletecek; ayrıca yeni ihtiyaçlar için 3 adet yeni tablo kuracaktır.

### 1. `public.vehicles` Genişletmesi (Garajım 2.0)
Aracın sağlık skoru, yaklaşan muayene/sigorta/bakım vadeleri ve kritik parça ömürlerini tutmak için mevcut tabloya yeni alanlar ekleniyor:
- `health_score` (INTEGER, Default 100, Check 0-100) ➔ Sağlık skoru.
- `chassis_number` (TEXT) ➔ Şasi numarası.
- `insurance_policy_no` (TEXT) ➔ Sigorta poliçe numarası.
- `inspection_expiry_date` (DATE) ➔ TÜVTÜRK Muayene bitiş tarihi.
- `insurance_expiry_date` (DATE) ➔ Zorunlu Trafik Sigortası bitiş tarihi.
- `last_tire_change` (DATE) ➔ Son lastik değişim tarihi.
- `last_battery_change` (DATE) ➔ Son akü değişim tarihi.
- `last_oil_change` (DATE) ➔ Son motor yağı değişim tarihi.

### 2. `public.vehicle_expenses` (YENİ TABLO - Maliyet Zekası)
Kullanıcının aylık, yıllık ve kilometre başına maliyet trendlerini analiz edebilmesi için masraf kayıtlarını tutar:
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `vehicle_id` UUID REFERENCES vehicles(id) ON DELETE CASCADE
- `expense_type` TEXT (CHECK: 'fuel', 'service', 'tax', 'insurance', 'fine', 'cleaning', 'other')
- `amount` DECIMAL(12,2)
- `date` TIMESTAMPTZ
- `mileage` INTEGER
- `notes` TEXT
- `created_at` TIMESTAMPTZ

### 3. `public.vehicle_documents` (YENİ TABLO - Belge Kasası)
Ruhsat, poliçe, fatura gibi belgelerin güvenli saklanması:
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `vehicle_id` UUID REFERENCES vehicles(id) ON DELETE CASCADE
- `name` TEXT
- `document_type` TEXT (CHECK: 'registration', 'insurance', 'inspection', 'invoice', 'technician_report', 'other')
- `file_url` TEXT
- `expiry_date` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ

### 4. `public.service_requests` Genişletmesi (Akıllı Servis Talebi & AI Teşhis)
Semptom seçimi, AI ön teşhisi, fotoğraf/ses kayıtları ve ortalama fiyat aralıklarını tutar:
- `symptoms` JSONB (Default '[]') ➔ Seçilen semptomlar dizisi.
- `ai_pre_diagnosis` TEXT ➔ AI tarafından üretilen ön teşhis özeti.
- `risk_level` TEXT (CHECK: 'low', 'medium', 'high', 'critical') ➔ Risk derecesi.
- `estimated_cost_min` DECIMAL(12,2) ➔ Tahmini min maliyet.
- `estimated_cost_max` DECIMAL(12,2) ➔ Tahmini max maliyet.
- `urgency` TEXT (CHECK: 'immediate', 'pending', 'flexible') ➔ Aciliyet durumu.
- `media_urls` JSONB (Default '[]') ➔ Ses/Video/Fotoğraf linkleri.

### 5. `public.emergency_requests` Genişletmesi (Canlı Yol Yardım)
ETA, çekici eşleşmesi, canlı konum ve kanıt fotoğrafları:
- `vehicle_id` UUID REFERENCES vehicles(id) ON DELETE SET NULL
- `provider_id` UUID REFERENCES profiles(id) ON DELETE SET NULL
- `provider_lat` DECIMAL(10,8)
- `provider_lng` DECIMAL(11,8)
- `eta_minutes` INTEGER
- `price` DECIMAL(12,2)
- `evidence_photos` JSONB (Default '[]')
- `rating` INTEGER (CHECK: 1-5)

### 6. `public.vehicle_reports` (YENİ TABLO - Araç Geçmiş Raporu)
Üretilen PDF/Export geçmiş raporlarının kayıtları:
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `vehicle_id` UUID REFERENCES vehicles(id) ON DELETE CASCADE
- `report_type` TEXT (CHECK: 'full', 'service_only', 'expense_only')
- `file_url` TEXT
- `created_at` TIMESTAMPTZ

---

## 🛠️ Faz 2: Frontend & UI Tasarım Sistemi (Pro Max)

Uygulamanın arayüzü son derece akıcı micro-animation'lar, HSL renk paletleri ve native app hissiyatı veren kart yapısı ile güncellenecektir.

1. **Garajım 2.0 Arayüzü (`GarageScreen.jsx` & `CustomerHome.jsx`):**
   - Üstte dairesel, gradyanlı bir **Sağlık Skoru Kadranı** (%skor) ve skora göre değişen renk durumları (Yeşil ➔ Sarı ➔ Kırmızı).
   - *Belge Kasası* butonu ile grid yapıda PDF/Resim gösteren doküman kartları.
   - *Hatırlatıcılar* listesi (Muayene, yağ, akü için yaklaşan gün/km sayacı).
   - *Masraf Ekle* popup'ı ve aylık harcama grafiği.

2. **Akıllı Teşhis Arayüzü (`SmartDiagnosisScreen.jsx`):**
   - Guided wizard: Semptom seçici (Simge ve etiketlerle donatılmış ses, titreme vb. kartlar).
   - AI Ön Teşhis Raporu: Teşhis detayını içeren şık bir "AI Raporu" kartı ve risk ibresi.
   - Ses/Görüntü kaydı yükleme alanı.

3. **Canlı Yol Yardım SOS Ekranı (`SOSActiveScreen.jsx`):**
   - Canlı Google Maps/OpenStreetMap bileşeni.
   - Çekici sağlayıcı kartları (Fiyat, puan ve ETA karşılaştırmalı).
   - SOS durum adımları (Çekici atandı ➔ Yola çıktı ➔ Ulaştı).

4. **Araç Raporu PDF İhracı:**
   - Client-side `jspdf` entegrasyonu ile tüm servis geçmişini, masrafları ve sağlık durumunu içeren muhteşem tasarımlı bir PDF rapor indirici.

---

## 🔒 Güvenlik (RLS) & Politikalar

Yeni oluşturulan tüm tablolar için Row Level Security (RLS) kuralları uygulanacaktır:
- Kullanıcılar sadece kendi araçlarına bağlı harcamaları, belgeleri ve raporları görebilir/yönetebilir (`auth.uid() = user_id`).
- Admin profilleri tüm verilere tam erişime sahiptir.

---

## 🏁 Doğrulama Planı
1. **Veritabanı Validasyonu:** `schema_validator.py` çalıştırılarak yeni eklemelerin Postgres kurallarıyla tam uyumu denetlenecektir.
2. **Derleme Kontrolü:** `npm run build` ile frontend derleme stabilitesi doğrulanacaktır.
3. **Manuel Testler:** Mock veri simülasyonları ile harita, masraf ekleme, AI teşhis ve PDF indirme akışlarının çalışabilirliği tarayıcı subagent'ı ile test edilecektir.
