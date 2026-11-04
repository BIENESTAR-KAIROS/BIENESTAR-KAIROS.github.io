import axios from 'axios'
import { useAuthStore } from '~/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const api = axios.create({
    baseURL: nuxtApp.$config.public.apiBase + nuxtApp.$config.public.apiVersion,
  })

  api.interceptors.request.use((config) => {
    const auth = useAuthStore()
    const studentPreview =
      auth.isStudentPreview &&
      nuxtApp.$router.currentRoute.value.path.startsWith('/user/')
    if (
      studentPreview &&
      config.url !== '/auth/logout' &&
      !['get', 'head', 'options'].includes(
        (config.method || 'get').toLowerCase(),
      )
    ) {
      throw new Error(
        'La vista de alumno es de solo exploración. No se guardan cambios.',
      )
    }
    delete config.headers['X-Kairos-View']
    delete config.headers['x-kairos-view']
    // Scope institutional calls without changing the signed-in account or its membership.
    if (
      ((nuxtApp.$router.currentRoute.value.path.startsWith('/institute/') &&
        auth.isInstitutionContext) ||
        studentPreview) &&
      !config.url?.startsWith('/auth/')
    ) {
      config.headers['X-Kairos-Institution'] = auth.institutionContext!._id
      if (studentPreview) config.headers['X-Kairos-View'] = 'student-preview'
    } else {
      delete config.headers['X-Kairos-Institution']
      delete config.headers['x-kairos-institution']
    }
    if (process.env.PROD) {
      config.baseURL =
        nuxtApp.$config.public.apiBase + nuxtApp.$config.public.apiVersion
    } else {
      config.baseURL =
        nuxtApp.$config.public.apiLocalBase + nuxtApp.$config.public.apiVersion
    }
    return config
  })

  const statsApi = axios.create({
    baseURL: nuxtApp.$config.public.apiStatsBase,
  })

  statsApi.interceptors.request.use((config) => {
    // Keep the legacy statistics routes on their existing service during migration.
    // Only these exact relative paths may carry the session bearer to Gowther.
    if (
      config.url === '/v1/session' ||
      config.url === '/v1/statistics/periods'
    ) {
      const auth = useAuthStore()
      if (
        !auth.isAuthenticated ||
        auth.isStudentPreview ||
        !nuxtApp.$router.currentRoute.value.path.startsWith('/institute/')
      )
        throw new Error('La sesión institucional no está disponible.')
      const base = import.meta.dev
        ? nuxtApp.$config.public.gowtherLocalBase
        : nuxtApp.$config.public.gowtherBase
      let target: URL
      try {
        target = new URL(base)
      } catch {
        throw new Error('El servicio de períodos no está configurado.')
      }
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(
        target.hostname,
      )
      if (
        target.username ||
        target.password ||
        target.search ||
        target.hash ||
        target.pathname !== '/' ||
        (target.protocol !== 'https:' &&
          !(import.meta.dev && local && target.protocol === 'http:'))
      )
        throw new Error(
          'El servicio de períodos no está configurado correctamente.',
        )
      config.baseURL = target.origin
      config.timeout = 15000
      config.withCredentials = false
      config.headers.set('Authorization', `Bearer ${auth.accessToken}`)
      config.headers.delete('X-Gowther-Service-Token')
      config.headers.delete('X-Kairos-Institution')
      config.headers.delete('X-Kairos-View')
      if (auth.isInstitutionContext)
        config.headers.set('X-Kairos-Institution', auth.institutionContext!._id)
      return config
    }

    if (process.env.PROD) {
      config.baseURL = nuxtApp.$config.public.apiStatsBase
    } else {
      config.baseURL = nuxtApp.$config.public.apiLocalStatsBase
    }
    return config
  })

  return {
    provide: {
      axios: api,
      statsApi: statsApi,
    },
  }
})
