import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './projects/ngx-editor-js2/vite.config.ts',
    test: {
      name: 'ngx-editor-js2',
      root: './projects/ngx-editor-js2',
    },
  },
]);
