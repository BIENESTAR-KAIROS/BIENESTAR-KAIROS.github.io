import type {
  DemoConfiguration,
  DemoDistribution,
  DemoInspection,
  DemoJob,
  DemoProfile,
  DemoReport,
} from '~/interfaces/stats/demo.interface'
import {
  validDefinitionRevision,
  validatePublicationMetric,
} from '~/utils/helpers/statistics-publication'

export const demoID = (v: unknown): v is string =>
  typeof v === 'string' && /^(?!0{24}$)[a-f0-9]{24}$/.test(v)
const hash = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)
const integer = (
  v: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max
const instant = (v: unknown) =>
  typeof v === 'string' && Number.isFinite(Date.parse(v))
function ensure(ok: unknown): asserts ok {
  if (!ok)
    throw new Error(
      'No pudimos verificar los datos de la demo. Actualiza el estado.',
    )
}
function object(v: unknown): Record<string, unknown> {
  ensure(v && typeof v === 'object' && !Array.isArray(v))
  return v as Record<string, unknown>
}
export function defaultDemoProfile(
  distribution: DemoDistribution = 'uniform',
): DemoProfile {
  return {
    distribution,
    center: distribution === 'normal' ? 0.5 : 0,
    spread: distribution === 'normal' ? 0.15 : 0,
    strength: distribution === 'low' || distribution === 'high' ? 3 : 0,
  }
}
export function validDemoProfile(v: unknown): v is DemoProfile {
  if (!v || typeof v !== 'object') return false
  const p = v as DemoProfile
  if (
    ![p.center, p.spread, p.strength].every(
      (n) => typeof n === 'number' && Number.isFinite(n),
    )
  )
    return false
  if (p.distribution === 'uniform')
    return p.center === 0 && p.spread === 0 && p.strength === 0
  if (p.distribution === 'normal')
    return (
      p.center >= 0 &&
      p.center <= 1 &&
      p.spread >= 0.01 &&
      p.spread <= 0.5 &&
      p.strength === 0
    )
  return (
    (p.distribution === 'low' || p.distribution === 'high') &&
    p.center === 0 &&
    p.spread === 0 &&
    p.strength >= 1 &&
    p.strength <= 8
  )
}
function configuration(v: unknown): asserts v is DemoConfiguration {
  const c = object(v),
    controls = object(c.controls)
  ensure(
    integer(c.version, 1) &&
      integer(c.assignmentRevision, 1) &&
      typeof c.definitionRevision === 'string' &&
      validDefinitionRevision(c.definitionRevision) &&
      hash(c.definitionFingerprint),
  )
  ensure(
    hash(controls.seed) &&
      validDemoProfile(controls.default) &&
      Array.isArray(controls.dimensions) &&
      controls.dimensions.length <= 32,
  )
  const seen = new Set<string>()
  for (const value of controls.dimensions) {
    const d = object(value)
    ensure(
      demoID(d.dimensionId) &&
        !seen.has(d.dimensionId) &&
        validDemoProfile(d.profile),
    )
    seen.add(d.dimensionId)
  }
}
export function parseDemoJob(v: unknown): DemoJob {
  const j = object(v)
  ensure(
    demoID(j.id) &&
      [
        'queued',
        'running',
        'prepared',
        'completed',
        'failed',
        'cancelled',
      ].includes(String(j.state)) &&
      integer(j.configVersion, 1) &&
      typeof j.cleanupComplete === 'boolean' &&
      instant(j.deadlineAt),
  )
  return v as DemoJob
}
export function parseDemoInspection(
  v: unknown,
  questionnaireId: string,
): DemoInspection {
  const d = object(v),
    a = object(d.assignment),
    r = object(d.revision),
    s = object(d.state)
  ensure(
    d.synthetic === true &&
      demoID(a.id) &&
      integer(a.revision, 1) &&
      integer(a.count, 1, 5000),
  )
  ensure(
    r.questionnaireId === questionnaireId &&
      r.schemaVersion === 2 &&
      r.scoringVersion === 1 &&
      typeof r.definitionRevision === 'string' &&
      validDefinitionRevision(r.definitionRevision) &&
      hash(d.definitionFingerprint),
  )
  ensure(
    Array.isArray(d.dimensionIds) &&
      d.dimensionIds.length <= 32 &&
      d.dimensionIds.every(demoID) &&
      new Set(d.dimensionIds).size === d.dimensionIds.length &&
      integer(d.maxParticipants, 1, 2000),
  )
  ensure(
    integer(s.latestVersion) &&
      typeof s.cleanupPending === 'boolean' &&
      (s.activeGenerationId === undefined || demoID(s.activeGenerationId)),
  )
  ensure(Array.isArray(s.configurations) && s.configurations.length <= 2)
  let last = 0
  for (const c of s.configurations) {
    configuration(c)
    ensure(c.version > last && c.version <= s.latestVersion)
    last = c.version
  }
  if (s.job !== null) {
    const job = parseDemoJob(s.job)
    ensure(job.configVersion <= s.latestVersion)
  }
  return v as DemoInspection
}
export function parseDemoReport(
  v: unknown,
  inspection: DemoInspection,
): DemoReport {
  const r = object(v)
  ensure(
    r.synthetic === true &&
      demoID(r.generationId) &&
      r.generationId === inspection.state.activeGenerationId &&
      r.assignmentId === inspection.assignment.id,
  )
  configuration(r.configuration)
  ensure(
    r.configuration.assignmentRevision === inspection.assignment.revision &&
      r.configuration.version <= inspection.state.latestVersion,
  )
  const receivedConfiguration = r.configuration
  const stored = inspection.state.configurations.find(
    (c) => c.version === receivedConfiguration.version,
  )
  ensure(
    stored &&
      stored.assignmentRevision === r.configuration.assignmentRevision &&
      stored.definitionRevision === r.configuration.definitionRevision &&
      stored.definitionFingerprint === r.configuration.definitionFingerprint &&
      stored.controls.seed === r.configuration.controls.seed,
  )
  ensure(
    r.policyVersion === '2026-11-04.v2' &&
      instant(r.calculatedAt) &&
      integer(r.participants, 1, 2000) &&
      r.participants === inspection.assignment.count,
  )
  ensure(
    Array.isArray(r.questions) &&
      r.questions.length <= 100 &&
      Array.isArray(r.metrics) &&
      r.metrics.length <= 32,
  )
  r.questions.forEach((m) => validatePublicationMetric(m, true, 1))
  r.metrics.forEach((m) => validatePublicationMetric(m, false, 1))
  return v as DemoReport
}
export function newDemoSeed(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}
