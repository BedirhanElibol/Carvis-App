# 🚀 Rapidsy Social Login Kurulum Rehberi

Görüntülediğin `Unsupported provider` hatası, Supabase ile Google/Apple arasındaki bağlantının henüz kurulmadığını gösterir. Bu bağlantıyı sadece sen (hesap sahibi olarak) gerçekleştirebilirsin.

## 🛠️ Adım 1: Supabase Dashboard Ayarları

1. [Supabase Dashboard](https://supabase.com/dashboard/project/gieclpczrozblvauxjhf/auth/providers)'a giriş yap.
2. **Authentication** -> **Providers** sekmesine git.
3. **Google** ve **Apple** listesini bul.

## 🔗 Adım 2: Google Login Aktif Etme

Google Cloud Console üzerinden bir "OAuth Client ID" oluşturman gerekiyor.

1. [Google Cloud Console](https://console.cloud.google.com/)'a git.
2. Yeni bir proje oluştur veya mevcut projenini seç.
3. **APIs & Services** -> **Credentials** -> **Create Credentials** -> **OAuth client ID** seç.
4. **Web application** seçeneğini işaretle.
5. **Authorized redirect URIs** kısmına şu adresi ekle:
   `https://gieclpczrozblvauxjhf.supabase.co/auth/v1/callback`
6. Oluşan `Client ID` ve `Client Secret` bilgilerini Supabase Dashboard üzerindeki Google ayarlarına yapıştır.

## 🔗 Adım 3: Apple Login Aktif Etme (Opsiyonel)

Apple Developer hesabın varsa:
1. Supabase Dashboard -> Apple ayarlarına git.
2. Oradaki adımları takip ederek `Services ID`, `Team ID` ve `Key ID` bilgilerini gir.
3. Redirect URI olarak yine aynısını kullan: 
   `https://gieclpczrozblvauxjhf.supabase.co/auth/v1/callback`

## 🛡️ Adım 4: E-posta Doğrulaması

Sistem artık **gerçek doğrulama** modundadır. 
- Kayıt olan kullanıcılara otomatik olarak doğrulama e-postası gider.
- Kullanıcı e-postasındaki linke tıklayana kadar platformda hassas işlemler (bakiye yükleme, sipariş verme) yapamaz.
- Bu ayarı değiştirmek istersen: Supabase Dashboard -> Auth -> Providers -> Email -> **Confirm email** seçeneğini kontrol et.

## 🔗 Adım 5: Yönlendirme (Redirect) URL Ayarları

Eğer sosyal girişten (Google/Apple) sonra tarayıcınız `localhost:3000` veya benzeri çalışmayan bir adrese yönleniyor ve `ERR_CONNECTION_REFUSED` hatası alıyorsanız, Supabase dashboardunda izin verilen yönlendirme adresleri eksiktir:

1. [Supabase Dashboard -> URL Configuration](https://supabase.com/dashboard/project/gieclpczrozblvauxjhf/auth/url-configuration) sayfasına gidin.
2. **Redirect URLs** alanına şu adresleri ekleyin:
   - `http://localhost:5173/**`
   - `http://localhost:5173/application/home`
3. Kaydedin.

---
**Not:** Bu ayarları yaptıktan sonra hata devam ederse sayfayı yenilemeniz yeterli olacaktır.
