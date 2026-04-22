import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Exclude Figma-specific modules
      'figma:foundry-client-api': path.resolve(__dirname, './src/noop.ts'),
      'figma:asset': path.resolve(__dirname, './src/noop.ts'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
