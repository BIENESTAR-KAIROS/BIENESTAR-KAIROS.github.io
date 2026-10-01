import type {
  BuilderOption,
  BuilderQuestion,
  BuilderQuestionType,
  DefinitionQuestion,
  EvaluationConfiguration,
  EvaluationDimension,
  QuestionPresentation,
} from '~/interfaces/quizzes/quiz-builder.interface'

// Mongo ObjectId representation; Mongoose casts these IDs and their references.
export const createObjectId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
export const questionTypes: {
  value: BuilderQuestionType
  label: string
  icon: string
}[] = [
  {
    value: 'single_choice',
    label: 'Selección única',
    icon: 'mdi-radiobox-marked',
  },
  {
    value: 'multiple_choice',
    label: 'Selección múltiple',
    icon: 'mdi-checkbox-marked-outline',
  },
  { value: 'number', label: 'Numérica', icon: 'mdi-numeric' },
  { value: 'text', label: 'Texto', icon: 'mdi-text' },
  { value: 'date', label: 'Fecha', icon: 'mdi-calendar-outline' },
]
export const presentations: Record<
  BuilderQuestionType,
  { value: QuestionPresentation; label: string }[]
> = {
  single_choice: [
    { value: 'radio', label: 'Lista de opciones' },
    { value: 'select', label: 'Desplegable' },
    { value: 'scale', label: 'Escala' },
  ],
  multiple_choice: [{ value: 'checkbox', label: 'Casillas' }],
  number: [{ value: 'number', label: 'Campo numérico' }],
  text: [{ value: 'textarea', label: 'Texto libre' }],
  date: [{ value: 'date', label: 'Calendario' }],
}
export const hasOptions = (type: BuilderQuestionType) =>
  ['single_choice', 'multiple_choice'].includes(type)
