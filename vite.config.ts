import path from 'node:path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

const onlyYelboltTokens = () => {
  const otherTokens =
    /assets\/styles\/tokens\/modules\/(figma|penpot|sketch|framer)-[a-z]+\.css$/
  const emptyModule = '\0only-yelbolt-tokens:empty'

  return {
    name: 'only-yelbolt-tokens',
    enforce: 'pre' as const,
    apply: 'serve' as const,
    resolveId(source: string) {
      if (otherTokens.test(source.split('?')[0])) return emptyModule
    },
    load(id: string) {
      if (id === emptyModule) return 'export default ""'
      if (otherTokens.test(id.split('?')[0])) return ''
    },
  }
}

export default defineConfig({
  plugins: [onlyYelboltTokens(), preact()],

  define: {
    __PLATFORM__: JSON.stringify('web'),
    __COLOR_MODE__: JSON.stringify(process.env.COLOR_MODE ?? 'light'),
    __EDITOR__: JSON.stringify('web'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },

  resolve: {
    conditions: ['development', 'browser'],
    dedupe: ['preact'],
    alias: {
      '@ui-lib': path.resolve(__dirname, './packages/ui-ui-color-palette/src'),
    },
  },

  ssr: {
    noExternal: true,

    resolve: {
      conditions: ['production', 'browser', 'module', 'import', 'default'],
    },
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
