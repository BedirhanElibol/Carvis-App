import json

car_database = [
    # TOFAŞ
    {
        "brand": "Tofaş",
        "series": [
            {"name": "Şahin", "models": [{"name": "1.6 ie", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["1.6 ie", "1.6 S", "1.4"]}, {"name": "1.6 S", "engine_code": "131 A1.000", "fuel": "LPG", "trims": ["S", "Standart"]}]},
            {"name": "Doğan", "models": [{"name": "1.6 SLX", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "SL", "L"]}, {"name": "1.6 ie", "engine_code": "158 A2.000", "fuel": "LPG", "trims": ["1.6 ie", "SLX"]}]},
            {"name": "Kartal", "models": [{"name": "1.6 SLX", "engine_code": "159 A3.000", "fuel": "LPG", "trims": ["SLX ie", "SLX", "S", "5 Vites"]}]},
            {"name": "Murat 131", "models": [{"name": "1.3", "engine_code": "131 A.000", "fuel": "LPG", "trims": ["Şahin", "Doğan", "T-131"]}]},
            {"name": "Murat 124", "models": [{"name": "1.2 Hacı Murat", "engine_code": "124 A.000", "fuel": "Benzin", "trims": ["Standart"]}]}
        ]
    },
    # FIAT
    {
        "brand": "Fiat",
        "series": [
            {"name": "Egea", "models": [
                {"name": "1.3 Multijet", "engine_code": "199B1000 / 55283775", "fuel": "Dizel", "trims": ["Easy", "Urban", "Lounge", "Street", "Pop", "Cross"]},
                {"name": "1.4 Fire", "engine_code": "843A1000 / 354A1000", "fuel": "Benzin", "trims": ["Easy", "Urban", "Lounge", "Street", "Cross"]},
                {"name": "1.6 Multijet", "engine_code": "55260384 / 955A3000", "fuel": "Dizel", "trims": ["Urban", "Lounge", "Easy", "Cross", "DCT"]},
                {"name": "1.5 T4 Hybrid", "engine_code": "46347813 GSH", "fuel": "Hibrit", "trims": ["Urban", "Lounge", "Cross", "Limited"]},
                {"name": "1.6 E-Torq", "engine_code": "55268036", "fuel": "Benzin", "trims": ["Urban", "Lounge"]}
            ]},
            {"name": "Linea", "models": [
                {"name": "1.3 Multijet", "engine_code": "199A3000 / 199B1000", "fuel": "Dizel", "trims": ["Active Plus", "Easy", "Pop", "Urban", "Emotion Plus"]},
                {"name": "1.4 Fire", "engine_code": "350A1000", "fuel": "Benzin", "trims": ["Active Plus", "Actual", "Easy"]},
                {"name": "1.6 Multijet", "engine_code": "198A3000", "fuel": "Dizel", "trims": ["Urban", "Lounge", "Emotion"]}
            ]},
            {"name": "Albea", "models": [
                {"name": "1.3 Multijet", "engine_code": "188A9000", "fuel": "Dizel", "trims": ["Sole", "Active", "Dynamic", "Premio"]},
                {"name": "1.4 Fire", "engine_code": "350A1000", "fuel": "Benzin", "trims": ["Sole", "Active", "Dynamic"]},
                {"name": "1.2 16V", "engine_code": "188A5000", "fuel": "Benzin", "trims": ["EL", "HL", "Dynamic"]}
            ]},
            {"name": "Palio", "models": [
                {"name": "1.3 Multijet", "engine_code": "188A9000", "fuel": "Dizel", "trims": ["Sole", "Active", "Dynamic"]},
                {"name": "1.2 16V", "engine_code": "188A5000", "fuel": "Benzin", "trims": ["EL", "SL", "Go"]},
                {"name": "1.4 EL", "engine_code": "178E2000", "fuel": "Benzin", "trims": ["EL", "SL", "Weekend"]}
            ]},
            {"name": "Punto", "models": [
                {"name": "1.3 Multijet", "engine_code": "199A2000 / 199B1000", "fuel": "Dizel", "trims": ["Pop", "Easy", "Lounge", "Dynamic", "Evo", "Grande"]},
                {"name": "1.4 Fire", "engine_code": "350A1000 / 199A6000", "fuel": "Benzin", "trims": ["Pop", "Easy", "Lounge", "S&S"]}
            ]},
            {"name": "Doblo", "models": [
                {"name": "1.3 Multijet", "engine_code": "223A9000 / 199A3000", "fuel": "Dizel", "trims": ["Easy", "Safeline", "Premio", "Urban", "Cargo"]},
                {"name": "1.6 Multijet", "engine_code": "263A8000 / 198A3000", "fuel": "Dizel", "trims": ["Premio Plus", "Urban", "Elegance", "Trekking"]},
                {"name": "2.0 Multijet", "engine_code": "263A1000", "fuel": "Dizel", "trims": ["Premio", "Elegance"]}
            ]},
            {"name": "Fiorino", "models": [
                {"name": "1.3 Multijet", "engine_code": "199A2000 / 199B1000", "fuel": "Dizel", "trims": ["Pop", "Safeline", "Premio", "Titanium"]},
                {"name": "1.4 Fire", "engine_code": "350A1000", "fuel": "Benzin", "trims": ["Pop", "Safeline", "Premio"]},
                {"name": "1.4 Eco (LPG)", "engine_code": "350A1000 LPG", "fuel": "LPG", "trims": ["Pop", "Safeline", "Premio"]}
            ]}
        ]
    },
    # RENAULT
    {
        "brand": "Renault",
        "series": [
            {"name": "Clio", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 608 / K9K 628 / K9K 872", "fuel": "Dizel", "trims": ["Joy", "Touch", "Icon", "Techno", "Extreme"]},
                {"name": "1.0 TCe", "engine_code": "H4D 470 / H5D 400", "fuel": "Benzin", "trims": ["Joy", "Touch", "Icon", "Techno", "Evolution"]},
                {"name": "1.2 16V", "engine_code": "D4F 740 / D4F 722", "fuel": "Benzin", "trims": ["Authentique", "Joy", "Touch"]},
                {"name": "0.9 TCe", "engine_code": "H4B 400 / H4B 408", "fuel": "Benzin", "trims": ["Joy", "Touch", "Icon"]}
            ]},
            {"name": "Megane", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 636 / K9K 656 / K9K 872", "fuel": "Dizel", "trims": ["Joy", "Touch", "Icon", "Privilege", "Dynamique"]},
                {"name": "1.3 TCe", "engine_code": "H5H 470 / H5H 450", "fuel": "Benzin", "trims": ["Joy", "Touch", "Icon", "Techno", "R.S. Line"]},
                {"name": "1.6 16V", "engine_code": "K4M 760 / K4M 812", "fuel": "Benzin", "trims": ["Joy", "Touch", "Expression"]}
            ]},
            {"name": "Fluence", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 836 / K9K 837", "fuel": "Dizel", "trims": ["Joy", "Touch", "Icon", "Privilege", "Extreme"]},
                {"name": "1.6 16V", "engine_code": "K4M 838", "fuel": "Benzin", "trims": ["Extreme", "Dynamique", "Touch"]}
            ]},
            {"name": "Symbol", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 612 / K9K 768", "fuel": "Dizel", "trims": ["Joy", "Touch", "Authentique"]},
                {"name": "1.2 16V", "engine_code": "D4F 740", "fuel": "Benzin", "trims": ["Joy", "Touch"]}
            ]},
            {"name": "R9 Broadway / Fairway", "models": [
                {"name": "1.4 Broadway", "engine_code": "C1J 768 / C2J", "fuel": "LPG", "trims": ["GTE", "RL", "RN", "RNi"]},
                {"name": "1.4 Fairway", "engine_code": "C1J 742", "fuel": "LPG", "trims": ["Fairway", "Spring"]}
            ]},
            {"name": "R11 Flash / Flash S", "models": [
                {"name": "1.7 Flash S", "engine_code": "F2N 730", "fuel": "LPG", "trims": ["Flash", "Flash S", "GTS"]}
            ]},
            {"name": "R19 Europa", "models": [
                {"name": "1.6 RT / RNE", "engine_code": "K7M 720 / C3G", "fuel": "LPG", "trims": ["RT", "RNE", "RN", "Alize"]}
            ]},
            {"name": "Kangoo", "models": [
                {"name": "1.5 dCi", "engine_code": "K9K 702 / K9K 802 / K9K 612", "fuel": "Dizel", "trims": ["Confort", "Authentique", "Multix"]}
            ]}
        ]
    },
    # VOLKSWAGEN
    {
        "brand": "Volkswagen",
        "series": [
            {"name": "Golf", "models": [
                {"name": "1.6 TDI", "engine_code": "CAYC / CXXB / DBKA / CRKB", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.5 TSI / eTSI", "engine_code": "DADA / DPCA / DXDB", "fuel": "Benzin", "trims": ["Life", "Style", "R-Line"]},
                {"name": "1.0 TSI", "engine_code": "CHZB / DDKA / DLAA", "fuel": "Benzin", "trims": ["Impression", "Life", "Style"]},
                {"name": "1.4 TSI", "engine_code": "CAXA / CAVA / CPTA / CZDA", "fuel": "Benzin", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "2.0 GTI / R", "engine_code": "CHHA / CJXC / DNUE", "fuel": "Benzin", "trims": ["GTI", "R"]}
            ]},
            {"name": "Passat", "models": [
                {"name": "1.6 TDI", "engine_code": "CAYC / CXXB / DCXA / DBKA", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline", "Business", "Elegance"]},
                {"name": "2.0 TDI", "engine_code": "CBAB / CFFB / DFCA / DBGA", "fuel": "Dizel", "trims": ["Highline", "Elegance", "Business"]},
                {"name": "1.5 TSI", "engine_code": "DADA / DPCA", "fuel": "Benzin", "trims": ["Business", "Elegance"]},
                {"name": "1.4 TSI", "engine_code": "CAXA / CZDA / CZEA", "fuel": "Benzin", "trims": ["Trendline", "Comfortline", "Highline"]}
            ]},
            {"name": "Polo", "models": [
                {"name": "1.0 TSI", "engine_code": "CHZB / DKLA / DLAC", "fuel": "Benzin", "trims": ["Trendline", "Comfortline", "Highline", "Life", "Style"]},
                {"name": "1.4 TDI", "engine_code": "AMF / BAY / CUSB / CUTA", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.2 TSI", "engine_code": "CBZA / CBZB / CJZC", "fuel": "Benzin", "trims": ["Trendline", "Comfortline"]}
            ]},
            {"name": "Jetta", "models": [
                {"name": "1.6 TDI", "engine_code": "CAYC / CXXB", "fuel": "Dizel", "trims": ["Trendline", "Comfortline", "Highline"]},
                {"name": "1.4 TSI", "engine_code": "CAXA / CZDA", "fuel": "Benzin", "trims": ["Trendline", "Comfortline", "Highline"]}
            ]},
            {"name": "Transporter / Caravelle", "models": [
                {"name": "2.0 TDI", "engine_code": "CAAA / CAAB / CCHA / CXHA / CXFA", "fuel": "Dizel", "trims": ["Caravelle Highline", "Comfortline", "Multivan"]}
            ]},
            {"name": "Caddy", "models": [
                {"name": "2.0 TDI", "engine_code": "DFSJ / DFSC / CUUD", "fuel": "Dizel", "trims": ["Life", "Style", "Cargo"]},
                {"name": "1.6 TDI", "engine_code": "CAYE / CAYD", "fuel": "Dizel", "trims": ["Trendline", "Comfortline"]}
            ]},
            {"name": "Amarok", "models": [
                {"name": "3.0 V6 TDI", "engine_code": "DDXA / DDXB / DDXC", "fuel": "Dizel", "trims": ["Highline", "Canyon", "Aventura"]},
                {"name": "2.0 BiTDI", "engine_code": "CDCA / CSHA", "fuel": "Dizel", "trims": ["Highline", "Trendline"]}
            ]}
        ]
    },
    # FORD
    {
        "brand": "Ford",
        "series": [
            {"name": "Focus", "models": [
                {"name": "1.5 EcoBlue / TDCi", "engine_code": "ZTDA / Z2DA / XWDA", "fuel": "Dizel", "trims": ["Trend X", "Titanium", "ST-Line"]},
                {"name": "1.6 Ti-VCT / TDCi", "engine_code": "PNDA / IQDB / T1DA / T3DA", "fuel": "Benzin", "trims": ["Trend", "Trend X", "Titanium"]},
                {"name": "1.0 EcoBoost", "engine_code": "M1DA / M2DA / B7DA", "fuel": "Benzin", "trims": ["Trend X", "Titanium", "ST-Line"]}
            ]},
            {"name": "Fiesta", "models": [
                {"name": "1.4 TDCi", "engine_code": "F6JB / KVJA", "fuel": "Dizel", "trims": ["Trend", "Comfort", "Titanium"]},
                {"name": "1.25 VCT / 1.4", "engine_code": "SNJA / SPJA", "fuel": "Benzin", "trims": ["Trend", "MyFiesta", "Titanium"]}
            ]},
            {"name": "Mondeo", "models": [
                {"name": "2.0 TDCi", "engine_code": "T7CE / T8CC / QXBA", "fuel": "Dizel", "trims": ["Trend", "Titanium", "Selective"]},
                {"name": "1.6 TDCi", "engine_code": "T1GA / UCCA", "fuel": "Dizel", "trims": ["Trend", "Titanium"]}
            ]},
            {"name": "Transit / Custom / Courier", "models": [
                {"name": "2.0 EcoBlue / 2.2 TDCi", "engine_code": "YNF6 / YLF6 / DRFF / CYFF", "fuel": "Dizel", "trims": ["Trend", "Deluxe", "Titanium", "Limited"]}
            ]},
            {"name": "Ranger", "models": [
                {"name": "2.0 EcoBlue", "engine_code": "YN2X / YN2R BiTurbo", "fuel": "Dizel", "trims": ["XLT", "Wildtrak", "Raptor"]},
                {"name": "3.2 TDCi", "engine_code": "SA2R / SAFA", "fuel": "Dizel", "trims": ["Wildtrak", "Limited"]}
            ]}
        ]
    },
    # BMW
    {
        "brand": "BMW",
        "series": [
            {"name": "1 Serisi", "models": [
                {"name": "116d / 118d", "engine_code": "N47D16 / B37C15 / B47D20A", "fuel": "Dizel", "trims": ["Joy", "Sport Line", "M Sport"]},
                {"name": "118i / 120i", "engine_code": "N13B16A / B38B15A / B48B20A", "fuel": "Benzin", "trims": ["Sport Line", "M Sport"]}
            ]},
            {"name": "3 Serisi", "models": [
                {"name": "320d", "engine_code": "N47D20C / B47D20A / B47D20B", "fuel": "Dizel", "trims": ["Prestige", "Sport Line", "Luxury Line", "M Sport"]},
                {"name": "320i / 320i ED", "engine_code": "N13B16A / N20B20A / B48B20A", "fuel": "Benzin", "trims": ["First Edition", "M Sport", "Sport Line"]},
                {"name": "316i / 318i", "engine_code": "N13B16A / B38B15A", "fuel": "Benzin", "trims": ["Joy", "Comfort", "M Sport"]}
            ]},
            {"name": "5 Serisi", "models": [
                {"name": "520d", "engine_code": "N47D20C / B47D20A / B47D20B", "fuel": "Dizel", "trims": ["Premium", "M Sport", "Executive", "Special Edition"]},
                {"name": "520i", "engine_code": "N20B20A / B48B20A", "fuel": "Benzin", "trims": ["Premium", "M Sport", "Executive"]}
            ]}
        ]
    },
    # MERCEDES-BENZ
    {
        "brand": "Mercedes-Benz",
        "series": [
            {"name": "A Serisi", "models": [
                {"name": "A 180 d", "engine_code": "OM 607.951 / OM 654.915", "fuel": "Dizel", "trims": ["Style", "Urban", "AMG"]},
                {"name": "A 200 / A 180", "engine_code": "M 270.910 / M 282.914", "fuel": "Benzin", "trims": ["AMG", "Progressive", "Style"]}
            ]},
            {"name": "C Serisi", "models": [
                {"name": "C 200 d / C 220 d", "engine_code": "OM 651.921 / OM 654.920 / OM 626", "fuel": "Dizel", "trims": ["AMG", "Avantgarde", "Exclusive", "Fascination"]},
                {"name": "C 180 / C 200", "engine_code": "M 274.910 / M 264.915", "fuel": "Benzin", "trims": ["Fascination", "AMG", "Style", "Exclusive"]}
            ]},
            {"name": "E Serisi", "models": [
                {"name": "E 220 d / E 250 CDI", "engine_code": "OM 651.924 / OM 654.920", "fuel": "Dizel", "trims": ["AMG", "Exclusive", "Avantgarde", "Fascination"]},
                {"name": "E 180 / E 200", "engine_code": "M 274.910 / M 264.920", "fuel": "Benzin", "trims": ["Elite", "Edition", "Avantgarde", "AMG"]}
            ]},
            {"name": "Vito / V-Class", "models": [
                {"name": "111 CDI / 114 CDI / 119 CDI", "engine_code": "OM 622.951 / OM 651.950 / OM 654", "fuel": "Dizel", "trims": ["Tourer", "Select", "VIP", "Base"]}
            ]}
        ]
    },
    # AUDI
    {
        "brand": "Audi",
        "series": [
            {"name": "A3", "models": [
                {"name": "35 TFSI / 1.6 TDI", "engine_code": "CAYC / CXXB / DADA / DPCA", "fuel": "Benzin", "trims": ["Advanced", "S Line", "Design", "Sport"]},
                {"name": "30 TDI / 35 TDI", "engine_code": "DGTE / DBGA / DEJA", "fuel": "Dizel", "trims": ["Advanced", "S Line"]}
            ]},
            {"name": "A4", "models": [
                {"name": "2.0 TDI / 40 TDI", "engine_code": "CAGA / CJCA / DEUA / DETB", "fuel": "Dizel", "trims": ["Advanced", "S Line", "Design", "Dynamic"]},
                {"name": "1.4 TFSI / 2.0 TFSI", "engine_code": "CVNA / CYRB / DLVA", "fuel": "Benzin", "trims": ["Dynamic", "Sport", "S Line"]}
            ]},
            {"name": "A6", "models": [
                {"name": "2.0 TDI / 40 TDI", "engine_code": "CGLC / CNHA / DFBA", "fuel": "Dizel", "trims": ["Prestige", "Exclusive", "S Line"]}
            ]}
        ]
    },
    # TOYOTA
    {
        "brand": "Toyota",
        "series": [
            {"name": "Corolla", "models": [
                {"name": "1.8 Hybrid", "engine_code": "2ZR-FXE", "fuel": "Hibrit", "trims": ["Dream", "Flame", "Passion", "Passion X-Pack"]},
                {"name": "1.5 Vision / Flame", "engine_code": "M15A-FKS Dynamic Force", "fuel": "Benzin", "trims": ["Vision", "Dream", "Flame", "Passion"]},
                {"name": "1.4 D-4D", "engine_code": "1ND-TV", "fuel": "Dizel", "trims": ["Active", "Touch", "Elegant", "Premium"]},
                {"name": "1.6 Terra / Sol", "engine_code": "1ZR-FE / 3ZZ-FE", "fuel": "Benzin", "trims": ["Terra", "Sol", "Luna"]}
            ]},
            {"name": "Yaris", "models": [
                {"name": "1.5 Hybrid", "engine_code": "M15A-FXE", "fuel": "Hibrit", "trims": ["Dream", "Flame", "Style"]},
                {"name": "1.33 / 1.0", "engine_code": "1NR-FE / 1KR-FE", "fuel": "Benzin", "trims": ["Terra", "Cool"]}
            ]},
            {"name": "Hilux", "models": [
                {"name": "2.4 D-4D / 2.8 D-4D", "engine_code": "2GD-FTV / 1GD-FTV", "fuel": "Dizel", "trims": ["Comfort", "Style", "Adventure", "Executive"]}
            ]}
        ]
    },
    # PEUGEOT
    {
        "brand": "Peugeot",
        "series": [
            {"name": "208 / 207 / 206", "models": [
                {"name": "1.4 HDi / 1.5 BlueHDi", "engine_code": "DV4TD / DV5RD (YHZ)", "fuel": "Dizel", "trims": ["Active", "Allure", "GT"]},
                {"name": "1.2 PureTech", "engine_code": "EB2F / EB2DTS", "fuel": "Benzin", "trims": ["Active", "Allure", "GT"]}
            ]},
            {"name": "301", "models": [
                {"name": "1.6 HDi / 1.5 BlueHDi", "engine_code": "DV6ATED4 / DV5RD", "fuel": "Dizel", "trims": ["Access", "Active", "Allure"]}
            ]},
            {"name": "308 / 3008 / 5008", "models": [
                {"name": "1.5 BlueHDi / 1.6 HDi", "engine_code": "DV5RD / DV6FC (BHZ)", "fuel": "Dizel", "trims": ["Active Prime", "Allure", "GT-Line", "GT"]},
                {"name": "1.2 PureTech", "engine_code": "EB2ADTS (HNS)", "fuel": "Benzin", "trims": ["Active", "Allure", "GT"]}
            ]}
        ]
    },
    # OPEL
    {
        "brand": "Opel",
        "series": [
            {"name": "Astra", "models": [
                {"name": "1.3 CDTI / 1.6 CDTI", "engine_code": "Z13DTH / B16DTH / B16DTL", "fuel": "Dizel", "trims": ["Essentia", "Enjoy", "Cosmo", "Edition", "GS"]},
                {"name": "1.4 Turbo / 1.6 16V", "engine_code": "A14NET / Z16XER / B14XFL", "fuel": "Benzin", "trims": ["Essentia", "Enjoy", "Cosmo", "GS"]}
            ]},
            {"name": "Corsa", "models": [
                {"name": "1.3 CDTI / 1.5D", "engine_code": "Z13DTJ / Z13DTE / D15DT", "fuel": "Dizel", "trims": ["Essentia", "Enjoy", "Edition", "GS"]},
                {"name": "1.2 / 1.4", "engine_code": "A12XER / A14XER / F12XHL", "fuel": "Benzin", "trims": ["Essentia", "Enjoy", "Edition"]}
            ]},
            {"name": "Insignia", "models": [
                {"name": "1.6 CDTI / 2.0 CDTI", "engine_code": "B16DTH / A20DTH / D20DTH", "fuel": "Dizel", "trims": ["Edition", "Cosmo", "Grand Sport", "GS Line"]}
            ]},
            {"name": "Vectra", "models": [
                {"name": "1.6 16V / 1.9 CDTI", "engine_code": "X16XEL / Z16XE / Z19DTH", "fuel": "Benzin", "trims": ["Comfort", "Elegance", "CDX"]}
            ]}
        ]
    },
    # HYUNDAI
    {
        "brand": "Hyundai",
        "series": [
            {"name": "Accent / Era / Blue", "models": [
                {"name": "1.5 CRDi / 1.6 CRDi", "engine_code": "D4FA / D4FB / D4FC", "fuel": "Dizel", "trims": ["Admire", "Team", "Select", "Mode", "Prime"]},
                {"name": "1.4 / 1.6 Benzin", "engine_code": "G4EE / G4FC / G4FG", "fuel": "Benzin", "trims": ["Select", "Mode", "Biz"]}
            ]},
            {"name": "i20", "models": [
                {"name": "1.4 CRDi / 1.0 T-GDi", "engine_code": "D4FC / G3LC", "fuel": "Benzin", "trims": ["Jump", "Style", "Elite", "N-Line"]},
                {"name": "1.4 MPi", "engine_code": "G4FA / G4LC", "fuel": "Benzin", "trims": ["Jump", "Style", "Elite"]}
            ]},
            {"name": "Tucson", "models": [
                {"name": "1.6 CRDi / 1.6 T-GDi", "engine_code": "D4FE Smartstream / G4FJ", "fuel": "Dizel", "trims": ["Comfort", "Style", "Elite", "N-Line"]}
            ]}
        ]
    },
    # HONDA
    {
        "brand": "Honda",
        "series": [
            {"name": "Civic", "models": [
                {"name": "1.6 i-VTEC", "engine_code": "R16A1 / R16B2 / R16Z4", "fuel": "Benzin", "trims": ["Elegance", "Executive", "Premium"]},
                {"name": "1.5 VTEC Turbo", "engine_code": "L15B7 / L15C7", "fuel": "Benzin", "trims": ["RS", "Elegance", "Executive+"]},
                {"name": "1.6 i-DTEC", "engine_code": "N16A1", "fuel": "Dizel", "trims": ["Elegance", "Executive"]}
            ]}
        ]
    },
    # CITROËN
    {
        "brand": "Citroën",
        "series": [
            {"name": "C-Elysee", "models": [{"name": "1.6 HDi / 1.5 BlueHDi", "engine_code": "DV6ATED4 / DV5RD", "fuel": "Dizel", "trims": ["Attraction", "Confort", "Exclusive", "Feel"]}]},
            {"name": "C3 / C4 / C5 Aircross", "models": [{"name": "1.2 PureTech / 1.5 BlueHDi", "engine_code": "EB2ADTS / DV5RD", "fuel": "Dizel", "trims": ["Feel", "Feel Bold", "Shine", "Max"]}]}
        ]
    },
    # SKODA
    {
        "brand": "Skoda",
        "series": [
            {"name": "Octavia / Superb", "models": [{"name": "1.6 TDI / 1.5 TSI", "engine_code": "CAYC / CXXB / DADA / DPCA", "fuel": "Dizel", "trims": ["Ambition", "Style", "L&K", "RS"]}]}
        ]
    },
    # SEAT
    {
        "brand": "Seat",
        "series": [
            {"name": "Leon / Ibiza", "models": [{"name": "1.6 TDI / 1.5 TSI", "engine_code": "CAYC / CXXB / DADA", "fuel": "Benzin", "trims": ["Style", "FR", "Xcellence"]}]}
        ]
    },
    # DACIA
    {
        "brand": "Dacia",
        "series": [
            {"name": "Duster / Sandero", "models": [{"name": "1.5 dCi / 1.3 TCe / 1.0 ECO-G", "engine_code": "K9K 872 / H5H 470 / H4D 470", "fuel": "LPG", "trims": ["Comfort", "Prestige", "Extreme"]}]}
        ]
    },
    # TOGG
    {
        "brand": "Togg",
        "series": [
            {"name": "T10X", "models": [{"name": "V1 / V2 RWD / AWD", "engine_code": "Bosch e-Motor 160kW / 320kW", "fuel": "Elektrik", "trims": ["Standart", "Uzun Menzil", "Performans"]}]}
        ]
    },
    # TESLA
    {
        "brand": "Tesla",
        "series": [
            {"name": "Model Y / Model 3", "models": [{"name": "RWD / Long Range", "engine_code": "3D6 / 4D1 Permanent Magnet", "fuel": "Elektrik", "trims": ["Standard Range", "Long Range", "Plaid"]}]}
        ]
    },
    # CHERY
    {
        "brand": "Chery",
        "series": [
            {"name": "Omoda 5 / Tiggo 7 Pro / Tiggo 8 Pro", "models": [{"name": "1.6 TGDI 183", "engine_code": "SQRF4J16", "fuel": "Benzin", "trims": ["Comfort", "Luxury", "Excellent"]}]}
        ]
    }
]

code_content = f"export const CAR_DATABASE = {json.dumps(car_database, ensure_ascii=False, indent=2)};\n"

with open("src/constants/carDatabase.js", "w", encoding="utf-8") as f:
    f.write(code_content)

print("Generated carDatabase.js successfully with engine codes for", len(car_database), "brands.")
