// CLI Parser - Parse and tokenize CLI commands
export function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return { command: '', args: [], raw: input };
  
  // Handle quoted strings
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) parts.push(current);
  
  return {
    command: parts[0]?.toLowerCase() || '',
    args: parts.slice(1),
    raw: input,
  };
}

export function tokenize(input) {
  return input.trim().split(/\s+/).filter(Boolean);
}

export function matchesPattern(input, pattern) {
  const tokens = tokenize(input);
  const patternTokens = tokenize(pattern);
  
  if (tokens.length < patternTokens.length) return false;
  
  return patternTokens.every((pt, i) => {
    if (pt.startsWith('<') && pt.endsWith('>')) return true; // Parameter placeholder
    return tokens[i].toLowerCase() === pt.toLowerCase();
  });
}

export function extractParams(input, pattern) {
  const tokens = tokenize(input);
  const patternTokens = tokenize(pattern);
  const params = {};
  
  patternTokens.forEach((pt, i) => {
    if (pt.startsWith('<') && pt.endsWith('>')) {
      const key = pt.slice(1, -1);
      params[key] = tokens[i];
    }
  });
  
  return params;
}

// Cisco-style command completion
export function getCompletions(partialInput, availableCommands) {
  const tokens = tokenize(partialInput);
  if (tokens.length === 0) return availableCommands.map(c => c.name);
  
  const lastToken = tokens[tokens.length - 1];
  const prefix = tokens.slice(0, -1).join(' ');
  
  // Find matching commands
  const matches = availableCommands.filter(cmd => {
    const cmdTokens = tokenize(cmd.name);
    if (cmdTokens.length < tokens.length) return false;
    return cmdTokens.slice(0, tokens.length - 1).every((t, i) => 
      t.toLowerCase() === tokens[i].toLowerCase()
    ) && cmdTokens[tokens.length - 1].toLowerCase().startsWith(lastToken.toLowerCase());
  });
  
  return matches.map(m => m.name);
}

// Validate command syntax
export function validateSyntax(parsed, commandDef) {
  if (!commandDef) return { valid: false, error: 'Unknown command' };
  
  const requiredArgs = commandDef.requiredArgs || 0;
  if (parsed.args.length < requiredArgs) {
    return { valid: false, error: `Incomplete command. Expected ${requiredArgs} arguments.` };
  }
  
  return { valid: true };
}

export default {
  parseCommand,
  tokenize,
  matchesPattern,
  extractParams,
  getCompletions,
  validateSyntax,
};