# Remove unused renderers from BackgroundStudio.jsx
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\components\BackgroundStudio.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Ranges to remove (1-indexed, inclusive)
ranges_to_remove = [
    (109, 167),   # StarfieldRenderer
    (169, 237),   # NetworkNodesRenderer
    (239, 287),   # AuroraRenderer
    (289, 351),   # CircuitBoardRenderer
    (353, 433),   # GalaxyRenderer
    (493, 544),   # MinimalRenderer
    (607, 668),   # HolographicGridRenderer
    (670, 711),   # DataStreamRenderer
    (713, 758),   # NOCRenderer
]

# Convert to 0-indexed and sort by start line descending (so we don't shift)
ranges_0idx = [(s-1, e-1) for s, e in ranges_to_remove]
ranges_0idx.sort(key=lambda x: x[0], reverse=True)

for start, end in ranges_0idx:
    print(f'Removing lines {start+1} to {end+1}')
    del lines[start:end+1]

with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\components\BackgroundStudio.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done')