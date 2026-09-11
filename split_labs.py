import json
import os

base = r"C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src"

with open(os.path.join(base, "data", "labs.procedural.json"), 'r', encoding='utf-8') as f:
    labs = json.load(f)

# Group by category
categories = {}
for lab in labs:
    cat = lab.get('category', 'Uncategorized')
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(lab)

# Write category files
labs_dir = os.path.join(base, "data", "labs")
for cat, cat_labs in categories.items():
    fname = cat.lower().replace(' ', '-').replace('/', '-') + '.json'
    fpath = os.path.join(labs_dir, fname)
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(cat_labs, f, indent=2)
    print(f"Created: {fname} ({len(cat_labs)} labs)")

# Create index file
index = {cat: len(labs) for cat, labs in categories.items()}
with open(os.path.join(labs_dir, 'index.json'), 'w', encoding='utf-8') as f:
    json.dump(index, f, indent=2)

print(f"\nTotal categories: {len(categories)}")
print(f"Total labs: {sum(len(l) for l in categories.values())}")