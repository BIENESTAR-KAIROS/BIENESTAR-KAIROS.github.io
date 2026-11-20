import type {
  StudentAnswer,
  StudentAnswers,
  StudentQuestionnaireDefinition,
} from '../../interfaces/quizzes/student-questionnaire.interface'
import { retainVisibleStudentAnswers } from './student-questionnaire'

const prefix = 'kairos:questionnaire-draft:'
const draftKey = (studentId: string, definitionId: string) =>
  `${prefix}${studentId}:${definitionId}`

function isAnswer(value: unknown): value is StudentAnswer {
  return (
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) && value.every((item) => typeof item === 'string'))
  )
}

export function readQuestionnaireDraft(
  studentId: string,
  definition: StudentQuestionnaireDefinition,
): { answers: StudentAnswers; currentId: string } | undefined {
  try {
    const key = draftKey(studentId, definition._id)
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return
    const draft = JSON.parse(raw)
    if (
      draft?.revision !== definition.revision ||
      draft?.attemptId !== definition.attemptId ||
      typeof draft?.currentId !== 'string' ||
      !draft.answers ||
      typeof draft.answers !== 'object' ||
      Array.isArray(draft.answers) ||
      !Object.values(draft.answers).every(isAnswer)
    ) {
      window.sessionStorage.removeItem(key)
      return
    }
    return {
      currentId: draft.currentId,
      answers: retainVisibleStudentAnswers(definition.questions, draft.answers),
    }
  } catch {
    // The questionnaire also works when tab storage is unavailable.
  }
}

export function writeQuestionnaireDraft(
  studentId: string,
  definition: StudentQuestionnaireDefinition,
  answers: StudentAnswers,
  currentId: string,
) {
  try {
    window.sessionStorage.setItem(
      draftKey(studentId, definition._id),
      JSON.stringify({
        revision: definition.revision,
        attemptId: definition.attemptId,
        currentId,
        answers,
      }),
    )
  } catch {
    // Keep the in-memory answers available for submission.
  }
}

export function removeQuestionnaireDraft(
  studentId: string,
  definitionId: string,
) {
  try {
    window.sessionStorage.removeItem(draftKey(studentId, definitionId))
  } catch {
    // An unavailable storage area also cannot be read.
  }
}

export function clearQuestionnaireDrafts(keepStudentId?: string) {
  try {
    const storage = window.sessionStorage
    for (const key of Object.keys(storage)) {
      if (
        key.startsWith(prefix) &&
        !(keepStudentId && key.startsWith(`${prefix}${keepStudentId}:`))
      )
        storage.removeItem(key)
    }
  } catch {
    // Storage restrictions must not interrupt sign-in or sign-out.
  }
}
