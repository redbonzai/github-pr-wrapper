// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // setupFiles: './vitest-setup.ts',
  },
  resolve: {
    alias: {
      '@src': '/src',
      '@test': '/test',
      '@libs': '/libs/common',
    },
  },
});
