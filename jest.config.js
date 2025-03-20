/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'coverage',
    '.*/lcov-report/.*',
    'main.ts',
    'app.module.ts',
    'test',
    'dist',
    '.*\\.module\\.ts',
    '.*\\.config\\.ts',
  ],
  globalSetup: '<rootDir>/../jest-global-setup.ts',
  globalTeardown: '<rootDir>/../jest-global-teardown.ts',
  // Este archivo se ejecutará antes de cada suite de pruebas
  setupFilesAfterEnv: ['<rootDir>/../jest-msw-setup.ts'],
};
