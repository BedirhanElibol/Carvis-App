# 🚀 Carvis "Halkın Gücü" Özellikleri - Uygulama Planı (v1.0)

Rakiplerin (Armut, OtoKonfor vb.) kullanıcı şikayetlerinden yola çıkarak, Carvis'i "Piyasanın En Güvenilir İsmi" yapacak 2 ana modül geliştirilecektir.

## 🔴 1. SOS Acil Yardım & Çekici Sistemi
**Sorun:** Yolda kalınca muhatap bulamama, konum tarif edememe.
**Çözüm:** Ana ekrana tek tuşla konum paylaşan ve en yakın yardımı çağıran dinamik widget.

### Yapılacaklar:
- [ ] `src/features/sos/SOSWidget.jsx` oluşturulması.
- [ ] Konum (Geolocation) entegrasyonu.
- [ ] "Acil Yardım Talebi" için Supabase tablosu (`emergency_requests`).
- [ ] Yakındaki ustalara (mechanic/valet) anlık bildirim gönderimi.

## 🟢 2. Canlı Onaylı Fiyatlandırma (Live Approval)
**Sorun:** Servis sırasında çıkan sürpriz maliyetler ve "Oldu-Bitti"ye getirme.
**Çözüm:** Usta ek işlem gerekirse fotoğrafı çeker ve fiyat teklifiyle kullanıcıya onay gönderir. Kullanıcı onaylamadan işlem yapılamaz.

### Yapılacaklar:
- [ ] `orders` tablosuna `pending_approval_items` (JSONB) alanı eklenmesi.
- [ ] `ProcessManager.jsx` (Usta tarafı) içine "Ek İşlem/Maliyet Ekle" butonu.
- [ ] `OrderDetailsModal.jsx` (Müşteri tarafı) içine "Onay Bekleyen İşlemler" bölümü.
- [ ] Onay anında toplam tutarın otomatik güncellenmesi.

## 🛠️ Teknik Gereksinimler & Veritabanı
- SQL Şemasına `emergency_requests` tablosu eklenmesi.
- `push_notifications` altyapısının bu onaylar için tetiklenmesi.

## 🏁 Doğrulama Planı
1. **SOS Testi**: Mock konum ile yardım talebi oluşturulup yakındaki bir "Partner" hesabına düşüp düşmediği kontrol edilecek.
2. **Onay Testi**: Usta panelinden eklenen 500 TL'lik bir işlemin, müşteri panelinde onaylanınca sipariş tutarını anlık artırdığı doğrulanacak.
