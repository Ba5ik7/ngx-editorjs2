/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: 'projects/ngx-editor-js2/tsconfig.spec.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['projects/ngx-editor-js2/src/test-setup.ts'],
    include: ['projects/ngx-editor-js2/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/ngx-editor-js2',
    },
    pool: 'forks',
    isolate: false,
  },
  define: {
    'import.meta.vitest': undefined,
  },
});
