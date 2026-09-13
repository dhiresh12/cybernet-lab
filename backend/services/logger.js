const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.LOG_FILE_PATH
  ? path.dirname(process.env.LOG_FILE_PATH)
  : './logs';

const LOG_FILE = process.env.LOG_FILE_PATH || './logs/cybernet-lab.log';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta = {}) {
  const entry = {
    timestamp: formatTimestamp(),
    level,
    service: 'cybernet-lab-backend',
    message: typeof message === 'string' ? message : JSON.stringify(message),
    ...(Object.keys(meta).length > 0 && { meta })
  };
  return JSON.stringify(entry);
}

function writeLog(level, message, meta) {
  if (LOG_LEVELS[level] > currentLevel) return;
  const line = formatMessage(level, message, meta);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    writeLog(level, 'http_request', {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}

const logger = {
  error: (msg, meta) => writeLog('error', msg, meta),
  warn: (msg, meta) => writeLog('warn', msg, meta),
  info: (msg, meta) => writeLog('info', msg, meta),
  debug: (msg, meta) => writeLog('debug', msg, meta),
  http: requestLogger,
  getRequestId: (req) => req.headers['x-request-id']
};

module.exports = { logger };
