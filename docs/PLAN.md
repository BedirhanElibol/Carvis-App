# 🎯 ORCHESTRATION PLAN: İki Taraflı Güvenli Ödeme (Escrow/Havuz) Sistemi

## 📌 Durum Analizi ve Problem Tanımı
Kullanıcımız, "Sanayide Güven Sorununa Son" mottomuzun altını dolduracak en kritik altyapıyı, yani **İki Taraflı Güvenli Ödeme (Escrow) Sistemini** talep etmektedir.
- **Problem:** Araç sahibi ustaya güvenmiyor (işin yarım kalması, sürpriz masraf), usta araç sahibine güvenmiyor (parayı alamama endişesi).
- **Çözüm:** Kullanıcı parayı öder, para Rapidsy'nin güvenli havuz hesabında (Escrow) bekletilir. İş bitiminde her iki taraf da dijital onay (QR Kod veya PIN) verdiğinde para ustanın cüzdanına (Wallet) aktarılır.
- **İhtiyaç:** Bu sistemin hem arayüzde (UI/UX) hem de veritabanında (Supabase Schema & RPC) modellenmesi gerekmektedir.

## 🚀 Faz 1: Planlama (Şu Anki Aşama)

Bu belgede, %100 güvenli havuz sisteminin nasıl inşa edileceği adım adım planlanmıştır.

### Hedeflenen Mimari (Faz 2 için)

1. **Veritabanı Mimarisi (Database & RPC):**
   - `escrow_transactions` tablosunun oluşturulması (Durumlar: `locked`, `released`, `disputed`, `refunded`).
   - İş bitimi onayı için `release_escrow` adlı güvenli bir RPC (Stored Procedure) yazılması. Bu RPC, parayı havuzdan alıp ustanın `wallets` tablosuna (bakiye olarak) ekleyecek.

2. **Frontend & UI/UX (Müşteri Tarafı):**
   - Müşterinin teklifi onaylarken ödeme yapacağı "Güvenli Ödeme (Checkout)" sayfasının iyileştirilmesi.
   - Ödeme sonrası müşteriye "İş Bitim PIN Kodu" veya "Onay Butonu" sunan "Aktif İşlem (Active Order)" ekranının tasarlanması.

3. **Frontend & UI/UX (Usta/Servis Tarafı):**
   - Usta paneline (Partner Dashboard) "Havuzda Bekleyen Bakiyeler (Escrow Balance)" göstergesinin eklenmesi (Motivasyon için).
   - İş bitiminde ustanın müşteriden onay (PIN/QR) isteyeceği ekranın yapılması.

---

## 🚦 Faz 2 İçin Görevlendirilecek Ajanlar (Onay Sonrası Paralel Çalışacak)

- 🏗️ **`database-architect`**: Supabase üzerinde `escrow_transactions` tablosunu ve parayı ustaya güvenle aktaracak PL/pgSQL fonksiyonlarını (`rpc`) yazacak.
- 🎨 **`frontend-specialist`**: Müşteri için "Güvenli Ödeme Onay" ekranını, Usta için ise "Havuzdaki Kazançlar" arayüzünü geliştirecek.
- 🔒 **`security-auditor`**: Paranın iki tarafın da onayı olmadan (veya admin kararı olmadan) aktarılamamasını sağlayan RLS (Row Level Security) politikalarını denetleyecek.
- 🧪 **`test-engineer`**: Ödeme akışını mock verilerle test edecek ve yetkisiz erişim/para aktarımı açıklarını linting araçlarıyla tarayacak.

---

## ⏸️ CHECKPOINT: Kullanıcı Onayı Bekleniyor

Yukarıdaki "İki Taraflı Güvenli Ödeme (Escrow)" mimarisi için plan hazırlanmıştır.

**Onaylıyor musunuz? (Y/N)**
- Y: Yazılım sürecini (Faz 2) başlatır.
- N: Plana eklemek/çıkarmak istediklerinizi belirtirsiniz.
