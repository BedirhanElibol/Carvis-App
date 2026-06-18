import os
import json

files_to_fix = [
    r'src\features\extras\TenderScreen.jsx',
    r'src\features\extras\InsuranceMarket.jsx',
    r'src\features\extras\FuelScreen.jsx',
    r'src\features\extras\ParkingScreen.jsx',
    r'src\features\garage\VehicleSearch.jsx',
    r'src\features\partners\PartnerDashboard.jsx',
    r'src\features\orders\OrdersScreen.jsx'
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if u'\ufffd' in content:
            print(f'File {filepath} still contains replacement characters.')
            lines = content.splitlines()
            for i, line in enumerate(lines):
                if u'\ufffd' in line:
                    print(f'  L{i+1}: {line.strip()}')
