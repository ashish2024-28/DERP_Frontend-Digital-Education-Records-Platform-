import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Default for most platforms
  },
  base: '/', // Good for general deployment anywhere
})