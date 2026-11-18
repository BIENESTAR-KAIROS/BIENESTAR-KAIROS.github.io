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
  const questionnaire =
    flow.questionnaires.find(
      (q) => q.questionnaireId === id && (q.canPreview || !q.solved),
    ) ?? null
  return { redirectTo: null, questionnaire }
}
