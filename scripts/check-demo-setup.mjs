// Synthetic local checks: no environment files, real sessions, HTTP or Atlas.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { effectScope, reactive, nextTick, createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { statisticsPreviewCompiler } from './lib/statistics-preview-compiler.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const { work, compile, close } = await statisticsPreviewCompiler(root)
try {
  const helpers = await import(await compile('utils/helpers/demo.ts'))
  const { isGowtherDemoRoute, isGowtherRoute } = await import(
    await compile('utils/helpers/gowther-route.ts')
  )
  const id = (n) => n.toString(16).padStart(24, '0')
  const q = id(1),
    institution = id(2),
    assignment = id(3),
    generation = id(4),
    dimension = id(5)
  const config = {
    version: 1,
    assignmentRevision: 1,
    definitionRevision: '3',
    definitionFingerprint: 'a'.repeat(64),
    controls: {
      seed: 'b'.repeat(64),
      default: helpers.defaultDemoProfile(),
      dimensions: [],
    },
  }
  const inspect = {
    synthetic: true,
    assignment: { id: assignment, revision: 1, count: 5 },
    revision: {
      questionnaireId: q,
      definitionRevision: '3',
      schemaVersion: 2,
      scoringVersion: 1,
    },
    definitionFingerprint: config.definitionFingerprint,
    dimensionIds: [dimension],
    maxParticipants: 2000,
    state: {
      latestVersion: 1,
      configurations: [config],
      job: null,
      activeGenerationId: generation,
      cleanupPending: false,
    },
  }
  assert.equal(helpers.parseDemoInspection(inspect, q), inspect)
  for (const d of ['uniform', 'normal', 'low', 'high'])
    assert.ok(helpers.validDemoProfile(helpers.defaultDemoProfile(d)))
  for (const p of [
    { ...config.controls.default, strength: 2 },
    { ...helpers.defaultDemoProfile('normal'), center: 1.1 },
    { ...helpers.defaultDemoProfile('low'), strength: 9 },
  ])
    assert.equal(helpers.validDemoProfile(p), false)
  assert.match(helpers.newDemoSeed(), /^[a-f0-9]{64}$/)
  const metric = {
    id: dimension,
    kind: 'dimension',
    publicationStatus: 'published',
    reasons: [],
    warnings: [],
    coverage: {
      participants: 5,
      applicable: 5,
      valid: 5,
      missing: 0,
      invalid: 0,
      notApplicable: 0,
      requiredMissing: 0,
      unscored: 0,
      answered: null,
      scoreFraction: null,
      fraction: 1,
      requiredMissingFraction: 0,
      requiredMissingApplicableFraction: null,
    },
    values: {
      count: 5,
      mean: 0,
      median: 0,
      modes: [0],
      modeStatus: 'modes',
      populationStdDev: 0,
      min: 0,
      max: 0,
    },
  }
  const report = {
    synthetic: true,
    generationId: generation,
    assignmentId: assignment,
    configuration: config,
    policyVersion: '2026-11-04.v2',
    calculatedAt: '2026-11-04T12:00:00Z',
    participants: 5,
    questions: [],
    metrics: [metric],
  }
  assert.equal(helpers.parseDemoReport(report, inspect), report)
  for (const change of [
    (r) => {
      r.synthetic = false
    },
    (r) => {
      r.assignmentId = id(9)
    },
    (r) => {
      r.generationId = id(9)
    },
    (r) => {
      r.participants = 4
    },
    (r) => {
      r.configuration.assignmentRevision = 2
    },
    (r) => {
      r.configuration.controls.seed = 'f'.repeat(64)
    },
    (r) => {
      r.metrics[0].publicationStatus = 'suppressed'
    },
  ]) {
    const bad = structuredClone(report)
    change(bad)
    assert.throws(() => helpers.parseDemoReport(bad, inspect))
  }
  for (const suffix of ['', '/jobs', '/cancel', '/report'])
    assert.ok(isGowtherDemoRoute(`/v1/demos/questionnaires/${q}${suffix}`))
  for (const path of [
    `https://other.example/v1/demos/questionnaires/${q}`,
    `/v1/demos/questionnaires/${q}?token=x`,
    `/v1/demos/questionnaires/${'0'.repeat(24)}`,
    `/v1/demos/questionnaires/${q}/../report`,
    `/v1/demos/questionnaires/${q}/jobs/extra`,
    '//other.example/v1/session',
  ])
    assert.ok(!isGowtherRoute(path))
  const { validatePublicationMetric } = await import(
    await compile('utils/helpers/statistics-publication.ts')
  )
  assert.throws(
    () => validatePublicationMetric(metric, false),
    'Real cohort remains at least ten',
  )
  const Report = (
    await import(await compile('components/admin/demos/DemoReport.vue'))
  ).default
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(Report, {
          report,
          currentRevision: '3',
          labels: {
            questions: {},
            metrics: { [dimension]: 'Dimensión sintética' },
          },
          title: 'Prueba local',
        }),
    }),
  )
  for (const text of [
    'Datos sintéticos',
    'Mediana',
    'Desviación estándar poblacional',
    'No representan respuestas',
    'Dimensión sintética',
  ])
    assert.ok(html.includes(text), text)
  assert.match(html, /<dd[^>]*>0<\/dd>/)
  const oldHtml = await renderToString(
    createSSRApp({
      render: () =>
        h(Report, {
          report,
          currentRevision: '4',
          labels: {
            questions: {},
            metrics: { [dimension]: 'Nombre de revisión nueva' },
          },
          title: 'Prueba local',
        }),
    }),
  )
  assert.ok(!oldHtml.includes('Nombre de revisión nueva'))

  const auth = reactive({
    accessToken: 'synthetic-session',
    user: { roles: ['KAIROS_ADMIN'] },
    isAuthenticated: true,
    isStudentPreview: false,
  })
  const deps = {
    auth,
    api: {
      get: async (url) => {
        if (url.endsWith('registration-directory'))
          return {
            data: [
              { _id: institution, name: 'Synthetic institution', active: true },
            ],
          }
        if (url.endsWith('/definition'))
          return {
            data: {
              _id: q,
              __v: 3,
              questions: [],
              evaluationConfiguration: { dimensions: [] },
            },
          }
        return {
          data: {
            questionnaires: [
              {
                id: q,
                title: 'Synthetic questionnaire',
                schemaVersion: 2,
                status: 'published',
                active: true,
              },
            ],
          },
        }
      },
    },
    stats: {},
  }
  let posts = [],
    mode = 'uncertain',
    resolveReport
  deps.stats.get = async (url) =>
    url.endsWith('/report')
      ? new Promise((resolve) => {
          resolveReport = resolve
        })
      : { data: structuredClone(inspect) }
  deps.stats.post = async (url, body, options) => {
    posts.push({ url, body: structuredClone(body), options })
    if (mode === 'uncertain') throw { isAxiosError: true, code: 'ECONNABORTED' }
    return {
      data: {
        id: generation,
        state: 'queued',
        configVersion: body.version,
        cleanupComplete: true,
        deadlineAt: '2026-11-04T12:15:00Z',
      },
    }
  }
  let source = await readFile(
    join(root, 'components/admin/demos/use-demo-setup.ts'),
    'utf8',
  )
  source = source
    .replace("import { useAuthStore } from '~/store/auth'", '')
    .replace('const auth = useAuthStore()', 'const auth = deps.auth')
    .replace(
      'export function useDemoSetup()',
      'export function useDemoSetup(deps)',
    )
    .replace(
      'const { $axios, $statsApi } = useNuxtApp()',
      'const $axios = deps.api; const $statsApi = deps.stats',
    )
  source = `import { ref, shallowRef, computed, watch } from '${import.meta.resolve('vue')}'\nconst onMounted = () => {}; const onBeforeUnmount = () => {}; const onBeforeRouteLeave = () => {};\n${source}`
  source = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText
  for (const [, specifier] of source.matchAll(/from ['"]([^'"]+)['"]/g)) {
    const url = specifier.startsWith('~/')
      ? await compile(specifier.slice(2) + '.ts')
      : specifier.startsWith('file:')
        ? specifier
        : import.meta.resolve(specifier)
    source = source
      .replaceAll(`'${specifier}'`, `'${url}'`)
      .replaceAll(`"${specifier}"`, `'${url}'`)
  }
  await writeFile(join(work, 'demo-composable.mjs'), source)
  const { useDemoSetup } = await import(
    pathToFileURL(join(work, 'demo-composable.mjs'))
  )
  const scope = effectScope(),
    state = scope.run(() => useDemoSetup(deps))
  const settle = async () => {
    for (let i = 0; i < 20; i++) {
      await Promise.resolve()
      await nextTick()
    }
  }
  await state.loadInstitutions()
  state.institutionId.value = institution
  await settle()
  state.questionnaireId.value = q
  await settle()
  assert.ok(state.canSubmit.value)
  await state.submit()
  assert.ok(
    state.pending.value && state.locked.value,
    'Uncertain outcome locks context',
  )
  const pending = structuredClone(state.pending.value)
  mode = 'success'
  await state.submit()
  assert.deepEqual(
    posts[0].body,
    posts[1].body,
    'Retry retains version and seed exactly',
  )
  assert.deepEqual(posts[1].body, pending)
  assert.deepEqual(Object.keys(posts[0].options.headers), [
    'X-Kairos-Institution',
  ])
  assert.equal(posts[0].options.headers['X-Kairos-Institution'], institution)
  assert.equal(state.pending.value, null)
  assert.ok(
    !Object.hasOwn(posts[0].body, 'institutionId') &&
      !Object.hasOwn(posts[0].body, 'actorId'),
  )
  const read = state.consult()
  await settle()
  state.institutionId.value = id(8)
  await settle()
  resolveReport({ data: report })
  await read
  assert.equal(
    state.report.value,
    null,
    'Late report of another institution discarded',
  )
  state.institutionId.value = institution
  await settle()
  state.questionnaireId.value = q
  await settle()
  const read2 = state.consult()
  await settle()
  auth.accessToken = 'rotated-synthetic-session'
  await settle()
  resolveReport({ data: report })
  await read2
  assert.equal(state.report.value, null, 'Session change clears results')
  scope.stop()

  // Test the actual Axios interceptor with a local in-memory adapter.
  let plugin = await readFile(join(root, 'plugins/axios.ts'), 'utf8')
  plugin = plugin
    .replace("import { useAuthStore } from '~/store/auth'", '')
    .replaceAll('useAuthStore()', 'globalThis.__demoQAAuth')
    .replaceAll('import.meta.dev', 'true')
    .replaceAll('process.env.PROD', 'false')
  plugin = `const defineNuxtPlugin = (fn) => fn;\n${plugin}`
  plugin = ts.transpileModule(plugin, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText
  for (const [, specifier] of plugin.matchAll(/from ['"]([^'"]+)['"]/g)) {
    const url = specifier.startsWith('~/')
      ? await compile(specifier.slice(2) + '.ts')
      : import.meta.resolve(specifier)
    plugin = plugin
      .replaceAll(`'${specifier}'`, `'${url}'`)
      .replaceAll(`"${specifier}"`, `'${url}'`)
  }
  await writeFile(join(work, 'demo-plugin.mjs'), plugin)
  globalThis.__demoQAAuth = auth
  const app = {
    $router: { currentRoute: { value: { path: '/admin/demos' } } },
    $config: {
      public: {
        gowtherLocalBase: 'http://127.0.0.1:8081',
        apiLocalStatsBase: 'http://127.0.0.1:9999',
        apiLocalBase: 'http://127.0.0.1:3000',
        apiVersion: '/api/v1',
      },
    },
  }
  const client = (
    await import(pathToFileURL(join(work, 'demo-plugin.mjs')))
  ).default(app).provide.statsApi
  let sent
  client.defaults.adapter = async (config) => {
    sent = config
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
  await client.get(`/v1/demos/questionnaires/${q}`, {
    headers: {
      'X-Kairos-Institution': institution,
      'X-Gowther-Service-Token': 'must-be-removed',
    },
  })
  assert.equal(sent.baseURL, 'http://127.0.0.1:8081')
  assert.equal(sent.headers.get('Authorization'), `Bearer ${auth.accessToken}`)
  assert.equal(sent.headers.get('X-Kairos-Institution'), institution)
  assert.equal(sent.headers.get('X-Gowther-Service-Token'), undefined)
  await assert.rejects(() => client.get(`/v1/demos/questionnaires/${q}`))
  auth.user.roles = ['INSTITUTION_ADMIN']
  await assert.rejects(() =>
    client.get(`/v1/demos/questionnaires/${q}`, {
      headers: { 'X-Kairos-Institution': institution },
    }),
  )
  auth.user.roles = ['KAIROS_ADMIN']
  app.$router.currentRoute.value.path = '/institute/stats'
  await assert.rejects(() =>
    client.get(`/v1/demos/questionnaires/${q}`, {
      headers: { 'X-Kairos-Institution': institution },
    }),
  )
  await client.get('/old-statistics')
  assert.equal(
    sent.headers.get('Authorization'),
    undefined,
    'No bearer leaks into legacy service',
  )
  delete globalThis.__demoQAAuth
  process.stdout.write(
    'PASS: demo contracts, protected values, cohort separation, render, exact retries, context/session races, and authenticated transport isolation.\n',
  )
} finally {
  await close()
}
