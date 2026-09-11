import { build } from 'vite';

await build({
  root: 'frontend',
  configFile: 'frontend/vite.config.js',
  mode: 'production',
  logLevel: 'info',
});