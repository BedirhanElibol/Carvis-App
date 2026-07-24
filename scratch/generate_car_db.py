"""
Carvis - Automatic Car Database Generator
Uses NHTSA vPIC API to fetch ALL car makes and models globally.
Then enriches with Turkish market engine codes where known.
"""
import json
import time
import urllib.request
import urllib.error
import sys

BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles"

# Turkish market brands we want to prioritize (all of them from Sahibinden.com)
TURKISH_MARKET_BRANDS = [
    "FIAT", "RENAULT", "VOLKSWAGEN", "FORD", "BMW", "MERCEDES-BENZ",
    "AUDI", "TOYOTA", "PEUGEOT", "OPEL", "HYUNDAI", "KIA", "HONDA",
    "NISSAN", "CITROEN", "SKODA", "SEAT", "DACIA", "VOLVO", "ALFA ROMEO",
    "MINI", "PORSCHE", "LAND ROVER", "JAGUAR", "JEEP", "MITSUBISHI",
    "MAZDA", "SUZUKI", "SUBARU", "CHEVROLET", "TESLA", "LEXUS",
    "MASERATI", "FERRARI", "LAMBORGHINI", "BENTLEY", "ROLLS-ROYCE",
    "ASTON MARTIN", "CADILLAC", "CHRYSLER", "DODGE", "LINCOLN",
    "GENESIS", "SMART", "DS", "CUPRA", "MG", "BYD", "CHERY",
    "GEELY", "SSANGYONG", "ISUZU", "IVECO", "MAN", "SCANIA",
    "DAEWOO", "SAAB", "LANCIA", "ROVER", "PROTON", "TATA",
    "GREAT WALL", "MAHINDRA",
]

# Known Turkish engine codes - manually curated critical data
KNOWN_ENGINE_CODES = {
    "FIAT": {
        "Egea": {"1.3 Multijet": "199B1000", "1.4 Fire": "843A1000", "1.6 Multijet": "55260384", "1.5 Hybrid": "46347813 GSH"},
        "Linea": {"1.3 Multijet": "199A3000", "1.4 Fire": "350A1000", "1.6 Multijet": "198A3000"},
        "Doblo": {"1.3 Multijet": "223A9000", "1.6 Multijet": "263A8000"},
        "Punto": {"1.3 Multijet": "199A2000", "1.4 Fire": "350A1000"},
        "Fiorino": {"1.3 Multijet": "199B1000", "1.4 Fire": "350A1000"},
    },
    "RENAULT": {
        "Clio": {"1.5 dCi": "K9K 872", "1.0 TCe": "H4D 470", "0.9 TCe": "H4B 400"},
        "Megane": {"1.5 dCi": "K9K 636", "1.3 TCe": "H5H 470"},
        "Fluence": {"1.5 dCi": "K9K 836"},
        "Symbol": {"1.5 dCi": "K9K 612"},
        "Kangoo": {"1.5 dCi": "K9K 702"},
    },
    "VOLKSWAGEN": {
        "Golf": {"1.6 TDI": "CAYC / CXXB", "1.5 TSI": "DADA / DPCA", "1.4 TSI": "CAXA / CZDA", "2.0 GTI": "CHHA"},
        "Passat": {"1.6 TDI": "CAYC / CXXB", "2.0 TDI": "CBAB / CFFB", "1.4 TSI": "CAXA / CZDA"},
        "Polo": {"1.0 TSI": "CHZB / DKLA", "1.4 TDI": "AMF / CUSB"},
        "Caddy": {"2.0 TDI": "DFSJ / DFSC", "1.6 TDI": "CAYE / CAYD"},
        "Transporter": {"2.0 TDI": "CAAA / CCHA"},
    },
    "FORD": {
        "Focus": {"1.5 TDCi": "ZTDA / XWDA", "1.6 Ti-VCT": "PNDA", "1.0 EcoBoost": "M1DA / M2DA"},
        "Fiesta": {"1.4 TDCi": "F6JB", "1.0 EcoBoost": "B7DA"},
        "Transit": {"2.0 EcoBlue": "YNF6 / YLF6"},
        "Ranger": {"2.0 EcoBlue": "YN2X BiTurbo"},
    },
    "BMW": {
        "3 Series": {"320d": "N47D20C / B47D20A", "320i": "N20B20A / B48B20A", "316i": "N13B16A"},
        "5 Series": {"520d": "B47D20A / B47D20B", "520i": "N20B20A / B48B20A"},
        "1 Series": {"116d": "N47D16 / B37C15", "118i": "B38B15A"},
    },
    "MERCEDES-BENZ": {
        "C-Class": {"C 200 d": "OM 654.920", "C 180": "M 264.915", "C 220 d": "OM 651.921"},
        "E-Class": {"E 220 d": "OM 654.920", "E 200": "M 264.920"},
        "A-Class": {"A 180 d": "OM 654.915", "A 200": "M 282.914"},
    },
    "TOYOTA": {
        "Corolla": {"1.8 Hybrid": "2ZR-FXE", "1.4 D-4D": "1ND-TV", "1.6": "1ZR-FE"},
        "Yaris": {"1.5 Hybrid": "M15A-FXE", "1.0": "1KR-FE"},
        "Hilux": {"2.4 D-4D": "2GD-FTV", "2.8 D-4D": "1GD-FTV"},
    },
    "PEUGEOT": {
        "308": {"1.5 BlueHDi": "DV5RD", "1.2 PureTech": "EB2ADTS"},
        "208": {"1.5 BlueHDi": "DV5RD", "1.2 PureTech": "EB2F"},
        "301": {"1.6 HDi": "DV6ATED4"},
    },
    "OPEL": {
        "Astra": {"1.6 CDTI": "B16DTH", "1.4 Turbo": "A14NET"},
        "Corsa": {"1.3 CDTI": "Z13DTJ", "1.2": "A12XER"},
    },
    "HYUNDAI": {
        "Accent": {"1.6 CRDi": "D4FB", "1.4": "G4FA"},
        "i20": {"1.0 T-GDi": "G3LC", "1.4 MPi": "G4LC"},
        "Tucson": {"1.6 CRDi": "D4FE Smartstream"},
    },
    "HONDA": {
        "Civic": {"1.6 i-VTEC": "R16A1", "1.5 VTEC Turbo": "L15B7", "1.6 i-DTEC": "N16A1"},
    },
}

