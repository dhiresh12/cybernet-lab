import json

with open('frontend/src/data/labs.procedural.json', 'r') as f:
    data = json.load(f)
labs = data.get('labs', [])

print(f'Total labs: {len(labs)}')
for lab in labs:
    if lab.get('id') in ['113', '126']:
        print("Lab {}: {}".format(lab.get('id'), lab.get('title')))
        print("  Quarantined: {}".format(lab.get('quarantined', False)))
        print("  Status: {}".format(lab.get('status', 'unknown')))
        print("  Steps: {}".format(len(lab.get('steps', []))))
        topo = lab.get('topology', {})
        print("  Devices: {}".format(len(topo.get('devices', []))))
        print("  Category: {}".format(lab.get('category', 'unknown')))
        print()

print("=== Reference Labs ===")
for ref_file in ['frontend/src/data/reference-labs/lab-small-office-lan.json',
                 'frontend/src/data/reference-labs/lab-vlans-sales-accounts.json']:
    try:
        with open(ref_file, 'r') as f:
            ref = json.load(f)
        print("\n{}:".format(ref_file))
        print("  Title: {}".format(ref.get('title')))
        print("  Steps: {}".format(len(ref.get('steps', []))))
        for s in ref.get('steps', []):
            ver = s.get('verification', {})
            print("    Step {}: {} verification={}".format(s.get('stepId'), s.get('title'), ver.get('type', 'none')))
    except Exception as e:
        print("Error reading {}: {}".format(ref_file, e))

# Check for quarantined labs
print("\n=== Quarantined Labs in registry ===")
try:
    with open('frontend/src/data/labQualityRegistry.json', 'r') as f:
        qr = json.load(f)
    for item in qr:
        if item.get('id') in ['113', '126']:
            print("  Lab {}: {}".format(item.get('id'), item.get('title', 'unknown')))
            print("    Quarantined: {}".format(item.get('quarantined', False)))
            print("    Category: {}".format(item.get('category', 'unknown')))
            print("    Status: {}".format(item.get('status', 'unknown')))
except Exception as e:
    print("Error reading labQualityRegistry.json: {}".format(e))
