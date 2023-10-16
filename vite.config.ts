import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/testing-playground',
  build: {
    minify: false,
  },
  plugins: [react()],
})
