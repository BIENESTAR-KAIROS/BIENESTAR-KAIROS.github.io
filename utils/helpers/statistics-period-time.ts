// Convert a wall-clock minute in an explicit IANA zone. Reject DST gaps and
// repeated hours rather than silently choosing a different institutional interval.
export function periodInstant(value: string, timeZone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error('Completa ambas fechas y horas.')
  const nominal = Date.parse(`${value}:00Z`)
  if (
    !Number.isFinite(nominal) ||
    new Date(nominal).toISOString().slice(0, 16) !== value
  )
    throw new Error('Revisa que las fechas sean válidas.')
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const wall = (instant: number) => {
    const parts = Object.fromEntries(
      formatter.formatToParts(instant).map((p) => [p.type, p.value]),
    )
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
  }
  const matches = new Set<number>()
  for (const hours of [-36, -12, 0, 12, 36]) {
    const sample = nominal + hours * 3600000
    const offset = Date.parse(`${wall(sample)}:00Z`) - sample
    const candidate = nominal - offset
    if (wall(candidate) === value) matches.add(candidate)
  }
  if (matches.size !== 1)
    throw new Error(
      'Esa hora cambia o se repite por el horario de la zona. Elige otra hora o utiliza UTC.',
    )
  return new Date([...matches][0]!).toISOString()
}

export function formatPeriodInstant(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
  }).format(new Date(value))
}
