import type {
  StudentQuestionnaireFlow,
  StudentQuestionnaireItem,
} from '~/interfaces/quizzes/student-questionnaire-flow.interface'

export function resolveStudentQuestionnaireRoute(
  flow: StudentQuestionnaireFlow,
  id: string,
): {
  redirectTo: string | null
  questionnaire: StudentQuestionnaireItem | null
} {
  if (flow.isActive && flow.nextQuestionnaireId !== id) {
    return {
      redirectTo: flow.nextQuestionnaireId
        ? `/user/quiz/${flow.nextQuestionnaireId}`
        : '/user/quiz',
      questionnaire: null,
    }
  }
  const questionnaire =
    (flow.isActive ? flow.queue : flow.questionnaires).find(
      (q) => q.questionnaireId === id && !q.solved,
    ) ?? null
  return { redirectTo: null, questionnaire }
}
