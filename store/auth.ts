import { defineStore } from 'pinia'
import { useQuizStore } from './quiz'
import { useUserStore } from './user'

import type { ILoginResponse } from '~/interfaces/login/login-response.interface'
import type { IUser } from '~/interfaces/user/user.interface'
import type { IInstitute } from '~/interfaces/institute/institute.interface'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      user: null as IUser | null,
      accessToken: '',
      isLoading: false,
      expiresAt: 0,
      institutionContext: null as IInstitute | null,
      institutionContextError: '',
      institutionContextMode: 'institution' as
        | 'institution'
        | 'student-preview',
      isBlockedForInstitutes: ['69751025bc2e095ec7a37e00'],
    }
  },
  actions: {
    clearInstitutionContext() {
      if (this.institutionContext) {
        useQuizStore().$reset()
        useUserStore().$reset()
      }
      this.institutionContext = null
      this.institutionContextMode = 'institution'
      if (import.meta.client)
        window.sessionStorage.removeItem('kairos-institution-context')
    },
    async enterInstitution(
      id: string,
      mode: 'institution' | 'student-preview' = 'institution',
    ) {
      if (!this.user?.roles.includes(UserRolEnum.KAIROS_ADMIN)) {
        throw new Error('Esta opción requiere administración general.')
      }
      const actorId = this.user._id || this.user.id
      this.institutionContextError = ''
      const { $axios } = useNuxtApp()
      const { data } = await $axios.get<IInstitute | null>(
        `/institute/${encodeURIComponent(id)}`,
      )
      if (!data?._id || data._id !== id)
        throw new Error('No se encontró la institución.')
      if (actorId !== (this.user?._id || this.user?.id))
        throw new Error('La sesión cambió.')
      window.sessionStorage.setItem(
        'kairos-institution-context',
        JSON.stringify({ actorId, id, mode }),
      )
      useQuizStore().$reset()
      useUserStore().$reset()
      this.institutionContext = data
      this.institutionContextMode = mode
    },
    async restoreInstitutionContext() {
      if (this.institutionContext) return
      const saved = window.sessionStorage.getItem('kairos-institution-context')
      if (!saved) return
      try {
        const context: unknown = JSON.parse(saved)
        if (
          !context ||
          typeof context !== 'object' ||
          !('actorId' in context) ||
          !('id' in context) ||
          typeof context.id !== 'string' ||
          context.actorId !== (this.user?._id || this.user?.id)
        ) {
          this.clearInstitutionContext()
          return
        }
        await this.enterInstitution(
          context.id,
          'mode' in context && context.mode === 'student-preview'
            ? 'student-preview'
            : 'institution',
        )
      } catch {
        this.clearInstitutionContext()
        this.institutionContextError =
          'No pudimos recuperar la institución. Selecciónala de nuevo.'
      }
    },
    async setAuth(session: ILoginResponse) {
      this.clearInstitutionContext()
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
      this.clearInstitutionContext()
      this.institutionContextError = ''
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
          await this.getMyUser()
        } else {
          await this.clearAuth()
        }
      }
    },
    async getMyUser() {
      const nuxtApp = useNuxtApp()
      const localAuth = window.localStorage.getItem('auth')

      this.user = localAuth ? JSON.parse(localAuth).user : this.user

      if (this.user && !this.user._id) {
        this.user!._id = this.user!.id
      }

      const user = await nuxtApp.$axios.get<IUser>(`/auth/profile`)
      this.user = { ...this.user, ...user.data }
      if (!this.user.roles.includes(UserRolEnum.KAIROS_ADMIN))
        this.clearInstitutionContext()
    },
  },
  getters: {
    activeInstitute(): IInstitute | undefined {
      return this.user?.roles.includes(UserRolEnum.KAIROS_ADMIN)
        ? (this.institutionContext ?? undefined)
        : this.user?.institute
    },
    isInstitutionContext(): boolean {
      return Boolean(
        this.user?.roles.includes(UserRolEnum.KAIROS_ADMIN) &&
        this.institutionContext &&
        this.institutionContextMode === 'institution',
      )
    },
    isStudentPreview(): boolean {
      return Boolean(
        this.user?.roles.includes(UserRolEnum.KAIROS_ADMIN) &&
        this.institutionContext &&
        this.institutionContextMode === 'student-preview',
      )
    },
    isAuthenticated(): boolean {
      const response = false
      if (this.accessToken && this.user) {
        const now = new Date().getTime()

        return now < this.expiresAt
      }

      return response
    },
  },
})
