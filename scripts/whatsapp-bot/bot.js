const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const csv = require('csv-parser');

// Hedef kitle listesi
const contacts = [];

// CSV dosyasını okuyup diziye atıyoruz
fs.createReadStream('contacts.csv')
  .pipe(csv())
  .on('data', (row) => {
    // CSV'deki başlıkların 'isim' ve 'telefon' olduğunu varsayıyoruz.
    contacts.push(row);
  })
  .on('end', () => {
    console.log(`CSV okundu. Toplam gönderilecek numara: ${contacts.length}`);
    startBot();
  });

function startBot() {
  console.log("WhatsApp başlatılıyor...");
  
  const client = new Client({
    authStrategy: new LocalAuth(), // Oturumu kaydeder, her seferinde QR sormaz
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('LÜTFEN TELEFONUNUZDAN WHATSAPP WEB QR KODUNU OKUTUNUZ:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('WhatsApp Bağlantısı Başarılı!');
    console.log('Otomatik mesaj gönderimi 5 saniye içinde başlıyor...');
    setTimeout(() => {
      sendMessages(client);
    }, 5000);
  });

  client.initialize();
}

// Rastgele bekleme süresi (MiliSaniye) - Banlanmayı önlemek için kritik
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Telefon numarasını WhatsApp formatına çevirir (905551234567@c.us)
function formatPhoneNumber(phone) {
  // Bütün boşlukları ve karakterleri temizle
  let cleanNumber = phone.replace(/\D/g, '');
  
  // Eğer numara 0 ile başlıyorsa (0555... gibi) baştaki 0'ı at
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  // Eğer numara doğrudan 5 ile başlıyorsa başına 90 ekle (Türkiye Kodu)
  if (cleanNumber.startsWith('5')) {
    cleanNumber = '90' + cleanNumber;
  }

  // Eğer 90 ile başlamıyorsa ve 10 haneliyse büyük ihtimal 5 ile başlamıştır
  if (cleanNumber.length === 10) {
    cleanNumber = '90' + cleanNumber;
  }

  return cleanNumber + '@c.us';
}

async function sendMessages(client) {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const name = contact.isim || "Ustam";
    const rawPhone = contact.telefon;

    if (!rawPhone) continue;

    const formattedPhone = formatPhoneNumber(rawPhone);
    
    // Gönderilecek Taslak Mesaj
    const messageText = `Selamlar ${name}, hayırlı işler. 
Biz Carvis adında yeni bir otomotiv asistan uygulaması kurduk. Uygulamamız üzerinden arıza yaşayan veya parça arayan müşterileri doğrudan sana yönlendirmek istiyoruz. 

İlk katılan 100 işletmeden hiçbir komisyon almıyoruz. Sisteme dükkanını ücretsiz eklememizi ve sana müşteri göndermemizi ister misin?

Ön Kayıt ve Detay: https://rapidsy.app/partner`;

    try {
      await client.sendMessage(formattedPhone, messageText);
      console.log(`[BAŞARILI] ${name} (${rawPhone}) numarasına mesaj gönderildi.`);
      successCount++;
    } catch (err) {
      console.error(`[HATA] ${name} (${rawPhone}) numarasına gönderilemedi:`, err.message);
      errorCount++;
    }

    // Son numarada bekleme yapmaya gerek yok
    if (i < contacts.length - 1) {
      const waitTime = randomDelay(10000, 25000); // 10 saniye ile 25 saniye arası rastgele
      console.log(`Bekleniyor... (${Math.round(waitTime/1000)} saniye) - Spam koruması`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.log('-----------------------------------');
  console.log('GÖNDERİM TAMAMLANDI!');
  console.log(`Başarılı: ${successCount} | Başarısız: ${errorCount}`);
  console.log('-----------------------------------');
  // client.destroy(); // İşlem bitince kapatmak için açılabilir
}
