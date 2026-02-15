import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PWA disabled to prevent Network Error on login
// Can be re-enabled after login is working

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
  },
});
