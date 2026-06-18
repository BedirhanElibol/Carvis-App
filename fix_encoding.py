import os

files_to_fix = [
    r'src\features\extras\TenderScreen.jsx',
    r'src\features\extras\InsuranceMarket.jsx',
    r'src\features\extras\FuelScreen.jsx',
    r'src\features\extras\ParkingScreen.jsx',
    r'src\features\garage\VehicleSearch.jsx',
    r'src\features\partners\PartnerDashboard.jsx',
    r'src\features\orders\OrdersScreen.jsx'
]

replacements = {
    'Ustalar nceliyor': 'Ustalar İnceleliyor',
    'Y ostlenildi': 'İş Üstlenildi',
    'Ak Taleplerim': 'Açık Taleplerim',
    'Ustalarn teklif verdiYi aktif iYleriniz': 'Ustaların teklif verdiği aktif işleriniz',
    'Talepleriniz yǬkleniyor...': 'Talepleriniz yükleniyor...',
    'HenǬz oluYturduYunuz bir teknik servis talebi yok.': 'Henüz oluşturduğunuz bir teknik servis talebi yok.',
    'Hemen Talep OluYtur': 'Hemen Talep Oluştur',
    'AlY:': 'Açılış:',
    'Gelen Teklifleri Gr': 'Gelen Teklifleri Gör',
    
    'LǬtfen giriY yapn.': 'Lütfen giriş yapın.',
    'LǬtfen nce bir ara sein.': 'Lütfen önce bir araç seçin.',
    'BaYarl': 'Başarılı',
    'Sigorta talebiniz alnd, uzman ekibimiz sizi arayacak.': 'Sigorta talebiniz alındı, uzman ekibimiz sizi arayacak.',
    'Talep oluYturulamad.': 'Talep oluşturulamadı.',
    'Aracnz iin en uygun kasko ve trafik sigortas tekliflerini tek panelden ynetin.': 'Aracınız için en uygun kasko ve trafik sigortası tekliflerini tek panelden yönetin.',
    'IIN TEKLIFLER': 'İÇİN TEKLİFLER',
    'Teklifler yukleniyor...': 'Teklifler yükleniyor...',
    'Su anda listelenen sigorta teklifi bulunmuyor': 'Şu anda listelenen sigorta teklifi bulunmuyor',
    'BaYlang Fiyat': 'Başlangıç Fiyatı',
    'BA?VURU YAP': 'BAŞVURU YAP',
    'ara yaYnza ve hasar gemiYinize gre deYiYiklik gsterebilir.': 'araç yaşınıza ve hasar geçmişinize göre değişiklik gösterebilir.',
    'TǬm baYvurular sigorta uzmanlarmz tarafndan incelenir.': 'Tüm başvurular sigorta uzmanlarımız tarafından incelenir.',
    
    'Yakt stasyonlar': 'Yakıt İstasyonları',
    'Yakn Otoparklar': 'Yakın Otoparklar',
    'Kadky, stanbul': 'Kadıköy, İstanbul',
    
    'Ltfen 17 haneli geerli bir ase numaras giriniz.': 'Lütfen 17 haneli geçerli bir şase numarası giriniz.',
    'Ara bilgileri bulunamad. Ltfen kontrol ediniz.': 'Araç bilgileri bulunamadı. Lütfen kontrol ediniz.',
    'ase numaras net okunamad. Ltfen tekrar ekin veya manuel girin.': 'Şase numarası net okunamadı. Lütfen tekrar çekin veya manuel girin.',
    'Tarama srasnda bir hata olutu.': 'Tarama sırasında bir hata oluştu.',
    'Grnt leniyor...': 'Görüntü İşleniyor...',
    'Doru para ve usta iin': 'Doğru parça ve usta için',
    'Manuel Seim': 'Manuel Seçim',
    'ase No': 'Şase No',
    
    'zel Tahsilat': 'Özel Tahsilat',
    'TAHSLAT YAP': 'TAHSİLAT YAP',
    'Otopark letmesi': 'Otopark İşletmesi',
    'Oto Servis & Bakm': 'Oto Servis & Bakım',
    'Para Tedarikisi': 'Parça Tedarikçisi',
    'Gnlk Ciro': 'Günlük Ciro',
    'Aktif lemler': 'Aktif İşlemler',
    'Mteri Memnuniyeti': 'Müşteri Memnuniyeti',
    'evrimii': 'Çevrimiçi',
    'evrimd': 'Çevrimdışı',
    'Durum gncellenirken bir hata olutu.': 'Durum güncellenirken bir hata oluştu.',
    'Finansal zet': 'Finansal Özet',
    'Aylk raporunuzu indirin': 'Aylık raporunuzu indirin',
    
    'Beklemede': 'Beklemede',
    'dendi': 'Ödendi',
    'Tamamland': 'Tamamlandı',
    'ptal Edildi': 'İptal Edildi',
    'ade Edildi': 'İade Edildi',
    'Tehis Ediliyor': 'Teşhis Ediliyor',
    'Onarlyor': 'Onarılıyor',
    'Siparilerim': 'Siparişlerim',
    'Sipari': 'Sipariş',
    'Henz Sipariiniz Yok': 'Henüz Siparişiniz Yok',
    'Teklifleri kabul ettiinizde veya marketplace zerinden rn aldnzda siparileriniz burada listelenir.': 'Teklifleri kabul ettiğinizde veya marketplace üzerinden ürün aldığınızda siparişleriniz burada listelenir.',
    'Alverie Bala': 'Alışverişe Başla',
    'Servis Salayc': 'Servis Sağlayıcı',
    
    'lem baarsz: ': 'İşlem başarısız: ',
    'Baarl: ': 'Başarılı: ',
    'Hata: ': 'Hata: '
}

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for k, v in replacements.items():
            content = content.replace(k, v)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {filepath}')
