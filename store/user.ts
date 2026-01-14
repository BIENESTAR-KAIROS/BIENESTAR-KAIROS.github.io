import type { UserRegisterRequestDto } from '~/dto/request/user/user-register.request.dto'
import type { StudentDataRequestDto } from '~/dto/request/user/user-student-data.request.dto'
import type { ILoginResponse } from '~/interfaces/login/login-response.interface'
import type AuthRegisterDto from '~/interfaces/register/register.dto'
import type { IUser } from '~/interfaces/user/user.interface'
import { translateGender } from '~/utils/constants/translations'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      registerUser: {} as AuthRegisterDto,
      user: null as IUser | null,
    }
  },
  actions: {
    async registerUser(user: UserRegisterRequestDto): Promise<ILoginResponse> {
      const nuxtApp = useNuxtApp()

      user.studentData = {
        ...user.studentData,
        gender: translateGender(user.studentData!.gender!.toString()),
      }

      const response = await nuxtApp.$axios.post<{
        user: IUser
        accessToken: string
        message?: string
      }>('/user', user)

      if (response.status != 201) {
        alert(`Error al registrar el usuario: ${response.data.message}`)
        console.log(response.data)
      }

      this.user = response.data.user

      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
        message: 'Usuario registrado correctamente',
      }
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

      let passed = true
      console.log(response)

      if (response.status !== 200) {
        alert(
          `Error al actualizar la información del campus: ${response.data.message}`,
        )
        console.log(response.data)
        passed = false
      }
      console.log(response.data)

      return { user: response.data.user, passed }
    },
  },
})
