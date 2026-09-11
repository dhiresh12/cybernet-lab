// NAT Commands - Network Address Translation configuration
import { CLI_MODES } from '../../core/constants';

function handleNat(device, args, engine) {
  const natCmd = args[1]?.toLowerCase();
  if (natCmd === 'inside' && args[2] === 'source' && args[3] === 'static') {
    device.nat.insideSource.push({ localIp: args[3], globalIp: args[4] });
    return { output: [] };
  }
  if (natCmd === 'outside' && args[2] === 'source' && args[3] === 'static') {
    device.nat.outsideSource.push({ localIp: args[3], globalIp: args[4] });
    return { output: [] };
  }
  return { output: ['% Incomplete command'] };
}

export const commands = [
  {
    name: 'ip',
    handler: (device, args, engine) => {
      const subCmd = args[0]?.toLowerCase();
      if (subCmd === 'nat') return handleNat(device, args, engine);
      return { output: ['% Incomplete command'] };
    },
    options: { requiredMode: CLI_MODES.CONFIG, description: 'Configure NAT' }
  },
];