export const DEVICE_STATES = {
  ON: 'on',
  OFF: 'off',
  REBOOTING: 'rebooting',
};

export const ADMIN_STATES = {
  UP: 'up',
  DOWN: 'down',
  SHUTDOWN: 'shutdown',
};

export const LINK_STATES = {
  UP: 'up',
  DOWN: 'down',
  CONNECTING: 'connecting',
  FAILED: 'failed',
};

export const DEVICE_TYPE_CONFIGS = {
  router: {
    defaultInterfaces: ['Gi0/0', 'Gi0/1'],
    defaultAdminState: ADMIN_STATES.UP,
    defaultLinkState: LINK_STATES.UP,
    supportsVlans: false,
    supportsRouting: true,
    supportsSwitching: false,
  },
  pc: {
    defaultInterfaces: ['Gi0/0'],
    defaultAdminState: ADMIN_STATES.UP,
    defaultLinkState: LINK_STATES.UP,
    supportsVlans: false,
    supportsRouting: false,
    supportsSwitching: false,
  },
  switch: {
    defaultInterfaces: ['Gi0/1', 'Gi0/2', 'Fa0/1', 'Fa0/2'],
    defaultAdminState: ADMIN_STATES.UP,
    defaultLinkState: LINK_STATES.UP,
    supportsVlans: true,
    supportsRouting: false,
    supportsSwitching: true,
  },
  server: {
    defaultInterfaces: ['Gi0/0'],
    defaultAdminState: ADMIN_STATES.UP,
    defaultLinkState: LINK_STATES.UP,
    supportsVlans: true,
    supportsRouting: false,
    supportsSwitching: false,
  },
  firewall: {
    defaultInterfaces: ['Gi0/0', 'Gi0/1'],
    defaultAdminState: ADMIN_STATES.UP,
    defaultLinkState: LINK_STATES.UP,
    supportsVlans: false,
    supportsRouting: true,
    supportsSwitching: false,
  },
};