# Additional Turkish-only brands not in NHTSA (they must be added manually)
MANUAL_BRANDS = [
    {
        "brand": "Tofaş",
        "series": [
            {"name": "Şahin", "models": [
                {"name": "1.6 ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["1.6 ie", "1.6 S"]},
                {"name": "1.4", "engine_code": "160 A1.000", "fuel": "LPG", "trims": ["Standart"]}
            ]},
            {"name": "Doğan", "models": [
                {"name": "1.6 SLX ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "SL", "L"]},
            ]},
            {"name": "Kartal", "models": [
                {"name": "1.6 SLX", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "S"]}
            ]},
            {"name": "Murat 131", "models": [{"name": "1.3", "engine_code": "131 A.000", "fuel": "LPG", "trims": ["Şahin", "Doğan"]}]},
            {"name": "Murat 124", "models": [{"name": "1.2", "engine_code": "124 A.000", "fuel": "Benzin", "trims": ["Standart"]}]}
        ]
    },
    {
        "brand": "Anadol",
        "series": [
            {"name": "A1", "models": [{"name": "1.2 MK1", "engine_code": "Ford Kent 1.2", "fuel": "Benzin", "trims": ["Klasik"]}]},
            {"name": "STC-16", "models": [{"name": "1.6 Sport", "engine_code": "Ford Kent 1.6", "fuel": "Benzin", "trims": ["STC Coupe"]}]}
        ]
    },
    {
        "brand": "Togg",
        "series": [
            {"name": "T10X", "models": [
                {"name": "V1 RWD Standart Menzil", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["Standart"]},
                {"name": "V2 RWD Uzun Menzil", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["Standart", "Üst"]},
                {"name": "V3 AWD", "engine_code": "Bosch e-Motor 320kW", "fuel": "Elektrik", "trims": ["Performans"]}
            ]},
            {"name": "T10F", "models": [
                {"name": "RWD", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["Standart", "Üst"]},
                {"name": "AWD", "engine_code": "Bosch e-Motor 320kW", "fuel": "Elektrik", "trims": ["Performans"]}
            ]}
        ]
    },
    {
        "brand": "Cupra",
        "series": [
            {"name": "Formentor", "models": [
                {"name": "1.5 TSI 150", "engine_code": "DADA", "fuel": "Benzin", "trims": ["Base", "VZ"]},
                {"name": "2.0 TSI 310 VZ5", "engine_code": "DNUE", "fuel": "Benzin", "trims": ["VZ5"]}
            ]},
            {"name": "Born", "models": [
                {"name": "58kWh", "engine_code": "APP550", "fuel": "Elektrik", "trims": ["Base", "e-Boost"]}
            ]}
        ]
    },
    {
        "brand": "DS Automobiles",
        "series": [
            {"name": "DS 4", "models": [{"name": "1.2 PureTech 130", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Bastille", "Trocadero", "Rivoli"]}]},
            {"name": "DS 7", "models": [{"name": "1.5 BlueHDi 130", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Bastille", "Rivoli", "Opera"]}]}
        ]
    },
    {
        "brand": "Lada",
        "series": [
            {"name": "Samara", "models": [{"name": "1.5 8V", "engine_code": "BA3-2108", "fuel": "LPG", "trims": ["1.5", "1.3"]}]},
            {"name": "Niva / 4x4", "models": [{"name": "1.7 ie", "engine_code": "BA3-21214", "fuel": "LPG", "trims": ["4x4", "Urban"]}]}
        ]
    },
    {
        "brand": "BMC",
        "series": [
            {"name": "Tuğra", "models": [{"name": "1844 Çekici", "engine_code": "FPT Cursor 11", "fuel": "Dizel", "trims": ["Elegance", "Standart"]}]},
            {"name": "Megastar", "models": [{"name": "2.8 TD", "engine_code": "VM Motori 2.8", "fuel": "Dizel", "trims": ["Panelvan", "Şasi"]}]}
        ]
    },
    {
        "brand": "Ford Trucks",
        "series": [
            {"name": "F-MAX", "models": [{"name": "1850T", "engine_code": "Ecotorq 12.7L 500HP", "fuel": "Dizel", "trims": ["Comfort", "Luxury"]}]},
            {"name": "Cargo", "models": [{"name": "1846T", "engine_code": "Ecotorq 10.3L", "fuel": "Dizel", "trims": ["Low Roof", "High Roof"]}]}
        ]
    },
    {
        "brand": "Temsa",
        "series": [
            {"name": "Maraton", "models": [{"name": "12m", "engine_code": "DAF MX-11", "fuel": "Dizel", "trims": ["Standart"]}]}
        ]
    },
    {
        "brand": "Otokar",
        "series": [
            {"name": "Sultan", "models": [{"name": "Mega", "engine_code": "Cummins ISL", "fuel": "Dizel", "trims": ["Mega", "LF"]}]}
        ]
    }
]


def api_get(url, max_retries=3):
    """Fetch JSON from NHTSA API with retries."""
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CarvisApp/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            print(f"  Retry {attempt+1}/{max_retries} for {url}: {e}")
            time.sleep(1)
    return None


def get_all_makes():
    """Get all passenger car makes from NHTSA."""
    print("Fetching all car makes from NHTSA...")
    data = api_get(f"{BASE_URL}/GetMakesForVehicleType/car?format=json")
    if not data:
        return []
    return [r["MakeName"] for r in data.get("Results", [])]


def get_models_for_make(make_name):
    """Get all models for a given make from NHTSA."""
    encoded = urllib.request.quote(make_name)
    data = api_get(f"{BASE_URL}/GetModelsForMake/{encoded}?format=json")
    if not data:
        return []
    return [r["Model_Name"] for r in data.get("Results", [])]


def build_series_from_models(make_name, model_names):
    """Convert flat model list into our series structure."""
    series = []
    engine_map = KNOWN_ENGINE_CODES.get(make_name, {})

    for model_name in sorted(set(model_names)):
        models_list = []
        known_engines = engine_map.get(model_name, {})

        if known_engines:
            # We have curated engine data for this model
            for eng_name, eng_code in known_engines.items():
                fuel = "Benzin"
                eng_lower = eng_name.lower()
                if any(k in eng_lower for k in ["tdi", "dci", "cdti", "hdi", "bluehdi", "d-4d", "crdi", "dtec", "multijet", "ecoblue"]):
                    fuel = "Dizel"
                elif any(k in eng_lower for k in ["hybrid", "e-tech"]):
                    fuel = "Hibrit"
                elif any(k in eng_lower for k in ["electric", "ev", "elektrik"]):
                    fuel = "Elektrik"
                elif "lpg" in eng_lower or "eco-g" in eng_lower:
                    fuel = "LPG"
                models_list.append({
                    "name": eng_name,
                    "engine_code": eng_code,
                    "fuel": fuel,
                    "trims": ["Standart"]
                })
        else:
            # No curated data, add a generic entry
            models_list.append({
                "name": model_name,
                "engine_code": "",
                "fuel": "Benzin",
                "trims": ["Standart"]
            })

        series.append({
            "name": model_name,
            "models": models_list
        })

    return series


def main():
    print("=" * 60)
    print("CARVIS - AUTOMATIC CAR DATABASE GENERATOR")
    print("Source: NHTSA vPIC API + Manual Turkish Market Data")
    print("=" * 60)

    # 1. Get all makes from NHTSA
    all_nhtsa_makes = get_all_makes()
    print(f"Found {len(all_nhtsa_makes)} makes from NHTSA API")

    # 2. Filter to Turkish market relevant brands
    turkish_makes_upper = {b.upper() for b in TURKISH_MARKET_BRANDS}
    relevant_makes = [m for m in all_nhtsa_makes if m.upper() in turkish_makes_upper]
    print(f"Filtered to {len(relevant_makes)} Turkish-market relevant brands")

    # 3. For each brand, fetch all models
    car_database = []
    total = len(relevant_makes)

    for idx, make_name in enumerate(sorted(relevant_makes)):
        pct = int((idx / total) * 100)
        print(f"[{pct:3d}%] Fetching models for: {make_name}...")

        model_names = get_models_for_make(make_name)
        if not model_names:
            print(f"  WARNING: No models found for {make_name}, skipping.")
            continue

        series = build_series_from_models(make_name.upper(), model_names)

        # Title case the brand name for display
        display_name = make_name.title()
        if make_name.upper() == "BMW":
            display_name = "BMW"
        elif make_name.upper() == "MERCEDES-BENZ":
            display_name = "Mercedes-Benz"
        elif make_name.upper() == "VOLKSWAGEN":
            display_name = "Volkswagen"
        elif make_name.upper() == "DS":
            display_name = "DS Automobiles"
        elif make_name.upper() == "MG":
            display_name = "MG"
        elif make_name.upper() == "BYD":
            display_name = "BYD"
        elif make_name.upper() == "KIA":
            display_name = "Kia"
        elif make_name.upper() == "MAN":
            display_name = "MAN"
        elif make_name.upper() == "IVECO":
            display_name = "IVECO"
        elif make_name.upper() == "ISUZU":
            display_name = "Isuzu"
        elif make_name.upper() == "GMC":
            display_name = "GMC"

        car_database.append({
            "brand": display_name,
            "series": series
        })

        # Be nice to the API
        time.sleep(0.3)

    print(f"[100%] API fetch complete. {len(car_database)} brands loaded.")

    # 4. Add manual Turkish-only brands (Tofaş, Anadol, Togg, etc.)
    manual_brand_names = {b["brand"].upper() for b in MANUAL_BRANDS}
    # Remove duplicates if API already returned them
    car_database = [c for c in car_database if c["brand"].upper() not in manual_brand_names]
    car_database.extend(MANUAL_BRANDS)

    # 5. Sort alphabetically
    car_database.sort(key=lambda x: x["brand"].lower())

    # 6. Generate JavaScript
    code_content = f"export const CAR_DATABASE = {json.dumps(car_database, ensure_ascii=False, indent=2)};\n"

    output_path = "src/constants/carDatabase.js"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(code_content)

    # Stats
    total_brands = len(car_database)
    total_series = sum(len(b["series"]) for b in car_database)
    total_models = sum(len(s["models"]) for b in car_database for s in b["series"])
    print()
    print("=" * 60)
    print(f"SUCCESS! Generated {output_path}")
    print(f"  Brands:  {total_brands}")
    print(f"  Series:  {total_series}")
    print(f"  Models:  {total_models}")
    print("=" * 60)


if __name__ == "__main__":
    main()
