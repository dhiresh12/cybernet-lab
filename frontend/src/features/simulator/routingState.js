// Routing State Management

export function createRoutingState() {
  return {
    staticRoutes: [],
    rip: null,
    ospf: null,
    eigrp: null,
    bgp: null,
  };
}

export function addStaticRoute(routing, network, mask, nextHop, ad = 1) {
  routing.staticRoutes.push({ network, mask, nextHop, ad });
  return routing.staticRoutes;
}

export function removeStaticRoute(routing, network, mask, nextHop) {
  routing.staticRoutes = routing.staticRoutes.filter(r => 
    !(r.network === network && r.mask === mask && r.nextHop === nextHop)
  );
  return routing.staticRoutes;
}

export function getStaticRoutes(routing) {
  return routing.staticRoutes;
}

export function configureRip(routing, processId) {
  routing.rip = { processId, networks: [], version: 2 };
  return routing.rip;
}

export function addRipNetwork(routing, network, wildcard) {
  if (!routing.rip) return false;
  routing.rip.networks.push({ network, wildcard });
  return true;
}

export function configureOspf(routing, processId) {
  routing.ospf = { processId, networks: [], routerId: null };
  return routing.ospf;
}

export function addOspfNetwork(routing, network, wildcard, area = '0') {
  if (!routing.ospf) return false;
  routing.ospf.networks.push({ network, wildcard, area });
  return true;
}

export function setOspfRouterId(routing, routerId) {
  if (!routing.ospf) return false;
  routing.ospf.routerId = routerId;
  return true;
}

export function configureEigrp(routing, asNumber) {
  routing.eigrp = { asNumber, networks: [], stub: false };
  return routing.eigrp;
}

export function addEigrpNetwork(routing, network, wildcard) {
  if (!routing.eigrp) return false;
  routing.eigrp.networks.push({ network, wildcard });
  return true;
}

export function setEigrpStub(routing, stub = true) {
  if (!routing.eigrp) return false;
  routing.eigrp.stub = stub;
  return true;
}

export function configureBgp(routing, asNumber) {
  routing.bgp = { asNumber, neighbors: [], networks: [] };
  return routing.bgp;
}

export function addBgpNeighbor(routing, neighborIp, remoteAs) {
  if (!routing.bgp) return false;
  routing.bgp.neighbors.push({ ip: neighborIp, remoteAs, state: 'Idle' });
  return true;
}

export function addBgpNetwork(routing, network, mask) {
  if (!routing.bgp) return false;
  routing.bgp.networks.push({ network, mask });
  return true;
}

export function getRoutingTable(device) {
  const routes = [];
  
  // Connected routes
  Object.entries(device.interfaces).forEach(([name, iface]) => {
    if (iface.ip !== 'unassigned' && iface.status === 'up') {
      const network = getNetworkAddress(iface.ip, iface.mask);
      routes.push({
        network,
        mask: iface.mask,
        nextHop: 'connected',
        interface: name,
        protocol: 'C',
        metric: 0,
      });
    }
  });
  
  // Static routes
  device.routing.staticRoutes.forEach(r => {
    routes.push({ ...r, protocol: 'S', metric: r.ad || 1 });
  });
  
  // Dynamic routes would be added here
  
  return routes;
}

// Helper
function getNetworkAddress(ip, mask) {
  const ipParts = ip.split('.').map(Number);
  const maskParts = mask.split('.').map(Number);
  return ipParts.map((p, i) => p & maskParts[i]).join('.');
}

export default {
  createRoutingState,
  addStaticRoute,
  removeStaticRoute,
  getStaticRoutes,
  configureRip,
  addRipNetwork,
  configureOspf,
  addOspfNetwork,
  setOspfRouterId,
  configureEigrp,
  addEigrpNetwork,
  setEigrpStub,
  configureBgp,
  addBgpNeighbor,
  addBgpNetwork,
  getRoutingTable,
};