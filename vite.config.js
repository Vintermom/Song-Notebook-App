import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your repository name exactly
export default defineConfig({
  plugins: [react()],
  base: '/Song-Notebook-App/', // <-- change if your repo name is different
})
