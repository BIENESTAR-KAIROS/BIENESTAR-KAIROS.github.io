import { defineStore } from 'pinia'
import type { UserRegisterRequestDto } from '~/dto/request/user/user-register.request.dto'
import type { StudentDataRequestDto } from '~/dto/request/user/user-student-data.request.dto'
import type { ILoginResponse } from '~/interfaces/login/login-response.interface'
import type AuthRegisterDto from '~/interfaces/register/register.dto'
import type {
  IQuestionnaireQueueReponse,
  IUser,
  IUserQuestionnaireQueue,
} from '~/interfaces/user/user.interface'
import { translateGender } from '~/utils/constants/translations'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      registerUser: {} as AuthRegisterDto,
      user: null as IUser | null,
      lastQuizId: null as string | null,
    }
  },
  actions: {
    async registerUser(user: UserRegisterRequestDto): Promise<ILoginResponse> {
      const nuxtApp = useNuxtApp()

      user.studentData = {
        ...user.studentData,
        gender: translateGender(user.studentData!.gender!.toString()),
      }

      let message = ''
      const response = await nuxtApp.$axios
        .post<{
          user: IUser
          accessToken: string
          message?: string
          statusCode?: number
        }>('/user', user)
        .catch((error) => {
          if (error.response.data.statusCode == 409)
            message = `El correo electrónico ya está registrado`
          else
            message = `Error al registrar el usuario: ${error.response.data.message}`
        })

      this.user = response?.data.user || null

      return {
        user: response?.data.user || ({} as IUser),
        accessToken: response?.data.accessToken || '',
        message: message || 'Usuario registrado correctamente',
      }
    },
    async updateUserStudentData(
      id: string,
      userCampusInfo: StudentDataRequestDto,
    ): Promise<{ user: IUser; passed: boolean }> {
      const nuxtApp = useNuxtApp()

      const payload = { studentData: userCampusInfo }

      if (payload.studentData.demographicData) {
        this.user!.studentData!.demographicSurveyCompleted = true
      }

      const response = await nuxtApp.$axios.patch<{
        user: IUser
        message?: string
      }>(`/user/${id}/student-data`, payload)

      let passed = true

      if (response.status !== 200) {
        alert(
          `Error al actualizar la información del campus: ${response.data.message}`,
        )
        passed = false
      }

      return { user: response.data.user, passed }
    },
    async getUserQuestionnaireQueue(): Promise<IUserQuestionnaireQueue | null> {
      const sortQueue = (
        questionnaireQueue: IUserQuestionnaireQueue,
      ): IUserQuestionnaireQueue => {
        if (!questionnaireQueue[0].solved) {
          questionnaireQueue = {
            queue: questionnaireQueue.map((item) => ({
              ...item,
              solved: item.solved || false, // Asegura que 'solved' esté presente y sea un booleano
            })),
          }
        }

        return {
          queue: questionnaireQueue.queue.sort((a, b) => a.order - b.order),
        }
      }

      const nuxtApp = useNuxtApp()
      const response = await nuxtApp.$axios.get<IQuestionnaireQueueReponse>(
        `/institute-setting/institute/${this.user!.institute!._id}`,
      )
      if (response.status != 200) {
        alert(`Error al obtener la cola de cuestionarios: ${response}`)
        return null
      }

      if (!response.data.isActive) {
        console.log('La cola de cuestionarios no está activa')
        return null
      }

      if (this.user!.questionnaireQueue) {
        return this.user!.questionnaireQueue
      }

      const sortedQueue = sortQueue(response.data.queue)

      this.user!.questionnaireQueue = sortedQueue

      return sortedQueue
    },
  },
})
