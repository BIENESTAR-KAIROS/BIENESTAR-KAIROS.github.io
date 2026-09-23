function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = asRecord(asRecord(error)?.response)
  const message = asRecord(response?.data)?.message
  return typeof message === 'string' && message ? message : fallback
}

export function hasErrorStatus(error: unknown, status: number): boolean {
  const record = asRecord(error)
  const response = asRecord(record?.response)
  return [
    response?.status,
    record?.status,
    record?.statusCode,
    asRecord(response?.data)?.statusCode,
    asRecord(record?.data)?.statusCode,
  ].includes(status)
}
