const { logger } = require('./logger');

const originalMethods = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

function redirectToLogger(method) {
  return (...args) => {
    const message = args.map(arg => {
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    logger[method](message, { raw: args });

    if (process.env.NODE_ENV === 'development' || method === 'error') {
      originalMethods[method](...args);
    }
  };
}

console.log = redirectToLogger('info');
console.warn = redirectToLogger('warn');
console.error = redirectToLogger('error');
console.info = redirectToLogger('info');
console.debug = redirectToLogger('debug');
