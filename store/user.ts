import type AuthRegisterDto from '~/interfaces/register/register.dto'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      registerUser: {} as AuthRegisterDto,
    }
  },
  actions: {
    async registerUser(user: AuthRegisterDto) {},
  },
})
