import os
import re

# We want to replace "Carvis" with "Rapidsy" and "CARVIS" with "RAPIDSY".
# But we must NOT replace if it's "Carvis AI", "Carvis Asistan", "Carvis App/1", 
# "privacy@carvis", "carvis.app", "com.carvis", "@carvis"
# Actually, the user said: "app'in adı rapidsy yapay zekamızın adı carvis"
# Let's define the Safe patterns that shouldn't be replaced.
safe_patterns = [
    r'Carvis\s+AI',
    r'Carvis\s+Asistan',
    r'Carvis\s+teknik',
    r'Sen\s+Carvis',
    r'Ben\s+Carvis',
    r'Carvis,\s*AI',
    r'carvis_onboarding',
    r'carvis_search',
    r'carvis_wallet'
]

# We will just replace Carvis -> Rapidsy. 
# For "CARVIS", if it's "CARVIS PRO" -> "RAPIDSY PRO". 

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return

    original = content
    
    # We use a trick: first, mask the safe occurrences
    for i, p in enumerate(safe_patterns):
        # We find matches and replace them with a unique token
        matches = re.finditer(p, content, flags=re.IGNORECASE)
        for m in matches:
            content = content.replace(m.group(0), f"__SAFE_TOKEN_{i}__" + m.group(0).replace(" ", "_MASK_") + f"__END_TOKEN_{i}__")

    # Now replace "Carvis" with "Rapidsy"
    content = content.replace("Carvis", "Rapidsy")
    content = content.replace("CARVIS", "RAPIDSY")
    # For URLs/Emails:
    content = content.replace("carvis.app", "rapidsy.app")
    content = content.replace("@carvis.app", "@rapidsy.app")
    
    # Revert the masks
    for i, p in enumerate(safe_patterns):
        # find the tokens
        mask_regex = re.compile(rf"__SAFE_TOKEN_{i}__(.*?)__END_TOKEN_{i}__")
        def unmask(m):
            return m.group(1).replace("_MASK_", " ")
        content = mask_regex.sub(unmask, content)

    # Some manual cleanup if needed.
    content = content.replace("Rapidsy AI", "Carvis AI")
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    skip_dirs = ['node_modules', '.git', 'dist', 'android', 'ios']
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for f in files:
            if f.endswith(('.js', '.jsx', '.ts', '.tsx', '.html', '.md', '.json')):
                # skip package.json and index.html if we already patched them, 
                # but it's safe to run again.
                replace_in_file(os.path.join(root, f))

if __name__ == '__main__':
    main()
