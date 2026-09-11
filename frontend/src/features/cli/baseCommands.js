// Base Commands - Mode navigation and basic CLI commands
import { CLI_MODES } from '../../core/constants';

function handleEnable(device, args, engine) {
  if (device.mode === CLI_MODES.ENABLE) {
    return { output: [] };
  }
  device.mode = CLI_MODES.ENABLE;
  return { output: [] };
}

function handleDisable(device, args, engine) {
  device.mode = CLI_MODES.USER;
  return { output: [] };
}

function handleConfigure(device, args, engine) {
  if (args[0] === 'terminal') {
    device.mode = CLI_MODES.CONFIG;
    return { output: ['Enter configuration commands, one per line. End with CNTL/Z.'] };
  }
  return { output: ['% Invalid configure command'] };
}

function handleExit(device, args, engine) {
  if (device.mode === CLI_MODES.CONFIG) {
    device.mode = CLI_MODES.ENABLE;
  } else if (device.mode === CLI_MODES.INTERFACE || device.mode === CLI_MODES.ACL || device.mode === CLI_MODES.DHCP) {
    device.mode = CLI_MODES.CONFIG;
  } else if (device.mode === CLI_MODES.ENABLE) {
    device.mode = CLI_MODES.USER;
  }
  return { output: [] };
}

function handleInterface(device, args, engine) {
  if (!args[0]) {
    return { output: ['% Incomplete command'] };
  }
  device.currentInterface = args[0];
  device.mode = CLI_MODES.INTERFACE;
  return { output: [] };
}

function handleNo(device, args, engine) {
  if (!args[0]) {
    return { output: ['% Incomplete command'] };
  }
  const subCmd = args[0].toLowerCase();
  const iface = device.interfaces[device.currentInterface];
  
  if (!iface) {
    return { output: ['% No interface selected'] };
  }

  switch (subCmd) {
    case 'shutdown':
      iface.status = 'up';
      iface.protocol = 'up';
      return { output: [] };
    case 'ip':
      if (args[1] === 'address') {
        iface.ip = 'unassigned';
        iface.mask = '255.255.255.0';
      }
      return { output: [] };
    default:
      return { output: [`% Unknown 'no' command: ${subCmd}`] };
  }
}

export const name = 'base';
export function setInterfaceMode(device, mode) {
  device.mode = mode;
  return device.mode;
}

export const commands = [
  { name: 'enable', handler: handleEnable, options: { requiredMode: CLI_MODES.USER, description: 'Enter privileged mode' } },
  { name: 'disable', handler: handleDisable, options: { requiredMode: CLI_MODES.ENABLE, description: 'Exit privileged mode' } },
  { name: 'configure', handler: handleConfigure, options: { requiredMode: CLI_MODES.ENABLE, aliases: ['conf', 'config'], description: 'Enter configuration mode' } },
  { name: 'exit', handler: handleExit, options: { requiredMode: CLI_MODES.CONFIG, description: 'Exit current mode' } },
  { name: 'interface', handler: handleInterface, options: { requiredMode: CLI_MODES.CONFIG, aliases: ['int'], description: 'Select interface' } },
  { name: 'no', handler: handleNo, options: { requiredMode: CLI_MODES.INTERFACE, description: 'Negate a command' } },
];