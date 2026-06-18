# 📋 Carvis Uygulaması Yapısal ve Arayüz Düzeltmeleri Planı

## 🎯 Hedef
Uygulamanın veritabanı şeması, arayüz metinleri, bağımlılık uyarıları, PWA ayarları ve dış API bağlantılarında tespit edilen en kritik hataların giderilmesi.

## 🔎 Kapsam ve Görev Dağılımı

### 1. Veritabanı ve Roller (Database & Backend)
- **Sorun:** `partner` rolü app içerisinde kullanılıyor ancak Supabase Enum (`user_role`) içinde tanımlı değil.
- **Çözüm:** `20260501_MASTER_SCHEMA_V7_2_2.sql` ve Supabase veritabanında `user_role` enum'ına `partner` eklenecek.
- **Görevli Ajanlar:** `database-architect`, `backend-specialist`

### 2. Türkçe Karakter Bozulması (Mojibake - Frontend)
- **Sorun:** `/app/valet` gibi sayfalarda (ör. `ValetScreen.jsx`) Türkçe karakterler (Annda, Teslim Noktas vb.) bozuk görüntüleniyor (Encoding sorunu).
- **Çözüm:** İlgili dosyaların UTF-8 encoding ile yeniden kaydedilmesi veya içeriklerindeki bozuk karakterlerin düzeltilmesi.
- **Görevli Ajan:** `frontend-specialist`

### 3. PWA / SEO Asset Eksikliği (Frontend)
- **Sorun:** `public/manifest.json` dosyası `favicon.ico`, `logo192.png`, `logo512.png` dosyalarını bekliyor ama klasörde sadece `pwa-icon.png` var.
- **Çözüm:** `manifest.json` ve `index.html` dosyalarının eldeki mevcut ikon (`pwa-icon.png`) ile uyumlu hale getirilmesi.
- **Görevli Ajan:** `frontend-specialist`

### 4. Hook Bağımlılık Uyarıları (Frontend)
- **Sorun:** `ServiceBookingModal.jsx` ve `PackageManager.jsx` dosyalarında stale state riski yaratan useEffect / useCallback bağımlılık (dependency) eksiklikleri var.
- **Çözüm:** Hook dependency'lerinin düzeltilip güncellenmesi.
- **Görevli Ajan:** `frontend-specialist`

### 5. Dış API Fallback (Backend / API)
- **Sorun:** `externalApis.js` içinde kurlar çekilirken `Currency API using local fallback` hatası alınıyor.
- **Çözüm:** `externalApis.js` içerisindeki API fetch URL, Header veya Rate Limit / API Key sorunlarının giderilmesi.
- **Görevli Ajan:** `backend-specialist`

## 🛠️ Faz 2: Uygulama (Implementation) - Paralel Ajan Çalışması
Onayınızın ardından şu ajanlar eşzamanlı (parallel) çalıştırılacaktır:
1. **`database-architect` & `backend-specialist`**: DB rol güncellemesini ve API düzeltmelerini yapar.
2. **`frontend-specialist`**: Hook bağımlılıklarını, karakter bozukluklarını ve PWA manifest ayarlarını düzeltir.
3. **`test-engineer`**: Kodda linting veya security hataları olup olmadığını doğrulama scriptleriyle (`lint_runner.py` / `security_scan.py`) kontrol eder.

---

> ⚠️ **ONAY BEKLENİYOR:** 
> Plan oluşturuldu: `docs/PLAN.md`
> 
> Onaylıyor musunuz? (Y/N)
> - **Y:** Implementation (Uygulama) başlatılır (Paralel ajanlar devreye girer).
> - **N:** Planı geri bildirimlerinize göre düzeltirim.