export function createOption(
  text = '',
  score: number | '' = '',
): BuilderOption {
  return { id: createObjectId(), text, score, children: [] }
}
export function createQuestion(): BuilderQuestion {
  return {
    id: createObjectId(),
    type: 'single_choice',
    presentation: 'radio',
    text: '',
    help: '',
    block: '',
    scoringMode: 'informational',
    scoringMethod: 'sum',
    required: true,
    options: [createOption(), createOption()],
    maxAnswers: 2,
    min: 0,
    max: 100,
    maxLength: 500,
  }
}
export function createExample(): BuilderQuestion {
  const question = createQuestion()
  question.text = '¿Has consumido esta sustancia alguna vez?'
  question.help =
    'Ejemplo de estructura; configura las puntuaciones y los rangos de tu instrumento.'
  question.options = [createOption('Sí'), createOption('No')]
  const frequency = createQuestion()
  frequency.text = '¿Con qué frecuencia la has consumido recientemente?'
  frequency.options = [createOption('Nunca'), createOption('En alguna ocasión')]
  const detail = createQuestion()
  detail.type = 'text'
  detail.presentation = 'textarea'
  detail.text = '¿Quieres compartir más detalles?'
  detail.required = false
  frequency.options[1].children.push(detail)
  question.options[0].children.push(frequency)
  return question
}
export function allBuilderQuestions(
  questions: BuilderQuestion[],
): BuilderQuestion[] {
  return questions.flatMap((q) => [
    q,
    ...allBuilderQuestions(
      hasOptions(q.type) ? q.options.flatMap((o) => o.children) : [],
    ),
  ])
}
export function flattenQuestions(
  questions: BuilderQuestion[],
): DefinitionQuestion[] {
  const flat: DefinitionQuestion[] = []
  const visit = (
    q: BuilderQuestion,
    visibleWhen: DefinitionQuestion['visibleWhen'] = null,
  ) => {
    flat.push({
      _id: q.id,
      text: q.text.trim(),
      helpText: q.help.trim(),
      category: q.block.trim(),
      type: q.type,
      presentation: q.presentation,
      required: q.required,
      order: flat.length,
      options: hasOptions(q.type)
        ? q.options.map((o) => ({
            _id: o.id,
            text: o.text.trim(),
            score:
              q.scoringMode === 'scored' && o.score !== '' ? o.score : null,
          }))
        : [],
      visibleWhen,
      scoring: {
        mode: q.scoringMode,
        method:
          q.type === 'number'
            ? 'direct'
            : q.type === 'multiple_choice'
              ? q.scoringMethod
              : 'sum',
      },
      constraints:
        q.type === 'multiple_choice'
          ? { maxSelections: q.maxAnswers }
          : q.type === 'number'
            ? { min: q.min, max: q.max }
            : q.type === 'text'
              ? { maxLength: q.maxLength }
              : {},
    })
    if (hasOptions(q.type))
      q.options.forEach((o) =>
        o.children.forEach((child) =>
          visit(child, {
            questionId: q.id,
            operator: 'includesAny',
            optionIds: [o.id],
          }),
        ),
      )
  }
  questions.forEach((q) => visit(q))
  return flat
}
export function createDimension(label = ''): EvaluationDimension {
  return {
    _id: createObjectId(),
    label,
    method: 'sum',
    items: [],
    missingAnswers: 'invalidate',
    skippedQuestions: 'exclude',
    minimumAnsweredPercentage: 100,
    interpretations: [],
  }
}
export function createEvaluation(): EvaluationConfiguration {
  return {
    schemaVersion: 1,
    dimensions: [],
    overall: null,
    alarms: [],
    alarmOperator: 'any',
    alarmLabel: 'Requiere revisión',
  }
}
export function validateBuilder(
  title: string,
  questions: DefinitionQuestion[],
  evaluation: EvaluationConfiguration,
): string[] {
  const errors: string[] = []
  if (!title.trim()) errors.push('Escribe el nombre del cuestionario.')
  questions.forEach((q, i) => {
    const prefix = `Pregunta ${i + 1}: `
    if (!q.text) errors.push(prefix + 'escribe el enunciado.')
    if (q.options.some((o) => !o.text))
      errors.push(prefix + 'completa todas las opciones.')
    if (
      q.options.some(
        (o) => o.score !== null && (!Number.isFinite(o.score) || o.score < 0),
      )
    )
      errors.push(
        prefix +
          'las puntuaciones deben ser números iguales o mayores que cero.',
      )
    if (
      q.scoring.mode === 'scored' &&
      q.options.length &&
      !q.options.some((o) => o.score !== null)
    )
      errors.push(prefix + 'asigna una puntuación al menos a una opción.')
    if (
      q.type === 'number' &&
      (!Number.isFinite(q.constraints.min) ||
        !Number.isFinite(q.constraints.max) ||
        q.constraints.min! >= q.constraints.max! ||
        (q.scoring.mode === 'scored' && q.constraints.min! < 0))
    )
      errors.push(prefix + 'revisa el mínimo y el máximo numéricos.')
    if (
      q.type === 'text' &&
      (!Number.isInteger(q.constraints.maxLength) ||
        q.constraints.maxLength! < 1 ||
        q.constraints.maxLength! > 5000)
    )
      errors.push(
        prefix + 'el límite de caracteres debe estar entre 1 y 5,000.',
      )
  })
  const scored = new Set(
    questions.filter((q) => q.scoring.mode === 'scored').map((q) => q._id),
  )
  const dimensions = [
    ...evaluation.dimensions,
    ...(evaluation.overall ? [evaluation.overall] : []),
  ]
  dimensions.forEach((d, i) => {
    const name = d.label.trim() || `Dimensión ${i + 1}`
    if (!d.label.trim()) errors.push(`${name}: escribe un nombre.`)
    if (!d.items.length)
      errors.push(
        `${name}: selecciona las preguntas que aportan a su calificación.`,
      )
    if (d.items.some((item) => !scored.has(item.questionId)))
      errors.push(`${name}: quita las preguntas eliminadas o informativas.`)
    if (
      d.method === 'weighted_mean' &&
      d.items.some((item) => !Number.isFinite(item.weight) || item.weight <= 0)
    )
      errors.push(`${name}: cada peso debe ser mayor que cero.`)
    if (
      !Number.isFinite(d.minimumAnsweredPercentage) ||
      d.minimumAnsweredPercentage < 0 ||
      d.minimumAnsweredPercentage > 100
    )
      errors.push(`${name}: la cobertura debe estar entre 0 y 100.`)
    if (
      d.interpretations.length &&
      d.interpretations.some(
        (band, j) =>
          band.min === '' ||
          !Number.isFinite(band.min) ||
          (j > 0 && Number(band.min) <= Number(d.interpretations[j - 1].min)),
      )
    )
      errors.push(
        `${name}: define límites crecientes para riesgo moderado y alto.`,
      )
  })
  evaluation.alarms.forEach((alarm) => {
    if (
      alarm.enabled &&
      (!alarm.risks.length ||
        !evaluation.dimensions.find((d) => d._id === alarm.dimensionId)
          ?.interpretations.length)
    )
      errors.push(
        'Cada alarma habilitada necesita rangos de riesgo y al menos un nivel seleccionado.',
      )
  })
  if (!evaluation.alarmLabel.trim())
    errors.push('Escribe la etiqueta de la alarma final.')
  return errors
}
