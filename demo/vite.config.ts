import { defineConfig } from 'vite'

export default defineConfig({
  // Use root base for custom domain, or '/repo-name/' for github.io
  base: '/',
  server: {
    port: 3000,
    open: true
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
