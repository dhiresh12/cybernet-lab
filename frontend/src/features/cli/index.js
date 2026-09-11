// CLI Feature - Public API
export { registerCommand, getCommand, getAllCommands, executeCommand } from './commandRegistry';
export { parseCommand, tokenize, matchesPattern, extractParams, getCompletions, validateSyntax } from './cliParser';
export { default as CliTerminal } from './CliTerminal';