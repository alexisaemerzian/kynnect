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
      '/utils': path.resolve(__dirname, './utils'),
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
      output: {
        manualChunks: {
          // Split React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // Split Supabase
          'supabase': ['@supabase/supabase-js'],
          // Split date libraries
          'date-utils': ['date-fns'],
          // Split UI libraries
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
