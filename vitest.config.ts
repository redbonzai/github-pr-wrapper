import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest-setup.ts',
    include: ['**/test/e2e/**/*e2e-spec.ts'],
  },
  resolve: {
    alias: {
      '@src': '/src',
      '@test': '/test',
      '@libs': '/libs/common',
    },
  },
});
