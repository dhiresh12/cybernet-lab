const v = require('./simulation/verifiers');

// Test state_check: correct IP passes
const labState1 = {
  deviceStates: new Map([
    ['PC1', { id: 'PC1', hostname: 'PC1', interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }]
  ])
});
const result1 = v.state_check({ deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' }, {}, labState1);
console.log('state_check correct IP:', result1.passed, result1.feedback);

// Test state_check: wrong IP fails
const result2 = v.state_check({ deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.99', mask: '255.255.255.0' }, {}, labState1);
console.log('state_check wrong IP:', result2.passed, result2.feedback.includes('Expected IP 192.168.1.99'));

// Test ping: reachable same-subnet passes
const labState2 = {
  deviceStates: new Map([
    ['PC1', { id: 'PC1', hostname: 'PC1', interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }],
    ['PC2', { id: 'PC2', hostname: 'PC2', interfaces: { Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' } } }]
  ])
};
const result3 = v.ping('reachable', {}, labState2, null, { targetDevice: 'PC1', commands: ['ping 192.168.1.20'] });
console.log('ping reachable:', result3.passed, result3.feedback);

// Test ping: unreachable target fails
const result4 = v.ping('reachable', {}, labState2, null, { targetDevice: 'PC1', commands: ['ping 10.0.0.1'] });
console.log('ping unreachable:', result4.passed, result4.feedback.includes('unreachable'));

// Test ping: source interface down fails
const labState3 = {
  deviceStates: new Map([
    ['PC1', { id: 'PC1', hostname: 'PC1', interfaces: { Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' } } }]
  ])
};
const result5 = v.ping('reachable', {}, labState3, null, { targetDevice: 'PC1', commands: ['ping 192.168.1.20'] });
console.log('ping source down:', result5.passed, result5.feedback.includes('Ping failed'));

console.log('\nAll tests completed.');