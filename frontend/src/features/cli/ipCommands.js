// IP Commands - IP address and interface configuration
import { CLI_MODES } from '../../core/constants';

function handleIpAddress(device, args, engine) {
  if (!device.currentInterface) return { output: ['% No interface selected'] };
  const iface = device.interfaces[device.currentInterface];
  if (!iface) return { output: ['% Interface not found'] };
  iface.ip = args[1];
  iface.mask = args[2];
  return { output: [] };
}

function handleIpDhcp(device, args, engine) {
  if (!device.currentInterface) return { output: ['% No interface selected'] };
  const iface = device.interfaces[device.currentInterface];
  if (!iface) return { output: ['% Interface not found'] };
  iface.dhcpClient = true;
  return { output: [] };
}

export const commands = [
  {
    name: 'ip',
    handler: (device, args, engine) => {
      const subCmd = args[0]?.toLowerCase();
      if (subCmd === 'address' && args[1] && args[2]) {
        return handleIpAddress(device, args, engine);
      }
      if (subCmd === 'dhcp') {
        return handleIpDhcp(device, args, engine);
      }
      return { output: ['% Incomplete command'] };
    },
    options: { requiredMode: CLI_MODES.INTERFACE, description: 'Configure IP settings' }
  }
];