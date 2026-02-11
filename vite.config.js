import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据环境变量决定 base 路径
  // GitHub Pages: /target/
  // 腾讯云/本地: /
  const base = process.env.VITE_BASE_PATH || (mode === 'github' ? '/target/' : '/')
  
  return {
    plugins: [react()],
    base,
    build: {
      rollupOptions: {
        output: {
          // 让产物保持常规结构，不内联
        }
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
