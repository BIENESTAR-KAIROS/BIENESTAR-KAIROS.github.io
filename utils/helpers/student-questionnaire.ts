import type {
  StudentAnswer,
  StudentAnswers,
  StudentDefinitionQuestion,
} from '../../interfaces/quizzes/student-questionnaire.interface'

export function hasStudentAnswer(answer: StudentAnswer | undefined): boolean {
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'number') return Number.isFinite(answer)
  return typeof answer === 'string' && answer.trim().length > 0
}

/** A matching answer only opens a question if every ancestor is visible too. */
export function visibleStudentQuestions(
  questions: StudentDefinitionQuestion[],
  answers: StudentAnswers,
): StudentDefinitionQuestion[] {
  const byId = new Map(questions.map((question) => [question._id, question]))
  const visibility = new Map<string, boolean>()
  const visiting = new Set<string>()
  function isVisible(question: StudentDefinitionQuestion): boolean {
    const cached = visibility.get(question._id)
    if (cached !== undefined) return cached
    if (visiting.has(question._id)) return false
    visiting.add(question._id)
    const condition = question.visibleWhen
    let visible = !condition
    if (condition?.operator === 'includesAny') {
      const parent = byId.get(condition.questionId)
      const answer = answers[condition.questionId]
      const selected = Array.isArray(answer) ? answer : [answer]
      visible = Boolean(
        parent &&
        isVisible(parent) &&
        condition.optionIds.some(
          (id) =>
            parent.options.some((option) => option._id === id) &&
            selected.includes(id),
        ),
      )
    }
    visiting.delete(question._id)
    visibility.set(question._id, visible)
    return visible
  }
  return questions.filter(isVisible).sort((a, b) => a.order - b.order)
}

/**
 * Hidden branches are discarded immediately, including all descendants.
 * Reopening a branch requires new answers; hidden values cannot enter a payload.
 * The future server evaluator must independently apply the same visibility rule.
 */
export function retainVisibleStudentAnswers(
  questions: StudentDefinitionQuestion[],
  answers: StudentAnswers,
): StudentAnswers {
  return Object.fromEntries(
    visibleStudentQuestions(questions, answers)
      .filter((question) => hasStudentAnswer(answers[question._id]))
      .map((question) => [question._id, answers[question._id]]),
  )
}

export function studentAnswerError(
  question: StudentDefinitionQuestion,
  answer: StudentAnswer | undefined,
): string | null {
  if (!hasStudentAnswer(answer))
    return question.required ? 'Responde esta pregunta para continuar.' : null
  const { constraints } = question
  if (question.type === 'single_choice') {
    return typeof answer === 'string' &&
      question.options.some((option) => option._id === answer)
      ? null
      : 'Selecciona una opción disponible.'
  }
  if (question.type === 'multiple_choice') {
    if (
      !Array.isArray(answer) ||
      new Set(answer).size !== answer.length ||
      answer.some((id) => !question.options.some((option) => option._id === id))
    )
      return 'Selecciona opciones disponibles.'
    if (
      constraints.maxSelections !== undefined &&
      answer.length > constraints.maxSelections
    )
      return `Elige hasta ${constraints.maxSelections} opciones.`
    return null
  }
  if (question.type === 'number') {
    if (typeof answer !== 'number' || !Number.isFinite(answer))
      return 'Escribe un número válido.'
    if (constraints.min !== undefined && answer < constraints.min)
      return `Escribe un número mayor o igual a ${constraints.min}.`
    if (constraints.max !== undefined && answer > constraints.max)
      return `Escribe un número menor o igual a ${constraints.max}.`
    return null
  }
  if (typeof answer !== 'string') return 'Revisa tu respuesta.'
  if (question.type === 'date') {
    const parsed = new Date(`${answer}T00:00:00Z`)
    return /^\d{4}-\d{2}-\d{2}$/.test(answer) &&
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === answer
      ? null
      : 'Escribe una fecha válida.'
  }
  if (
    constraints.maxLength !== undefined &&
    answer.length > constraints.maxLength
  )
    return `Usa hasta ${constraints.maxLength} caracteres.`
  return null
}
