import type {
  PublicationLabels,
  PublicationMetric,
  PublicationQuery,
  StatisticsPublicationResponse,
} from '~/interfaces/stats/statistics-publication.interface'

function ensure(ok: unknown): asserts ok {
  if (!ok) throw new Error('No pudimos verificar el informe recibido.')
}
function object(value: unknown): Record<string, unknown> {
  ensure(value && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, unknown>
}
const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)
const integer = (v: unknown, min = 0, max = 2000) =>
  finite(v) && Number.isSafeInteger(v) && v >= min && v <= max
const instant = (v: unknown): v is string =>
  typeof v === 'string' && Number.isFinite(Date.parse(v))
function codes(v: unknown): asserts v is string[] {
  ensure(
    Array.isArray(v) &&
      v.length <= 32 &&
      v.every((c) => typeof c === 'string' && /^[a-z_]{1,128}$/.test(c)),
  )
}
export function validDefinitionRevision(value: string): boolean {
  return (
    /^(0|[1-9][0-9]{0,15})$/.test(value) && Number.isSafeInteger(Number(value))
  )
}
export function publicationMetricLabel(
  metric: PublicationMetric,
  index: number,
  labels?: PublicationLabels,
) {
  const sameRevision =
    metric.kind === 'question'
      ? labels?.questions[metric.id]
      : labels?.metrics[metric.id]
  return (
    metric.label?.trim() ||
    sameRevision?.trim() ||
    (metric.kind === 'overall'
      ? 'Resultado general'
      : `${metric.kind === 'question' ? 'Pregunta' : 'Dimensión'} ${index + 1} (nombre no disponible)`)
  )
}

export function validatePublicationMetric(
  value: unknown,
  question: boolean,
  minimum = 10,
) {
  const m = object(value)
  ensure(typeof m.id === 'string' && m.id.length > 0 && m.id.length <= 128)
  ensure(
    question
      ? m.kind === 'question'
      : m.kind === 'overall' || m.kind === 'dimension',
  )
  ensure(
    m.unit === undefined ||
      (typeof m.unit === 'string' && m.unit.length <= 100),
  )
  ensure(
    m.label === undefined ||
      (typeof m.label === 'string' && m.label.length <= (question ? 500 : 100)),
  )
  ensure(m.method === undefined || typeof m.method === 'string')
  codes(m.reasons)
  codes(m.warnings)
  ensure(
    m.publicationStatus === 'published' || m.publicationStatus === 'suppressed',
  )
  if (m.publicationStatus === 'suppressed')
    ensure(m.values === null && m.reasons.length > 0)
  else
    ensure(
      (m.values !== null || question) &&
        m.coverage !== null &&
        m.reasons.length === 0,
    )
  if (
    m.reasons.includes('insufficient_cohort') ||
    m.reasons.includes('complementary_suppression')
  )
    ensure(m.coverage === null && m.values === null && m.warnings.length === 0)
  if (m.coverage !== null) {
    const c = object(m.coverage)
    for (const key of [
      'participants',
      'applicable',
      'valid',
      'missing',
      'invalid',
      'notApplicable',
      'requiredMissing',
      'unscored',
    ])
      ensure(integer(c[key]))
    ensure(c.answered === null || integer(c.answered))
    for (const key of [
      'fraction',
      'scoreFraction',
      'requiredMissingFraction',
      'requiredMissingApplicableFraction',
    ])
      ensure(c[key] === null || (finite(c[key]) && c[key] >= 0 && c[key] <= 1))
  }
  if (m.values !== null) {
    const v = object(m.values)
    ensure(integer(v.count, minimum))
    for (const key of ['mean', 'median', 'populationStdDev', 'min', 'max'])
      ensure(finite(v[key]))
    ensure(
      (v.populationStdDev as number) >= 0 &&
        (v.min as number) <= (v.max as number),
    )
    ensure(
      Array.isArray(v.modes) && v.modes.length <= 2000 && v.modes.every(finite),
    )
    ensure(
      v.modeStatus === 'no_mode'
        ? v.modes.length === 0
        : v.modeStatus === 'modes' && v.modes.length > 0,
    )
  }
}

