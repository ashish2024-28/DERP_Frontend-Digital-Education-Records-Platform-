import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs'    // ← Output to docs folder instead of dist

    //  outDir: 'dist'  // ← Change from 'docs' to 'dist' (Vercel default)
  }

  //  base: '/', // for general deployment anywhere

})

// Step 2: Delete .github/workflows/deploy.yml

// (You don't need GitHub Pages workflow if using Vercel)

// Step 3: Delete docs/ folder

// (Not needed anymore)

// Step 4: Create vercel.json (Optional, but recommended)
//   {
  //   "buildCommand": "npm run build",
  //   "outputDirectory": "dist",
  //   "framework": "vite"
  // }