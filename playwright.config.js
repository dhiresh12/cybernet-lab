// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
};