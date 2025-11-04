/* eslint-env node */
/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// path import intentionally unused for now (kept for easy re-enable of manual chunking)
/* eslint-disable no-unused-vars */
import path from 'path'
/* eslint-enable no-unused-vars */

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
      // Increase warning limit a bit; manual chunking removed for stability in CI/runtime
      chunkSizeWarningLimit: 800,
    },
  })
}
