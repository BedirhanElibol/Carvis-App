# Carvis Monetizasyon ve Ödeme Planı (v1.0)

Bu doküman, Carvis platformundaki farklı iş ortaklarının (Satıcılar, Servisler, Valeler) platforma ödeyeceği ücretlerin, komisyon oranlarının ve abonelik modellerinin teknik ve iş mantığını tanımlar.

## 1. Gelir Modelleri (Revenue Models)

| İş Ortağı Tipi | Model | Oran/Ücret (Öneri) | Açıklama |
| :--- | :--- | :--- | :--- |
| **Yedek Parça (Marketplace)** | Komisyon | %12 | Satılan her ürün üzerinden kesilir. |
| **Oto Servis & Tamir** | Abonelik + Randevu | 499 TL/Ay + 50 TL/Randevu | Sabit listeleme ücreti + yönlendirilen müşteri başına ücret. |
| **Vale Hizmeti** | Komisyon | %8 | Her vale işlemi üzerinden kesilir. |
| **Otopark** | Sabit Komisyon | İşlem başı 10 TL | Otopark giriş/çıkış ücretinden bağımsız sabit pay. |
| **Expertiz / Danışmanlık** | Komisyon | %20 | Bilgi odaklı hizmetlerde yüksek pay. |

## 2. Teknik Altyapı ve Veritabanı Değişiklikleri

### 2.1. Yeni Tablolar
- `public.monetization_plans`: Farklı abonelik paketlerini tanımlar (Free, Basic, Pro, Enterprise).
- `public.partner_settings`: Her partnerin özel komisyon oranlarını ve aktif planını tutar.
- `public.platform_earnings`: Platformun kestiği komisyonların detaylı muhasebe kaydı.

### 2.2. RPC ve Fonksiyon Güncellemeleri
- `process_wallet_payment` fonksiyonu, ödeme sırasında ilgili satıcının `plan_type` ve `commission_rate` değerini kontrol ederek tutarı ikiye bölecek:
    - **%X**: Carvis Platform Hesabı (Komisyon)
    - **% (100-X)**: Satıcı Hesabı (Hakediş)

## 3. Ödeme ve Hakediş Akışı (Payout Flow)

1. **Ödeme Alınır**: Müşteri ödemeyi yapar (Cüzdan veya Kart).
2. **Komisyon Kesilir**: Toplam tutar üzerinden anlık olarak platform payı ayrılır.
3. **Havuzda Bekletme (Escrow)**: Satıcı payı, hizmet tamamlanana kadar "Bekleyen Bakiye" (pending_balance) olarak tutulur.
4. **Onay ve Transfer**: Hizmet/Ürün teslimi onaylandığında bakiye "Çekilebilir Bakiye"ye aktarılır.

## 4. Kullanıcı İncelemesi Gereken Noktalar

> [!IMPORTANT]
> **Komisyon iadesi**: Müşteri siparişi iptal ederse platform kestiği komisyonu iade etmeli mi yoksa işlem ücreti olarak tutmalı mı? (Öneri: Sadece satıcı kusuru varsa iade edilmeli).

> [!WARNING]
> **Abonelik Takibi**: Aylık abonelik ücretini ödemeyen satıcılar sistemde "Pasif" duruma düşürülmeli mi yoksa sadece randevu almaları mı engellenmeli?

## 5. Doğrulama Planı
- Farklı satıcı rolleriyle (Mechanic, Parts) test ödemeleri yapılacak.
- Komisyon oranlarının veritabanından dinamik olarak çekildiği doğrulanacak.
- Admin panelinde "Toplam Kazanç" ve "Komisyon Gelirleri" raporları test edilecek.
