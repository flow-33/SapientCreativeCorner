import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/SapientCreativeCorner/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

