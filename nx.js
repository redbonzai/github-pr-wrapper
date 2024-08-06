module.exports = {
  npmScope: 'prwrapper',
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
    'prwrapper-root': {
      tags: [],
    },
    common: {
      tags: [],
    },
    prwrapper: {
      tags: [],
    },
    'prwrapper-e2e': {
      tags: [],
    },
  },
};
