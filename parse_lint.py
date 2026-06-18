import json
import os

with open('lint_report.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"{'File':<80} | {'Warnings':<10}")
print("-" * 95)
total_warnings = 0
for file in data:
    warnings = len(file['messages'])
    if warnings > 0:
        rel_path = os.path.relpath(file['filePath'], os.getcwd())
        print(f"{rel_path:<80} | {warnings:<10}")
        total_warnings += warnings

print("-" * 95)
print(f"{'Total':<80} | {total_warnings:<10}")
