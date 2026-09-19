import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 1576,
    strictPort: true,
    proxy: {
      '/api/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/allprojects': { target: 'http://localhost:8002', changeOrigin: true },
    },
  },
  preview: {
    port: 4175,
    strictPort: true,
  },
})
