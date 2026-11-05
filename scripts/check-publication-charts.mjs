// Synthetic-only rendering checks. No services, credentials or database writes.
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { statisticsPreviewCompiler } from './lib/statistics-preview-compiler.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const compiler = await statisticsPreviewCompiler(root)
try {
  const { metricChartValues, metricChartCoverage } = await import(
    await compiler.compile('utils/helpers/publication-charts.ts')
  )
  const { default: Charts } = await import(
    await compiler.compile(
      'components/institute/my-stats/publication-charts.vue',
    )
  )
  const metric = {
    id: 'dimension',
    kind: 'dimension',
    unit: 'puntos',
    method: 'mean',
    publicationStatus: 'published',
    reasons: [],
    warnings: [],
    values: {
      count: 20,
      mean: 3,
      median: 2.5,
      modes: [2],
      modeStatus: 'modes',
      populationStdDev: 1,
      min: 1,
      max: 5,
    },
    coverage: {
      participants: 20,
      applicable: 10,
      valid: 9,
      missing: 1,
      invalid: 0,
      notApplicable: 10,
      requiredMissing: 2,
      unscored: 0,
      answered: 9,
      fraction: 0.45,
      scoreFraction: 0.9,
      requiredMissingFraction: 0.1,
      requiredMissingApplicableFraction: 0.2,
    },
  }
  const axis = metricChartValues(metric)
  assert.equal(axis.start, 0)
  assert.equal(axis.end, 5)
  assert.equal(axis.lower, 2)
  assert.equal(axis.upper, 4)
  assert.ok(axis.mean > axis.median)
  const negative = metricChartValues({
    ...metric,
    values: {
      ...metric.values,
      min: -5,
      max: -1,
      mean: -3,
      median: -2,
      populationStdDev: 4,
    },
  })
  assert.equal(negative.start, -7)
  assert.equal(negative.end, 1)
  assert.ok(negative.barStart < negative.zero)
  const zero = {
    ...metric,
    values: {
      ...metric.values,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      populationStdDev: 0,
    },
  }
  const zeroAxis = metricChartValues(zero)
  assert.equal(zeroAxis.barWidth, 0)
  assert.equal(zeroAxis.low, zeroAxis.high)
  assert.equal(zeroAxis.end, 1)
  assert.equal(
    metricChartValues({
      ...metric,
      values: { ...metric.values, mean: Infinity },
    }),
    null,
  )
  const hidden = {
    ...metric,
    id: 'private',
    publicationStatus: 'suppressed',
    reasons: ['insufficient_cohort'],
    values: { ...metric.values, mean: 987654321 },
    coverage: { ...metric.coverage, valid: 87654321 },
  }
  assert.equal(metricChartValues(hidden), null)
  assert.equal(metricChartCoverage(hidden), null)
  const coverage = metricChartCoverage(metric)
  assert.equal(coverage.score, 0.45)
  assert.equal(coverage.denominator, 20)
  assert.equal(coverage.required, 0.1)
  const question = metricChartCoverage({ ...metric, kind: 'question' })
  assert.equal(question.score, 0.9)
  assert.equal(question.denominator, 10)
  assert.equal(question.required, 0.1) // Always total participants, never applicable.
  const unavailable = metricChartCoverage({
    ...metric,
    coverage: {
      ...metric.coverage,
      fraction: null,
      requiredMissingFraction: null,
    },
  })
  assert.equal(unavailable.score, null)
  assert.equal(unavailable.required, null)
  const quality = {
    ...metric,
    publicationStatus: 'suppressed',
    values: null,
    reasons: ['required_missing_exceeds_threshold'],
  }
  assert.notEqual(metricChartCoverage(quality), null)
  const percentMetric = {
    ...metric,
    id: 'percent',
    unit: '%',
    values: {
      ...metric.values,
      mean: 60,
      median: 50,
      min: 20,
      max: 100,
      populationStdDev: 20,
    },
  }
  assert.equal(metricChartValues(percentMetric).end, 100)
  // Each axis is independent: percent ranges never rescale the points axis.
  assert.equal(metricChartValues(metric).end, 5)
  const render = (items, extra = {}) =>
    renderToString(
      createSSRApp({ render: () => h(Charts, { items, ...extra }) }),
    )
  const html = await render(
    [
      { metric: zero, label: 'Cero válido' },
      { metric: hidden, label: 'Protegida' },
      { metric: quality, label: 'Calidad insuficiente' },
      { metric: percentMetric, label: 'Porcentaje' },
    ],
    { context: 'admin' },
  )
  assert.ok(html.includes('report-charts admin'))
  assert.ok(html.includes('<svg'))
  assert.match(html, /<table[\s>]/)
  assert.ok(html.includes('scope="col"'))
  assert.ok(html.includes('aria-hidden="true"'))
  assert.ok(html.includes('aria-label="Tipo de gráfica"'))
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1)
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 2)
  assert.ok(html.includes('no es un intervalo de confianza'))
  assert.ok(html.includes('No publicado'))
  assert.ok(!html.includes('987654321'))
  assert.ok(!html.includes('87654321'))
  assert.ok(!html.includes('NaN'))
  assert.ok(!html.includes('Infinity'))
  const protectedHtml = await render([{ metric: hidden, label: 'Protegida' }])
  assert.ok(!protectedHtml.includes('<svg'))
  assert.ok(!protectedHtml.includes('class="coverage-track'))
  assert.ok(protectedHtml.includes('cobertura está protegida'))
  const informational = await render(
    [
      {
        metric: { ...metric, kind: 'question', values: null },
        label: 'Informativa',
      },
    ],
    { questions: true },
  )
  assert.ok(!informational.includes('<svg'))
  assert.ok(informational.includes('Gráficas por pregunta'))
  process.stdout.write(
    'Publication charts: scales, zero/negative values, suppression, coverage denominators and accessible rendering passed.\n',
  )
} finally {
  await compiler.close()
}
