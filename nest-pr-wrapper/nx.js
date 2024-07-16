module.exports = {
  npmScope: 'nest-pr-wrapper',
  affected: {
    defaultBase: 'main',
  },
  tasksRunnerOptions: {
    default: {
      runner: 'nx-cloud',
      options: {
        cacheableOperations: ['build', 'lint', 'test', 'e2e'],
        heartbeatTimeout: 10000,
        accessToken: process.env.NX_ACCESS_TOKEN,
      },
    },
  },
  targetDefaults: {
    lint: {
      inputs: ['default', '{workspaceRoot}/eslint.config.js'],
    },
  },
  projects: {
    'nest-pr-wrapper-root': {
      tags: [],
    },
    common: {
      tags: [],
    },
    'nest-pr-wrapper': {
      tags: [],
    },
    'nest-pr-wrapper-e2e': {
      tags: [],
    },
  },
};
