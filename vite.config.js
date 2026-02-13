import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icons/*.svg'],
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
          // App Icons
          {
            src: 'icons/app_icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/pwa_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          // Play Store
          {
            src: 'icons/playstore_1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          },
          // PWA Icon
          {
            src: 'icons/pwa_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          // Notification Icon
          {
            src: 'icons/notification_96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          // Website Icons
          {
            src: 'icons/navbar_40.png',
            sizes: '40x40',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/sidebar_48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          // Favicon
          {
            src: 'icons/favicon_32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/favicon_16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any'
          },
          // Apple Touch Icon (SVG)
          {
            src: 'icons/badge-72.svg',
            sizes: '72x72',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          // App Badge Icon
          {
            src: 'icons/pwa_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
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
