import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Smart Reminder App',
        short_name: 'SmartRemind',
        description: 'Track your habits, medicine, and tasks with smart notifications',
        theme_color: '#0ea5e9',
        background_color: '#f9fafb',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        lang: 'en',
        categories: ['productivity', 'health', 'utilities'],
        prefer_related_applications: false,
        shortcuts: [
          {
            name: 'Add Reminder',
            short_name: 'Add',
            description: 'Create a new reminder',
            url: '/add-task',
            icons: [{ src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          },
          {
            name: 'View Reminders',
            short_name: 'Reminders',
            description: 'View all reminders',
            url: '/',
            icons: [{ src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          }
        ],
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [] // Empty to prevent Network Error on login
      },
      devOptions: {
        enabled: true
      }
    }),
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
