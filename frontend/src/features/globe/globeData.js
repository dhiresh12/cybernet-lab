// Globe data generators - pure functions, no Three.js dependency
export function generateNodes(seed = 42) {
  const nodes = [];
  const types = ['core', 'edge', 'gateway', 'datacenter', 'endpoint'];
  const statuses = ['online', 'online', 'online', 'online', 'warning', 'critical', 'offline'];
  
  for (let i = 0; i < 28; i++) {
    const lat = (Math.sin(seed + i * 1.1) * 10000 - Math.floor(Math.sin(seed + i * 1.1) * 10000) - 0.5) * Math.PI * 0.85;
    const lon = (Math.sin(seed + i * 2.3) * 10000 - Math.floor(Math.sin(seed + i * 2.3) * 10000)) * Math.PI * 2;
    const x = Math.cos(lat) * Math.cos(lon);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.sin(lon);
    
    const typeIndex = Math.floor((Math.sin(seed + i * 3.7) * 10000 - Math.floor(Math.sin(seed + i * 3.7) * 10000)) * types.length);
    const statusIndex = Math.floor((Math.sin(seed + i * 5.1) * 10000 - Math.floor(Math.sin(seed + i * 5.1) * 10000)) * statuses.length);
    
    nodes.push({
      id: i,
      lat,
      lon,
      position: [x * 1.5 * 1.005, y * 1.5 * 1.005, z * 1.5 * 1.005],
      label: `NODE-${String(i + 1).padStart(2, '0')}`,
      region: ['NA', 'EU', 'APAC', 'SA', 'AF', 'OC'][i % 6],
      type: types[typeIndex],
      status: statuses[statusIndex],
      load: Math.floor((Math.sin(seed + i * 7.3) * 10000 - Math.floor(Math.sin(seed + i * 7.3) * 10000)) * 100),
      uptime: Math.floor((Math.sin(seed + i * 11.2) * 10000 - Math.floor(Math.sin(seed + i * 11.2) * 10000)) * 100),
    });
  }
  return nodes;
}

export function generateArcs(nodes, seed = 42) {
  const arcs = [];
  for (let i = 0; i < nodes.length; i++) {
    const linkCount = 2 + Math.floor((Math.sin(seed + i * 4.1) * 10000 - Math.floor(Math.sin(seed + i * 4.1) * 10000)) * 3);
    for (let k = 0; k < linkCount; k++) {
      const j = Math.floor((Math.sin(seed + i * 100 + k * 50) * 10000 - Math.floor(Math.sin(seed + i * 100 + k * 50) * 10000)) * nodes.length);
      if (j !== i) {
        const exists = arcs.some(a => (a.from === i && a.to === j) || (a.from === j && a.to === i));
        if (!exists) {
          arcs.push({ 
            from: i, 
            to: j, 
            intensity: 0.3 + (Math.sin(seed + i * 200 + k * 30) * 10000 - Math.floor(Math.sin(seed + i * 200 + k * 30) * 10000)) * 0.7,
            bandwidth: Math.floor((Math.sin(seed + i * 300 + k * 40) * 10000 - Math.floor(Math.sin(seed + i * 300 + k * 40) * 10000)) * 1000) + 100,
          });
        }
      }
    }
  }
  return arcs;
}
