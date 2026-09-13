class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 3) {
    this.windowMs = windowMs; // 1 minute
    this.maxRequests = maxRequests; // 3 requests
    this.requests = new Map(); // key => { timestamps: [] }
  }

  getKey(labId, ip) {
    return `${ip || 'unknown'}:${labId || 'global'}`;
  }

  isAllowed(labId, ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const key = this.getKey(labId, ip);

    let record = this.requests.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.requests.set(key, record);
    }

    record.timestamps = record.timestamps.filter(t => t > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      return false;
    }

    record.timestamps.push(now);
    return true;
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter(t => t > windowStart);
      if (record.timestamps.length === 0) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter(60000, 3);
setInterval(() => rateLimiter.cleanup(), 60000);

function ipRateLimiter(windowMs = 60000, maxRequests = 30) {
  const requests = new Map();

  return function check(ip) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const key = ip || 'unknown';

    let record = requests.get(key);
    if (!record) {
      record = { timestamps: [] };
      requests.set(key, record);
    }

    record.timestamps = record.timestamps.filter(t => t > windowStart);

    if (record.timestamps.length >= maxRequests) {
      return false;
    }

    record.timestamps.push(now);
    return true;
  };
}

const globalIpLimiter = ipRateLimiter(60000, 60);

module.exports = { rateLimiter, globalIpLimiter };