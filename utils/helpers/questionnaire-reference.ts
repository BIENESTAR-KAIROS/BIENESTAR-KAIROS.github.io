export function questionnaireReference(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value)
    ? value
    : undefined
}
