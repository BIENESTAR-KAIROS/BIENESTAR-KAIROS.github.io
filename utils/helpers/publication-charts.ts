import type { PublicationMetric } from '~/interfaces/stats/statistics-publication.interface'

export interface ChartMetric {
  metric: PublicationMetric
  label: string
}

// Each row owns its numeric axis. Equal units/methods do not establish equal
// theoretical ranges; the current report contract does not expose those ranges.
export function metricChartValues(metric: PublicationMetric) {
  if (metric.publicationStatus !== 'published' || !metric.values) return null
  const v = metric.values
  if (
    ![v.mean, v.median, v.min, v.max, v.populationStdDev].every(
      Number.isFinite,
    ) ||
    v.populationStdDev < 0
  )
    return null
  const lower = v.mean - v.populationStdDev
  const upper = v.mean + v.populationStdDev
  const start = Math.min(0, v.min, v.mean, v.median, lower)
  const end = Math.max(0, v.max, v.mean, v.median, upper)
  const span = end - start || 1
  if (![lower, upper, start, end, span].every(Number.isFinite)) return null
  const position = (value: number) => 4 + ((value - start) / span) * 92
  return {
    values: v,
    start,
    end: end === start ? start + 1 : end,
    lower,
    upper,
    zero: position(0),
    mean: position(v.mean),
    median: position(v.median),
    low: position(lower),
    high: position(upper),
    barStart: Math.min(position(0), position(v.mean)),
    barWidth: Math.abs(position(v.mean) - position(0)),
  }
}

export function metricChartCoverage(metric: PublicationMetric) {
  // Defense in depth: these reasons also suppress coverage in the server contract.
  if (
    !metric.coverage ||
    metric.reasons.some((reason) =>
      ['insufficient_cohort', 'complementary_suppression'].includes(reason),
    )
  )
    return null
  const c = metric.coverage
  const score = metric.kind === 'question' ? c.scoreFraction : c.fraction
  const safeFraction = (n: number | null) =>
    n !== null && Number.isFinite(n) && n >= 0 && n <= 1 ? n : null
  return {
    score: safeFraction(score),
    required: safeFraction(c.requiredMissingFraction),
    valid: c.valid,
    denominator: metric.kind === 'question' ? c.applicable : c.participants,
    participants: c.participants,
    requiredMissing: c.requiredMissing,
    question: metric.kind === 'question',
  }
}
