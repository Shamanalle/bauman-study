import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: resolve(__dirname, 'src/public'),
  plugins: [
    {
      name: 'copy-data-dir',
      closeBundle() {
        const srcData = resolve(__dirname, 'src/data');
        const distData = resolve(__dirname, 'dist/data');
        if (fs.existsSync(srcData)) {
          fs.cpSync(srcData, distData, { recursive: true });
          console.log('✓ Successfully copied src/data to dist/data');
        }
      },
    },
  ],
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

