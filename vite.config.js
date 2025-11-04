/* eslint-env node */
/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default ({ mode }) => {
  // load VITE_* env variables for the current mode (development/production)
  // use process.cwd() which is available in Node ESM contexts
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || '/'

  return defineConfig({
    plugins: [react()],
    base: basePath,
    build: {
      // Increase warning limit a bit while we split chunks; adjust as needed
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Split large vendor libraries into separate chunks and allow
          // further manual splitting if needed.
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              if (id.includes('tailwindcss') || id.includes('postcss')) {
                return 'css-vendor'
              }
              return 'vendor'
            }

            // Example: split heavy front-end components into their own chunks
            // so they don't bloat the main bundle. Adjust paths if you move files.
            if (id.includes(path.posix.join('src', 'components', 'QuizModal')))
              return 'quiz-modal'
            if (id.includes(path.posix.join('src', 'components', 'QuizReviewModal')))
              return 'quiz-review'
          },
        },
      },
    },
  })
}
