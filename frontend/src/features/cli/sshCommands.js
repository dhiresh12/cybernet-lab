// SSH Commands - SSH configuration
import { CLI_MODES } from '../../core/constants';

function handleIpSsh(device, args, engine) {
  const sshCmd = args[1]?.toLowerCase();
  if (sshCmd === 'version' && args[2]) {
    device.ssh.version = parseInt(args[2], 10);
    return { output: [] };
  }
  if (sshCmd === 'domain-name' && args[2]) {
    device.ssh.domain = args[2];
    return { output: [] };
  }
  if (sshCmd === 'key' && args[2] === 'generate') {
    device.ssh.keys = { rsa: 'generated' };
    return { output: ['% SSH keys generated'] };
  }
  return { output: ['% Incomplete command'] };
}

function handleUsername(device, args, engine) {
  if (args.length >= 3 && args[1] === 'privilege' && args[2] === '15' && args[3] === 'secret') {
    device.ssh.users.push({ name: args[0], password: args[4] });
    return { output: [] };
  }
  return { output: ['% Incomplete command'] };
}

export const commands = [
  {
    name: 'ip',
    handler: (device, args, engine) => {
      const subCmd = args[0]?.toLowerCase();
      if (subCmd === 'ssh') return handleIpSsh(device, args, engine);
      return { output: ['% Incomplete command'] };
    },
    options: { requiredMode: CLI_MODES.CONFIG, description: 'Configure SSH' }
  },
  { name: 'username', handler: handleUsername, options: { requiredMode: CLI_MODES.CONFIG, description: 'Create user account' } },
];