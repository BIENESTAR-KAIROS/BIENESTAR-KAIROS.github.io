export const valueLabels: Record<string, string> = {
  FREE_UNION: 'Unión libre',
  SINGLE: 'Soltero/a',
  MARRIED: 'Casado/a',
  DIVORCED: 'Divorciado/a',
  WIDOWED: 'Viudo/a',
  ROOMMATES: 'Con compañeros de cuarto',
  ALONE: 'Solo/a',
  WITH_FAMILY: 'Con familia',
  WITH_PARTNER: 'Con pareja',
  BETWEEN_9000_12000: '$9,000 - $12,000',
  BETWEEN_6000_9000: '$6,000 - $9,000',
  BETWEEN_3000_6000: '$3,000 - $6,000',
  LESS_THAN_3000: 'Menos de $3,000',
  BETWEEN_12000_15000: '$12,000 - $15,000',
  MORE_THAN_15000: 'Más de $15,000',
  BETWEEN_15000_20000: '$15,000 - $20,000',
  BETWEEN_20000_30000: '$20,000 - $30,000',
  BETWEEN_30000_40000: '$30,000 - $40,000',
  BETWEEN_40000_50000: '$40,000 - $50,000',
  MORE_THAN_50000: 'Más de $50,000',
  LESS_THAN_15000: 'Menos de $15,000',
  MORE_THAN_20_HOURS_WEEK: 'Más de 20 hrs/semana',
  LESS_THAN_20_HOURS_WEEK: 'Menos de 20 hrs/semana',
  UNEMPLOYED: 'Sin empleo',
  ONCE_PER_WEEK: 'Una vez por semana',
  TWICE_PER_WEEK: 'Dos veces por semana',
  THREE_OR_MORE_PER_WEEK: 'Tres o más veces por semana',
  ONCE_PER_MONTH: 'Una vez al mes',
  NEVER: 'Nunca',
  DAILY: 'Diario',
  '1_TO_4_HOURS_PER_WEEK': '1 a 4 horas por semana',
  '5_TO_8_HOURS_PER_WEEK': '5 a 8 horas por semana',
  MORE_THAN_8_HOURS_PER_WEEK: 'Más de 8 horas por semana',
  NONE: 'Ninguna',
}

export function translateValue(val: any): string {
  if (typeof val === 'boolean') return val ? 'Sí' : 'No'
  if (typeof val === 'string') return valueLabels[val] || val
  return String(val)
}
