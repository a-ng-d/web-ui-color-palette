import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],

  define: {
    __PLATFORM__: JSON.stringify('web'),
    __COLOR_MODE__: JSON.stringify(process.env.COLOR_MODE ?? 'light'),
    __EDITOR__: JSON.stringify('web'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },

  resolve: {
    // Allows Vite to process TypeScript source files from the workspace package
    conditions: ['development', 'browser'],
  },

  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: 'index.html',
    },
  },

  server: {
    port: 44100,
  },
})
