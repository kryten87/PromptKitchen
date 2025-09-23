import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read version from root package.json
const rootPackageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
);

// Get environment for version display
const environment = process.env.NODE_ENV || 'development';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(rootPackageJson.version),
    __APP_ENVIRONMENT__: JSON.stringify(environment),
  },
  resolve: {
    alias: {
      // ...existing code...
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
});
