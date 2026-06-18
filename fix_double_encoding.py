import os
import re

files_to_fix = [
    r'src\features\extras\TenderScreen.jsx',
    r'src\features\extras\InsuranceMarket.jsx',
    r'src\features\extras\FuelScreen.jsx',
    r'src\features\extras\ParkingScreen.jsx',
    r'src\features\garage\VehicleSearch.jsx',
    r'src\features\partners\PartnerDashboard.jsx',
    r'src\features\orders\OrdersScreen.jsx'
]

# Map of common double-encoded UTF-8 Turkish characters to correct ones
replacements = {
    'Ã§': 'ç', 'Ã‡': 'Ç',
    'Ä±': 'ı', 'Ä°': 'İ',
    'ÅŸ': 'ş', 'Åž': 'Ş',
    'Ã¶': 'ö', 'Ã–': 'Ö',
    'Ã¼': 'ü', 'Ãœ': 'Ü',
    'ÄŸ': 'ğ', 'Äž': 'Ğ'
}

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for k, v in replacements.items():
            content = content.replace(k, v)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed encoding in {filepath}')
