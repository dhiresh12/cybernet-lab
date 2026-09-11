// Generic formatting utilities
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatUptime(days) {
  return `${days}d`;
}

export function formatTraffic(tb) {
  return `${tb.toFixed(2)} TB`;
}

export function formatPercentage(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

// ID generation
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateStepId(labId, stepIndex) {
  return `${labId}-${stepIndex}`;
}

// Network calculation utilities
export function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function cidrToMask(cidr) {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

export function maskToCidr(mask) {
  return mask.split('.').reduce((acc, octet) => {
    const n = parseInt(octet, 10);
    return acc + (n === 255 ? 8 : n === 254 ? 7 : n === 252 ? 6 : n === 248 ? 5 : n === 240 ? 4 : n === 224 ? 3 : n === 192 ? 2 : n === 128 ? 1 : 0);
  }, 0);
}

export function getNetworkAddress(ip, mask) {
  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);
  return intToIp(ipInt & maskInt);
}

export function getBroadcastAddress(ip, mask) {
  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);
  return intToIp(ipInt | (~maskInt >>> 0));
}

export function isIpInNetwork(ip, network, mask) {
  const ipInt = ipToInt(ip);
  const netInt = ipToInt(network);
  const maskInt = ipToInt(mask);
  return (ipInt & maskInt) === (netInt & maskInt);
}

// Validation utilities
export function isValidIp(ip) {
  const parts = ip.split('.');
  return parts.length === 4 && parts.every(p => {
    const n = parseInt(p, 10);
    return n >= 0 && n <= 255;
  });
}

export function isValidMask(mask) {
  const parts = mask.split('.');
  if (parts.length !== 4) return false;
  const nums = parts.map(Number);
  if (nums.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const binary = nums.map(n => n.toString(2).padStart(8, '0')).join('');
  return /^1+0*$/.test(binary);
}

export function isValidMac(mac) {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

export function isValidCidr(cidr) {
  const n = parseInt(cidr, 10);
  return n >= 0 && n <= 32;
}

// String utilities
export function truncate(str, maxLength) {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function kebabToTitle(str) {
  return str.split('-').map(capitalize).join(' ');
}

// Array utilities
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function unique(arr) {
  return [...new Set(arr)];
}

export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function sortBy(arr, keyFn, desc = false) {
  return [...arr].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    if (aVal < bVal) return desc ? 1 : -1;
    if (aVal > bVal) return desc ? -1 : 1;
    return 0;
  });
}

// Object utilities
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(k => delete result[k]);
  return result;
}

export function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k];
    return acc;
  }, {});
}

// Color utilities
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Debounce utility
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle utility
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}