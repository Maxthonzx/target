import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: '/target/',
  build: {
    rollupOptions: {
      output: {
        // manualChunks removed for single-file build
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})
