// Command Registry - Centralized CLI command handling
import { CLI_MODES } from '../../core/constants';

const commandRegistry = new Map();

export function registerCommand(name, handler, options = {}) {
  const cmd = {
    name,
    handler,
    requiredMode: options.requiredMode || CLI_MODES.USER,
    description: options.description || '',
    aliases: options.aliases || [],
    subcommands: options.subcommands || {},
  };
  commandRegistry.set(name.toLowerCase(), cmd);
  if (options.aliases) {
    options.aliases.forEach(alias => {
      commandRegistry.set(alias.toLowerCase(), cmd);
    });
  }
}

export function getCommand(name) {
  return commandRegistry.get(name.toLowerCase());
}

export function getAllCommands() {
  return Array.from(commandRegistry.values());
}

export function executeCommand(device, fullCommand, engine) {
  const parts = fullCommand.trim().split(/\s+/);
  if (parts.length === 0) return { output: [], error: null };

  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);
  const command = getCommand(cmdName);

  if (!command) {
    return { output: [`% Unrecognized command: ${cmdName}`], error: 'unknown_command' };
  }

  if (device.mode !== command.requiredMode && command.requiredMode !== CLI_MODES.USER) {
    return { output: [`% Command not available in ${device.mode} mode`], error: 'wrong_mode' };
  }

  try {
    const result = command.handler(device, args, engine);
    return result;
  } catch (e) {
    console.error(`Command ${cmdName} failed:`, e);
    return { output: [`% Error executing command: ${e.message}`], error: 'execution_error' };
  }
}

// Register all commands from handler modules
import { commands as baseCommands } from './baseCommands';
import { commands as ipCommands } from './ipCommands';
import { commands as vlanCommands } from './vlanCommands';
import { commands as showCommands } from './showCommands';
import { commands as routingCommands } from './routingCommands';
import { commands as sshCommands } from './sshCommands';
import { commands as portSecurityCommands } from './portSecurityCommands';
import { commands as aclCommands } from './aclCommands';
import { commands as natCommands } from './natCommands';
import { commands as dhcpCommands } from './dhcpCommands';
import { commands as terminalCommands } from './terminalCommands';

[baseCommands, ipCommands, vlanCommands, showCommands, routingCommands, sshCommands, portSecurityCommands, aclCommands, natCommands, dhcpCommands, terminalCommands].forEach(cmds => {
  cmds.forEach(cmd => {
    registerCommand(cmd.name, cmd.handler, cmd.options || {});
  });
});

export default { registerCommand, getCommand, getAllCommands, executeCommand };