module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  testPathIgnorePatterns: ['/.kilo/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  forceExit: true,
};