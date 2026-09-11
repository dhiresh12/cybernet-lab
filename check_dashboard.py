import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\components\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check imports and exports
print('Dashboard imports:')
imports = re.findall(r"import\s+(?:(?:{\s*([^}]+)\s*})|(\w+))\s+from\s+'([^']+)'", content)
for match in imports:
    if match[0]:
        names = [n.strip() for n in match[0].split(',')]
        for n in names:
            print('  ' + n + ' <- ' + match[2])
    else:
        print('  ' + match[1] + ' <- ' + match[2])

# Check for onSelectLab prop usage
print('\nonSelectLab usage:')
matches = re.findall(r'onSelectLab\s*=', content)
print('  Found', len(matches), 'times')

# Check for lab clicking/selection
print('\nLab selection handlers:')
matches = re.findall(r'onClick\s*=>\s*{[^}]*onSelectLab', content)
for m in matches[:5]:
    print('  ' + m[:100])