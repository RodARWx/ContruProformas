import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'construmetrica-pwa.svg'],
      manifest: {
        name: 'Construproformas',
        short_name: 'Construproformas',
        description: 'Generación mobile-first de proformas para Construmétrica.',
        theme_color: '#7f1d1d',
        background_color: '#fafafa',
        display: 'standalone',
        lang: 'es',
        start_url: '/proformas',
        scope: '/',
        icons: [
          {
            src: '/construmetrica-pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: '/index.html',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    // Proxy en desarrollo: permite usar VITE_API_BASE_URL=/api sin depender de CORS en el backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
