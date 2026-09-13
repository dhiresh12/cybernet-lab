const verifiers = require('../../simulation/verifiers');

describe('Backend Verification Extended', () => {
  function buildLabState(deviceStatesMap) {
    return {
      deviceStates: new Map(
        Object.entries(deviceStatesMap || {}).map(([id, state]) => [id, { id, ...state }])
      )
    };
  }

  describe('state_check variations', () => {
    it('passes with exact IP and mask match', () => {
      const ls = buildLabState({
        R1: { interfaces: { 'Gi0/0': { ip: '10.0.0.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.state_check({ deviceId: 'R1', interface: 'Gi0/0', ip: '10.0.0.1', mask: '255.255.255.0' }, null, ls);
      expect(result.passed).toBe(true);
    });

    it('fails when IP does not match', () => {
      const ls = buildLabState({
        R1: { interfaces: { 'Gi0/0': { ip: '10.0.0.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.state_check({ deviceId: 'R1', interface: 'Gi0/0', ip: '10.0.0.2', mask: '255.255.255.0' }, null, ls);
      expect(result.passed).toBe(false);
    });

    it('fails when mask does not match', () => {
      const ls = buildLabState({
        R1: { interfaces: { 'Gi0/0': { ip: '10.0.0.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.state_check({ deviceId: 'R1', interface: 'Gi0/0', ip: '10.0.0.1', mask: '255.255.255.252' }, null, ls);
      expect(result.passed).toBe(false);
    });

    it('fails when device is missing', () => {
      const ls = buildLabState({});
      const result = verifiers.state_check({ deviceId: 'MISSING', interface: 'Gi0/0', ip: '10.0.0.1' }, null, ls);
      expect(result.passed).toBe(false);
    });

    it('fails when interface is missing on device', () => {
      const ls = buildLabState({
        R1: { interfaces: { Gi0/1: { ip: '10.0.0.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.state_check({ deviceId: 'R1', interface: 'Gi0/0', ip: '10.0.0.1', mask: '255.255.255.0' }, null, ls);
      expect(result.passed).toBe(false);
    });

    it('result has feedback property', () => {
      const ls = buildLabState({});
      const result = verifiers.state_check({ deviceId: 'R1', interface: 'Gi0/0', ip: '10.0.0.1' }, null, ls);
      expect(result).toHaveProperty('feedback');
      expect(typeof result.feedback).toBe('string');
    });
  });

  describe('ping variations', () => {
    it('ping passes when source interface is up and target reachable', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } },
        PC2: { interfaces: { Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '192.168.1.20' }, 'reachable', ls);
      expect(result.passed).toBe(true);
      expect(result.details.actualReachable).toBe(true);
    });

    it('ping fails when source interface is down', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '192.168.1.20' }, 'reachable', ls);
      expect(result.passed).toBe(false);
    });

    it('ping fails when target is unreachable', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, 'reachable', ls);
      expect(result.passed).toBe(false);
      expect(result.feedback).toContain('unreachable');
    });

    it('ping result has details', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, 'reachable', ls);
      expect(result.details).toBeDefined();
    });

    it('ping returns feedback with target IP', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, 'reachable', ls);
      expect(result.feedback).toContain('10.0.0.1');
    });

    it('ping fails when source device is missing', () => {
      const ls = buildLabState({});
      const result = verifiers.ping({ sourceDeviceId: 'MISSING', targetIp: '10.0.0.1' }, 'reachable', ls);
      expect(result.passed).toBe(false);
    });

    it('ping fails when source has no active interface', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '192.168.1.20' }, 'reachable', ls);
      expect(result.passed).toBe(false);
      expect(result.feedback).toContain('no active interface');
    });

    it('ping works with different subnet mask lengths', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '10.0.0.1', mask: '255.0.0.0', status: 'up', protocol: 'up' } } },
        PC2: { interfaces: { Ethernet0: { ip: '10.0.0.2', mask: '255.0.0.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '10.0.0.2' }, 'reachable', ls);
      expect(result.passed).toBe(true);
    });
  });

  describe('traceroute variations', () => {
    it('traceroute passes for reachable destination', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } },
        R1: { interfaces: { Gi0/0: { ip: '192.168.1.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.traceroute({ sourceDeviceId: 'PC1', targetIp: '192.168.1.1' }, null, ls);
      expect(result.passed).toBe(true);
    });

    it('traceroute fails for unreachable destination', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.traceroute({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, null, ls);
      expect(result.passed).toBe(false);
    });
  });

  describe('arp variations', () => {
    it('arp passes when target is in same subnet', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up', name: 'Ethernet0' } } },
        R1: { interfaces: { Gi0/0: { ip: '192.168.1.1', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.arp({ sourceDeviceId: 'PC1', targetIp: '192.168.1.1' }, null, ls);
      expect(result.passed).toBe(true);
    });

    it('arp result shows interface name', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up', name: 'Ethernet0' } } }
      });
      const result = verifiers.arp({ sourceDeviceId: 'PC1', targetIp: '192.168.1.1' }, null, ls);
      expect(result.details).toBeDefined();
    });

    it('arp fails for unreachable target', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.arp({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, null, ls);
      expect(result.passed).toBe(false);
    });
  });

  describe('verifyStep variations', () => {
    it('verifyStep returns result object', () => {
      const ls = buildLabState({
        PC1: { interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }
      });
      const result = verifiers.verifyStep({ type: 'ping', deviceId: 'PC1', targetIp: '192.168.1.20' }, null, ls);
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('feedback');
    });

    it('verifyStep handles unknown verification type', () => {
      const ls = buildLabState({});
      const result = verifiers.verifyStep({ type: 'unknown', deviceId: 'PC1' }, null, ls);
      expect(result).toHaveProperty('passed');
    });
  });
});
