const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.inMemoryStore = new Map();
  }

  async connect() {
    return new Promise((resolve) => {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          connectTimeout: 3000
        }
      });

      let settled = false;
      const fallback = () => {
        if (settled) return;
        settled = true;
        this.client.removeAllListeners('error');
        this.client.quit().catch(() => {});
        this.client = null;
        console.warn('Redis unavailable, using in-memory store. Some features (pub/sub, persistence) may be limited.');
        resolve();
      };

      this.client.on('error', (err) => {
        if (!settled) {
          console.warn('Redis error, falling back to in-memory store:', err.message);
          fallback();
        }
      });

      this.client.connect().then(() => {
        if (!settled) {
          settled = true;
          console.log('Redis connected');
          resolve();
        }
      }).catch(fallback);
    });
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  isUsingMemory() {
    return !this.client;
  }

  async get(key) {
    if (this.client) return await this.client.get(key);
    return this.inMemoryStore.get(key) || null;
  }

  async set(key, value, ttl = 3600) {
    if (this.client) {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return;
    }
    this.inMemoryStore.set(key, JSON.stringify(value));
  }

  async del(key) {
    if (this.client) await this.client.del(key);
    else this.inMemoryStore.delete(key);
  }

  async hSet(key, field, value) {
    if (this.client) {
      await this.client.hSet(key, field, JSON.stringify(value));
      return;
    }
    if (!this.inMemoryStore.has(key)) this.inMemoryStore.set(key, {});
    const hash = this.inMemoryStore.get(key);
    hash[field] = JSON.stringify(value);
  }

  async hGet(key, field) {
    if (this.client) {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    }
    const hash = this.inMemoryStore.get(key);
    if (!hash || !hash[field]) return null;
    return JSON.parse(hash[field]);
  }
}

module.exports = { RedisClient };