function validateComparisons(report: Record<string, unknown>) {
  if (report.comparisons === undefined) return
  const rows = report.comparisons
  const n = Number(report.participants)
  const minimum = Number(report.minCohort)
  const safeCount = (v: number) => v === 0 || v >= minimum
  ensure(Array.isArray(rows) && rows.length <= 3200)
  const seen = new Set<string>()
  const metrics = (report.metrics as unknown[]).map(object)
  for (const row of rows) {
    const c = object(row)
    const metric = metrics.find(
      (m) =>
        m.id === c.metricId && m.publicationStatus === 'published' && m.values,
    )
    ensure(
      metric &&
        typeof c.questionId === 'string' &&
        /^[a-f0-9]{24}$/.test(c.questionId),
    )
    const key = JSON.stringify([c.metricId, c.questionId])
    ensure(!seen.has(key))
    seen.add(key)
    ensure(
      typeof c.text === 'string' &&
        c.text.trim().length > 0 &&
        ['number', 'single_choice', 'multiple_choice'].includes(String(c.kind)),
    )
    ensure(integer(c.paired, minimum, n) && safeCount(n - Number(c.paired)))
    const paired = Number(c.paired)
    const scored = Number(object(metric.values).count)
    ensure(paired <= scored && safeCount(scored - paired))
    ensure(
      c.pearson === null ||
        (c.kind === 'number' && finite(c.pearson) && Math.abs(c.pearson) <= 1),
    )
    ensure(
      c.etaSquared === null ||
        (c.kind === 'single_choice' &&
          finite(c.etaSquared) &&
          c.etaSquared >= 0 &&
          c.etaSquared <= 1),
    )
    ensure(Array.isArray(c.groups) && c.groups.length <= 100)
    ensure(c.kind === 'number' ? c.groups.length === 0 : c.groups.length > 0)
    let members = 0
    for (const item of c.groups) {
      const g = object(item)
      const count = Number(g.count)
      ensure(
        typeof g.label === 'string' &&
          g.label.trim().length > 0 &&
          integer(g.count, 0, paired),
      )
      ensure(safeCount(count) && safeCount(paired - count))
      ensure(count === 0 ? g.mean === null : finite(g.mean))
      members += count
    }
    if (c.kind === 'single_choice') ensure(members === paired)
    if (c.kind === 'multiple_choice') ensure(members >= paired)
  }
}

// Validate scope and suppression before rendering; never reconstruct protected data.
export function parseStatisticsPublication(
  value: unknown,
  query: PublicationQuery,
): StatisticsPublicationResponse {
  const data = object(value)
  codes(data.reasons)
  if (data.status === 'suppressed') {
    ensure(
      data.report === null &&
        data.reasons.length === 1 &&
        data.reasons[0] === 'insufficient_cohort',
    )
    return { status: 'suppressed', reasons: data.reasons, report: null }
  }
  ensure(data.status === 'evaluated' && data.reasons.length === 0)
  const r = object(data.report)
  const scope = object(r.scope)
  const revision = object(scope.revision)
  ensure(
    scope.institutionId === query.institutionId && scope.population === 'real',
  )
  ensure(
    revision.questionnaireId === query.questionnaireId &&
      revision.definitionRevision === query.definitionRevision,
  )
  ensure(revision.schemaVersion === 2 && revision.scoringVersion === 1)
  ensure(
    instant(scope.from) &&
      instant(scope.until) &&
      Date.parse(scope.from) === Date.parse(query.from) &&
      Date.parse(scope.until) === Date.parse(query.until),
  )
  ensure(
    r.policyVersion === '2026-11-04.v2' &&
      r.releasePolicyVersion === '2026-11-04.release-v1',
  )
  ensure(
    r.selectionPolicy ===
      'latest_submitted_within_period_per_person_and_revision',
  )
  ensure(
    integer(r.minCohort, 10) &&
      r.requiredMissingThreshold === 0.1 &&
      integer(r.participants, 10),
  )
  ensure(
    instant(r.calculatedAt) &&
      typeof r.definitionFingerprint === 'string' &&
      /^[a-f0-9]{64}$/.test(r.definitionFingerprint),
  )
  codes(r.reasons)
  codes(r.retakeReasons)
  if (r.retakes === null) ensure(r.retakeReasons.length > 0)
  else {
    ensure(r.retakeReasons.length === 0)
    const t = object(r.retakes)
    ensure(
      integer(t.total, 0, 10000) &&
        integer(t.participantsWithRetakes) &&
        finite(t.average) &&
        t.average >= 0,
    )
    ensure(
      t.averageAmongRepeaters === null ||
        (finite(t.averageAmongRepeaters) && t.averageAmongRepeaters >= 0),
    )
  }
  ensure(
    Array.isArray(r.metrics) &&
      r.metrics.length <= 32 &&
      Array.isArray(r.questions) &&
      r.questions.length <= 100,
  )
  r.metrics.forEach((m) => validatePublicationMetric(m, false))
  r.questions.forEach((m) => validatePublicationMetric(m, true))
  validateComparisons(r)
  return value as StatisticsPublicationResponse
}
