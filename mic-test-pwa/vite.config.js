import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/tests': 'http://localhost:3000',
      '/vapid-public-key': 'http://localhost:3000',
      '/subscribe': 'http://localhost:3000',
      '/push': 'http://localhost:3000'
    }
  }
})
