import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/trasladohub': {
        target: 'http://localhost:5206',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
