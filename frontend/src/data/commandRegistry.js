const READ_ONLY_COMMANDS = new Set([
  'show running-config',
  'show startup-config',
  'show version',
  'show ip interface brief',
  'show interfaces',
  'show cdp neighbors',
  'show vlan brief',
  'show ip route',
  'show ip ospf neighbor',
  'show ip protocols',
  'show access-lists',
  'show ip dhcp binding',
  'show ip nat translations',
]);

const CONCEPTUAL_COMMANDS = new Set([
  'router bgp',
  'neighbor',
  'address-family',
]);

const DEVICE_TYPES = ['router', 'switch', 'host'];

export function getCommandContract(command) {
  const normalized = String(command || '').trim().toLowerCase();
  if (!normalized) {
    return {
      status: 'unsupported',
      mode: 'unknown',
      deviceTypes: [],
      mutatesState: false,
      verification: 'No command supplied.',
      rollback: 'No rollback available.',
    };
  }

  if (CONCEPTUAL_COMMANDS.has(normalized) || normalized.startsWith('router bgp')) {
    return {
      status: 'conceptual',
      mode: 'configuration',
      deviceTypes: ['router'],
      mutatesState: false,
      verification: 'Reference syntax only; use an explicitly supported lab step for execution.',
      rollback: 'Not executable in the browser simulation.',
    };
  }

  if (READ_ONLY_COMMANDS.has(normalized)) {
    return {
      status: 'supported-reference',
      mode: 'EXEC',
      deviceTypes: DEVICE_TYPES,
      mutatesState: false,
      verification: 'Compare the output with the active lab verification requirement.',
      rollback: 'Read-only command; no rollback required.',
    };
  }

  if (normalized.startsWith('show ')) {
    return {
      status: 'supported-reference',
      mode: 'EXEC',
      deviceTypes: DEVICE_TYPES,
      mutatesState: false,
      verification: 'Use only when the active lab lists this show command as supported.',
      rollback: 'Read-only command; no rollback required.',
    };
  }

  return {
    status: 'lab-dependent',
    mode: 'configuration',
    deviceTypes: DEVICE_TYPES,
    mutatesState: true,
    verification: 'Run the lab-defined verification step after the change.',
    rollback: 'Use the lab-defined rollback or reset the synthetic lab.',
  };
}
