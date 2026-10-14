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
