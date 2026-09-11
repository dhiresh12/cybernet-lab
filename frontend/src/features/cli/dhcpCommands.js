// DHCP Commands - DHCP pool configuration
import { CLI_MODES } from '../../core/constants';

function handleIpDhcp(device, args, engine) {
  const subCmd = args[0]?.toLowerCase();
  if (subCmd === 'dhcp' && args[1] === 'pool' && args[2]) {
    device.dhcp.pools.push({ name: args[2] });
    device.currentDhcpPool = args[2];
    device.mode = CLI_MODES.DHCP;
    return { output: [] };
  }
  if (subCmd === 'dhcp' && args[1] === 'excluded-address' && args[2]) {
    device.dhcp.excluded.push(args[2]);
    if (args[3]) device.dhcp.excluded.push(args[3]);
    return { output: [] };
  }
  return { output: ['% Incomplete command'] };
}

function handleDhcpPool(device, args, engine) {
  if (device.mode === CLI_MODES.DHCP && device.currentDhcpPool) {
    const pool = device.dhcp.pools.find(p => p.name === device.currentDhcpPool);
    if (pool && args[0] && args[1]) {
      pool.network = args[0];
      pool.mask = args[1];
      return { output: [] };
    }
  }
  return { output: ['% Not in DHCP pool configuration mode'] };
}

function handleDefaultRouter(device, args, engine) {
  if (device.mode === CLI_MODES.DHCP && device.currentDhcpPool && args[0]) {
    const pool = device.dhcp.pools.find(p => p.name === device.currentDhcpPool);
    if (pool) {
      pool.defaultRouter = args[0];
      return { output: [] };
    }
  }
  return { output: ['% Not in DHCP pool configuration mode'] };
}

function handleDnsServer(device, args, engine) {
  if (device.mode === CLI_MODES.DHCP && device.currentDhcpPool && args[0]) {
    const pool = device.dhcp.pools.find(p => p.name === device.currentDhcpPool);
    if (pool) {
      pool.dnsServer = args[0];
      return { output: [] };
    }
  }
  return { output: ['% Not in DHCP pool configuration mode'] };
}

export const commands = [
  {
    name: 'ip',
    handler: (device, args, engine) => {
      const subCmd = args[0]?.toLowerCase();
      if (subCmd === 'dhcp') return handleIpDhcp(device, args, engine);
      return { output: ['% Incomplete command'] };
    },
    options: { requiredMode: CLI_MODES.CONFIG, description: 'Configure DHCP' }
  },
  { name: 'network', handler: handleDhcpPool, options: { requiredMode: CLI_MODES.DHCP, description: 'Set DHCP pool network' } },
  { name: 'default-router', handler: handleDefaultRouter, options: { requiredMode: CLI_MODES.DHCP, description: 'Set DHCP default router' } },
  { name: 'dns-server', handler: handleDnsServer, options: { requiredMode: CLI_MODES.DHCP, description: 'Set DHCP DNS server' } },
];