// Synthetic checks only: no .env, HTTP calls, credentials or database writes.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from 'typescript'
import { statisticsPreviewCompiler } from './lib/statistics-preview-compiler.mjs'
import { createSSRApp, h, reactive, effectScope, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'

const root = fileURLToPath(new URL('../', import.meta.url))
const { work, compile, css, close } = await statisticsPreviewCompiler(root)
try {
  const { parseStatisticsPublication: parseReport, validDefinitionRevision } =
    await import(await compile('utils/helpers/statistics-publication.ts'))
  const { isGowtherRoute } = await import(
    await compile('utils/helpers/gowther-route.ts')
  )
  const query = {
    institutionId: 'a'.repeat(24),
    questionnaireId: 'b'.repeat(24),
    definitionRevision: '2',
    from: '2026-01-01T00:00:00Z',
    until: '2026-02-01T00:00:00Z',
  }
  const coverage = {
    participants: 100,
    applicable: 100,
    valid: 100,
    missing: 0,
    invalid: 0,
    notApplicable: 0,
    requiredMissing: 0,
    unscored: 0,
    answered: null,
    fraction: 1,
    scoreFraction: null,
    requiredMissingFraction: 0,
    requiredMissingApplicableFraction: null,
  }
  const values = {
    count: 100,
    mean: 0,
    median: 0,
    modes: [0],
    modeStatus: 'modes',
    populationStdDev: 0,
    min: 0,
    max: 0,
  }
  const published = {
    id: 'zero',
    kind: 'dimension',
    unit: 'puntos',
    method: 'mean',
    publicationStatus: 'published',
    reasons: [],
    warnings: [],
    coverage,
    values,
  }
  const protectedMetric = {
    ...published,
    id: 'protected',
    publicationStatus: 'suppressed',
    reasons: ['insufficient_cohort'],
    coverage: null,
    values: null,
  }
  const quality = {
    ...protectedMetric,
    id: 'quality',
    reasons: ['required_missing_exceeds_threshold'],
    coverage: {
      ...coverage,
      valid: 80,
      missing: 20,
      requiredMissing: 20,
      fraction: 0.8,
      requiredMissingFraction: 0.2,
    },
    warnings: ['incomplete_coverage', 'required_answers_missing'],
  }
  const fixture = {
    status: 'evaluated',
    reasons: [],
    report: {
      scope: {
        institutionId: query.institutionId,
        revision: {
          questionnaireId: query.questionnaireId,
          definitionRevision: '2',
          schemaVersion: 2,
          scoringVersion: 1,
        },
        population: 'real',
        from: query.from,
        until: query.until,
      },
      policyVersion: '2026-11-04.v2',
      releasePolicyVersion: '2026-11-04.release-v1',
      calculatedAt: '2026-02-02T12:00:00Z',
      definitionFingerprint: 'a'.repeat(64),
      selectionPolicy: 'latest_submitted_within_period_per_person_and_revision',
      minCohort: 10,
      requiredMissingThreshold: 0.1,
      participants: 100,
      retakes: null,
      retakeReasons: ['insufficient_cohort'],
      reasons: [],
      metrics: [
        published,
        protectedMetric,
        quality,
        {
          ...protectedMetric,
          id: 'related',
          reasons: ['complementary_suppression'],
        },
      ],
      questions: [
        {
          ...published,
          id: 'informational',
          kind: 'question',
          values: null,
          coverage: { ...coverage, answered: 100 },
        },
      ],
    },
  }
  assert.equal(parseReport(fixture, query).report.metrics[0].values.mean, 0)
  const suppressed = {
    status: 'suppressed',
    reasons: ['insufficient_cohort'],
    report: null,
  }
  assert.deepEqual(parseReport(suppressed, query), suppressed)
  for (const mutate of [
    (r) => {
      r.report.scope.institutionId = 'c'.repeat(24)
    },
    (r) => {
      r.report.scope.population = 'demo'
    },
    (r) => {
      r.report.scope.until = '2026-03-01T00:00:00Z'
    },
    (r) => {
      r.report.scope.revision.definitionRevision = '3'
    },
    (r) => {
      r.report.metrics[1].values = values
    },
    (r) => {
      r.report.metrics[1].coverage = coverage
    },
    (r) => {
      r.report.metrics[0].values.mean = NaN
    },
    (r) => {
      r.report.metrics[0].values.count = 9
    },
    (r) => {
      r.report.retakes = {
        total: 1,
        participantsWithRetakes: 1,
        average: 0.01,
        averageAmongRepeaters: 1,
      }
    },
  ]) {
    const copy = structuredClone(fixture)
    mutate(copy)
    assert.throws(() => parseReport(copy, query))
  }
  for (const revision of ['0', '2', '9007199254740991'])
    assert.ok(validDefinitionRevision(revision))
  for (const revision of ['', '-1', '01', '1e2', '2.1', '9007199254740992'])
    assert.ok(!validDefinitionRevision(revision))
  assert.ok(
    isGowtherRoute(`/v1/statistics/questionnaires/${query.questionnaireId}`),
  )
  for (const route of [
    'https://other.example/v1/session',
    '//other.example/v1/session',
    '/v1/session?token=x',
    '/v1/statistics/questionnaires/a',
    `/v1/statistics/questionnaires/${query.questionnaireId}/extra`,
    '/api/analytics/summary',
  ])
    assert.ok(!isGowtherRoute(route))
  const Report = (
    await import(
      await compile('components/institute/my-stats/publication-report.vue')
    )
  ).default
  const labels = {
    metrics: {
      zero: 'Dimensión con cero válido',
      protected: 'Dimensión protegida',
      quality: 'Dimensión con omisiones',
      related: 'Dimensión relacionada',
    },
    questions: { informational: 'Pregunta informativa' },
  }
  const render = (response, syntheticPreview = false) =>
    renderToString(
      createSSRApp({
        render: () =>
          h(Report, {
            response,
            syntheticPreview,
            labels,
            title: 'Ejemplo sintético · Sin datos de alumnos',
          }),
      }),
    )
  const historical = structuredClone(fixture)
  historical.report.metrics[0].label = 'Nombre de la revisión evaluada'
  const historicalHtml = await render(historical)
  assert.ok(historicalHtml.includes('Nombre de la revisión evaluada'))
  assert.ok(!historicalHtml.includes(labels.metrics.zero))
  const html = await render(fixture)
  for (const text of [
    'Mediana',
    'Desviación estándar poblacional',
    'Resultado no publicado',
    'más del 10%',
    'deducir un resultado protegido',
    'Pregunta informativa',
    'sin calcular puntuaciones',
  ])
    assert.ok(html.includes(text), text)
  assert.match(html, /<dd[^>]*>0<\/dd>/)
  assert.ok(html.includes('Alumnos reales · Informe fijado'))
  const synthetic = await render(fixture, true)
  assert.ok(synthetic.includes('Prueba sintética · Gowther'))
  assert.ok(synthetic.includes('no escribe en Atlas'))
  assert.ok(!synthetic.includes('Alumnos reales · Informe fijado'))
  const hidden = await render(suppressed)
  assert.ok(
    hidden.includes('Informe no publicado') &&
      !hidden.includes('Mediana') &&
      !hidden.includes('100 participantes'),
  )
  const repeaters = structuredClone(fixture)
  repeaters.report.retakes = {
    total: 50,
    participantsWithRetakes: 50,
    average: 0.5,
    averageAmongRepeaters: 1,
  }
  repeaters.report.retakeReasons = []
  repeaters.report.metrics[0].values = {
    ...values,
    modes: [],
    modeStatus: 'no_mode',
  }
  parseReport(repeaters, query)
  const retakeHtml = await render(repeaters)
  assert.ok(
    retakeHtml.includes('Sin moda') &&
      retakeHtml.includes('Promedio entre quienes repitieron'),
  )

  // Run the real composable with Vue reactivity and controlled transport promises.
  let resolveReport
  let calls = []
  const auth = reactive({
    activeInstitute: query.institutionId,
    accessToken: 'synthetic-session',
    user: { _id: 'synthetic-actor' },
    institutionContextMode: 'institution',
    isAuthenticated: true,
    isStudentPreview: false,
    validateStatisticsSession: async () => ({
      institutionId: auth.activeInstitute,
    }),
  })
  const deps = {
    auth,
    api: {
      get: async () => ({
        data: {
          questionnaires: [
            {
              id: query.questionnaireId,
              title: 'Synthetic',
              revision: 2,
              schemaVersion: 2,
              status: 'published',
              active: true,
            },
          ],
        },
      }),
    },
    stats: {
      get: async (url, config) => {
        calls.push({ url, config })
        if (url.endsWith('/periods'))
          return {
            data: {
              periods: [
                { from: query.from, until: query.until, closed: true },
                {
                  from: '2027-01-01T00:00:00Z',
                  until: '2027-02-01T00:00:00Z',
                  closed: false,
                },
              ],
            },
          }
        return new Promise((resolve) => {
          resolveReport = resolve
        })
      },
    },
  }
  let source = await readFile(
    join(root, 'components/institute/my-stats/use-publication-stats.ts'),
    'utf8',
  )
  source = source
    .replace("import { useAuthStore } from '~/store/auth'", '')
    .replace('const auth = useAuthStore()', 'const auth = deps.auth')
    .replace(
      'export function usePublicationStats()',
      'export function usePublicationStats(deps)',
    )
  source = `import { ref, shallowRef, computed, watch } from '${import.meta.resolve('vue')}'\nconst onBeforeUnmount = () => {}\n${source}`
  source = source.replace(
    'const { $axios, $statsApi } = useNuxtApp()',
    'const $axios = deps.api; const $statsApi = deps.stats',
  )
  source = ts
    .transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    })
    .outputText.replace("'axios'", `'${import.meta.resolve('axios')}'`)
    .replace(
      "'~/utils/helpers/statistics-publication'",
      `'${await compile('utils/helpers/statistics-publication.ts')}'`,
    )
  await writeFile(join(work, 'composable.mjs'), source)
  const { usePublicationStats } = await import(
    pathToFileURL(join(work, 'composable.mjs'))
  )
  const scope = effectScope()
  const state = scope.run(() => usePublicationStats(deps))
  const settle = async () => {
    for (let i = 0; i < 12; i++) {
      await Promise.resolve()
      await nextTick()
    }
  }
  await settle()
  assert.equal(state.closedPeriods.value.length, 1)
  assert.equal(calls.length, 1, 'No automatic publication query')
  state.periodKey.value = '2027-01-01T00:00:00Z'
  assert.equal(state.canConsult.value, false, 'Open period blocked')
  state.periodKey.value = query.from
  const pending = state.consult()
  await settle()
  assert.equal(calls.length, 2)
  assert.deepEqual(Object.keys(calls[1].config.params).sort(), [
    'definitionRevision',
    'from',
    'until',
  ])
  auth.activeInstitute = 'd'.repeat(24)
  assert.equal(state.result.value, null)
  assert.equal(calls[1].config.signal.aborted, true)
  resolveReport({ data: fixture })
  await pending
  await settle()
  assert.equal(
    state.result.value,
    null,
    'Late response from previous institution discarded',
  )
  const nextFixture = structuredClone(fixture)
  nextFixture.report.scope.institutionId = auth.activeInstitute
  const success = state.consult()
  await settle()
  resolveReport({ data: nextFixture })
  await success
  assert.equal(state.result.value.status, 'evaluated')
  state.revisionMode.value = 'previous'
  assert.equal(state.result.value, null, 'Changing revision clears the report')
  state.previousRevision.value = '01'
  assert.equal(state.canConsult.value, false)
  state.previousRevision.value = '1'
  const smallGroup = state.consult()
  await settle()
  resolveReport({ data: suppressed })
  await smallGroup
  assert.equal(state.result.value.status, 'suppressed')
  auth.validateStatisticsSession = async () => {
    throw { isAxiosError: true, response: { status: 401 } }
  }
  const beforeDenied = calls.length
  await state.consult()
  assert.equal(
    calls.length,
    beforeDenied,
    'Failed session cannot query reports',
  )
  assert.equal(state.result.value, null)
  assert.match(state.queryError.value, /sesión ya no es válida/)
  scope.stop()
  if (process.argv[2] === '--preview') {
    const output = process.argv[3]
    assert.ok(output && output.startsWith('/'), 'Use an absolute preview path')
    await writeFile(
      output,
      `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prueba sintética de estadísticas</title><style>body{margin:0;background:#f5f4f8;font-family:Arial,sans-serif}main{max-width:1200px;margin:auto;padding:24px;box-sizing:border-box}*{box-sizing:border-box}h1{font-size:22px} ${css.join('\n')}</style><main><h1>Prueba sintética · No son datos de alumnos</h1>${html}</main></html>`,
    )
  }
  process.stdout.write(
    'PASS: contract, scope, protected values, zero, informational questions, reasons, modes, retakes, rendering, route allowlist and context cancellation.\n',
  )
} finally {
  await close()
}
