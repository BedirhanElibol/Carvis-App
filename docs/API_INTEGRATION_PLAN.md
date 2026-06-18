# API Integration Plan: "Global Connect"

**Status**: Draft
**Agent**: Project Planner
**Context**: Enhancing Rapidsy with real-time external data using the newly compiled Public APIs resource.

---

## 🎯 Objective
Integrate 4 high-value public APIs to transform Rapidsy from a "Static App" to a "Live Platform".
Focus on Automotive Data, Real-Time Traffic, and Financial Metrics.

## 🔌 Selected Integrations

### 1. VIN Decoder (NHTSA vPIC)
- **Target**: `GarageContext.jsx`, `AddVehicleModal`
- **Use Case**: User enters VIN -> Auto-populate Brand, Model, Year, Engine Type.
- **Benefit**: Reduces user error, improves data quality.
- **Auth**: Free (No Key).

### 2. Fuel Prices (CollectAPI / GlobalPetrolPrices Fallback)
- **Target**: `MarketStats` (Dashboard), `PredictiveHealth`
- **Use Case**: Show current gasoline/diesel avg prices in user's region (Turkey).
- **Benefit**: "Rapidsy Intelligence" feature. Helps user calculate trip costs.
- **Auth**: API Key required (We will use a mock/fallback for dev if key missing).

### 3. Traffic Data (TomTom / OpenRouteService)
- **Target**: `MapContext.jsx`, `MechanicFinder`
- **Use Case**: Show reliable travel times to mechanics.
- **Benefit**: "Is the shop 15 mins or 45 mins away?" - Decision factor.
- **Auth**: API Key required (Will use Fallback).

### 4. EV Charging Stations (Open Charge Map)
- **Target**: `MapContext.jsx`
- **Use Case**: Show nearby chargers for EV vehicles.
- **Benefit**: Future-proofing for EV adoption (2025 Trend).
- **Auth**: API Key required.

---

## 🛠️ Implementation Strategy

### Phase 1: The "External Gateway" Hook
Create a unified hook `hooks/useExternalData.js` to manage these 3rd party calls.
- Centralized error handling.
- Caching logic (don't fetch fuel prices every second).
- Fallback mock data if API limits reached.

### Phase 2: Feature Injection
1.  **Garage**: Update `addVehicle` flow to fetch VIN details.
2.  **Dashboard**: Add "Market Pulse" widget (Fuel Prices).
3.  **Map**: Add toggle for "EV Stations" using Open Charge Map.

---

## ⚠️ Risks & Mitigations
-   **API Rate Limits**: Users might hit free tier limits.
    -   *Mitigation*: Implement aggressive client-side caching (LocalStorage) for 24h for things like Fuel Prices.
-   **CORS Issues**: Some public APIs block browser requests.
    -   *Mitigation*: Use a lightweight Edge Function or Proxy if direct interaction fails (or use CORS-friendly alternatives listed).

## ✅ Definition of Done
- [ ] User can click "Decode VIN" in Add Vehicle form.
- [ ] Dashboard shows "Avg Fuel Price: 42.50 TL".
- [ ] Map shows EV Stations overlay.
