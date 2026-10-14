import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { StudentQuestionnaireFlow } from '~/interfaces/quizzes/student-questionnaire-flow.interface'
import type { UserRegisterRequestDto } from '~/dto/request/user/user-register.request.dto'
import type { StudentDataRequestDto } from '~/dto/request/user/user-student-data.request.dto'
import type { RegistrationResponse } from '~/interfaces/register/registration-response.interface'
import type {
  IUser,
  IUserQuestionnaireQueue,
} from '~/interfaces/user/user.interface'
import type {
  IDemographicHistory,
  IDemographicSurveyAvailability,
} from '~/interfaces/user/demographic-history.interface'
import { translateGender } from '~/utils/constants/translations'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null as IUser | null,
      lastQuizId: null as string | null,
      questionnaireFlow: null as StudentQuestionnaireFlow | null,
    }
  },
  actions: {
    async registerUser(
      user: UserRegisterRequestDto,
    ): Promise<RegistrationResponse> {
      const nuxtApp = useNuxtApp()

      const payload: UserRegisterRequestDto = {
        ...user,
        email: user.email.trim().toLowerCase(),
        studentData: user.studentData
          ? {
              age: user.studentData.age,
              gender: translateGender(user.studentData.gender!.toString()),
            }
          : undefined,
      }
      const { data } = await nuxtApp.$axios.post<RegistrationResponse>(
        '/user',
        payload,
      )
      return data
    },
    async updateUserStudentData(
      id: string,
      userCampusInfo: StudentDataRequestDto,
    ): Promise<{ user: IUser; passed: boolean }> {
      const nuxtApp = useNuxtApp()

      const payload = { studentData: userCampusInfo }

      const response = await nuxtApp.$axios.patch<{
        user: IUser
        message?: string
      }>(`/user/${id}/student-data`, payload)

      if (payload.studentData.demographicData && this.user?.studentData) {
        this.user.studentData.demographicSurveyCompleted = true
      }

      let passed = true

      if (response.status !== 200) {
        alert(
          `Error al actualizar la información del campus: ${response.data.message}`,
        )
        passed = false
      }

      return { user: response.data.user, passed }
    },
    async loadQuestionnaireFlow(): Promise<StudentQuestionnaireFlow> {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('No hay una sesión activa.')
      const userId = auth.user._id
      const contextId = auth.institutionContext?._id
      const contextMode = auth.institutionContextMode
      this.questionnaireFlow = null
      const { data } = await useNuxtApp().$axios.get<StudentQuestionnaireFlow>(
        '/questionnaire/student-flow',
      )
      // An old response must not be reused after a change of account.
      if (
        auth.user?._id !== userId ||
        auth.institutionContext?._id !== contextId ||
        auth.institutionContextMode !== contextMode
      )
        throw new Error('La sesión cambió. Vuelve a intentarlo.')
      this.questionnaireFlow = data
      this.user = { ...auth.user }
      this.user.questionnaireQueue = { queue: data.isActive ? data.queue : [] }
      return data
    },
    async getUserQuestionnaireQueue(): Promise<IUserQuestionnaireQueue | null> {
      const flow = await this.loadQuestionnaireFlow()
      return flow.isActive ? { queue: flow.queue } : null
    },
    async getDemographicHistory(): Promise<IDemographicHistory> {
      const nuxtApp = useNuxtApp()

      const response = await nuxtApp.$axios.get<IDemographicHistory>(
        '/demographic-history/me',
      )

      return response.data
    },
    async getDemographicSurveyAvailability(): Promise<IDemographicSurveyAvailability> {
      const nuxtApp = useNuxtApp()

      const response = await nuxtApp.$axios.get<IDemographicSurveyAvailability>(
        '/demographic-history/me/availability',
      )

      return response.data
    },
  },
})
