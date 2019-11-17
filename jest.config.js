module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.ts$": 'ts-jest'
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  clearMocks: true,
  testRegex: '/tests/.*\\.test\\.ts$',
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.test.json",
      diagnostics: false,
      disableSourceMapSupport: false
    }
  }
};
