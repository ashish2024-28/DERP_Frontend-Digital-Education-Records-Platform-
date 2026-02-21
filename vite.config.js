import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs'    // ← Output to docs folder instead of dist
  }

  //  base: '/', // for general deployment anywhere
  
})
