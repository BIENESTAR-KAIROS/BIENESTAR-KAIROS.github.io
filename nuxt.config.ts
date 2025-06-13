import { resolvePath } from 'nuxt/kit'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    app: {
      newsApiKey: process.env.NUXT_NEWS_API_KEY,
    },
    public: {
      apiBase: `${process.env.API_BASE_URL}`,
      apiLocalBase: `${process.env.API_LOCAL_BASE_URL}`,
      apiVersion: `${process.env.API_VERSION}`,
    },
  },

  app: {
    head: {
      title: 'Bienestar KAIROS',
      htmlAttrs: {
        lang: 'es',
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      charset: 'utf-16',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    },
  },

  typescript: {
    shim: false,
  },

  ssr: true,
  compatibilityDate: '2025-03-25',
  devtools: { enabled: true },

  css: [
    'assets/css/main.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],

  build: {
    transpile: ['vuetify'],
  },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  hooks: {
    'vite:extendConfig': async (config) => {
      config?.plugins?.push(
        vuetify({
          styles: { configFile: await resolvePath('./settings.scss') },
        }),
      )
    },
  },
})
