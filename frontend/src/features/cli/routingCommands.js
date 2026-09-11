// Routing Commands - Routing protocol configuration
import { CLI_MODES } from '../../core/constants';

function handleRouter(device, args, engine) {
  if (!args[0] || !args[1]) return { output: ['% Incomplete command'] };
  const protocol = args[0].toLowerCase();
  const processId = args[1];
  
  if (!device.routing[protocol]) {
    return { output: [`% Unknown routing protocol: ${protocol}`] };
  }
  
  device.routing[protocol] = { processId, networks: [] };
  device.mode = `router-${protocol}`;
  return { output: [] };
}

function handleNetwork(device, args, engine) {
  if (!args[0]) return { output: ['% Incomplete command'] };
  const network = args[0];
  const wildcard = args[1] || '0.0.0.0';
  const area = args[3] || '0';
  
  if (device.mode.startsWith('router-')) {
    const protocol = device.mode.replace('router-', '');
    if (device.routing[protocol]) {
      device.routing[protocol].networks.push({ network, wildcard, area });
      return { output: [] };
    }
  }
  return { output: ['% Not in routing protocol configuration mode'] };
}

function handleStaticRoute(device, args, engine) {
  const subCmd = args[0]?.toLowerCase();
  if (subCmd === 'route' && args.length >= 3) {
    const network = args[1];
    const mask = args[2];
    const nextHop = args[3];
    device.routing.staticRoutes.push({ network, mask, nextHop });
    return { output: [] };
  }
  return { output: ['% Incomplete command'] };
}

export const commands = [
  { name: 'router', handler: handleRouter, options: { requiredMode: CLI_MODES.CONFIG, description: 'Configure routing protocol' } },
  { name: 'network', handler: handleNetwork, options: { requiredMode: 'router-ospf', description: 'Add network to routing protocol' } },
  { name: 'ip', handler: handleStaticRoute, options: { requiredMode: CLI_MODES.CONFIG, description: 'Configure static route' } },
];