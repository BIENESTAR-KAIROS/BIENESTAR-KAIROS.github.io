// Isolated visual QA. No .env, accounts, real responses or MongoDB connections.
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { statisticsPreviewCompiler } from './lib/statistics-preview-compiler.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
let fixtures = '',
  gowther = resolve(root, '../gowther'),
  port = 8766,
  check = false
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fixtures' && args[i + 1]) fixtures = resolve(args[++i])
  else if (args[i] === '--gowther-dir' && args[i + 1])
    gowther = resolve(args[++i])
  else if (args[i] === '--port' && /^\d+$/.test(args[i + 1] || ''))
    port = Number(args[++i])
  else if (args[i] === '--check') check = true
  else
    throw new Error(
      'Usage: node scripts/preview-statistics.mjs [--gowther-dir PATH] [--fixtures FILE] [--port PORT] [--check]',
    )
}
if (port < 1024 || port > 65535)
  throw new Error('Port must be between 1024 and 65535')
const raw = fixtures
  ? await readFile(fixtures, 'utf8')
  : execFileSync('go', ['run', './cmd/statistics-preview'], {
      cwd: gowther,
      encoding: 'utf8',
      timeout: 60000,
      maxBuffer: 2 << 20,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
if (Buffer.byteLength(raw) > 2 << 20)
  throw new Error('Fixture bundle exceeds limit')
const bundle = JSON.parse(raw)
if (
  bundle.kind !== 'gowther-synthetic-preview-v1' ||
  bundle.synthetic !== true ||
  bundle.persistence !== 'none' ||
  !Array.isArray(bundle.cases) ||
  bundle.cases.length !== 8
)
  throw new Error('Only the identified synthetic Gowther bundle is allowed')
const compiler = await statisticsPreviewCompiler(root)
const pages = new Map()
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  )
const labels = {
  questions: { a: 'Pregunta A', b: 'Pregunta B', info: 'Pregunta informativa' },
  metrics: {
    'dimension-a': 'Dimensión A',
    'dimension-b': 'Dimensión B',
    overall: 'Resultado general',
  },
}
try {
  const { parseStatisticsPublication } = await import(
    await compiler.compile('utils/helpers/statistics-publication.ts')
  )
  const Report = (
    await import(
      await compiler.compile(
        'components/institute/my-stats/publication-report.vue',
      )
    )
  ).default
  for (const item of bundle.cases) {
    if (
      !/^[a-z-]{1,32}$/.test(item.id) ||
      pages.has(item.id) ||
      ![item.title, item.description, item.expected].every(
        (v) => typeof v === 'string' && v.length < 2000,
      )
    )
      throw new Error('Invalid preview case')
    const scope = item.response?.report?.scope
    if (
      scope &&
      (scope.institutionId !== '1'.repeat(24) ||
        scope.revision.questionnaireId !== '2'.repeat(24) ||
        scope.revision.definitionRevision !== '1')
    )
      throw new Error('Unexpected fixture identity')
    parseStatisticsPublication(item.response, {
      institutionId: '1'.repeat(24),
      questionnaireId: '2'.repeat(24),
      definitionRevision: '1',
      from: '2026-01-01T00:00:00Z',
      until: '2026-02-01T00:00:00Z',
    })
    const content = await renderToString(
      createSSRApp({
        render: () =>
          h(Report, {
            response: item.response,
            labels,
            title: item.title,
            syntheticPreview: true,
          }),
      }),
    )
    if (content.includes('Alumnos reales · Informe fijado'))
      throw new Error('Preview must not claim to contain real students')
    pages.set(item.id, { item, content })
  }
} finally {
  await compiler.close()
}
const style = `*{box-sizing:border-box}body{margin:0;background:#f5f4f8;color:#3c2f52;font-family:Figtree,Arial,sans-serif}main{max-width:1400px;margin:auto;padding:24px 32px 40px}h1{font-size:24px;margin:8px 0 16px}h2,h3,p,dd{margin:0}p{line-height:1.6}a{color:#3c2f52}a:focus-visible,summary:focus-visible{outline:3px solid #5c4a75;outline-offset:3px}.qa-heading{margin-bottom:24px}.qa-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:24px}.qa-nav{display:grid;gap:8px;align-content:start}.qa-nav a{padding:12px 16px;min-height:44px;border:1px solid #ded6ea;border-radius:16px;background:white;text-decoration:none;font-weight:700;line-height:1.5}.qa-nav a[aria-current=page]{background:#3c2f52;color:white}.qa-content{min-width:0;display:grid;gap:20px}.qa-case{background:white;border:1px solid #efebf5;border-radius:24px;padding:24px}.qa-case p{margin-top:12px}.qa-case h2{font-size:20px}.qa-expected{background:#edf6f3;color:#2c6a5c;border-radius:16px;padding:16px;margin-top:16px}.qa-tag{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.qa-note{font-size:13px;color:#6b6080;margin-top:12px}@media(max-width:960px){.qa-layout{grid-template-columns:minmax(0,1fr)}.qa-nav{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){main{padding:20px 16px 32px}.qa-nav{grid-template-columns:minmax(0,1fr)}.qa-case{padding:20px}}`
for (const [id, { item, content }] of pages) {
  const nav = bundle.cases
    .map(
      (c) =>
        `<a href="/?case=${escape(c.id)}"${c.id === id ? ' aria-current="page"' : ''}>${escape(c.title)}</a>`,
    )
    .join('')
  pages.set(
    id,
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(item.title)} · Pruebas Gowther</title><style>${style}\n${compiler.css.join('\n')}</style></head><body><main><header class="qa-heading"><p class="qa-tag">Bienestar KAIROS · Desarrollo local</p><h1>Validar estadísticas con datos sintéticos</h1><p>Ejemplos calculados por el motor de Gowther, con las mismas tarjetas de Mis estadísticas. Selecciona un caso para comparar el resultado con lo esperado.</p><p class="qa-note">No usa alumnos, sesión ni Atlas. Comprueba cálculos y presentación; no acredita persistencia ni generación de demos en la plataforma.</p></header><div class="qa-layout"><nav class="qa-nav" aria-label="Casos de validación">${nav}</nav><div class="qa-content"><section class="qa-case"><h2>${escape(item.title)}</h2><p>${escape(item.description)}</p><div class="qa-expected"><strong>Qué comprobar</strong><p>${escape(item.expected)}</p></div></section>${content}</div></div></main></body></html>`,
  )
}
if (check)
  process.stdout.write(
    `Validated and rendered ${pages.size} synthetic scenarios. No server or database writes.\n`,
  )
else {
  const server = createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    )
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    if (request.headers.authorization || request.headers.cookie) {
      response.writeHead(400)
      response.end('Este visor no admite credenciales.')
      return
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' })
      response.end()
      return
    }
    const url = new URL(request.url, `http://127.0.0.1:${port}`)
    const id = url.searchParams.get('case') || bundle.cases[0].id
    if (
      url.pathname !== '/' ||
      [...url.searchParams.keys()].some((k) => k !== 'case') ||
      url.searchParams.getAll('case').length > 1 ||
      !pages.has(id)
    ) {
      response.writeHead(404)
      response.end('Caso no disponible.')
      return
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(request.method === 'HEAD' ? undefined : pages.get(id))
  })
  server.maxConnections = 8
  server.requestTimeout = 5000
  server.headersTimeout = 5000
  server.on('error', (error) => {
    process.stderr.write(
      error.code === 'EADDRINUSE'
        ? `El puerto ${port} está ocupado. Cierra el visor anterior o usa --port con otro puerto.\n`
        : 'No se pudo iniciar el visor local.\n',
    )
    process.exitCode = 1
  })
  server.listen(port, '127.0.0.1', () =>
    process.stdout.write(
      `Visor sintético: http://127.0.0.1:${port}\nCtrl+C para cerrarlo. No ocupa el puerto de Gowther ni modifica Atlas.\n`,
    ),
  )
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, () => server.close())
}
