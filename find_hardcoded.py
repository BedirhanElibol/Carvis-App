import os
import re
import json

hardcoded_strings = {}
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Find text between JSX tags > text <
            matches = re.findall(r'>\s*([A-ZÇĞİÖŞÜa-zçğıöşü][a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s.,!?\'"()-]{2,})\s*<', content)
            
            valid_matches = []
            for m in matches:
                m = m.strip()
                # Exclude variables like {variable}
                if not m.startswith('{') and not m.endswith('}'):
                    valid_matches.append(m)
                    
            if valid_matches:
                hardcoded_strings[filepath] = list(set(valid_matches))

with open('hardcoded.json', 'w', encoding='utf-8') as f:
    json.dump(hardcoded_strings, f, indent=2, ensure_ascii=False)
