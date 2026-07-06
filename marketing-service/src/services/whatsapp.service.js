import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { CampaignService } from './campaign.service.js';
import { AIService } from './ai.service.js';

export class WhatsAppService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.setupEvents();
    }

    setupEvents() {
        this.client.on('qr', (qr) => {
            console.log('\n==================================================================');
            console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP (Use a secondary number):');
            console.log('==================================================================\n');
            
            // Terminalde kesik çıkma ihtimaline karşı tarayıcıdan açılabilen link
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
            console.log('⚠️ Eğer terminaldeki QR kod bozuk/kesik görünüyorsa, şu linke tıklayarak tarayıcınızdan okutabilirsiniz:');
            console.log('\n👉 ' + qrUrl + '\n');
            
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp Bot is READY and Connected!');
            // Start the campaign loop using CampaignService
            CampaignService.startCampaignLoop(this.client);
        });

        // ==========================================
        // WHATSAPP BOT: INTERACTIVE MENU & STATE
        // ==========================================
        this.userStates = new Map();

        this.client.on('message', async (msg) => {
            const text = msg.body.trim();
            const userId = msg.from;
            const textLower = text.toLowerCase();

            // Eğer bir state yoksa ve kullanıcı merhaba dediyse
            if (['merhaba', 'selam', 'hey', 'hi', 'başla', 'start', 'yardım'].includes(textLower)) {
                this.userStates.set(userId, 'MAIN_MENU');
                await msg.reply(
                    "👋 *Carvis'e Hoş Geldiniz!*\n\n" +
                    "Ben yapay zeka tabanlı araç asistanınızım. Size nasıl yardımcı olabilirim?\n\n" +
                    "Lütfen bir işlem numarası seçin:\n" +
                    "1️⃣ *Yapay Zeka Arıza Teşhisi*\n" +
                    "2️⃣ *Acil Çekici Çağır (S.O.S)*\n" +
                    "3️⃣ *Yakındaki Tamirciler*\n" +
                    "4️⃣ *Müşteri Temsilcisine Bağlan*\n\n" +
                    "_(Seçmek için sadece numarasını yazıp gönderin)_"
                );
                return;
            }

            const currentState = this.userStates.get(userId);

            if (currentState === 'MAIN_MENU') {
                if (text === '1') {
                    this.userStates.set(userId, 'AWAITING_DIAGNOSIS');
                    await msg.reply("🤖 *Carvis AI Teşhis Modu:* Lütfen aracınızdaki sorunu veya duyduğunuz arıza sesini detaylıca anlatın. (Örn: 'Motordan tık tık ses geliyor ve yağ damlatıyor')");
                } else if (text === '2') {
                    this.userStates.set(userId, 'AWAITING_LOCATION_SOS');
                    await msg.reply("🚨 *Acil Çekici (S.O.S):* Lütfen şu anki konumunuzu WhatsApp üzerinden gönderin, size en yakın çekiciyi anında yönlendirelim.");
                } else if (text === '3') {
                    this.userStates.set(userId, 'AWAITING_LOCATION_MECHANIC');
                    await msg.reply("🛠️ *Tamirci Bul:* Size en uygun ustaları listeleyebilmemiz için lütfen marka/model bilginizi ve bulunduğunuz ili yazın.");
                } else if (text === '4') {
                    this.userStates.set(userId, 'SUPPORT');
                    await msg.reply("👨‍💻 *Canlı Destek:* Sizi en kısa sürede bir müşteri temsilcimize aktarıyorum. Lütfen hattan ayrılmayın.");
                } else {
                    await msg.reply("❌ Lütfen geçerli bir numara girin (1, 2, 3 veya 4).");
                }
                return;
            }

            // AI Teşhis Akışı
            if (currentState === 'AWAITING_DIAGNOSIS') {
                await msg.reply("⏳ *Carvis AI:* Durumunuzu analiz ediyorum, lütfen bekleyin...");
                const diagnosis = await AIService.getDiagnosis(userId, text);
                const replyText = AIService.formatResponse(diagnosis);
                await msg.reply(replyText + "\n\n🔄 _Ana menüye dönmek için 'Merhaba' yazabilirsiniz._");
                this.userStates.delete(userId); // İşlem bitti
                return;
            }

            // Eski sistem uyumluluğu için direkt !teşhis komutu kullanımı
            if (textLower.startsWith('!teşhis') || textLower.startsWith('!teshis')) {
                const issueDescription = text.replace(/^!teşhis|^!teshis/i, '').trim();
                if (!issueDescription) {
                    await msg.reply("🤖 *Carvis AI:* Lütfen komuttan sonra arızanızı açıklayın. Örnek: `!teşhis Aracımın motorundan duman çıkıyor.`");
                    return;
                }
                await msg.reply("⏳ *Carvis AI:* Durumunuzu analiz ediyorum, lütfen bekleyin...");
                const diagnosis = await AIService.getDiagnosis(userId, issueDescription);
                const replyText = AIService.formatResponse(diagnosis);
                await msg.reply(replyText);
            }
        });

        this.client.on('disconnected', (reason) => {
            console.error('❌ WhatsApp Bot was disconnected. Reason:', reason);
            // Optionally, handle reconnection or clean exit here
            process.exit(1);
        });
    }

    start() {
        console.log("🚀 Initializing WhatsApp Service...");
        this.client.initialize();
    }
}
