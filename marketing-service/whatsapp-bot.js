/**
 * WhatsApp Marketing Bot - Entry Point
 * Refactored using Node.js 2025 Best Practices.
 */

// This will immediately trigger environment validation in config.js
import { config } from './src/config/config.js';
import { WhatsAppService } from './src/services/whatsapp.service.js';

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

console.log("=========================================");
console.log("      CARVIS WHATSAPP MARKETING BOT      ");
console.log("=========================================");
console.log(`Interval: ${config.CAMPAIGN_INTERVAL_MS / 1000} seconds`);

const whatsappApp = new WhatsAppService();
whatsappApp.start();
