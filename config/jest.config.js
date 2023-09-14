export default {
  verbose: true,
  testEnvironment: 'node',
  roots: [
    '<rootDir>/test'
  ],
  moduleFileExtensions: [
    'js'
  ],
  moduleNameMapper: {
    '^#src/(.*)$': '<rootDir>/src/$1',
    '^#database/(.*)$': '<rootDir>/src/database/$1',
    '^#routes/(.*)$': '<rootDir>/src/routes/$1',
    '^#utilities/(.*)$': '<rootDir>/src/utilities/$1'
  },
  coverageDirectory: '/tmp',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/database/seeds",
  ],
  coverageReporters: [
    'text',
    [
      'cobertura',
      {
        file: 'unit.coverage.xml'
      }
    ]
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '/tmp'
      }
    ]
  ]
}