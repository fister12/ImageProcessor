import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/auth': {
        target: 'http://image-processor:5000',
        changeOrigin: true
      },
      '/api': {
        target: 'http://image-processor:5000',
        changeOrigin: true
      }
    }
  }
})

