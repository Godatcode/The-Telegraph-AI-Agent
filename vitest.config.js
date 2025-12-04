import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './client/node_modules/react'),
      'react-dom': path.resolve(__dirname, './client/node_modules/react-dom'),
      '@testing-library/react': path.resolve(__dirname, './client/node_modules/@testing-library/react'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './client/src/test-setup.js',
    exclude: ['**/node_modules/**'],
  },
});
