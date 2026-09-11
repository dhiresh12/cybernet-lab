import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\components\BackgroundStudio.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find BACKGROUNDS array entries
bg_match = re.search(r'const BACKGROUNDS\s*=\s*\[(.*?)\];', content, re.DOTALL)
if bg_match:
    bg_content = bg_match.group(1)
    bg_ids = re.findall(r"id:\s*'([^']+)'", bg_content)
    print('BACKGROUNDS entries:', len(bg_ids))
    for b in bg_ids:
        print('  ' + b)
else:
    print('BACKGROUNDS not found')

# Find RENDERERS map entries
renderers_map = re.findall(r"'([^']+)':\s*(\w+)", content)
print('\nRENDERERS map entries:', len(renderers_map))
map_keys = [k for k, v in renderers_map]
for k, v in renderers_map:
    print('  ' + k + ': ' + v)

# Check for missing
for b in bg_ids:
    if b not in map_keys:
        print('  MISSING from RENDERERS: ' + b)

for k in map_keys:
    if k not in bg_ids:
        print('  EXTRA in RENDERERS (not in BACKGROUNDS): ' + k)