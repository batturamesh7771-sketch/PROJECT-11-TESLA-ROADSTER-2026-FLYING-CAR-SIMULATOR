import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@tesla-roadster/shared-core': path.resolve(__dirname, 'packages/shared-core/src'),
    },
  },
  test: {
    environment: 'node',
  },
});
