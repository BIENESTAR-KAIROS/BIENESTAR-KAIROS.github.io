import type {
  InstitutionDemoStatus,
  InstitutionDemoReport,
} from '~/interfaces/stats/institution-demo.interface'
import { demoID } from '~/utils/helpers/demo'
import {
  validDefinitionRevision,
  validatePublicationMetric,
} from '~/utils/helpers/statistics-publication'

function ensure(value: unknown): asserts value {
  if (!value) throw new Error('Invalid institutional demo response')
}
function object(value: unknown): Record<string, unknown> {
  ensure(value && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, unknown>
}
const positive = (v: unknown, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === 'number' && Number.isSafeInteger(v) && v > 0 && v <= max
export function parseInstitutionDemoStatus(
  value: unknown,
  institution: string,
  questionnaire: string,
): InstitutionDemoStatus {
  const s = object(value),
    a = object(s.assignment)
  ensure(
    s.synthetic === true &&
      s.institutionId === institution &&
      s.questionnaireId === questionnaire,
  )
  ensure(demoID(a.id) && positive(a.revision) && positive(a.count, 5000))
  ensure(
    [
      'not_generated',
      'queued',
      'running',
      'prepared',
      'completed',
      'failed',
      'cancelled',
    ].includes(String(s.jobState)),
  )
  ensure(
    typeof s.hasActiveGeneration === 'boolean' &&
      typeof s.cleanupPending === 'boolean',
  )
  return value as InstitutionDemoStatus
}
export function parseInstitutionDemoReport(
  value: unknown,
  status: InstitutionDemoStatus,
): InstitutionDemoReport {
  const r = object(value)
  ensure(
    r.synthetic === true &&
      r.institutionId === status.institutionId &&
      r.questionnaireId === status.questionnaireId,
  )
  ensure(
    r.assignmentId === status.assignment.id &&
      demoID(r.generationId) &&
      positive(r.configurationVersion),
  )
  ensure(
    typeof r.definitionRevision === 'string' &&
      validDefinitionRevision(r.definitionRevision),
  )
  ensure(
    r.policyVersion === '2026-11-04.v2' &&
      typeof r.calculatedAt === 'string' &&
      Number.isFinite(Date.parse(r.calculatedAt)),
  )
  ensure(
    positive(r.participants, 2000) &&
      r.participants === status.assignment.count,
  )
  ensure(
    Array.isArray(r.questions) &&
      r.questions.length <= 100 &&
      Array.isArray(r.metrics) &&
      r.metrics.length <= 32,
  )
  r.questions.forEach((m) => validatePublicationMetric(m, true, 1))
  r.metrics.forEach((m) => validatePublicationMetric(m, false, 1))
  for (const items of [r.questions, r.metrics]) {
    const ids = items.map((m) => object(m).id)
    ensure(new Set(ids).size === ids.length)
  }
  return value as InstitutionDemoReport
}
