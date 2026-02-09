/**
 * Post-build prerender script.
 * Serves the Vite build output, visits public routes with Puppeteer,
 * and writes the rendered HTML back to dist/ so crawlers get real content.
 *
 * Usage: node scripts/prerender.mjs
 */

import { createServer } from 'http'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const PORT = 4173
const ROUTES = ['/', '/about', '/demo', '/login']

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

// Simple static file server for the dist folder
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST, req.url === '/' ? '/index.html' : req.url)
      try {
        const data = readFileSync(filePath)
        const ext = extname(filePath)
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
        res.end(data)
      } catch {
        // SPA fallback — serve index.html for any route
        const html = readFileSync(join(DIST, 'index.html'))
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
      }
    })
    server.listen(PORT, () => resolve(server))
  })
}

async function prerender() {
  const server = await startServer()

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' })

    let html = await page.content()
    // Remove the duplicate fallback <title> from index.html when React injected a page-specific one
    html = html.replace(/(<title>.*?<\/title>)(\s*<title>CallManager.*?<\/title>)/, '$1')
    const dir = join(DIST, route)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
    await page.close()
  }

  await browser.close()
  server.close()
}

prerender().catch((err) => {
  process.exit(1)
})
