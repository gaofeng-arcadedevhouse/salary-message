import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
   
  ],
  css: {
    preprocessorOptions: {
      scss: {
         additionalData: '@import "@/assets/styles/index.less";'
      },
    },
  },
 
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    host: '',
    port: 3088,
    strictPort: false,
    open: false,
    proxy: {
      '/api': {
        target: "",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }

 
  },
})
