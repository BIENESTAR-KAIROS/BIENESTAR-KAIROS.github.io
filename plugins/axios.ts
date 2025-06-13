import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const api = axios.create({
    baseURL: nuxtApp.$config.public.apiBase + nuxtApp.$config.public.apiVersion,
  })

  api.interceptors.request.use((config) => {
    if (process.env.PROD) {
      config.baseURL =
        nuxtApp.$config.public.apiBase + nuxtApp.$config.public.apiVersion
    } else {
      config.baseURL =
        nuxtApp.$config.public.apiLocalBase + nuxtApp.$config.public.apiVersion
    }
    return config
  })

  return {
    provide: {
      axios: api,
    },
  }
})
