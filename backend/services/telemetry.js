class TelemetryStream {
  constructor() {
    this.deviceManager = null;
    this.telemetryHistory = [];
    this.maxHistory = 1000;
    this.subscribers = new Map();
  }

  initialize(deviceManager) {
    this.deviceManager = deviceManager;
    this.startTelemetryCollection();
  }

  startTelemetryCollection() {
    setInterval(async () => {
      if (!this.deviceManager) return;
      const devices = this.deviceManager.getAllDevices();
      const telemetry = {
        timestamp: Date.now(),
        devices: devices.map(d => ({
          id: d.id,
          hostname: d.name || d.id,
          type: d.type,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          temperature: 40 + Math.random() * 40,
          interfaceStats: {
            inPackets: Math.floor(Math.random() * 10000),
            outPackets: Math.floor(Math.random() * 10000),
            errors: Math.floor(Math.random() * 10),
            drops: Math.floor(Math.random() * 5)
          }
        }))
      };
      
      this.telemetryHistory.push(telemetry);
      if (this.telemetryHistory.length > this.maxHistory) {
        this.telemetryHistory.shift();
      }
      
      this.broadcast(telemetry);
    }, 1000);
  }

  subscribe(ws, deviceIds) {
    this.subscribers.set(ws, deviceIds || []);
  }

  unsubscribe(ws) {
    this.subscribers.delete(ws);
  }

  broadcast(data) {
    const { devices } = data;
    for (const [client, deviceIds] of this.subscribers.entries()) {
      if (client.readyState !== 1) continue;
      if (deviceIds.length === 0) {
        client.send(JSON.stringify({ type: 'telemetry', data }));
        continue;
      }
      const relevantDevices = devices.filter(d => deviceIds.some(id => String(d.id) === String(id)));
      if (relevantDevices.length > 0) {
        client.send(JSON.stringify({ type: 'telemetry', data: { ...data, devices: relevantDevices } }));
      }
    }
  }

  async getLatest() {
    if (this.telemetryHistory.length === 0) {
      throw new Error('No telemetry data available');
    }
    return this.telemetryHistory[this.telemetryHistory.length - 1];
  }

  getHistory(duration = 3600000) {
    const cutoff = Date.now() - duration;
    return this.telemetryHistory.filter(t => t.timestamp > cutoff);
  }
}

module.exports = { TelemetryStream };