import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/main.ts')
        },
        output: {
          format: 'cjs'
        },
        external: ['canvas']
      }
    },
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
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve('src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src'),
        '@models': resolve('src/models'),
        '@utils': resolve('src/utils'),
        '/src': resolve('src')
      }
    },
    plugins: [react()]
  }
})
