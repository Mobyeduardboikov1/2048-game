module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/styleMock.js',
  },
  verbose: true
};