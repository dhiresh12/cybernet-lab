class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.deviceStates = new Map();
  }

  initializeDevices() {
    const deviceConfigs = [
      { id: 'core', type: 'router', name: 'CyberNet-Lab-Core', ip: '172.16.0.1', interfaces: 4 },
      { id: 'sw1', type: 'switch', name: 'Virtual Cloud Switch', ip: '10.0.0.2', interfaces: 24 },
      { id: 'pc1', type: 'pc', name: 'VM1-R1', ip: '10.0.0.11', interfaces: 1 },
      { id: 'pc2', type: 'pc', name: 'VM2-R2', ip: '10.0.0.12', interfaces: 1 },
      { id: 'svr1', type: 'server', name: 'Web App Server', ip: '10.0.0.13', interfaces: 2 },
      { id: 'isp', type: 'cloud', name: 'ISP Router Sim', ip: '203.0.113.254', interfaces: 2 }
    ];

    deviceConfigs.forEach(config => {
      this.devices.set(config.id, config);
      this.deviceStates.set(config.id, {
        status: 'online',
        cpu: Math.random() * 30,
        memory: Math.random() * 40,
        temperature: 40 + Math.random() * 20,
        lastUpdate: Date.now()
      });
    });
  }

  getDeviceInfo(deviceId) {
    const device = this.devices.get(deviceId);
    const state = this.deviceStates.get(deviceId);
    if (!device || !state) {
      return { error: 'Device not found' };
    }
    return { device, state };
  }

  getAllDevices() {
    return Array.from(this.devices.values()).map(device => ({
      ...device,
      state: this.deviceStates.get(device.id)
    }));
  }

  updateDeviceState(deviceId, state) {
    const current = this.deviceStates.get(deviceId) || {};
    this.deviceStates.set(deviceId, {
      ...current,
      ...state,
      lastUpdate: Date.now()
    });
  }

  getDeviceStates() {
    return Array.from(this.deviceStates.entries()).map(([id, state]) => ({
      deviceId: id,
      ...state
    }));
  }
}

module.exports = { DeviceManager };
