import { defineStore } from 'pinia'

import { type ILoginResponse } from '~/interfaces/login/login-response.interface'
import { type IUser } from '~/interfaces/users/user.interface'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      user: null as IUser | null,
      accessToken: '',
      isLoading: false,
    }
  },
  actions: {
    async setAuth(accessToken: string) {
      const nuxtApp = useNuxtApp()

      // Set new auth
      /*
      const expiresAtInMs = auth.expiresIn * 1000
      this.auth = {
        idToken: auth.idToken,
        refreshToken: auth.refreshToken,
        expiresAt: expiresAtInMs,
      }*/

      // Set axios auth header
      nuxtApp.$axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`

      // Set auth on local storage
      window.localStorage.setItem('auth', JSON.stringify(this.accessToken))

      // Set user profile
      await this.getMyUser()
    },
    clearAuth() {
      const nuxtApp = useNuxtApp()

      this.accessToken = ''

      // Clear axios auth header
      nuxtApp.$axios.defaults.headers.common.Authorization = ''

      // Clear auth on local storage
      window.localStorage.removeItem('auth')

      // Clear user profile
      this.user = null
    },
    async refreshAuth() {
      const nuxtApp = useNuxtApp()
      const localAuth = window.localStorage.getItem('auth')
      const auth: string = localAuth ? localAuth : this.accessToken

      if (auth) {
        const now = new Date().getMilliseconds()

        if (this.user) {
          if (now < this.user.lastAccess.getMilliseconds() + 18000) {
            this.accessToken = auth

            // Set axios auth header
            nuxtApp.$axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`
          } else {
            await this.clearAuth()
          }
        }
      }
    },
    async getMyUser() {
      const nuxtApp = useNuxtApp()

      const user = await nuxtApp.$axios.get<IUser>(`/users/${this.user?.id}`)
      this.user = user.data
    },
  },
  getters: {
    isAuthenticated(): boolean {
      let response = false

      if (this.accessToken && this.user) {
        const now = new Date().getTime()
        return now < this.user.lastAccess.getMilliseconds() + 18000
      }

      return response
    },
  },
})
