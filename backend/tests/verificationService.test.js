const verifiers = require('../../simulation/verifiers');

describe('Backend Verification: state_check and ping', () => {
  function buildLabState(deviceStatesMap) {
    return {
      deviceStates: new Map(
        Object.entries(deviceStatesMap || {}).map(([id, state]) => [id, { id, ...state }])
      )
    };
  }

  test('state_check: correct interface IP passes', () => {
    const labState = buildLabState({
      PC1: {
        hostname: 'PC1',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    });
    const result = verifiers.state_check({ deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' }, null, labState);
    expect(result.passed).toBe(true);
    expect(result.feedback).toBe('State check passed.');
  });

  test('state_check: wrong IP fails', () => {
    const labState = buildLabState({
      PC1: {
        hostname: 'PC1',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    });
    const result = verifiers.state_check({ deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.99', mask: '255.255.255.0' }, null, labState);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Expected IP 192.168.1.99');
  });

  test('state_check: missing device fails', () => {
    const labState = buildLabState({});
    const result = verifiers.state_check({ deviceId: 'MISSING', interface: 'Ethernet0', ip: '192.168.1.10' }, null, labState);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Device state not found');
  });

  test('ping: reachable same-subnet passes', () => {
    const labState = buildLabState({
      PC1: {
        hostname: 'PC1',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      },
      PC2: {
        hostname: 'PC2',
        interfaces: {
          Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    });
    const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '192.168.1.20' }, 'reachable', labState);
    expect(result.passed).toBe(true);
    expect(result.feedback).toBe('Ping connectivity verified.');
    expect(result.details).toBeDefined();
    expect(result.details.actualReachable).toBe(true);
  });

  test('ping: unreachable target fails', () => {
    const labState = buildLabState({
      PC1: {
        hostname: 'PC1',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    });
    const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '10.0.0.1' }, 'reachable', labState);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('unreachable');
  });

  test('ping: source interface down fails', () => {
    const labState = buildLabState({
      PC1: {
        hostname: 'PC1',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' }
        }
      }
    });
    const result = verifiers.ping({ sourceDeviceId: 'PC1', targetIp: '192.168.1.20' }, 'reachable', labState);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('no active interface');
  });
});
