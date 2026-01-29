# PAYTR ENTEGRASYONU - DEPLOYMENT GUIDE

**Tarih**: 25 Ocak 2026  
**Durum**: ✅ Tamamlandı

---

## 📋 SUPABASE EDGE FUNCTIONS DEPLOYMENT

### **1. Supabase CLI Kurulumu**

```bash
# Supabase CLI'yi kur (eğer yoksa)
npm install -g supabase

# Supabase'e login ol
supabase login

# Projeyi link et
supabase link --project-ref your-project-ref
```

---

### **2. Environment Variables Ayarla**

Supabase Dashboard → Settings → Edge Functions → Secrets

```bash
# PayTR Credentials
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=1  # 1 = Test, 0 = Production

# App URL
APP_URL=https://your-app-url.com

# Supabase (otomatik set edilir)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Komut ile:**
```bash
supabase secrets set PAYTR_MERCHANT_ID=your_merchant_id
supabase secrets set PAYTR_MERCHANT_KEY=your_merchant_key
supabase secrets set PAYTR_MERCHANT_SALT=your_merchant_salt
supabase secrets set PAYTR_TEST_MODE=1
supabase secrets set APP_URL=https://your-app-url.com
```

---

### **3. Edge Functions Deploy**

```bash
# create-payment function'ı deploy et
supabase functions deploy create-payment

# paytr-callback function'ı deploy et
supabase functions deploy paytr-callback
```

---

### **4. PayTR Callback URL Ayarla**

PayTR Dashboard → Ayarlar → Callback URL:

```
https://your-project.supabase.co/functions/v1/paytr-callback
```

---

## 🧪 TEST

### **1. Test Kartları (PayTR Sandbox)**

```
Kart No: 9792 0300 0000 0005
Son Kullanma: 12/26
CVV: 000
3D Şifre: 000000
```

### **2. Test Akışı**

1. Uygulamada teklif kabul et
2. "Ödeme Yap" butonuna tıkla
3. PayTR iframe'i açılmalı
4. Test kartı ile ödeme yap
5. Başarılı ödeme sonrası:
   - Order status → "paid"
   - Bildirim gelir
   - Satıcıya bildirim gider

---

## 🔍 DEBUG

### **Edge Function Logları**

```bash
# create-payment logları
supabase functions logs create-payment

# paytr-callback logları
supabase functions logs paytr-callback

# Realtime loglar
supabase functions logs create-payment --follow
```

---

## ⚠️ ÖNEMLİ NOTLAR

### **1. Hash Güvenliği**
- PayTR hash'i her zaman doğrula
- merchant_key ve merchant_salt'u GİZLİ tut
- Asla frontend'de kullanma

### **2. Webhook**
- PayTR webhook'a MUTLAKA "OK" dön
- Hata olsa bile 200 status code dön
- Aksi halde PayTR tekrar tekrar çağırır

### **3. Test Mode**
- Test modda gerçek ödeme alınmaz
- Production'a geçmeden önce test et
- PAYTR_TEST_MODE=0 yap

### **4. Komisyon**
- Trigger otomatik hesaplıyor
- Order paid olunca komisyon oluşur
- Seller balance güncellenir

---

## 📊 DATABASE KONTROL

### **Orders**
```sql
SELECT * FROM orders WHERE status = 'paid';
```

### **Transactions**
```sql
SELECT * FROM transactions WHERE payment_status = 'success';
```

### **Commissions**
```sql
SELECT * FROM commissions WHERE status = 'pending';
```

### **Seller Balances**
```sql
SELECT * FROM seller_balances;
```

---

## 🚀 PRODUCTION CHECKLIST

- [ ] PayTR gerçek credentials al
- [ ] PAYTR_TEST_MODE=0 yap
- [ ] Callback URL'i güncelle
- [ ] SSL sertifikası kontrol et
- [ ] Error handling test et
- [ ] Webhook test et
- [ ] Komisyon hesaplama test et
- [ ] Bildirimler test et
- [ ] Gerçek kart ile test et

---

## 📞 DESTEK

**PayTR Destek**: destek@paytr.com  
**Dokümantasyon**: https://www.paytr.com/entegrasyon

---

**Hazırlayan**: Antigravity AI  
**Tarih**: 25 Ocak 2026, 00:45
