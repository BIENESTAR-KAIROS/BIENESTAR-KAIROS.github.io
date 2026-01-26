import { defineStore } from 'pinia'

import { type ILoginResponse } from '~/interfaces/login/login-response.interface'
import type { IUser } from '~/interfaces/user/user.interface'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      user: null as IUser | null,
      accessToken: '',
      isLoading: false,
      expiresAt: 0,
    }
  },
  actions: {
    async setAuth(session: ILoginResponse) {
      const nuxtApp = useNuxtApp()
      this.accessToken = session.accessToken
      this.user = session.user

      this.user.lastAccess = new Date(this.user.lastAccess || 0)
      this.expiresAt = new Date().getTime() + 1080000
      // Set new auth1
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
      window.localStorage.setItem(
        'auth',
        JSON.stringify({
          accessToken: this.accessToken,
          expiresAt: this.expiresAt,
          user: this.user,
        }),
      )

      // Set user profile
      //await this.getMyUser()
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

      const auth = localAuth
        ? JSON.parse(localAuth).accessToken
        : this.accessToken
      this.expiresAt = localAuth
        ? JSON.parse(localAuth).expiresAt
        : this.expiresAt

      if (auth) {
        const now = new Date().getTime()

        if (now < this.expiresAt) {
          this.accessToken = auth

          // Set axios auth header
          nuxtApp.$axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`
          this.getMyUser()
        } else {
          await this.clearAuth()
        }
      }
    },
    async getMyUser() {
      const nuxtApp = useNuxtApp()
      const localAuth = window.localStorage.getItem('auth')

      this.user = localAuth ? JSON.parse(localAuth).user : this.user

      if (!this.user?._id) {
        this.user!._id = this.user!.id
      }

      const user = await nuxtApp.$axios.get<IUser>(`/users/${this.user!._id}`)
      this.user = { ...this.user, ...user.data }
    },
  },
  getters: {
    isAuthenticated(): boolean {
      let response = false
      if (this.accessToken && this.user) {
        const now = new Date().getTime()

        return now < this.expiresAt
      }

      return response
    },
  },
})
