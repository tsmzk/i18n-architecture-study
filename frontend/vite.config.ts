import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: false, // ポートが使用中なら自動で+1して探す
    // strictPort: true  // ポートが使用中ならエラーで停止
  }
})
