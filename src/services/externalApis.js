/**
 * External API Service
 * Handles interactions with public APIs for Carvis features.
 * 
 * APIs:
 * 1. NHTSA vPIC (VIN Decoder) - Free
 * 2. CollectAPI (Fuel Prices) - Freemium (Key required)
 * 3. Open Charge Map (EV Stations) - Freemium (Key required)
 */

const CORS_PROXY = 'https://corsproxy.io/?'; // Useful for avoiding CORS on some public APIs during dev

// --- 1. VIN Decoder (NHTSA) ---
export const decodeVin = async (vin) => {
    if (!vin || vin.length < 17) throw new Error('Invalid VIN length');

    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
        const data = await response.json();

        if (!data.Results) return null;

        // Helper to find value by Variable key
        const getVal = (variable) => data.Results.find(r => r.Variable === variable)?.Value;

        return {
            brand: getVal('Make'),
            model: getVal('Model'),
            year: getVal('Model Year'),
            body_type: getVal('Body Class'),
            fuel_type: getVal('Fuel Type - Primary'),
            engine_cylinders: getVal('Engine Number of Cylinders'),
        };
    } catch (error) {
        console.error('VIN Decode Error:', error);
        throw error;
    }
};

// --- 2. Fuel Prices (CollectAPI) ---
// MOCK DATA Fallback to save API credits during dev
const MOCK_FUEL_PRICES = {
    results: [
        { name: 'Benzin', price: 55.21, currency: 'TL' },
        { name: 'Motorin', price: 57.36, currency: 'TL' },
        { name: 'LPG', price: 29.29, currency: 'TL' }
    ],
    last_updated: new Date().toISOString()
};

export const getFuelPrices = async () => {
    const API_KEY = import.meta.env.VITE_COLLECT_API_KEY;

    if (!API_KEY) {
        console.warn("CollectAPI Key missing, using mock fuel data.");
        return MOCK_FUEL_PRICES;
    }

    try {
        const response = await fetch(`${CORS_PROXY}https://api.collectapi.com/gasPrice/turkeyPrice?city=istanbul`, {
            headers: {
                'content-type': 'application/json',
                'authorization': `apikey ${API_KEY}`
            }
        });
        const result = await response.json();

        if (result.success) {
            return {
                results: result.result,
                last_updated: new Date().toISOString()
            };
        }
        return MOCK_FUEL_PRICES;
    } catch (error) {
        console.error('Fuel Price Error:', error);
        return MOCK_FUEL_PRICES;
    }
};

// --- 3. EV Charging Stations (Open Charge Map) ---
// --- 3. EV Charging Stations (Open Charge Map) ---
export const getEVStations = async (lat, lng, distance = 10) => {
    const API_KEY = import.meta.env.VITE_OPEN_CHARGE_MAP_KEY;

    // Fallback Mock for Demo
    const MOCK_STATIONS = [
        {
            ID: 1,
            AddressInfo: { Title: "Zorlu Center E-Şarj", Latitude: lat + 0.01, Longitude: lng + 0.01, Distance: 1.2 },
            Connections: [{ ConnectionType: { Title: "Type 2" }, Level: { Title: "Fast" } }]
        },
        {
            ID: 2,
            AddressInfo: { Title: "Akasya AVM Şarj", Latitude: lat - 0.01, Longitude: lng - 0.01, Distance: 2.5 },
            Connections: [{ ConnectionType: { Title: "CCS" }, Level: { Title: "Ultra Fast" } }]
        }
    ];

    if (!API_KEY) {
        console.warn("OpenChargeMap Key missing, using mock stations.");
        return MOCK_STATIONS;
    }

    try {
        const response = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${distance}&maxresults=10&key=${API_KEY}`, {
            headers: { 'User-Agent': 'CarvisApp/1.0' }
        });
        const data = await response.json();
        return data.length > 0 ? data : MOCK_STATIONS;
    } catch (error) {
        console.error('EV Station Error:', error);
        return MOCK_STATIONS;
    }
};

// --- 4. Weather (Open-Meteo) NO-KEY ---
export const getWeather = async (lat, lng) => {
    try {
        // Fetch current weather, temperature, wind speed
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=auto`);
        const data = await response.json();

        if (!data.current) return null;

        // Map WMO codes to human readable
        const getCondition = (code) => {
            if (code === 0) return 'Güneşli';
            if (code < 3) return 'Parçalı Bulutlu';
            if (code < 50) return 'Sisli';
            if (code < 60) return 'Çiseleyen Yağmur';
            if (code < 80) return 'Yağmurlu';
            if (code < 95) return 'Kar Yağışlı';
            return 'Fırtına';
        };

        return {
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            wind: data.current.wind_speed_10m,
            condition: getCondition(data.current.weather_code),
            is_day: data.current.is_day
        };
    } catch (error) {
        console.error("Weather API Error:", error);
        return null; // Fail gracefully
    }
};

// --- 5. Currency (Frankfurter) NO-KEY ---
export const getExchangeRates = async (base = 'USD', target = 'TRY') => {
    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
        const data = await response.json();
        return {
            rate: data.rates[target],
            date: data.date
        };
    } catch (error) {
        console.error("Currency API Error:", error);
        return null;
    }
};
