/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/middlewares/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 60,
      functions: 60,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^../models$': '<rootDir>/src/__tests__/__mocks__/models.ts',
    '^../models/(.*)$': '<rootDir>/src/__tests__/__mocks__/models.ts',
    '^../../models$': '<rootDir>/src/__tests__/__mocks__/models.ts',
    '^../../models/(.*)$': '<rootDir>/src/__tests__/__mocks__/models.ts',
  },
};
