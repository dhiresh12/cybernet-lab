import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\components\LabWorkspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check imports
imports = re.findall(r"import\s+(?:(?:{\s*([^}]+)\s*})|(\w+))\s+from\s+'([^']+)'", content)
print('Imports:')
for match in imports:
    if match[0]:  # named imports
        names = [n.strip() for n in match[0].split(',')]
        for n in names:
            print('  ' + n + ' <- ' + match[2])
    else:  # default import
        print('  ' + match[1] + ' <- ' + match[2])

# Check for common issues
issues = [
    ('getEdgeStatus defined in useEffect', r'const getEdgeStatus\s*='), 
    ('NetworkSimulationEngine usage', r'NetworkSimulationEngine'),
    ('TroubleshootingEngine usage', r'TroubleshootingEngine'),
    ('defaultDeviceState usage', r'defaultDeviceState'),
    ('parseLabDevices', r'parseLabDevices'),
    ('parseLabConnections', r'parseLabConnections'),
    ('parseIpTable', r'parseIpTable'),
    ('buildLayout', r'buildLayout'),
]

print('\nCode patterns:')
for name, pattern in issues:
    matches = re.findall(pattern, content)
    print(f'  {name}: {len(matches)} occurrence(s)')

# Check for missing closing braces or brackets in useEffect
# Look for useEffect patterns
useeffects = re.findall(r'useEffect\s*\([^)]*=>\s*{', content)
print(f'\nuseEffect count: {len(useeffects)}')

# Check state variables
states = re.findall(r'const\s+\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=', content)
print('\nuseState variables:')
for s, set_s in states:
    print(f'  {s} / set{set_s}')