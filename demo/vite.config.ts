import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // Use root base for custom domain, or '/repo-name/' for github.io
  base: '/',
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from parent directory (for npm link)
      allow: ['.', '..']
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  optimizeDeps: {
    exclude: ['@guinetik/crypto-wasm']
  },
  assetsInclude: ['**/*.wasm']
})
