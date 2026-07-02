import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { CampaignService } from './campaign.service.js';

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
