class TelemetryStream {
  constructor() {
    this.clients = new Set();
    this.telemetryHistory = [];
    this.maxHistory = 1000;
  }

  initialize(deviceManager) {
    this.deviceManager = deviceManager;
    this.startTelemetryCollection();
  }

  startTelemetryCollection() {
    setInterval(async () => {
      const devices = this.deviceManager.getAllDevices();
      const telemetry = {
        timestamp: Date.now(),
        devices: devices.map(d => ({
          id: d.id,
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

  addClient(client) {
    this.clients.add(client);
  }

  removeClient(client) {
    this.clients.delete(client);
  }

  broadcast(data) {
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'telemetry', data }));
      }
    });
  }

  async getLatest() {
    return this.telemetryHistory[this.telemetryHistory.length - 1] || null;
  }

  getHistory(duration = 3600000) {
    const cutoff = Date.now() - duration;
    return this.telemetryHistory.filter(t => t.timestamp > cutoff);
  }
}

module.exports = { TelemetryStream };
