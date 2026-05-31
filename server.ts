import * as fs from 'node:fs'
import * as path from 'node:path'
import * as http from 'node:http'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100

async function createServer() {
  if (isProd) {
    // ── Production ── serve pre-built assets + SSR-rendered HTML
    const { default: express } = await import('express')
    const app = express()

    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }))

    app.get('*', async (req, res) => {
      try {
        const template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        )
        const { render } = await import('./dist/server/entry-server.js' as string)
        const { html } = await render()

        res.status(200)
          .set('Content-Type', 'text/html')
          .end(template.replace('<!--app-->', html))
      } catch (err) {
        console.error(err)
        res.status(500).end('Internal Server Error')
      }
    })

    const server = http.createServer(app)
    server.listen(port, () =>
      console.log(`Server listening on http://localhost:${port}`)
    )
    return server
  } else {
    // ── Development ── Vite dev server handles HMR + SSR
    const { createServer: createViteServer } = await import('vite')
    const { default: express } = await import('express')

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })

    const app = express()
    app.use(vite.middlewares)

    app.get('*', async (req, res) => {
      try {
        let template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(req.url, template)

        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
        const { html } = await render()

        res.status(200)
          .set('Content-Type', 'text/html')
          .end(template.replace('<!--app-->', html))
      } catch (err) {
        vite.ssrFixStacktrace(err as Error)
        console.error(err)
        res.status(500).end('Internal Server Error')
      }
    })

    const server = http.createServer(app)

    server.listen(port, () =>
      console.log(`Dev server listening on http://localhost:${port}`)
    )

    let shuttingDown = false
    function shutdown() {
      if (shuttingDown) return
      shuttingDown = true
      vite.close().then(() => {
        server.close(() => process.exit(0))
      })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    return server
  }
}

createServer()
