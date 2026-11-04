const explanations: Record<string, string> = {
  insufficient_cohort:
    'No se publica para proteger grupos pequeños. Se requieren al menos 10 participantes por grupo y cálculo; también se protegen los subgrupos que podrían deducirse por diferencia.',
  complementary_suppression:
    'No se publica porque permitiría deducir un resultado protegido de preguntas o dimensiones relacionadas.',
  required_missing_exceeds_threshold:
    'No se publica porque más del 10% de quienes presentaron la evaluación tienen omisiones obligatorias que afectan este cálculo.',
  no_participants: 'No hay participantes para realizar este cálculo.',
  no_valid_scores: 'No hay puntuaciones válidas para realizar este cálculo.',
  not_applicable: 'Esta pregunta o métrica no fue aplicable a este grupo.',
  incomplete_coverage:
    'No todas las personas contestaron o aportaron un resultado válido. Las ausencias no cuentan como cero y pueden introducir sesgo de no respuesta.',
  required_answers_missing:
    'Hay omisiones obligatorias. Su proporción no determina la magnitud ni la dirección del posible sesgo; consulta la cobertura y el motivo de publicación.',
  unscored_values_excluded:
    'Hay respuestas contestadas sin puntuación. Se excluyen del cálculo numérico y no se consideran omisiones obligatorias.',
  invalid_values_excluded: 'Se excluyeron valores inválidos del cálculo.',
  incompatible_revision:
    'Las definiciones de esta revisión no permiten combinar los resultados.',
}

export const publicationExplanation = (code: string) =>
  explanations[code] ||
  'El servicio ha restringido este resultado por una regla de calidad o privacidad.'

export const statisticNumber = (value: number | null) =>
  value === null
    ? 'No disponible'
    : value.toLocaleString('es-MX', { maximumFractionDigits: 2 })

export const statisticPercent = (value: number | null) =>
  value === null
    ? 'No disponible'
    : value.toLocaleString('es-MX', {
        style: 'percent',
        maximumFractionDigits: 2,
      })

export const scoringMethod = (method?: string) =>
  ({
    sum: 'Suma',
    mean: 'Promedio',
    weighted_mean: 'Promedio ponderado',
    max: 'Máximo',
    direct: 'Puntuación directa',
  })[method || ''] || 'Según el cuestionario'
