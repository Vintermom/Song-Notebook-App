import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: change this to your repo name (case-sensitive) before deploy
  base: '/song-notebook-demo/',
})
