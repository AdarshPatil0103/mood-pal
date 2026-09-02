import { defineConfig } from 'vite'

export default defineConfig({
  // Relative paths so the game works on GitHub Pages project sites.
  base: './',
  server: {
    host: '127.0.0.1',
    port: 47821,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 47821,
    strictPort: true,
  },
})
