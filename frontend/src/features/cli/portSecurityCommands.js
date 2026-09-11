// Port Security Commands - Switchport port-security configuration
import { CLI_MODES } from '../../core/constants';

function handleSwitchport(device, args, engine) {
  if (!device.currentInterface) return { output: ['% No interface selected'] };
  const iface = device.interfaces[device.currentInterface];
  if (!iface) return { output: ['% Interface not found'] };

  const subCmd = args[0]?.toLowerCase();
  if (subCmd === 'port-security') {
    if (!iface.portSecurity) iface.portSecurity = {};
    if (args[1] === 'maximum' && args[2]) {
      iface.portSecurity.maximum = parseInt(args[2], 10);
    } else if (args[1] === 'violation' && args[2]) {
      iface.portSecurity.violation = args[2];
    } else if (args[1] === 'mac-address' && args[2]) {
      iface.portSecurity.sticky = true;
      iface.portSecurity.macAddress = args[2];
    }
    iface.portSecurity.enabled = true;
    return { output: [] };
  }
  if (subCmd === 'mode' && args[1]) {
    iface.mode = args[1];
    return { output: [] };
  }
  return { output: ['% Incomplete command'] };
}

export const commands = [
  { name: 'switchport', handler: handleSwitchport, options: { requiredMode: CLI_MODES.INTERFACE, description: 'Configure switchport' } },
];