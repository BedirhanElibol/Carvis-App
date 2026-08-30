# Carvis 3.0 - Partner Aylık Abonelik Modeli & Sıfır Platform Sorumluluğu Geçiş Planı

## 🎯 Hedef ve İş Modeli Değişimi

Carvis platformu komisyon, ödeme blokesi (escrow/güvenli havuz) ve hizmet garantisi/tazminat gibi platforma hukuki ve finansal sorumluluk yükleyen yapılardan tamamen arındırılmaktadır.

### Yeni Çalışma Prensipleri:
1. **%0 Komisyon**: Carvis müşteriden veya partnerden yapılan işlemler üzerinden hiçbir komisyon almaz.
2. **Sabit Aylık Partner Aboneliği**: Carvis geliri yalnızca platforma üye olan partnerlerin ödediği sabit **aylık abonelik (SaaS) ücretlerinden** sağlanır.
3. **Sıfır Platform Sorumluluğu**: Carvis yalnızca bağımsız hizmet sağlayıcılar (partnerler) ile araç sahiplerini buluşturan bir yazılım/ilan rehberi platformudur. Hizmet kalitesi, araç hasarı, gecikme veya uyuşmazlıklardan platform hiçbir şekilde sorumlu tutulamaz. Ödemeler müşteri ve partner arasında doğrudan dükkan/adres konumunda tamamlanır.

---

## 🛠️ Katman Katman Yapılacak Değişiklikler

### 1. Legal & Hukuki Metinler (`src/features/legal/legalTexts.js`)
- Müşteri Kullanım Koşulları ve Partner Üyelik Sözleşmesi güncellenecek.
- Sorumluluk Reddi (Disclaimer) maddeleri eklenecek: Carvis garantör veya aracı ödeme kuruluşu değildir; sadece dijital listeleme ve eşleştirme sağlayıcısıdır.

### 2. Partner Abonelik Modeli (`src/features/partners/components/`)
- `PlansAndTrustStep.jsx`: Yüzdelik komisyon oranları ve platform garantileri kaldırılacak. Yerine kategori bazlı sabit **Aylık Abonelik Paketleri** (Servis: ₺1.499/ay, Parça: ₺1.999/ay, Yıkama: ₺799/ay, Çekici/Vale: ₺999/ay) eklenecek.
- `CommissionTariffsView.jsx`: Komisyon tarifeleri görünümü devreden çıkarılıp `SubscriptionPlansView.jsx` (Aylık Üyelik & Fatura Durumu) modülüne dönüştürülecek.

### 3. Ödeme & İşlem Akışı (`src/components/payments/`, `src/features/orders/`)
- Müşteri ödeme adımlarında (%0 Komisyon & Yerinde/Doğrudan Ödeme) mesajı netleştirilecek.
- Escrow PIN & Havuz blokesi mekanizması "Randevu & İşlem Tamamlama Onayı" haline getirilecek.

### 4. Hizmet / Servis Katmanı (`src/services/`)
- `EscrowService.js`: Bloke ödeme mantığı basitleştirilerek sadece randevu ve hizmet durum güncellemelerini yönetecek.
- `DisputeService.js`: "Tazminat / İade Talebi" yerine "Partner Şikayet & Bildirim" mekanizmasına dönüştürülecek.
- `AssuranceService.js`: Platform kasko/garantisi yerine "Partner İtibar & Puanlama" yapısına geçirilecek.

---

## 👥 Görevlendirilen Uzman Ajanlar (Orchestration)
1. `project-planner`: Genel mimari plan ve iş modeli dönüşümü kontrolü.
2. `backend-specialist`: `EscrowService`, `DisputeService`, `AssuranceService` ve `seed_partner_accounts.js` backend/servis mantıklarının refactor edilmesi.
3. `frontend-specialist`: Partner onboarding, komisyon görünümlerinin abonelik kartlarına dönüştürülmesi ve ödeme ekranlarının güncellenmesi.
4. `security-auditor`: Yasal sorumluluk reddi metinlerinin, gizlilik politikalarının ve yetkisiz işlemleri engelleme mekanizmalarının denetimi.

---

## 📊 Doğrulama ve Test Planı
- `npm run test` veya vitest testlerinin çalıştırılması.
- `.agent/scripts/checklist.py .` ile kod kalitesi ve güvenlik denetimi.
