import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://vyapaarsathi-862234198628.asia-south1.run.app',
        changeOrigin: true,
        secure: true
      },
      '/oauth2': {
        target: 'https://vyapaarsathi-862234198628.asia-south1.run.app',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
