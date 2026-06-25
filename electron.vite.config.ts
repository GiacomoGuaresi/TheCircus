import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@models': resolve('src/models'),
        '@services': resolve('src/services'),
        '@utils': resolve('src/utils'),
        '@core': resolve('src/core')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@models': resolve('src/models'),
        '@utils': resolve('src/utils')
      }
    },
    plugins: [react()]
  }
})
