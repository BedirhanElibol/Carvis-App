import os
filepath = r'src\features\admin\PartnerApplications.jsx'
replacements = {
    'Ã§': 'ç', 'Ã‡': 'Ç',
    'Ä±': 'ı', 'Ä°': 'İ',
    'ÅŸ': 'ş', 'Åž': 'Ş',
    'Ã¶': 'ö', 'Ã–': 'Ö',
    'Ã¼': 'ü', 'Ãœ': 'Ü',
    'ÄŸ': 'ğ', 'Äž': 'Ğ'
}
if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for k, v in replacements.items():
        content = content.replace(k, v)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
