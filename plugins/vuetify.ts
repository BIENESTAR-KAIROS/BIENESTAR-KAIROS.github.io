import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'
import { VCalendar } from 'vuetify/labs/VCalendar'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: false,
    components: {
      ...components,
      VCalendar,
    },
    directives,
    display: {
      mobileBreakpoint: 'md',
    },
    theme: {
      defaultTheme: 'kairos',
      themes: {
        kairos: {
          dark: false,
          colors: {
            background: colors.shades.transparent,
            backgroundSecondary: '#F9F9F9',
            loginInput: '#DBF2F4',
            primary: '#6CC5CB',
            secondary: '#07979F',
            thirdy: '#8475A0',
            purpleShadow: '#CBADD8',
            greenShadow: '#065C5D',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})
