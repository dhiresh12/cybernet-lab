import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check imports
imports = re.findall(r"import\s+(?:(?:{\s*([^}]+)\s*})|(\w+))\s+from\s+'([^']+)'", content)
print('Imports in App.jsx:')
for match in imports:
    if match[0]:
        names = [n.strip() for n in match[0].split(',')]
        for n in names:
            print('  ' + n + ' <- ' + match[2])
    else:
        print('  ' + match[1] + ' <- ' + match[2])

# Check which imports are used
components = ['AudioEngine', 'LabEngine', 'gameEngine', 'generatePacketTracerHint', 
              'LabStepViewer', 'MusicPlayer', 'BackgroundStudio', 'NetworkVisualization',
              'CommandLibrary', 'LearningRoadmap', 'Dashboard', 'GlobalSearch', 
              'EngineerMode', 'FocusMode', 'LabWorkspace', 'labsData']

print('\nUsage check:')
for c in components:
    count = content.count(c)
    if count > 0:
        print('  ' + c + ': used ' + str(count) + ' times')
    else:
        print('  ' + c + ': NOT USED')