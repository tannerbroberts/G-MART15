import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Vite 6.x requires explicit Node.js polyfilling
  resolve: {
    alias: {
      // This is needed because some dependencies expect Buffer to be available
      buffer: 'buffer/',
    }
  },
  define: {
    // This is needed for Vite to properly polyfill Node.js globals
    'global': 'globalThis',
  }
})
