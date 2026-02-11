import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/target/',
  build: {
    rollupOptions: {
      output: {
        // 让产物保持常规结构，不内联
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})
