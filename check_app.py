import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check imports
imports = re.findall(r"import\s+(\w+)\s+from\s+'([^']+)'", content)
print('Imports:')
for name, path in imports:
    print('  ' + name + ' <- ' + path)

# Check for usage of components
components_used = [
    'BackgroundStudio', 'NetworkVisualization', 'CommandLibrary', 
    'LearningRoadmap', 'Dashboard', 'GlobalSearch', 'EngineerMode',
    'FocusMode', 'LabWorkspace', 'LabStepViewer', 'MusicPlayer'
]
for c in components_used:
    if c in content:
        print(f'  {c}: USED')
    else:
        print(f'  {c}: NOT USED')

# Check for undefined variables
undefined_checks = [
    'saveProgress', 'handleStartLab', 'currentLab', 'labProgressCount',
    'theme', 'bgSetting', 'animationsEnabled', 'soundEnabled',
    'musicTrack', 'packetTracerHint', 'invertColors'
]
for v in undefined_checks:
    count = content.count(v)
    if count > 0:
        print(f'  {v}: used {count} times')
    else:
        print(f'  {v}: NOT USED')