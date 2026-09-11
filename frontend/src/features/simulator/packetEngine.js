// Packet Flow Simulation

export const PACKET_STATES = {
  SENT: 'sent',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  DROPPED: 'dropped',
};

export function createPacket(from, to, mode = 'ping') {
  return {
    id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from,
    to,
    mode,
    state: PACKET_STATES.SENT,
    progress: 0,
    path: [],
    timestamp: Date.now(),
  };
}

export function simulatePacketFlow(device, targetIp, devices, getRoutingTable) {
  const routingTable = getRoutingTable(device);
  let currentDevice = device;
  const path = [];
  let hops = 0;
  const maxHops = 16;
  
  while (hops < maxHops) {
    path.push(currentDevice.id);
    
    // Check if target is directly connected
    for (const iface of Object.values(currentDevice.interfaces)) {
      if (iface.ip !== 'unassigned' && iface.status === 'up') {
        const network = getNetworkAddress(iface.ip, iface.mask);
        if (isIpInNetwork(targetIp, network, iface.mask)) {
          // Target is on this subnet
          return { success: true, path, finalDevice: currentDevice, finalInterface: iface };
        }
      }
    }
    
    // Check routing table
    let bestRoute = null;
    let bestMetric = Infinity;
    
    for (const route of routingTable) {
      if (isIpInNetwork(targetIp, route.network, route.mask)) {
        if (route.metric < bestMetric) {
          bestMetric = route.metric;
          bestRoute = route;
        }
      }
    }
    
    if (!bestRoute) {
      return { success: false, path, reason: 'No route to host' };
    }
    
    // Find next hop device
    if (bestRoute.nextHop === 'connected') {
      // Directly connected - should have been caught above
      return { success: false, path, reason: 'Routing loop detected' };
    }
    
    // Find device with the next hop IP
    let nextDevice = null;
    for (const d of Object.values(devices)) {
      for (const iface of Object.values(d.interfaces)) {
        if (iface.ip === bestRoute.nextHop) {
          nextDevice = d;
          break;
        }
      }
      if (nextDevice) break;
    }
    
    if (!nextDevice) {
      return { success: false, path, reason: 'Next hop unreachable' };
    }
    
    currentDevice = nextDevice;
    hops++;
  }
  
  return { success: false, path, reason: 'Max hops exceeded' };
}

// Helpers
function getNetworkAddress(ip, mask) {
  const ipParts = ip.split('.').map(Number);
  const maskParts = mask.split('.').map(Number);
  return ipParts.map((p, i) => p & maskParts[i]).join('.');
}

function isIpInNetwork(ip, network, mask) {
  const ipInt = ipToInt(ip);
  const netInt = ipToInt(network);
  const maskInt = ipToInt(mask);
  return (ipInt & maskInt) === (netInt & maskInt);
}

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function animatePacket(packet, duration = 2000) {
  return new Promise(resolve => {
    const start = Date.now();
    
    function animate() {
      const elapsed = Date.now() - start;
      packet.progress = Math.min(elapsed / duration, 1);
      
      if (packet.progress >= 1) {
        packet.state = PACKET_STATES.DELIVERED;
        resolve(packet);
      } else {
        packet.state = PACKET_STATES.IN_TRANSIT;
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  });
}

export function dropPacket(packet, reason) {
  packet.state = PACKET_STATES.DROPPED;
  packet.dropReason = reason;
  return packet;
}

export default {
  PACKET_STATES,
  createPacket,
  simulatePacketFlow,
  animatePacket,
  dropPacket,
};