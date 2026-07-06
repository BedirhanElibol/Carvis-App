import os

def create_component(name, lines, imports, props):
    content = f"""import React, {{ memo }} from "react";
{imports}

const {name} = memo(({{{props}}}) => {{
  return (
    <>
{lines}
    </>
  );
}});

{name}.displayName = '{name}';
export default {name};
"""
    with open(f"src/features/home/components/landing/{name}.jsx", "w", encoding="utf-8") as f:
        f.write(content)

with open('src/features/home/LandingScreen.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_lines(start, end):
    return "".join(lines[start-1:end])

# LandingHero (Lines 206 - 420)
create_component(
    "LandingHero", 
    get_lines(206, 420), 
    'import { ArrowRight, ChevronDown, ChevronRight, Droplets, Fuel, Map, MapPin, RefreshCw, Search, Box, Wrench, TrendingUp, ShieldCheck, HardDrive, Wind, Flame } from "lucide-react";\nimport { motion } from "framer-motion";\nimport { useNavigate } from "react-router-dom";',
    "t, language, searchQuery, setSearchQuery, searchLocation, setSearchLocation, CITIES, fuelPrices, fuelCity, setFuelCity, fuelLastUpdated, isLoadingFuel"
)

# LandingAppShowcase (Lines 422 - 630)
create_component(
    "LandingAppShowcase",
    get_lines(422, 630),
    'import { Car, Clock, Wrench, ChevronRight, SearchCheck, FileText, Lock } from "lucide-react";\nimport { useNavigate } from "react-router-dom";',
    "t, language"
)

# LandingInteractiveMap (Lines 632 - 743)
create_component(
    "LandingInteractiveMap",
    get_lines(632, 743),
    'import { ChevronRight, Star, Loader2, FileText, Flame, ShieldCheck, Maximize, HeartHandshake, Video } from "lucide-react";\nimport LocationMap from "../../../components/ui/LocationMap";',
    "t, language, isLoadingProviders, nearbyProviders, edsMarkers, mapCenter, hoveredPin, setHoveredPin, openModal"
)

# LandingHowItWorks (Lines 745 - 773)
create_component(
    "LandingHowItWorks",
    get_lines(745, 773),
    'import { Search, FileText, CheckCircle } from "lucide-react";',
    "t"
)

# LandingPremiumFeatures (Lines 775 - 1158)
create_component(
    "LandingPremiumFeatures",
    get_lines(775, 1158),
    'import { TrendingUp, Fuel, Wrench, CheckCircle2, Layers, Star, Package, ShieldCheck, Navigation, User } from "lucide-react";',
    "t, language"
)

# LandingStats (Lines 1161 - 1197)
create_component(
    "LandingStats",
    get_lines(1161, 1197),
    '',
    ""
)

# LandingBusinessPortalCTA (Lines 1199 - 1225)
create_component(
    "LandingBusinessPortalCTA",
    get_lines(1199, 1225),
    'import { Store } from "lucide-react";\nimport { useNavigate } from "react-router-dom";',
    "t"
)

print("Extraction complete.")
