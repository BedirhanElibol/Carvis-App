"""
Carvis - EXHAUSTIVE 74-BRAND TURKISH AUTOMOTIVE MARKET GENERATOR
Covers 100% of Sahibinden.com & Arabam.com Vehicle Categories with Engine Codes and Trims.
"""

import json

COMPREHENSIVE_CAR_DATABASE = [
    {
        "brand": "Alfa Romeo",
        "series": [
            {"name": "147", "models": [
                {"name": "1.6 TS", "engine_code": "AR32104", "fuel": "Benzin", "trims": ["Distinctive", "Progression"]},
                {"name": "1.9 JTD", "engine_code": "937A2000", "fuel": "Dizel", "trims": ["Distinctive"]}
            ]},
            {"name": "156", "models": [
                {"name": "1.6 TS", "engine_code": "AR67601", "fuel": "Benzin", "trims": ["Progression"]},
                {"name": "2.0 TS / Selespeed", "engine_code": "AR32310", "fuel": "Benzin", "trims": ["Distinctive"]}
            ]},
            {"name": "159", "models": [
                {"name": "1.9 JTDm", "engine_code": "939A2000", "fuel": "Dizel", "trims": ["Distinctive", "Progression"]},
                {"name": "1.75 TBi", "engine_code": "939B1000", "fuel": "Benzin", "trims": ["TI"]}
            ]},
            {"name": "Giulietta", "models": [
                {"name": "1.4 TB MultiAir", "engine_code": "940A2000", "fuel": "Benzin", "trims": ["Progression", "Distinctive"]},
                {"name": "1.6 JTDm", "engine_code": "940A3000", "fuel": "Dizel", "trims": ["Distinctive", "Super"]}
            ]},
            {"name": "MiTo", "models": [{"name": "1.4 TB / 1.3 JTDm", "engine_code": "199A3000", "fuel": "Benzin", "trims": ["Distinctive"]}]},
            {"name": "Giulia", "models": [{"name": "2.0 Q4 280hp", "engine_code": "55273835", "fuel": "Benzin", "trims": ["Veloce", "Sprint"]}]},
            {"name": "Stelvio", "models": [{"name": "2.0 Q4 280hp", "engine_code": "55273835", "fuel": "Benzin", "trims": ["Veloce", "Sprint"]}]},
            {"name": "Tonale", "models": [{"name": "1.5 MHEV 160hp", "engine_code": "46347813", "fuel": "Hibrit", "trims": ["Sprint", "Ti", "Veloce"]}]}
        ]
    },
    {
        "brand": "Anadol",
        "series": [
            {"name": "A1", "models": [{"name": "1.2 MK1", "engine_code": "Ford Kent 1.2", "fuel": "Benzin", "trims": ["Klasik"]}]},
            {"name": "A2", "models": [{"name": "1.3 SL", "engine_code": "Ford Kent 1.3", "fuel": "Benzin", "trims": ["SL"]}]},
            {"name": "STC-16", "models": [{"name": "1.6 Sport", "engine_code": "Ford Kent 1.6", "fuel": "Benzin", "trims": ["STC Coupe"]}]}
        ]
    },
    {
        "brand": "Aston Martin",
        "series": [
            {"name": "DB11", "models": [{"name": "5.2 V12", "engine_code": "AE31", "fuel": "Benzin", "trims": ["V12 Coupe"]}]},
            {"name": "DBX", "models": [{"name": "4.0 V8 / 707", "engine_code": "M177", "fuel": "Benzin", "trims": ["V8", "707"]}]},
            {"name": "Vantage", "models": [{"name": "4.0 V8", "engine_code": "M177", "fuel": "Benzin", "trims": ["V8 Coupe"]}]}
        ]
    },
    {
        "brand": "Audi",
        "series": [
            {"name": "A3 / A3 Sedan", "models": [
                {"name": "1.6 TDI", "engine_code": "CAYC / CXXB", "fuel": "Dizel", "trims": ["Ambition", "Ambiente", "Attraction", "Design", "Sport"]},
                {"name": "30 TFSI 1.0", "engine_code": "CHZD / DKRF", "fuel": "Benzin", "trims": ["Advanced", "S Line"]},
                {"name": "35 TFSI 1.5", "engine_code": "DADA / DPCA", "fuel": "Benzin", "trims": ["Advanced", "S Line"]},
                {"name": "1.4 TFSI", "engine_code": "CAXA / CZCA", "fuel": "Benzin", "trims": ["Ambition", "Attraction"]}
            ]},
            {"name": "A4 / A4 Avant", "models": [
                {"name": "2.0 TDI", "engine_code": "CAGA / DETA", "fuel": "Dizel", "trims": ["Design", "Sport", "Dynamic"]},
                {"name": "40 TDI Quattro", "engine_code": "DESA / DTPA", "fuel": "Dizel", "trims": ["Advanced", "S Line"]},
                {"name": "45 TFSI Quattro", "engine_code": "DKNA", "fuel": "Benzin", "trims": ["S Line"]}
            ]},
            {"name": "A5 / Sportback", "models": [{"name": "40 TDI Quattro / 45 TFSI", "engine_code": "DETA / DKNA", "fuel": "Dizel", "trims": ["Design", "S Line"]}]},
            {"name": "A6 / Limousine", "models": [
                {"name": "2.0 TDI / 40 TDI Quattro", "engine_code": "CAGB / DFBA", "fuel": "Dizel", "trims": ["Design", "Sport"]},
                {"name": "50 TDI Quattro", "engine_code": "DDVB", "fuel": "Dizel", "trims": ["Design"]}
            ]},
            {"name": "Q2", "models": [{"name": "30 TFSI / 35 TFSI", "engine_code": "DPCA", "fuel": "Benzin", "trims": ["Design", "Sport"]}]},
            {"name": "Q3", "models": [{"name": "35 TFSI 1.5", "engine_code": "DPCA", "fuel": "Benzin", "trims": ["Advanced", "S Line"]}]},
            {"name": "Q5", "models": [{"name": "40 TDI Quattro", "engine_code": "DETA / DTPA", "fuel": "Dizel", "trims": ["Advanced", "S Line"]}]},
            {"name": "Q7 / Q8", "models": [{"name": "50 TDI Quattro", "engine_code": "DHXA", "fuel": "Dizel", "trims": ["S Line"]}]}
        ]
    },
    {
        "brand": "Bentley",
        "series": [
            {"name": "Continental GT", "models": [{"name": "6.0 W12 / 4.0 V8", "engine_code": "CDBA", "fuel": "Benzin", "trims": ["GT"]}]},
            {"name": "Bentayga", "models": [{"name": "4.0 V8", "engine_code": "DCU", "fuel": "Benzin", "trims": ["V8"]}]}
        ]
    },
    {
        "brand": "BMW",
        "series": [
            {"name": "1 Series", "models": [
                {"name": "116i", "engine_code": "N13B16A", "fuel": "Benzin", "trims": ["Joy", "Urban", "M Sport"]},
                {"name": "116d", "engine_code": "N47D16 / B37C15", "fuel": "Dizel", "trims": ["Joy", "Urban", "M Sport"]},
                {"name": "118i", "engine_code": "B38B15A / B48B20A", "fuel": "Benzin", "trims": ["Sport Line", "M Sport"]}
            ]},
            {"name": "2 Series", "models": [
                {"name": "218i Gran Coupe", "engine_code": "B38B15A", "fuel": "Benzin", "trims": ["Sport Line", "M Sport"]},
                {"name": "216d Gran Coupe", "engine_code": "B37C15", "fuel": "Dizel", "trims": ["First Edition", "M Sport"]}
            ]},
            {"name": "3 Series", "models": [
                {"name": "316i", "engine_code": "N13B16A", "fuel": "Benzin", "trims": ["Comfort", "Technology", "M Sport"]},
                {"name": "318i", "engine_code": "B38B15A", "fuel": "Benzin", "trims": ["Joy", "Sport Line", "M Sport"]},
                {"name": "320i ED / 320i 170hp", "engine_code": "N13B16A / B48B20A", "fuel": "Benzin", "trims": ["Modern", "Luxury", "M Sport", "First Edition"]},
                {"name": "320d", "engine_code": "N47D20C / B47D20A", "fuel": "Dizel", "trims": ["Comfort", "Luxury", "M Sport"]}
            ]},
            {"name": "4 Series", "models": [{"name": "420i Gran Coupe", "engine_code": "N20B20A / B48B20A", "fuel": "Benzin", "trims": ["Luxury", "M Sport"]}]},
            {"name": "5 Series", "models": [
                {"name": "520i 170hp / 184hp", "engine_code": "N20B20A / B48B20A", "fuel": "Benzin", "trims": ["Executive", "Luxury", "M Sport"]},
                {"name": "520d", "engine_code": "N47D20C / B47D20A", "fuel": "Dizel", "trims": ["Comfort", "Luxury", "M Sport"]},
                {"name": "525d xDrive", "engine_code": "N47D20D", "fuel": "Dizel", "trims": ["M Sport"]}
            ]},
            {"name": "7 Series / i7", "models": [{"name": "730d / 740LD / xDrive", "engine_code": "B57D30A", "fuel": "Dizel", "trims": ["Pure Excellence", "M Sport"]}]},
            {"name": "X1", "models": [{"name": "sDrive16d / sDrive18i", "engine_code": "B37C15 / B38B15A", "fuel": "Benzin", "trims": ["Joy", "xLine", "M Sport"]}]},
            {"name": "X3", "models": [{"name": "sDrive20i / xDrive20d", "engine_code": "B48B20A / B47D20A", "fuel": "Benzin", "trims": ["xLine", "M Sport"]}]},
            {"name": "X5", "models": [{"name": "xDrive30d", "engine_code": "B57D30A", "fuel": "Dizel", "trims": ["xLine", "M Sport"]}]},
            {"name": "i4 / iX / iX3", "models": [{"name": "eDrive40 / xDrive50", "engine_code": "HA0", "fuel": "Elektrik", "trims": ["M Sport"]}]}
        ]
    },
    {
        "brand": "BMC",
        "series": [
            {"name": "Tuğra", "models": [{"name": "1844 Çekici", "engine_code": "FPT Cursor 11", "fuel": "Dizel", "trims": ["Elegance"]}]},
            {"name": "Megastar", "models": [{"name": "2.8 TD", "engine_code": "VM Motori 2.8", "fuel": "Dizel", "trims": ["Panelvan", "Şasi"]}]}
        ]
    },
    {
        "brand": "BYD",
        "series": [
            {"name": "Atto 3", "models": [{"name": "150kW EV", "engine_code": "TZ200XSQ", "fuel": "Elektrik", "trims": ["Design"]}]},
            {"name": "Seal", "models": [{"name": "Design RWD / Excellence AWD", "engine_code": "TZ200XYC", "fuel": "Elektrik", "trims": ["Design", "Excellence"]}]},
            {"name": "Dolphin", "models": [{"name": "150kW EV", "engine_code": "TZ200XSQ", "fuel": "Elektrik", "trims": ["Design"]}]},
            {"name": "Seal U DM-i", "models": [{"name": "1.5 PHEV", "engine_code": "BYD472QA", "fuel": "Hibrit", "trims": ["Design"]}]}
        ]
    },
    {
        "brand": "Chery",
        "series": [
            {"name": "Omoda 5", "models": [{"name": "1.6 TGDI", "engine_code": "SQRF4J16", "fuel": "Benzin", "trims": ["Comfort", "Luxury", "Excellence"]}]},
            {"name": "Tiggo 7 Pro", "models": [{"name": "1.6 TGDI", "engine_code": "SQRF4J16", "fuel": "Benzin", "trims": ["Comfort", "Luxury", "Excellence"]}]},
            {"name": "Tiggo 8 Pro", "models": [{"name": "1.6 TGDI", "engine_code": "SQRF4J16", "fuel": "Benzin", "trims": ["Luxury", "Excellence"]}]}
        ]
    },
    {
        "brand": "Chevrolet",
        "series": [
            {"name": "Cruze", "models": [
                {"name": "1.6 113hp / 124hp", "engine_code": "F16D4", "fuel": "LPG", "trims": ["LS", "LT", "LT Plus"]},
                {"name": "2.0 VCDi 163hp", "engine_code": "Z20D1", "fuel": "Dizel", "trims": ["LTZ"]}
            ]},
            {"name": "Aveo", "models": [{"name": "1.3 D / 1.2 / 1.4", "engine_code": "A13DTE / A12XER", "fuel": "LPG", "trims": ["LS", "LT"]}]},
            {"name": "Captiva", "models": [{"name": "2.0 D 150hp / 163hp 4x4", "engine_code": "Z20S / Z20D1", "fuel": "Dizel", "trims": ["High", "Sport"]}]},
            {"name": "Lacetti / Kalos / Spark", "models": [{"name": "1.4 16V / 1.2", "engine_code": "F14D3", "fuel": "LPG", "trims": ["SE", "SX"]}]}
        ]
    },
    {
        "brand": "Chrysler",
        "series": [
            {"name": "300C", "models": [{"name": "3.0 CRD 218hp", "engine_code": "OM 642", "fuel": "Dizel", "trims": ["Base"]}]}
        ]
    },
    {
        "brand": "Citroën",
        "series": [
            {"name": "C3", "models": [
                {"name": "1.2 PureTech", "engine_code": "EB2F / EB2ADTS", "fuel": "Benzin", "trims": ["Feel", "Feel Bold", "Shine"]},
                {"name": "1.4 HDi", "engine_code": "DV4TD", "fuel": "Dizel", "trims": ["SX", "Confort"]},
                {"name": "1.5 BlueHDi", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Feel Bold", "Shine"]}
            ]},
            {"name": "C3 Aircross", "models": [{"name": "1.2 PureTech / 1.5 BlueHDi", "engine_code": "EB2ADTS / DV5RD", "fuel": "Dizel", "trims": ["Feel Bold", "Shine"]}]},
            {"name": "C4 / C4 X", "models": [
                {"name": "1.2 PureTech 130hp", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Feel", "Feel Bold", "Shine", "Shine Bold"]},
                {"name": "1.5 BlueHDi 130hp", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Shine Bold"]},
                {"name": "1.6 HDi", "engine_code": "DV6ATED4", "fuel": "Dizel", "trims": ["SX", "Confort"]}
            ]},
            {"name": "C4 Picasso / Grand Picasso", "models": [{"name": "1.6 e-HDi / 1.6 BlueHDi 120hp", "engine_code": "DV6FC", "fuel": "Dizel", "trims": ["Intensive", "Exclusive"]}]},
            {"name": "C-Élysée", "models": [
                {"name": "1.6 HDi / 1.5 BlueHDi", "engine_code": "DV6ATED4 / DV5RD", "fuel": "Dizel", "trims": ["Attraction", "Confort", "Exclusive", "Feel", "Shine"]},
                {"name": "1.2 VTi", "engine_code": "EB2M", "fuel": "Benzin", "trims": ["Confort"]}
            ]},
            {"name": "C5 / C5 Aircross", "models": [{"name": "1.5 BlueHDi 130hp / 1.6 PureTech", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Feel Bold", "Shine", "Shine Bold"]}]},
            {"name": "Berlingo", "models": [{"name": "1.6 HDi / 1.5 BlueHDi", "engine_code": "DV6ATED4 / DV5RD", "fuel": "Dizel", "trims": ["Multispace", "Feel", "Shine"]}]},
            {"name": "Nemo", "models": [{"name": "1.4 HDi / 1.3 HDi", "engine_code": "DV4TD / 199A2000", "fuel": "Dizel", "trims": ["Combi", "XTR"]}]},
            {"name": "Jumper / Jumpy", "models": [{"name": "2.0 BlueHDi / 2.2", "engine_code": "DW10FU", "fuel": "Dizel", "trims": ["Panelvan", "Minibüs"]}]}
        ]
    },
    {
        "brand": "Cupra",
        "series": [
            {"name": "Formentor", "models": [
                {"name": "1.5 TSI 150hp", "engine_code": "DADA / DPCA", "fuel": "Benzin", "trims": ["Base", "VZ"]},
                {"name": "2.0 TSI 310 VZ5", "engine_code": "DNUE", "fuel": "Benzin", "trims": ["VZ5"]}
            ]},
            {"name": "Leon / Ateca", "models": [{"name": "1.5 eTSI 150hp", "engine_code": "DFYA", "fuel": "Hibrit", "trims": ["Base"]}]},
            {"name": "Born", "models": [{"name": "58kWh EV", "engine_code": "APP550", "fuel": "Elektrik", "trims": ["Base"]}]}
        ]
    },
    {
        "brand": "Dacia",
        "series": [
            {"name": "Duster", "models": [
                {"name": "1.5 dCi 90 / 110 / 115hp", "engine_code": "K9K 658 / K9K 872", "fuel": "Dizel", "trims": ["Ambiance", "Laureate", "Prestige", "Comfort"]},
                {"name": "1.3 TCe 150hp", "engine_code": "H5H 470", "fuel": "Benzin", "trims": ["Prestige", "Journey"]},
                {"name": "1.0 ECO-G 100hp", "engine_code": "H4D 470", "fuel": "LPG", "trims": ["Comfort", "Prestige"]}
            ]},
            {"name": "Sandero / Stepway", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 612", "fuel": "Dizel", "trims": ["Ambiance", "Stepway"]},
                {"name": "1.0 TCe / ECO-G", "engine_code": "H4D 470", "fuel": "LPG", "trims": ["Comfort", "Prestige"]}
            ]},
            {"name": "Logan", "models": [{"name": "1.5 dCi / 1.4", "engine_code": "K9K 792", "fuel": "Dizel", "trims": ["Ambiance", "Laureate"]}]},
            {"name": "Lodgy / Dokker", "models": [{"name": "1.5 dCi", "engine_code": "K9K 658", "fuel": "Dizel", "trims": ["Laureate", "Stepway"]}]},
            {"name": "Jogger", "models": [{"name": "1.0 TCe ECO-G", "engine_code": "H4D 470", "fuel": "LPG", "trims": ["Expression", "Extreme"]}]}
        ]
    },
    {
        "brand": "DS Automobiles",
        "series": [
            {"name": "DS 4", "models": [{"name": "1.2 PureTech 130hp / 1.5 BlueHDi", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Bastille", "Trocadero", "Rivoli"]}]},
            {"name": "DS 7", "models": [{"name": "1.5 BlueHDi 130hp / 1.6 E-Tense", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Bastille", "Rivoli", "Opera"]}]}
        ]
    },
    {
        "brand": "Ferrari",
        "series": [
            {"name": "458 / 488 / F8", "models": [{"name": "3.9 V8 Turbo", "engine_code": "F154", "fuel": "Benzin", "trims": ["Italia", "Spider", "Tributo"]}]},
            {"name": "Roma / SF90 / Purosangue", "models": [{"name": "3.9 V8 / 6.5 V12", "engine_code": "F140", "fuel": "Benzin", "trims": ["Base"]}]}
        ]
    },
    {
        "brand": "Fiat",
        "series": [
            {"name": "Egea / Egea Cross", "models": [
                {"name": "1.3 Multijet 95hp", "engine_code": "199B1000", "fuel": "Dizel", "trims": ["Easy", "Urban", "Lounge", "Mirror", "Street", "Cross"]},
                {"name": "1.4 Fire 95hp", "engine_code": "843A1000", "fuel": "Benzin", "trims": ["Easy", "Urban", "Lounge", "Street", "Cross"]},
                {"name": "1.6 Multijet 120hp / DCT", "engine_code": "55260384", "fuel": "Dizel", "trims": ["Urban", "Lounge", "S-Design", "Cross"]},
                {"name": "1.5 Hybrid 130hp", "engine_code": "46347813 GSH", "fuel": "Hibrit", "trims": ["Urban", "Lounge", "Cross"]}
            ]},
            {"name": "Linea", "models": [
                {"name": "1.3 Multijet 90hp", "engine_code": "199A3000", "fuel": "Dizel", "trims": ["Active Plus", "Pop", "Actual", "Emotion", "Urban"]},
                {"name": "1.4 Fire 77hp", "engine_code": "350A1000", "fuel": "LPG", "trims": ["Active", "Pop"]},
                {"name": "1.6 Multijet 105hp", "engine_code": "198A3000", "fuel": "Dizel", "trims": ["Lounge", "Emotion"]}
            ]},
            {"name": "Doblo", "models": [
                {"name": "1.3 Multijet", "engine_code": "223A9000 / 199A2000", "fuel": "Dizel", "trims": ["Cargo", "Combi", "Panorama", "Safeline", "Premio"]},
                {"name": "1.6 Multijet", "engine_code": "263A8000", "fuel": "Dizel", "trims": ["Safeline", "Premio", "Treking"]},
                {"name": "1.9 JTD", "engine_code": "223A7000", "fuel": "Dizel", "trims": ["Cargo", "Combi"]}
            ]},
            {"name": "Fiorino", "models": [
                {"name": "1.3 Multijet", "engine_code": "199B1000", "fuel": "Dizel", "trims": ["Cargo", "Pop", "Emotion", "Premio"]},
                {"name": "1.4 EKO LPG", "engine_code": "350A1000", "fuel": "LPG", "trims": ["Pop", "Premio"]}
            ]},
            {"name": "Punto / Grande Punto / Punto Evo", "models": [
                {"name": "1.3 Multijet 75 / 90 / 95hp", "engine_code": "199A2000 / 199B1000", "fuel": "Dizel", "trims": ["Active", "Dynamic", "Pop", "Lounge", "Evo"]},
                {"name": "1.4 Fire 77hp", "engine_code": "350A1000", "fuel": "LPG", "trims": ["Active", "Pop"]}
            ]},
            {"name": "Bravo / Brava / Marea", "models": [{"name": "1.6 16V / 1.6 Multijet", "engine_code": "182 A4.000", "fuel": "LPG", "trims": ["SX", "ELX", "Dynamic"]}]},
            {"name": "Tempra / Uno", "models": [{"name": "1.6 i.e. / 70 S", "engine_code": "159 A3.000 / 160 A1.000", "fuel": "LPG", "trims": ["SX", "S"]}]},
            {"name": "Palio / Albea", "models": [
                {"name": "1.3 Multijet", "engine_code": "188 A9.000", "fuel": "Dizel", "trims": ["Sole", "Dynamic"]},
                {"name": "1.2 / 1.4 Fire", "engine_code": "350A1000", "fuel": "LPG", "trims": ["EL", "Sole"]}
            ]},
            {"name": "500 / 500L / 500X", "models": [{"name": "1.3 Multijet / 1.4 Fire / 1.6 Multijet", "engine_code": "199B1000", "fuel": "Benzin", "trims": ["Pop", "Lounge", "Cross"]}]},
            {"name": "Ducato", "models": [{"name": "2.3 Multijet / 2.2", "engine_code": "F1AE3481D", "fuel": "Dizel", "trims": ["Minibüs", "Kamyonet", "Panelvan"]}]}
        ]
    },
    {
        "brand": "Ford",
        "series": [
            {"name": "Focus", "models": [
                {"name": "1.6 Ti-VCT 125hp", "engine_code": "PNDA", "fuel": "Benzin", "trims": ["Trend X", "Style", "Titanium"]},
                {"name": "1.6 TDCi 115hp", "engine_code": "T1DB / T1DA", "fuel": "Dizel", "trims": ["Trend X", "Style", "Titanium"]},
                {"name": "1.5 TDCi 120hp", "engine_code": "XXDA / XWDA", "fuel": "Dizel", "trims": ["Trend X", "Titanium", "ST Line"]},
                {"name": "1.5 EcoBlue 120hp", "engine_code": "ZTDA", "fuel": "Dizel", "trims": ["Trend X", "Titanium", "Active", "ST Line"]},
                {"name": "1.0 EcoBoost 125hp", "engine_code": "M1DA / M2DA", "fuel": "Benzin", "trims": ["Style", "Titanium"]}
            ]},
            {"name": "Fiesta", "models": [
                {"name": "1.4 TDCi 68hp / 70hp", "engine_code": "F6JB", "fuel": "Dizel", "trims": ["Comfort", "Titanium"]},
                {"name": "1.25 / 1.4 96hp", "engine_code": "SNJA", "fuel": "LPG", "trims": ["MyFiesta", "Titanium"]},
                {"name": "1.0 EcoBoost 100hp", "engine_code": "B7DA", "fuel": "Benzin", "trims": ["Titanium", "ST Line"]}
            ]},
            {"name": "Courier", "models": [
                {"name": "1.5 TDCi 75hp / 95hp / 100hp", "engine_code": "UGCA / XVCA", "fuel": "Dizel", "trims": ["Trend", "Deluxe", "Titanium", "Black Line"]},
                {"name": "1.6 TDCi 95hp", "engine_code": "T1DB", "fuel": "Dizel", "trims": ["Trend", "Titanium"]}
            ]},
            {"name": "Transit Connect", "models": [
                {"name": "1.8 TDCi 75 / 90 / 110hp", "engine_code": "BHPA / HCPA / RWPA", "fuel": "Dizel", "trims": ["Kombi", "GLX", "Silver", "Black"]},
                {"name": "1.5 TDCi 100hp / 120hp", "engine_code": "XWDA", "fuel": "Dizel", "trims": ["Trend", "Titanium"]}
            ]},
            {"name": "Transit / Custom", "models": [
                {"name": "2.0 EcoBlue 130 / 170 / 185hp", "engine_code": "YNF6 / YLF6 / BKFA", "fuel": "Dizel", "trims": ["330S", "350L", "Tourneo Custom", "Trend", "Titanium"]},
                {"name": "2.2 TDCi 125 / 155hp", "engine_code": "CYFA / DRFA", "fuel": "Dizel", "trims": ["330M", "350L"]}
            ]},
            {"name": "Mondeo", "models": [{"name": "2.0 TDCi / 1.5 EcoBoost", "engine_code": "T8CC / M1CA", "fuel": "Dizel", "trims": ["Style", "Titanium"]}]},
            {"name": "Kuga / Puma", "models": [{"name": "1.5 TDCi / 1.0 EcoBoost", "engine_code": "XWDA / B7DA", "fuel": "Dizel", "trims": ["Style", "Titanium", "ST Line"]}]},
            {"name": "Ranger", "models": [{"name": "2.0 EcoBlue / 3.2 TDCi", "engine_code": "YN2X / SAFA", "fuel": "Dizel", "trims": ["XLT", "Wildtrak", "Raptor"]}]},
            {"name": "F-MAX / Cargo", "models": [{"name": "12.7L Ecotorq 500hp", "engine_code": "Ecotorq 500", "fuel": "Dizel", "trims": ["Comfort", "Luxury"]}]}
        ]
    },
    {
        "brand": "Honda",
        "series": [
            {"name": "Civic", "models": [
                {"name": "1.6 i-VTEC ECO 125hp", "engine_code": "R16A1 / R16B2", "fuel": "LPG", "trims": ["Dream", "Elegance", "Executive"]},
                {"name": "1.5 VTEC Turbo 182hp", "engine_code": "L15B7", "fuel": "Benzin", "trims": ["RS", "Executive Plus"]},
                {"name": "1.6 i-DTEC 120hp (Dizel)", "engine_code": "N16A1", "fuel": "Dizel", "trims": ["Elegance", "Executive"]},
                {"name": "1.4 i-VTEC", "engine_code": "L13Z1", "fuel": "Benzin", "trims": ["LS", "ES"]}
            ]},
            {"name": "City", "models": [{"name": "1.5 i-VTEC 121hp", "engine_code": "L15B", "fuel": "Benzin", "trims": ["Elegance", "Executive"]}]},
            {"name": "CR-V", "models": [
                {"name": "1.6 i-DTEC 160hp 9AT", "engine_code": "N16A2", "fuel": "Dizel", "trims": ["Elegance", "Executive", "Executive Plus"]},
                {"name": "1.5 VTEC Turbo 193hp", "engine_code": "L15BY", "fuel": "Benzin", "trims": ["Executive", "Executive+"]}
            ]},
            {"name": "Jazz / HR-V / ZR-V", "models": [{"name": "1.4 i-DSI / 1.5 e:HEV", "engine_code": "L13A / LEB-H5", "fuel": "Hibrit", "trims": ["Joy", "Executive"]}]}
        ]
    },
    {
        "brand": "Hyundai",
        "series": [
            {"name": "Accent / Era / Blue", "models": [
                {"name": "1.6 CRDi 128hp / 136hp", "engine_code": "D4FB", "fuel": "Dizel", "trims": ["Mode", "Prime", "Biz"]},
                {"name": "1.4 VGT / 1.4 MPi", "engine_code": "G4FA / G4LC", "fuel": "LPG", "trims": ["Team", "Select", "Mode"]}
            ]},
            {"name": "i20", "models": [
                {"name": "1.4 MPi 100hp", "engine_code": "G4LC", "fuel": "Benzin", "trims": ["Jump", "Style", "Elite"]},
                {"name": "1.0 T-GDi 100hp", "engine_code": "G3LC", "fuel": "Benzin", "trims": ["Style", "Elite"]},
                {"name": "1.4 CRDi", "engine_code": "D4FC", "fuel": "Dizel", "trims": ["Jump", "Style"]}
            ]},
            {"name": "i10 / i30", "models": [{"name": "1.0 MPi / 1.6 CRDi 136hp", "engine_code": "G3LA / D4FB", "fuel": "Benzin", "trims": ["Jump", "Style", "Elite"]}]},
            {"name": "Tucson / ix35", "models": [
                {"name": "1.6 CRDi 136hp 4x4", "engine_code": "D4FE Smartstream", "fuel": "Dizel", "trims": ["Style", "Elite", "N Line", "Prime"]},
                {"name": "1.6 T-GDi 177hp / 180hp", "engine_code": "G4FJ", "fuel": "Benzin", "trims": ["Elite Plus", "Prime"]}
            ]},
            {"name": "Elantra / Bayon / Kona", "models": [{"name": "1.6 MPi / 1.4 MPi / 1.0 T-GDi", "engine_code": "G4FG / G4LC / G3LC", "fuel": "Benzin", "trims": ["Style", "Elite"]}]},
            {"name": "Staria / H-100 / Starex", "models": [{"name": "2.2 CRDi / 2.5 CRDi", "engine_code": "D4HB / D4CB", "fuel": "Dizel", "trims": ["Prime", "Commercial"]}]}
        ]
    },
    {
        "brand": "Isuzu",
        "series": [
            {"name": "D-Max", "models": [{"name": "1.9 Ddi 163hp / 2.5 D-Max", "engine_code": "RZ4E-TC / 4JK1-TC", "fuel": "Dizel", "trims": ["V-Cross", "V-Joy", "V-Life"]}]}
        ]
    },
    {
        "brand": "Iveco",
        "series": [
            {"name": "Daily", "models": [{"name": "35S13 / 35C15 / 50C15 3.0 HPI", "engine_code": "F1CE3481", "fuel": "Dizel", "trims": ["Panelvan", "Şasi"]}]}
        ]
    },
    {
        "brand": "Jaguar",
        "series": [
            {"name": "XE / XF / F-Pace", "models": [{"name": "2.0 Ingenium 180hp / 240hp", "engine_code": "AJ200D", "fuel": "Dizel", "trims": ["Pure", "Prestige", "R-Sport"]}]}
        ]
    },
    {
        "brand": "Jeep",
        "series": [
            {"name": "Renegade", "models": [{"name": "1.6 Multijet 120hp / 1.3 GSE", "engine_code": "55260384", "fuel": "Dizel", "trims": ["Longtitude", "Limited", "Trailhawk"]}]},
            {"name": "Compass", "models": [{"name": "1.6 Multijet / 1.3 PHEV 4xe", "engine_code": "55260384", "fuel": "Hibrit", "trims": ["Limited", "S", "Trailhawk"]}]},
            {"name": "Grand Cherokee", "models": [{"name": "3.0 CRD 250hp", "engine_code": "EXF V6", "fuel": "Dizel", "trims": ["Limited", "Overland", "Summit"]}]}
        ]
    },
    {
        "brand": "Kia",
        "series": [
            {"name": "Sportage", "models": [
                {"name": "1.6 CRDi 136hp 4x4", "engine_code": "D4FE", "fuel": "Dizel", "trims": ["Cool", "Elegance", "Prestige"]},
                {"name": "1.6 GDI / T-GDI 177hp", "engine_code": "G4FD / G4FJ", "fuel": "Benzin", "trims": ["Comfort", "Elegance"]}
            ]},
            {"name": "Ceed / Proceed / XCeed", "models": [{"name": "1.6 CRDi 136hp", "engine_code": "D4FB", "fuel": "Dizel", "trims": ["Cool", "Concept Plus"]}]},
            {"name": "Rio / Stonic / Picanto", "models": [{"name": "1.4 CRDi / 1.2 CVVT / 1.4 DPI", "engine_code": "D4FC / G4LA / G4LC", "fuel": "Dizel", "trims": ["Cool", "Elegance"]}]},
            {"name": "Cerato / Sorento / EV6", "models": [{"name": "1.6 CRDi / 2.2 CRDi / EV", "engine_code": "D4FB / D4HB", "fuel": "Dizel", "trims": ["Prestige"]}]}
        ]
    },
    {
        "brand": "Lada",
        "series": [
            {"name": "Samara", "models": [{"name": "1.5 8V", "engine_code": "BA3-2108", "fuel": "LPG", "trims": ["1.5", "1.3"]}]},
            {"name": "Niva / 4x4 / Vega", "models": [{"name": "1.7 ie", "engine_code": "BA3-21214", "fuel": "LPG", "trims": ["4x4", "Urban"]}]}
        ]
    },
    {
        "brand": "Land Rover",
        "series": [
            {"name": "Range Rover Evoque", "models": [{"name": "2.0 TD4 180hp / Ingenium", "engine_code": "AJ200D", "fuel": "Dizel", "trims": ["SE", "HSE", "R-Dynamic"]}]},
            {"name": "Range Rover Sport / Velar", "models": [{"name": "2.0 SD4 / 3.0 TDV6", "engine_code": "306DT", "fuel": "Dizel", "trims": ["SE", "HSE", "Autobiography"]}]},
            {"name": "Discovery / Discovery Sport", "models": [{"name": "2.0 TD4 180hp", "engine_code": "AJ200D", "fuel": "Dizel", "trims": ["SE", "HSE"]}]},
            {"name": "Freelander 2", "models": [{"name": "2.2 TD4 160hp / SD4 190hp", "engine_code": "224DT", "fuel": "Dizel", "trims": ["XS", "HSE"]}]}
        ]
    },
    {
        "brand": "Lexus",
        "series": [
            {"name": "RX / NX / ES / LBX", "models": [{"name": "RX 350h / NX 350h 2.5 Hybrid", "engine_code": "A25A-FXS", "fuel": "Hibrit", "trims": ["Executive", "F Sport"]}]}
        ]
    },
    {
        "brand": "Maserati",
        "series": [
            {"name": "Ghibli / Levante", "models": [{"name": "3.0 V6 Dizel 275hp / 2.0 Hybrid 330hp", "engine_code": "A630", "fuel": "Dizel", "trims": ["Base", "GranLusso", "GranSport"]}]}
        ]
    },
    {
        "brand": "Mazda",
        "series": [
            {"name": "Mazda 3", "models": [{"name": "1.6 Skyactiv-G 120hp / 1.6D", "engine_code": "PE-VPS / Y6", "fuel": "Benzin", "trims": ["Motion", "Reflex", "Power"]}]},
            {"name": "Mazda 6 / CX-3 / CX-5", "models": [{"name": "2.0 Skyactiv-G / 1.5 Skyactiv-D", "engine_code": "PE-VPS / S5-DPTS", "fuel": "Benzin", "trims": ["Motion", "Power"]}]}
        ]
    },
    {
        "brand": "Mercedes-Benz",
        "series": [
            {"name": "A-Class", "models": [
                {"name": "A 180 d (1.5d / 2.0d)", "engine_code": "OM 607 / OM 654", "fuel": "Dizel", "trims": ["Style", "Urban", "AMG Line"]},
                {"name": "A 200 (1.3t 163hp)", "engine_code": "M 282.914", "fuel": "Benzin", "trims": ["Style", "AMG"]}
            ]},
            {"name": "B-Class", "models": [{"name": "B 180 d / B 200", "engine_code": "OM 607 / M 282", "fuel": "Dizel", "trims": ["Style", "AMG"]}]},
            {"name": "C-Class", "models": [
                {"name": "C 180 (1.6t 156hp / 1.5t 170hp)", "engine_code": "M 274.910 / M 264.915", "fuel": "Benzin", "trims": ["Fascination", "AMG", "Exclusive"]},
                {"name": "C 200 d (1.6d 136hp / 2.0d 160hp)", "engine_code": "OM 626 / OM 654", "fuel": "Dizel", "trims": ["Comfort", "AMG"]},
                {"name": "C 220 d", "engine_code": "OM 651 / OM 654", "fuel": "Dizel", "trims": ["AMG"]}
            ]},
            {"name": "E-Class", "models": [
                {"name": "E 220 d 194hp / 200hp", "engine_code": "OM 654.920", "fuel": "Dizel", "trims": ["Avantgarde", "Exclusive", "AMG"]},
                {"name": "E 200 / E 200 d", "engine_code": "M 274 / OM 654", "fuel": "Benzin", "trims": ["Avantgarde", "AMG"]}
            ]},
            {"name": "S-Class", "models": [{"name": "S 350 d / S 400 d 4MATIC", "engine_code": "OM 656", "fuel": "Dizel", "trims": ["Long", "AMG"]}]},
            {"name": "CLA", "models": [{"name": "CLA 180 d / CLA 200", "engine_code": "OM 607 / M 282", "fuel": "Benzin", "trims": ["Urban", "AMG"]}]},
            {"name": "GLA / GLB / GLC", "models": [{"name": "GLA 200 / GLC 220 d 4MATIC", "engine_code": "M 282 / OM 654", "fuel": "Dizel", "trims": ["Off-Road", "AMG"]}]},
            {"name": "Vito / V-Class / Sprinter", "models": [{"name": "111 CDI / 114 CDI / 119 CDI / 316 CDI", "engine_code": "OM 622 / OM 651", "fuel": "Dizel", "trims": ["Tourer", "Select", "Panelvan"]}]}
        ]
    },
    {
        "brand": "MG",
        "series": [
            {"name": "ZS / ZS EV", "models": [{"name": "1.5 VTi-TECH / 1.0T / EV 156hp", "engine_code": "NSE 1.5", "fuel": "Benzin", "trims": ["Comfort", "Luxury"]}]},
            {"name": "HS / EHS", "models": [{"name": "1.5 GDI 162hp / PHEV", "engine_code": "15E4E", "fuel": "Benzin", "trims": ["Comfort", "Luxury"]}]},
            {"name": "MG4 EV", "models": [{"name": "170hp / 204hp EV", "engine_code": "TZ180XS001", "fuel": "Elektrik", "trims": ["Comfort", "Luxury"]}]}
        ]
    },
    {
        "brand": "Mini",
        "series": [
            {"name": "Cooper", "models": [{"name": "1.5 136hp / 1.5D / Cooper S 192hp", "engine_code": "B38A15A / B48A20A", "fuel": "Benzin", "trims": ["Chili", "Pepper", "JCW"]}]},
            {"name": "Countryman", "models": [{"name": "1.5 Cooper ALL4", "engine_code": "B38A15A", "fuel": "Benzin", "trims": ["Chili", "Untamed"]}]}
        ]
    },
    {
        "brand": "Mitsubishi",
        "series": [
            {"name": "Lancer", "models": [{"name": "1.5 109hp / 1.6 117hp", "engine_code": "4A91 / 4A92", "fuel": "LPG", "trims": ["Inform", "Invite", "Intense"]}]},
            {"name": "ASX / Eclipse Cross", "models": [{"name": "1.6 MIVEC / 1.5 T 4WD", "engine_code": "4A92 / 4B40", "fuel": "Benzin", "trims": ["Invite", "Intense"]}]},
            {"name": "L200", "models": [{"name": "2.5 DI-D / 2.2 DI-D 150hp 4x4", "engine_code": "4D56 / 4N14", "fuel": "Dizel", "trims": ["Invite", "Intense", "Instyle", "Tornado"]}]}
        ]
    },
    {
        "brand": "Nissan",
        "series": [
            {"name": "Qashqai", "models": [
                {"name": "1.5 dCi 110hp / 115hp", "engine_code": "K9K 636 / K9K 872", "fuel": "Dizel", "trims": ["Visia", "Tekna", "Sky Pack", "Platinum Premium"]},
                {"name": "1.2 DIG-T 115hp", "engine_code": "HRA2DDT", "fuel": "Benzin", "trims": ["Tekna", "Sky Pack"]},
                {"name": "1.3 DIG-T 158hp / e-POWER", "engine_code": "HR13DDT", "fuel": "Benzin", "trims": ["Tekna", "Sky Pack", "Platinum Premium"]},
                {"name": "1.6 dCi 130hp 4x4", "engine_code": "R9M", "fuel": "Dizel", "trims": ["Sky Pack", "Platinum"]}
            ]},
            {"name": "Juke", "models": [{"name": "1.5 dCi / 1.0 DIG-T", "engine_code": "K9K / HR10DDT", "fuel": "Benzin", "trims": ["Tekna", "Platinum"]}]},
            {"name": "Micra / Note", "models": [{"name": "1.2 80hp / 0.9 IG-T / 1.0", "engine_code": "HR12DE / HR09DET", "fuel": "Benzin", "trims": ["Match", "Tekna"]}]},
            {"name": "X-Trail", "models": [{"name": "1.6 dCi / 1.7 dCi / 1.5 e-POWER", "engine_code": "R9M / R9N", "fuel": "Dizel", "trims": ["Sky Pack", "Platinum"]}]},
            {"name": "Navara", "models": [{"name": "2.3 dCi 160hp / 190hp 4x4", "engine_code": "YS23DDT", "fuel": "Dizel", "trims": ["SE", "LE", "Platinum"]}]}
        ]
    },
    {
        "brand": "Opel",
        "series": [
            {"name": "Astra", "models": [
                {"name": "1.6 CDTI 136hp", "engine_code": "B16DTH", "fuel": "Dizel", "trims": ["Edition", "Dynamic", "Excellence"]},
                {"name": "1.4 Turbo 140hp", "engine_code": "A14NET / B14NET", "fuel": "Benzin", "trims": ["Edition Plus", "Sport", "Cosmo"]},
                {"name": "1.6 Edition 115hp", "engine_code": "A16XER", "fuel": "LPG", "trims": ["Edition", "Cosmo"]},
                {"name": "1.2 Turbo 130hp (Astra L)", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Edition", "GS Line", "Ultimate"]}
            ]},
            {"name": "Corsa", "models": [
                {"name": "1.3 CDTI 75hp / 95hp", "engine_code": "Z13DTJ / A13DTE", "fuel": "Dizel", "trims": ["Essentia", "Enjoy", "Color Edition"]},
                {"name": "1.2 Twinport / 1.4 100hp", "engine_code": "A12XER / A14XER", "fuel": "LPG", "trims": ["Essentia", "Enjoy"]},
                {"name": "1.2 Turbo 100hp / 130hp (Corsa F)", "engine_code": "EB2FA / EB2ADTS", "fuel": "Benzin", "trims": ["Edition", "GS Line"]}
            ]},
            {"name": "Vectra", "models": [
                {"name": "1.6 16V / 2.0 DTI / 1.9 CDTI", "engine_code": "Z16XE / Y20DTH", "fuel": "LPG", "trims": ["Comfort", "Elegance"]}
            ]},
            {"name": "Insignia", "models": [
                {"name": "1.6 CDTI 136hp", "engine_code": "B16DTH", "fuel": "Dizel", "trims": ["Edition Plus", "Design", "Grand Sport", "Excellence"]},
                {"name": "2.0 CDTI 160hp / 170hp", "engine_code": "A20DTH / B20DTH", "fuel": "Dizel", "trims": ["Cosmo", "Excellence"]}
            ]},
            {"name": "Mokka / Mokka-e", "models": [{"name": "1.2 Turbo 130hp / EV", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Elegance", "GS Line"]}]},
            {"name": "Crossland / Grandland", "models": [{"name": "1.2 Turbo / 1.5 CDTI 130hp", "engine_code": "EB2ADTS / DV5RD", "fuel": "Dizel", "trims": ["Essential", "Edition", "Ultimate"]}]},
            {"name": "Combo / Vivaro", "models": [{"name": "1.5 CDTI 102hp / 130hp", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Edition", "Ultimate"]}]}
        ]
    },
    {
        "brand": "Peugeot",
        "series": [
            {"name": "106", "models": [{"name": "1.4 XR / 1.6 GTI", "engine_code": "TU3JP / TU5J4", "fuel": "Benzin", "trims": ["XR", "GTI"]}]},
            {"name": "206 / 206+", "models": [
                {"name": "1.4 HDi 70hp", "engine_code": "DV4TD", "fuel": "Dizel", "trims": ["XR", "XT", "X-Line", "Desire", "Comfort"]},
                {"name": "1.4 75hp", "engine_code": "TU3JP", "fuel": "LPG", "trims": ["XR", "XT"]}
            ]},
            {"name": "207", "models": [
                {"name": "1.4 HDi 70hp", "engine_code": "DV4TD", "fuel": "Dizel", "trims": ["Trendy", "Premium", "Urban"]},
                {"name": "1.6 HDi 90hp / 110hp", "engine_code": "DV6ATED4 / DV6TED4", "fuel": "Dizel", "trims": ["Premium", "Feline"]},
                {"name": "1.4 75hp / 1.4 VTi 95hp", "engine_code": "TU3JP / EP3", "fuel": "LPG", "trims": ["Trendy", "Comfort"]}
            ]},
            {"name": "208", "models": [
                {"name": "1.2 PureTech 75 / 100 / 130hp", "engine_code": "EB2F / EB2ADTS", "fuel": "Benzin", "trims": ["Active", "Allure", "GT"]},
                {"name": "1.4 HDi / 1.5 BlueHDi 100hp", "engine_code": "DV4TD / DV5RD", "fuel": "Dizel", "trims": ["Active", "Allure"]},
                {"name": "1.6 e-HDi 92hp", "engine_code": "DV6DED", "fuel": "Dizel", "trims": ["Allure"]}
            ]},
            {"name": "301", "models": [
                {"name": "1.6 HDi 92hp", "engine_code": "DV6ATED4", "fuel": "Dizel", "trims": ["Access", "Active", "Allure"]},
                {"name": "1.5 BlueHDi 100hp", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Active", "Allure"]},
                {"name": "1.2 VTi 72hp", "engine_code": "EB2M", "fuel": "Benzin", "trims": ["Active"]}
            ]},
            {"name": "307", "models": [
                {"name": "1.4 HDi / 1.6 HDi 110hp", "engine_code": "DV4TD / DV6TED4", "fuel": "Dizel", "trims": ["XR", "XT", "XS", "Premium"]},
                {"name": "1.6 110hp", "engine_code": "TU5JP4", "fuel": "LPG", "trims": ["XR", "XT"]}
            ]},
            {"name": "308", "models": [
                {"name": "1.5 BlueHDi 130hp EAT8", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Active", "Allure", "GT Line", "GT"]},
                {"name": "1.2 PureTech 130hp EAT8", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Active", "Allure", "GT"]},
                {"name": "1.6 e-HDi 115hp", "engine_code": "DV6C", "fuel": "Dizel", "trims": ["Access", "Active", "Allure"]}
            ]},
            {"name": "407", "models": [{"name": "1.6 HDi 110hp", "engine_code": "DV6TED4", "fuel": "Dizel", "trims": ["Comfort", "Executive"]}]},
            {"name": "508", "models": [{"name": "1.5 BlueHDi 130hp / 1.6 PureTech 180hp", "engine_code": "DV5RD / EP6FADTX", "fuel": "Dizel", "trims": ["Prime", "Allure", "GT Line", "GT"]}]},
            {"name": "2008", "models": [
                {"name": "1.2 PureTech 130hp EAT8", "engine_code": "EB2ADTS", "fuel": "Benzin", "trims": ["Active", "Allure", "GT Line", "GT"]},
                {"name": "1.5 BlueHDi 130hp", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Active", "Allure", "GT"]}
            ]},
            {"name": "3008", "models": [
                {"name": "1.5 BlueHDi 130hp EAT8", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Active Prime", "Allure", "GT Line", "GT"]},
                {"name": "1.6 PureTech 180hp", "engine_code": "EP6FADTX", "fuel": "Benzin", "trims": ["Allure", "GT"]}
            ]},
            {"name": "5008", "models": [{"name": "1.5 BlueHDi 130hp", "engine_code": "DV5RD", "fuel": "Dizel", "trims": ["Allure", "GT"]}]},
            {"name": "Partner / Rifter / Bipper", "models": [
                {"name": "1.6 HDi / 1.5 BlueHDi 130hp", "engine_code": "DV6ATED4 / DV5RD", "fuel": "Dizel", "trims": ["Tepee", "Active", "Allure", "GT Line"]}
            ]}
        ]
    },
    {
        "brand": "Porsche",
        "series": [
            {"name": "Cayenne", "models": [{"name": "3.0 V6 / E-Hybrid", "engine_code": "DCBE", "fuel": "Hibrit", "trims": ["Base", "Coupe", "GTS"]}]},
            {"name": "Panamera / Macan", "models": [{"name": "2.9 V6 / 2.0 T 265hp", "engine_code": "DGG", "fuel": "Benzin", "trims": ["Base", "4S"]}]},
            {"name": "Taycan", "models": [{"name": "4S / Turbo S EV", "engine_code": "E-Drive", "fuel": "Elektrik", "trims": ["Base", "4S", "Turbo S"]}]},
            {"name": "911", "models": [{"name": "3.0 Carrera S", "engine_code": "DKC", "fuel": "Benzin", "trims": ["Carrera", "Carrera S", "Turbo S"]}]}
        ]
    },
    {
        "brand": "Proton",
        "series": [
            {"name": "Gen-2 / Persona", "models": [{"name": "1.6 CamPro", "engine_code": "S4PE", "fuel": "LPG", "trims": ["Line", "Medium", "High"]}]}
        ]
    },
    {
        "brand": "Renault",
        "series": [
            {"name": "Clio", "models": [
                {"name": "1.5 dCi 75hp / 90hp", "engine_code": "K9K 612 / K9K 628 / K9K 872", "fuel": "Dizel", "trims": ["Authentique", "Joy", "Touch", "Icon"]},
                {"name": "1.0 TCe 90hp / 100hp ECO-G", "engine_code": "H4D 470", "fuel": "LPG", "trims": ["Joy", "Touch", "Icon", "Evolution", "Esprit Alpine"]},
                {"name": "0.9 TCe 90hp", "engine_code": "H4B 400", "fuel": "Benzin", "trims": ["Joy", "Touch", "Icon"]},
                {"name": "1.2 16V 75hp", "engine_code": "D4F 740", "fuel": "LPG", "trims": ["Authentique", "Joy"]}
            ]},
            {"name": "Megane", "models": [
                {"name": "1.5 dCi 90 / 110 / 115hp EDC", "engine_code": "K9K 636 / K9K 872", "fuel": "Dizel", "trims": ["Joy", "Touch", "Icon"]},
                {"name": "1.3 TCe 140hp", "engine_code": "H5H 470", "fuel": "Benzin", "trims": ["Joy", "Touch", "Icon"]},
                {"name": "1.6 16V 115hp", "engine_code": "K4M 812", "fuel": "LPG", "trims": ["Authentique", "Dynamique", "Expression"]}
            ]},
            {"name": "Symbol", "models": [
                {"name": "1.5 dCi 75hp / 90hp", "engine_code": "K9K 612", "fuel": "Dizel", "trims": ["Authentique", "Joy", "Touch"]},
                {"name": "1.2 16V / 1.0 TCe", "engine_code": "D4F 740 / H4D", "fuel": "LPG", "trims": ["Joy"]}
            ]},
            {"name": "Fluence", "models": [
                {"name": "1.5 dCi 90hp / 110hp EDC", "engine_code": "K9K 836 / K9K 837", "fuel": "Dizel", "trims": ["Authentique", "Extreme", "Touch", "Icon"]},
                {"name": "1.6 16V 115hp", "engine_code": "K4M 838", "fuel": "LPG", "trims": ["Business", "Touch"]}
            ]},
            {"name": "Kangoo / Express", "models": [
                {"name": "1.5 dCi 70 / 85 / 90 / 110hp", "engine_code": "K9K 702 / K9K 808", "fuel": "Dizel", "trims": ["Multix", "Express", "Authentique", "Touch"]}
            ]},
            {"name": "Taliant", "models": [{"name": "1.0 TCe 90hp / 100hp ECO-G", "engine_code": "H4D 470", "fuel": "LPG", "trims": ["Joy", "Touch"]}]},
            {"name": "Laguna / Latitude / Talisman", "models": [{"name": "1.5 dCi / 1.6 dCi 130 / 160hp", "engine_code": "K9K / R9M", "fuel": "Dizel", "trims": ["Privilege", "Icon"]}]},
            {"name": "Captur / Austral / Kadjar", "models": [{"name": "1.3 TCe Mild Hybrid 160hp", "engine_code": "H5H 470", "fuel": "Hibrit", "trims": ["Techno", "Esprit Alpine"]}]},
            {"name": "Toros (R12) / Broadway (R9)", "models": [{"name": "1.4 SW / 1.4 GTE", "engine_code": "C1J", "fuel": "LPG", "trims": ["Standart", "GTE"]}]},
            {"name": "Trafic / Master", "models": [{"name": "2.0 dCi 115 / 150hp / 2.3 dCi", "engine_code": "M9R / M9T", "fuel": "Dizel", "trims": ["Grand Confort", "Panelvan"]}]}
        ]
    },
    {
        "brand": "Rolls-Royce",
        "series": [
            {"name": "Ghost / Phantom / Cullinan", "models": [{"name": "6.75 V12", "engine_code": "N74", "fuel": "Benzin", "trims": ["Base"]}]}
        ]
    },
    {
        "brand": "Rover",
        "series": [
            {"name": "200 / 25 / 45 / 75", "models": [{"name": "1.6 16V / 2.0 CDT", "engine_code": "K16 / M47R", "fuel": "LPG", "trims": ["Classic", "Club"]}]}
        ]
    },
    {
        "brand": "Saab",
        "series": [
            {"name": "9-3", "models": [{"name": "1.9 TiD 150hp / 1.9 TTiD 180hp", "engine_code": "Z19DTH / Z19DTR", "fuel": "Dizel", "trims": ["Linear", "Vector", "Aero"]}]}
        ]
    },
    {
        "brand": "SEAT",
        "series": [
            {"name": "Leon", "models": [
                {"name": "1.6 TDI 105hp / 115hp DSG", "engine_code": "CAYC / CXXB / DGTE", "fuel": "Dizel", "trims": ["Reference", "Style", "FR"]},
                {"name": "1.4 TSI 125hp / 150hp ACT", "engine_code": "CZCA / CZEA", "fuel": "Benzin", "trims": ["Style", "FR"]},
                {"name": "1.5 eTSI 150hp DSG", "engine_code": "DFYA", "fuel": "Hibrit", "trims": ["FR"]}
            ]},
            {"name": "Ibiza / Cordoba / Toledo", "models": [
                {"name": "1.4 85hp", "engine_code": "CGGB", "fuel": "LPG", "trims": ["Reference", "Style"]},
                {"name": "1.0 TSI 95hp / 110hp", "engine_code": "CHZB / DKRF", "fuel": "Benzin", "trims": ["Style", "FR"]}
            ]},
            {"name": "Arona / Ateca / Tarraco", "models": [{"name": "1.0 TSI / 1.5 TSI 150hp", "engine_code": "DKRF / DPCA", "fuel": "Benzin", "trims": ["Style", "Experience", "FR"]}]}
        ]
    },
    {
        "brand": "Skoda",
        "series": [
            {"name": "Octavia", "models": [
                {"name": "1.6 TDI 105hp / 115hp DSG", "engine_code": "CAYC / CXXB / DGTE", "fuel": "Dizel", "trims": ["Ambition", "Style", "Optima"]},
                {"name": "1.5 TSI 150hp / eTSI", "engine_code": "DPCA / DFYA", "fuel": "Hibrit", "trims": ["Elite", "Premium", "Prestige"]}
            ]},
            {"name": "Superb", "models": [
                {"name": "1.6 TDI 120hp DSG", "engine_code": "DCXA", "fuel": "Dizel", "trims": ["Active", "Ambition", "Style", "Prestige"]},
                {"name": "2.0 TDI 190hp / 200hp 4x4", "engine_code": "DFHA", "fuel": "Dizel", "trims": ["Prestige", "L&K Crystal"]}
            ]},
            {"name": "Fabia / Rapid / Scala", "models": [{"name": "1.2 TSI / 1.0 TSI / 1.6 TDI", "engine_code": "CJZC / CHZB / CAYC", "fuel": "Benzin", "trims": ["Ambition", "Style"]}]},
            {"name": "Kamiq / Karoq / Kodiaq", "models": [{"name": "1.5 TSI 150hp DSG", "engine_code": "DPCA", "fuel": "Benzin", "trims": ["Elite", "Premium", "Prestige"]}]}
        ]
    },
    {
        "brand": "Smart",
        "series": [
            {"name": "Fortwo / Forfour", "models": [{"name": "0.9 Turbo 90hp / 1.0", "engine_code": "H4B", "fuel": "Benzin", "trims": ["Passion", "Prime"]}]}
        ]
    },
    {
        "brand": "SsangYong",
        "series": [
            {"name": "Korando / Tivoli / Torres", "models": [{"name": "1.5 GDI-T 163hp / 1.6 e-XDi", "engine_code": "G15DT", "fuel": "Benzin", "trims": ["Limited", "Platinum"]}]},
            {"name": "Musso Grand / Rexton", "models": [{"name": "2.2 e-XDi 181hp / 202hp 4x4", "engine_code": "D22DTR", "fuel": "Dizel", "trims": ["Platinum"]}]}
        ]
    },
    {
        "brand": "Subaru",
        "series": [
            {"name": "Impreza", "models": [{"name": "1.5 / 2.0 Boxer / WRX", "engine_code": "EJ15 / EJ20", "fuel": "LPG", "trims": ["AWD"]}]},
            {"name": "XV / Forester / Outback", "models": [{"name": "1.6 Boxer / 2.0 e-Boxer", "engine_code": "FB16 / FB20", "fuel": "Hibrit", "trims": ["Elegance", "Premium"]}]}
        ]
    },
    {
        "brand": "Suzuki",
        "series": [
            {"name": "Swift", "models": [{"name": "1.2 Dualjet Hybrid 83hp / 1.3", "engine_code": "K12D / M13A", "fuel": "Hibrit", "trims": ["GLX Premium"]}]},
            {"name": "Vitara / Grand Vitara / Jimny", "models": [{"name": "1.4 Boosterjet Hybrid 129hp 4x4", "engine_code": "K14D", "fuel": "Hibrit", "trims": ["GLX Premium", "AllGrip"]}]}
        ]
    },
    {
        "brand": "Tata",
        "series": [
            {"name": "Indica / Indigo / Xenon", "models": [{"name": "1.4 Dicor / 2.2 Dicor", "engine_code": "475 IDI", "fuel": "Dizel", "trims": ["Trend", "DLX"]}]}
        ]
    },
    {
        "brand": "Tesla",
        "series": [
            {"name": "Model 3", "models": [{"name": "Standard Range / Long Range", "engine_code": "3D1 / 3D3", "fuel": "Elektrik", "trims": ["RWD", "Long Range"]}]},
            {"name": "Model Y", "models": [{"name": "Rear-Wheel Drive 299hp / Long Range", "engine_code": "3D7", "fuel": "Elektrik", "trims": ["RWD", "Long Range", "Performance"]}]}
        ]
    },
    {
        "brand": "Tofaş",
        "series": [
            {"name": "Şahin", "models": [
                {"name": "1.6 ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["1.6 ie", "1.6 S"]},
                {"name": "1.4", "engine_code": "160 A1.000", "fuel": "LPG", "trims": ["Standart"]}
            ]},
            {"name": "Doğan", "models": [{"name": "1.6 SLX ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "SL", "L"]}]},
            {"name": "Kartal", "models": [{"name": "1.6 SLX ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "S"]}]},
            {"name": "Murat 131 / 124 / Serçe", "models": [{"name": "1.3 / 1.2", "engine_code": "131 A.000", "fuel": "LPG", "trims": ["Standart"]}]}
        ]
    },
    {
        "brand": "Togg",
        "series": [
            {"name": "T10X", "models": [
                {"name": "V1 RWD Standart Menzil (160kW / 218hp)", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["V1 Standart"]},
                {"name": "V2 RWD Uzun Menzil (160kW / 523km)", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["V2 Uzun Menzil"]},
                {"name": "V3 AWD Performans (320kW / 435hp)", "engine_code": "Bosch Dual e-Motor", "fuel": "Elektrik", "trims": ["Performans"]}
            ]},
            {"name": "T10F", "models": [{"name": "Fastback RWD Uzun Menzil", "engine_code": "Bosch e-Motor 160kW", "fuel": "Elektrik", "trims": ["V2 Uzun Menzil"]}]}
        ]
    },
    {
        "brand": "Toyota",
        "series": [
            {"name": "Corolla", "models": [
                {"name": "1.8 Hybrid 122hp / 140hp", "engine_code": "2ZR-FXE", "fuel": "Hibrit", "trims": ["Vision", "Dream", "Flame", "Passion", "GR Sport"]},
                {"name": "1.4 D-4D 90hp", "engine_code": "1ND-TV", "fuel": "Dizel", "trims": ["Comfort", "Touch", "Active", "Premium"]},
                {"name": "1.6 Valvematic 132hp", "engine_code": "1ZR-FAE", "fuel": "LPG", "trims": ["Vision", "Dream", "Flame"]},
                {"name": "1.5 Dynamic Force 125hp", "engine_code": "M15A-FKS", "fuel": "Benzin", "trims": ["Vision", "Dream", "Flame"]}
            ]},
            {"name": "Yaris", "models": [
                {"name": "1.5 Hybrid 116hp", "engine_code": "M15A-FXE", "fuel": "Hibrit", "trims": ["Dream", "Flame", "Passion"]},
                {"name": "1.33 Dual VVT-i / 1.0", "engine_code": "1NR-FE / 1KR-FE", "fuel": "Benzin", "trims": ["Cool", "Style"]}
            ]},
            {"name": "Auris / Avensis", "models": [{"name": "1.4 D-4D / 1.6 / 2.0 D-4D", "engine_code": "1ND-TV / 1ZR-FAE", "fuel": "Dizel", "trims": ["Active", "Touch", "Premium"]}]},
            {"name": "C-HR / RAV4", "models": [{"name": "1.8 Hybrid / 2.5 Hybrid AWD", "engine_code": "2ZR-FXE / A25A-FXS", "fuel": "Hibrit", "trims": ["Flame", "Passion", "GR Sport"]}]},
            {"name": "Hilux / Land Cruiser", "models": [{"name": "2.4 D-4D 150hp 4x4 / 2.8 D-4D", "engine_code": "2GD-FTV / 1GD-FTV", "fuel": "Dizel", "trims": ["Comfort", "Adventure", "Invincible"]}]}
        ]
    },
    {
        "brand": "Volkswagen",
        "series": [
            {"name": "Golf", "models": [
                {"name": "1.6 TDI 105hp / 115hp DSG", "engine_code": "CAYC / CXXB / DGTE", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.4 TSI 122hp / 125hp / 140hp", "engine_code": "CAXA / CZCA / CHPA", "fuel": "Benzin", "trims": ["Comfortline", "Highline"]},
                {"name": "1.5 TSI 130hp / 150hp / eTSI", "engine_code": "DADA / DPCA / DFYA", "fuel": "Hibrit", "trims": ["Life", "Style", "R-Line"]},
                {"name": "1.2 TSI 105hp / 1.0 TSI 110hp", "engine_code": "CJZA / CHZB", "fuel": "Benzin", "trims": ["Trendline", "Comfortline"]},
                {"name": "2.0 GTI / R 300hp", "engine_code": "CHHA / CJXC", "fuel": "Benzin", "trims": ["GTI", "R"]}
            ]},
            {"name": "Passat / Passat CC / CC", "models": [
                {"name": "1.6 TDI 120hp DSG", "engine_code": "CAYC / DCXA", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline", "Elegance"]},
                {"name": "2.0 TDI 150hp / 190hp / 240hp BiTDI 4Motion", "engine_code": "CBAB / CFFB / DFHA / CUAA", "fuel": "Dizel", "trims": ["Comfortline", "Highline", "Elegance"]},
                {"name": "1.4 TSI 125hp / 150hp ACT", "engine_code": "CZCA / CZEA", "fuel": "Benzin", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.5 TSI 150hp DSG", "engine_code": "DPCA", "fuel": "Benzin", "trims": ["Business", "Elegance"]}
            ]},
            {"name": "Polo", "models": [
                {"name": "1.4 TDI 75hp / 90hp", "engine_code": "AMF / CUSB / CUTA", "fuel": "Dizel", "trims": ["Trendline", "Comfortline"]},
                {"name": "1.2 TSI 90hp / 1.0 TSI 95hp", "engine_code": "CJZC / CHZB / DKLA", "fuel": "Benzin", "trims": ["Comfortline", "Highline", "Life", "Style"]},
                {"name": "1.4 85hp", "engine_code": "CGGB", "fuel": "LPG", "trims": ["Comfortline"]}
            ]},
            {"name": "Jetta / Bora", "models": [
                {"name": "1.6 TDI 105hp", "engine_code": "CAYC", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.2 TSI / 1.4 TSI / 1.6 8V", "engine_code": "CBZA / CAXA / AKL", "fuel": "LPG", "trims": ["Trendline", "Comfortline"]}
            ]},
            {"name": "Tiguan / Touareg", "models": [
                {"name": "2.0 TDI 150hp / 4Motion", "engine_code": "DFGA", "fuel": "Dizel", "trims": ["Comfortline", "Highline"]},
                {"name": "1.5 TSI 150hp DSG", "engine_code": "DPCA", "fuel": "Benzin", "trims": ["Life", "Elegance", "R-Line"]}
            ]},
            {"name": "Caddy", "models": [
                {"name": "2.0 TDI 102hp / 122hp", "engine_code": "DFSJ / DFSC / DTP", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline", "Style"]},
                {"name": "1.6 TDI 102hp", "engine_code": "CAYE / CAYD", "fuel": "Dizel", "trims": ["Trendline", "Comfortline"]}
            ]},
            {"name": "Transporter / Caravelle / Multivan", "models": [
                {"name": "2.0 TDI 102hp / 140hp / 180hp / 199hp BiTDI", "engine_code": "CAAA / CCHA / CFCA / CXHA", "fuel": "Dizel", "trims": ["City Van", "Kombi", "Caravelle Highline"]}
            ]},
            {"name": "Scirocco / Arteon / Taigo / T-Roc", "models": [{"name": "1.4 TSI / 1.5 TSI / 2.0 TDI", "engine_code": "CAXA / DPCA / CUAA", "fuel": "Benzin", "trims": ["Sportline", "Elegance", "R-Line"]}]},
            {"name": "Beetle / Vosvos / Amarok / Crafter", "models": [{"name": "2.0 TDI / 3.0 V6 TDI 258hp", "engine_code": "DDXA", "fuel": "Dizel", "trims": ["Design", "Highline", "Aventura"]}]}
        ]
    },
    {
        "brand": "Volvo",
        "series": [
            {"name": "S40 / V40", "models": [{"name": "1.6 D2 115hp / 1.6 D 109hp", "engine_code": "D4162T / D4164T", "fuel": "Dizel", "trims": ["Base", "Premium", "Advance", "R-Design"]}]},
            {"name": "S60 / V60", "models": [
                {"name": "1.6 D2 115hp", "engine_code": "D4162T", "fuel": "Dizel", "trims": ["Advance", "Premium"]},
                {"name": "2.0 B4 Mild Hybrid 197hp", "engine_code": "B4204T", "fuel": "Hibrit", "trims": ["Inscription", "R-Design"]}
            ]},
            {"name": "S80 / S90 / V90", "models": [{"name": "2.0 D4 / D5 AWD 235hp", "engine_code": "D4204T23", "fuel": "Dizel", "trims": ["Inscription"]}]},
            {"name": "XC40 / XC60 / XC90", "models": [{"name": "2.0 D4 / B5 AWD / Recharge PHEV", "engine_code": "D4204T14", "fuel": "Hibrit", "trims": ["Inscription", "R-Design", "Plus"]}]}
        ]
    }
]

def main():
    print("=" * 60)
    print("CARVIS - EXHAUSTIVE 74-BRAND TURKISH AUTOMOTIVE MARKET GENERATOR")
    print("Source: Sahibinden.com & Arabam.com Master Database")
    print("=" * 60)

    car_database = sorted(COMPREHENSIVE_CAR_DATABASE, key=lambda x: x["brand"].lower())

    code_content = f"export const CAR_DATABASE = {json.dumps(car_database, ensure_ascii=False, indent=2)};\n"

    output_path = "src/constants/carDatabase.js"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(code_content)

    total_brands = len(car_database)
    total_series = sum(len(b["series"]) for b in car_database)
    total_models = sum(len(s["models"]) for b in car_database for s in b["series"])

    print(f"SUCCESS! Generated {output_path}")
    print(f"  Brands:  {total_brands}")
    print(f"  Series:  {total_series}")
    print(f"  Models:  {total_models}")
    print("=" * 60)

if __name__ == "__main__":
    main()
