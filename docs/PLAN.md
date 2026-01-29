# Carvis App Geliştirme ve Stabilizasyon Planı

**Tarih:** 28 Ocak 2026
**Durum:** Taslak (Onay Bekliyor)
**Ajanlar:** project-planner, frontend-specialist, backend-specialist, security-auditor, test-engineer

## 1. Analiz ve Hazırlık (Faz 1)
- [ ] Mevcut `src` yapısındaki dosya yolu hatalarının (`predictiveMaintenance.js` vb.) tespiti ve taşınması.
- [ ] Supabase veritabanı şemasının (`orders`, `order_items`, `service_requests`) mevcut Context'lerle uyumunun doğrulanması.

## 2. Güvenlik ve Yetkilendirme (Faz 2)
- [ ] `AuthContext` üzerinde kullanıcı rollerinin (`customer`, `partner`, `admin`) tanımlanması.
- [ ] `routes.jsx` üzerindeki `ProtectedRoute` bileşeninin rol bazlı erişim kontrolü yapacak şekilde güncellenmesi.
- [ ] `AppHeader` ve `BottomNav` üzerindeki butonların kullanıcı rollerine göre dinamik olarak gösterilmesi.

## 3. Servis ve AI İyileştirmeleri (Faz 2)
- [ ] `AIService.js` üzerinde Gemini Vision API çağrılarının JSON parse mantığının güçlendirilmesi.
- [ ] `AIChatScreen.jsx` üzerinde hasar analizi "Scanning" animasyonlarının ve görsel efektlerinin (Glassmorphism + Framer Motion) eklenmesi.
- [ ] `GarageContext` üzerindeki bakım hesaplama mantığının `predictiveMaintenance.js` içine (veya yeni bir utility dosyasına) taşınarak stabilize edilmesi.

## 4. Market ve Ödeme Akışı (Faz 2)
- [ ] `ShopContext` ve `PaymentContext` üzerindeki checkout (ödeme) işlemlerinin gerçek `orders` tablosuna başarılı bir şekilde yazılmasının sağlanması.
- [ ] `WalletScreen` üzerindeki bakiye güncelleme işlemlerinin Supabase real-time ile senkronize edilmesi.

## 5. Doğrulama ve Teslimat (Faz 3)
- [ ] `security_scan.py` ile güvenlik taraması.
- [ ] `lint_runner.py` ile kod standardı kontrolü.
- [ ] `checklist.py` ile projenin genel final denetimi.

---

## Teknik Bağımlılıklar
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide React
- **Backend/DB:** Supabase (Auth, DB, Realtime)
- **AI:** Google Generative AI (Gemini 1.5 Flash), Pollinations AI (Fallback)

---
*Bu plan orchestrator tarafından oluşturulmuştur ve uygulama aşamasına geçmeden önce kullanıcı onayı gerektirir.*
