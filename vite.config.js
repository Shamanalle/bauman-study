import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'src/public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Inline all dynamic imports into one file — needed for single-file offline bundle
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    open: true,
  },
});
