import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: 'esbuild',
    reportCompressedSize: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/, /^\/auth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co/,
            handler: 'NetworkOnly'
          }
        ],
        navigateFallback: 'index.html',
        navigationPreload: false,
      },
      manifest: {
        name: 'Rapidsy - Akıllı Araç Platformu',
        short_name: 'Rapidsy',
        description: 'Yedek parça, usta randevusu, AI asistan (Rapidsy) ve dijital servis takibi.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  logLevel: 'info',
  optimizeDeps: {
    include: ['lucide-react', 'react-leaflet', 'leaflet'],
  },
  server: {
    watch: {
      ignored: ['**/android/**', '**/ios/**', '**/dist/**']
    },
    proxy: {
      '/api/opet': {
        target: 'https://api.opet.com.tr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opet/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
            proxyReq.setHeader('Accept', 'application/json');
          });
        }
      }
    },
    headers: {
      // Prevent clickjacking attacks
      'X-Frame-Options': 'DENY',
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      // Referrer policy for privacy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Permissions policy
      'Permissions-Policy': 'geolocation=(self), microphone=(self), camera=()',
      // Content Security Policy (Dev Mode Warning: 'unsafe-eval' needed for Vite HMR)
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.pollinations.ai https://text.pollinations.ai https://*.googleapis.com https://api.open-meteo.com https://corsproxy.io https://api.allorigins.win https://thingproxy.freeboard.io https://api.codetabs.com https://api.collectapi.com https://api.frankfurter.app https://api.exchangerate-api.com https://vpic.nhtsa.dot.gov https://api.openchargemap.io https://api.bigdatacloud.net https://overpass-api.de https://hasanadiguzel.com.tr;",
      // Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  }
})
