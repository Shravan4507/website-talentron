import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Talentron 2026',
        short_name: 'Talentron',
        description: 'Pune\'s Ultimate Inter-Collegiate Cultural Festival',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/website-talentron/',
        start_url: '/website-talentron/',
        icons: [
          {
            src: 'assets/logos/talentron-logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'assets/logos/talentron-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'assets/logos/talentron-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/website-talentron/',
})
