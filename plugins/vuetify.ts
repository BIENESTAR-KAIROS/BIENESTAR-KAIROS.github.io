import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import colors from "vuetify/util/colors";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    display: {
      mobileBreakpoint: "md",
    },
    theme: {
      defaultTheme: "kairos",
      themes: {
        kairos: {
          dark: false,
          colors: {
            background: colors.shades.transparent,
            primary: "#065C5D",
            secondary: "#8475A0",
            error: "#B00020",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FB8C00",
            nublue: "#1A75FF",
            nuLightBlue: "#EFF1FE",
            lightPurple: "#DED9FD",
            nyellow: "#FFB046",
            nyellowLight: "#FFEFDA",
            dark: "#1D163F",
            gray: "#989898",
            nkerror: "#FAD5DC",
            servicePanels: "#EFF1FE",
          },
        },
      },
    },
  });
  app.vueApp.use(vuetify);
});
