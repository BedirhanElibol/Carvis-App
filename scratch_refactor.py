import os
import re

file_path = 'src/features/home/LandingScreen.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the JSX blocks from the main return statement
# Hero Section
hero_match = re.search(r'(<section className="w-full max-w-7xl mx-auto px-6 text-center flex flex-col items-center">.*?</section>)', content, re.DOTALL)
if hero_match:
    hero_section = hero_match.group(1)
    
# Wait, parsing React code with regex is very brittle.
# I will instead create new components by copying the entire LandingScreen.jsx to a new file and then trimming it down.
