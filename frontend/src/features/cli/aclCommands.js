// ACL Commands - Access Control List configuration
import { CLI_MODES } from '../../core/constants';

function handleAccessList(device, args, engine) {
  if (args.length < 3) return { output: ['% Incomplete command'] };
  const seq = parseInt(args[0], 10);
  const action = args[1].toLowerCase();
  const protocol = args[2].toLowerCase();
  
  if (!['permit', 'deny'].includes(action)) {
    return { output: ['% Invalid action'] };
  }
  
  const entry = { seq, action, protocol, source: 'any', dest: 'any' };
  device.acl.entries.push(entry);
  return { output: [] };
}

export const commands = [
  { name: 'access-list', handler: handleAccessList, options: { requiredMode: CLI_MODES.CONFIG, description: 'Create access list' } },
];