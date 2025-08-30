import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: '/linkedinify/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'src/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false  // Reduce WebSocket error overlay noise in development
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false  // Disable service worker in development to reduce console errors
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [{
          urlPattern: /^https:\/\/.*$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'external-cache',
            networkTimeoutSeconds: 5,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }],
        // Ignore chrome-extension and other non-http schemes
        navigateFallbackDenylist: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^webkit-extension:\/\//],
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Add error handling for unsupported schemes
        additionalManifestEntries: []
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: false  // Use the existing manifest.json file instead of generating one
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js']
  }
});