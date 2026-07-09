# 🏁 PLAN: Rapidsy Revenue Maximizer & Premium Features

Bu döküman, Rapidsy'in pazar payını artıracak ve kullanıcı sadakatini en üst düzeye çıkaracak olan "Premium" özelliklerin teknik detaylarını içerir.

## 👥 Görevli Ajanlar (Invoked Agents)
1. `database-architect`: Şema değişiklikleri ve yeni tablolar.
2. `frontend-specialist`: Gelişmiş Garaj ve Paket Satın Alma UI/UX.
3. `backend-specialist`: Hatırlatıcı servisleri ve paket kullanım hakları takibi.
4. `test-engineer`: Senaryo bazlı doğrulama.

---

## 🛠️ Teknik Yol Haritası

### 1. Aşama: Altyapı (Database Architect)
- `garage_profiles` tablosuna `inspection_date`, `insurance_expiry` ve `last_mileage` alanlarının eklenmesi.
- `service_packages` (Partner paketleri) ve `user_subscriptions` (Kullanıcı abonelikleri) tablolarının oluşturulması.

### 2. Aşama: Core UI (Frontend Specialist)
- **Gelişmiş Garaj Kartları**: Aracın ne zaman muayeneye gireceğini gösteren görsel geri sayımlar.
- **Paket Mağazası**: Partnerlerin sunduğu paketlerin listelendiği ve satın alınabildiği yeni bir sekme.

### 3. Aşama: Business Logic (Backend Specialist)
- Paket satın alımında cüzdandan ödeme düşülmesi ve `user_subscriptions` kaydı oluşturulması.
- Sipariş tamamlandığında paket kullanım hakkının düşülmesi.

### 4. Aşama: Polish & Proof (Mobile Developer)
- **Şeffaflık Raporu**: Partnerlerin sipariş detayında fotoğraf yükleyebilmesi için mobil uyumlu kamera entegrasyonu iyileştirmesi.

---

## 📅 Önceliklendirme
1. **Garaj Pro** (Hemen - En çok talep edilen özellik)
2. **Şeffaflık Raporu** (Güven inşası için kritik)
3. **Servis Paketleri** (Gelir artırıcı model)

Onaylıyor musunuz? Uygulama aşamasına geçelim mi?
