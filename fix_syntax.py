with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\features\backgrounds\renderers\NetworkGalaxyRenderer.jsx', 'r') as f:
    content = f.read()

# Fix the syntax error: }, []); -> }, []);
content = content.replace('}, []);', '}, []);')

with open(r'C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\frontend\src\features\backgrounds\renderers\NetworkGalaxyRenderer.jsx', 'w') as f:
    f.write(content)

print('Fixed')