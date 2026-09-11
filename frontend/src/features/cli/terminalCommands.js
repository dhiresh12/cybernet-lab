// Terminal Commands - Ping, traceroute, write, erase, reload
import { CLI_MODES } from '../../core/constants';

function handlePing(device, args, engine) {
  if (!args[0]) return { output: ['% Incomplete command'] };
  const target = args[0];
  return { output: [`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds`, '!!!!!', `Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`] };
}

function handleTraceroute(device, args, engine) {
  if (!args[0]) return { output: ['% Incomplete command'] };
  return { output: [`Tracing route to ${args[0]}`, '  1  192.168.1.1  2 msec  2 msec  2 msec', '  2  10.0.0.1  4 msec  4 msec  4 msec'] };
}

function handleWrite(device, args, engine) {
  return { output: ['Building configuration...', '[OK]'] };
}

function handleErase(device, args, engine) {
  if (args[0] === 'startup-config') {
    device.configHistory = [];
    return { output: ['Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]', '[OK]'] };
  }
  return { output: ['% Invalid command'] };
}

function handleReload(device, args, engine) {
  return { output: ['Proceed with reload? [confirm]', 'System restarted'] };
}

export const commands = [
  { name: 'ping', handler: handlePing, options: { requiredMode: CLI_MODES.USER, description: 'Ping remote host' } },
  { name: 'traceroute', handler: handleTraceroute, options: { requiredMode: CLI_MODES.USER, description: 'Trace route to host' } },
  { name: 'write', handler: handleWrite, options: { requiredMode: CLI_MODES.ENABLE, aliases: ['wr'], description: 'Save configuration' } },
  { name: 'erase', handler: handleErase, options: { requiredMode: CLI_MODES.ENABLE, description: 'Erase configuration' } },
  { name: 'reload', handler: handleReload, options: { requiredMode: CLI_MODES.ENABLE, description: 'Reload system' } },
];