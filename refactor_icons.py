import os
import re

def refactor_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False

    # Match import { Icon1, Icon2 } from 'lucide-react'
    pattern = r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];?"
    matches = list(re.finditer(pattern, content))

    if not matches:
        return False

    new_content = content
    icons_to_replace = []

    for match in matches:
        full_match = match.group(0)
        icons_text = match.group(1)
        icons = [i.strip() for i in icons_text.split(',') if i.strip()]
        icons_to_replace.extend(icons)
        
        # Replace the entire import line
        new_content = new_content.replace(full_match, "import * as Icons from 'lucide-react';")

    # Replace usages
    for icon in set(icons_to_replace):
        # Case 1: <IconName
        new_content = re.sub(rf'<({icon})\b', rf'<Icons.\1', new_content)
        # Case 2: Icon={IconName}
        new_content = re.sub(rf'=\s*\{({icon})\s*\}', rf'={{Icons.\1}}', new_content)
        # Case 3: icon: IconName
        new_content = re.sub(rf'\bicon\s*:\s*({icon})\b', rf'icon: Icons.\1', new_content)
        # Case 4: {IconName} (inside JSX)
        new_content = re.sub(rf'\{({icon})\s*\}', rf'{{Icons.\1}}', new_content)

    if new_content != content:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except Exception as e:
            print(f"Error writing {filepath}: {e}")
    return False

# Use relative path since we run from workspace root
src_dir = 'src'
count = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            path = os.path.join(root, file)
            if refactor_file(path):
                print(f"Refactored: {path}")
                count += 1

print(f"Total files refactored: {count}")
