import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: { port: 8080 },
  build: { assetsDir: 'static', sourcemap: true },
  fmt: { singleQuote: true, semi: false },
  test: { include: ['tests/unit/**/*.test.js'] },
})
