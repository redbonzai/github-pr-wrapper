import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest-setup.ts',
  },
  resolve: {
    alias: {
      '@src': '/src',
      '@modules': '/src/modules',
      '@services': '/src/services',
    },
  },
});
