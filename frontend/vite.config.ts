import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@/public': path.resolve(import.meta.dirname, './public'),
      '@': path.resolve(import.meta.dirname, './src'),
      'next/image': path.resolve(import.meta.dirname, './src/components/common/Image.tsx'),
      'next/link': path.resolve(import.meta.dirname, './src/components/common/Link.tsx'),
      'motion/react-client': path.resolve(import.meta.dirname, './src/components/common/motion-client.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/static': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
