import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'NUTRI PRO - SaaS de Nutrição Clínica & Antropometria',
          short_name: 'NUTRI PRO',
          description: 'SaaS clínico para nutricionistas com cálculo de necessidades energéticas e macros, dietas personalizadas, antropometria ISAK e receituário.',
          theme_color: '#004f28',
          background_color: '#0b1320',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          importScripts: ['/sw-background-sync.js'],
          runtimeCaching: [
            // 1. GET Cache for Patient Charts
            {
              urlPattern: /^https?:\/\/.*\/api\/patients.*/i,
              handler: 'NetworkFirst',
              method: 'GET',
              options: {
                cacheName: 'api-patients-cache',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // 2. Background Sync for Patients Mutation Queue (POST, PUT, DELETE)
            {
              urlPattern: /^https?:\/\/.*\/api\/patients.*/i,
              handler: 'NetworkOnly',
              method: 'POST',
              options: {
                backgroundSync: {
                  name: 'nutripro-patients-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60, // 48 hours in minutes
                  }
                }
              }
            },
            {
              urlPattern: /^https?:\/\/.*\/api\/patients.*/i,
              handler: 'NetworkOnly',
              method: 'PUT',
              options: {
                backgroundSync: {
                  name: 'nutripro-patients-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            {
              urlPattern: /^https?:\/\/.*\/api\/patients.*/i,
              handler: 'NetworkOnly',
              method: 'DELETE',
              options: {
                backgroundSync: {
                  name: 'nutripro-patients-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            // 3. Clinical Evaluations, Settings & Prescriptions Sync Queue
            {
              urlPattern: /^https?:\/\/.*\/api\/(evaluations|settings|diets|sync).*/i,
              handler: 'NetworkOnly',
              method: 'POST',
              options: {
                backgroundSync: {
                  name: 'nutripro-clinical-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            {
              urlPattern: /^https?:\/\/.*\/api\/(evaluations|settings|diets|sync).*/i,
              handler: 'NetworkOnly',
              method: 'PUT',
              options: {
                backgroundSync: {
                  name: 'nutripro-clinical-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            // 4. Cloud Firebase Firestore Direct & Proxy Sync Queue
            {
              urlPattern: /^https:\/\/(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)\/.*/i,
              handler: 'NetworkOnly',
              method: 'POST',
              options: {
                backgroundSync: {
                  name: 'nutripro-firebase-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            {
              urlPattern: /^https:\/\/(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)\/.*/i,
              handler: 'NetworkOnly',
              method: 'PATCH',
              options: {
                backgroundSync: {
                  name: 'nutripro-firebase-sync-queue',
                  options: {
                    maxRetentionTime: 48 * 60,
                  }
                }
              }
            },
            // 5. GET Cache for Clinical Settings
            {
              urlPattern: /^https?:\/\/.*\/api\/settings.*/i,
              handler: 'NetworkFirst',
              method: 'GET',
              options: {
                cacheName: 'api-settings-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      // Disable HMR and WS to avoid WebSocket errors in the AI Studio environment.
      hmr: false as const,
      ws: false as const,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
