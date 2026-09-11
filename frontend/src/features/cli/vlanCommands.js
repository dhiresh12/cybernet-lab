// VLAN Commands - VLAN configuration
import { CLI_MODES } from '../../core/constants';

function handleVlan(device, args, engine) {
  if (!args[0]) return { output: ['% Incomplete command'] };
  const vlanId = parseInt(args[0], 10);
  if (isNaN(vlanId)) return { output: ['% Invalid VLAN ID'] };
  if (!device.vlans[vlanId]) {
    device.vlans[vlanId] = { name: `VLAN${vlanId}`, ports: [] };
  }
  device.currentVlan = vlanId;
  device.mode = 'vlan';
  return { output: [] };
}

function handleVlanName(device, args, engine) {
  if (device.currentVlan && device.vlans[device.currentVlan]) {
    device.vlans[device.currentVlan].name = args.join(' ');
    return { output: [] };
  }
  return { output: ['% No VLAN selected'] };
}

export const commands = [
  { name: 'vlan', handler: handleVlan, options: { requiredMode: CLI_MODES.CONFIG, description: 'Create/configure VLAN' } },
  { name: 'name', handler: handleVlanName, options: { requiredMode: 'vlan', description: 'Set VLAN name' } },
];
