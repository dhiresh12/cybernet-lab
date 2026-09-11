import re
with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find handleStartLab function
match = re.search(r'const handleStartLab\s*=\s*\([^)]*\)\s*{([^}]+)}', content, re.DOTALL)
if match:
    print('handleStartLab:')
    print(match.group(0)[:500])
else:
    # Try broader search
    match = re.search(r'handleStartLab\s*=', content)
    if match:
        start = match.start()
        # Find the function body
        brace_start = content.find('{', start)
        if brace_start > 0:
            brace_count = 0
            i = brace_start
            while i < len(content):
                if content[i] == '{':
                    brace_count += 1
                elif content[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        print('handleStartLab function:')
                        print(content[start:i+1][:1000])
                        break
                i += 1

# Check how currentLab is set
print('\n--- currentLab assignments ---')
matches = re.findall(r'setCurrentLab\s*\([^)]+\)', content)
for m in matches[:10]:
    print('  ' + m[:100])

# Check lab selection
print('\n--- lab selection ---')
matches = re.findall(r'onSelectLab\s*\([^)]*\)', content)
for m in matches[:10]:
    print('  ' + m[:100])