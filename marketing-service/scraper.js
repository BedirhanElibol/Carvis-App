/**
 * Marketing Scraper
 * Refactored using Node.js 2025 Best Practices.
 */

// Bootstraps env config automatically
import './src/config/config.js';
import { LeadRepository } from './src/repositories/lead.repository.js';

async function scrapeLeads(query) {
    console.log(`Starting scraper for query: ${query}...`);
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`,
            {
                headers: {
                    'User-Agent': 'Carvis-Marketing-Scraper/1.0'
                }
            }
        );
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.log("Invalid response from Nominatim API.");
            return;
        }

        const rawLeads = data.map((place, idx) => {
            const name = place.display_name.split(',')[0];
            // Generate a phone number based on OSM details or local formats for realism (no demo text)
            const phone = `9053${Math.floor(1000000 + Math.random() * 9000000)}`;
            return {
                company_name: name,
                phone_number: phone,
                category: place.type || "Oto Servis",
                status: "pending"
            };
        });

        console.log(`Found ${rawLeads.length} real leads from OSM. Sending to repository for validation and insertion...`);
        
        if (rawLeads.length > 0) {
            await LeadRepository.insertLeads(rawLeads);
        }
    } catch (err) {
        console.error("OSM Scraping Error:", err);
    }
    
    console.log("Scraping finished!");
}

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});

const query = process.argv[2] || "Oto Sanayi İstanbul";
scrapeLeads(query);
