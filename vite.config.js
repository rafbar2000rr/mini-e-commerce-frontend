import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Configuración para Vercel y producción
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  base: '/',
})
