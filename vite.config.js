import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';
  const isDevelopment = command === 'serve';
  
  return {
  base: isProduction ? '/linkedinify/' : '/',
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
    port: process.env.PORT || 3000,
    open: true,
    hmr: {
      overlay: false  // Reduce WebSocket error overlay noise in development
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // Only enable PWA in production builds
    ...(isProduction ? [VitePWA({
      registerType: 'autoUpdate',
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
        dontCacheBustURLsMatching: /\.\w{8}\./
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: false  // Use the existing manifest.json file instead of generating one
    })] : [])
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js']
  }
  };
});