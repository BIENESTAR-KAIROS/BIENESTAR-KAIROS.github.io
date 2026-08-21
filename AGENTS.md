# AGENTS.md — Bienestar KAIROS

Guía para agentes de IA (y humanos) que trabajen en este repositorio.

## Qué es este proyecto

Bienestar KAIROS es una aplicación web de bienestar/salud mental para
estudiantes universitarios. Permite a los usuarios responder cuestionarios
(quizzes) de tamizaje, ver recomendaciones personalizadas, acceder a
recursos (meditación guiada, libros, especialistas) y llevar seguimiento
("check-in") de su estado. Las instituciones (universidades) tienen un
panel propio para gestionar sus usuarios y ver estadísticas agregadas, y
existe un rol de administrador de KAIROS con su propio dashboard.

Roles de la app (ver `interfaces/user/enum/user-rol.enum.ts` y
`middleware/auth.global.ts`):
- `KAIROS_ADMIN` — administrador global (`/admin/*`).
- `INSTITUTION_ADMIN` / `INSTITUTION_STAFF` — panel institucional (`/institute/*`).
- Usuario final — panel de usuario (`/user/*`).

## Stack técnico

- **Framework**: Nuxt 3 (SSR deshabilitado, `ssr: false` — es una SPA).
- **UI**: Vuetify 3 + Sass (tema en `settings.scss`), iconos Material Design (`@mdi/font`).
- **Estado**: Pinia (`store/`: `app`, `auth`, `institute`, `quiz`, `user`).
- **HTTP**: Axios vía plugin propio (`plugins/axios.ts`), expone `$axios` y `$statsApi`
  (dos APIs backend distintas: la principal y la de estadísticas).
- **Gráficas**: Chart.js / vue-chartjs.
- **Mapas**: Leaflet (`@nuxtjs/leaflet`) con heatmap.
- **PWA**: `@vite-pwa/nuxt`.
- **Lenguaje**: TypeScript + Vue SFC (`<script setup lang="ts">`).
- **Lint/format**: ESLint (`@nuxt/eslint`, config Nuxt/TypeScript) + Prettier
  (sin punto y coma, comillas simples — ver `.prettierrc`).
- **Node**: versión `25.x` (ver `engines` en `package.json`).

## Estructura del repo

```
components/   Componentes Vue, organizados por área: global, institute, login,
              public, register, user (y subcarpetas por feature, p.ej.
              components/user/quiz, components/institute/my-stats).
pages/        Rutas de Nuxt, reflejan la navegación de la app: pages/user/*,
              pages/institute/*, pages/admin/*, más páginas públicas
              (index, register, forgot-password, chat).
layouts/      Layouts de Nuxt (default, empty, empty-login, institute).
store/        Pinia stores.
interfaces/   Tipos/contratos TypeScript, agrupados por dominio
              (user, login, quizzes, group, institute, stats, tracking, etc.).
dto/          DTOs de request/response hacia el backend.
middleware/   `auth.global.ts` controla el enrutamiento por rol y sesión —
              es el punto central de autorización de rutas.
plugins/      Plugins de Nuxt (axios, chart.js, sweetalert2, vuetify).
utils/        constants/ (enums de demografía, listas de navegación),
              helpers/ (reglas de formularios), translations/ (i18n manual
              de valores de enums, no un plugin i18n completo).
assets/       CSS global e imágenes.
public/       Estáticos servidos tal cual (imágenes de dashboard, favicon).
```

## Cómo correr el proyecto

```bash
npm install        # instalar dependencias (hay package-lock.json; usar npm, no yarn/pnpm)
npm run dev         # servidor de desarrollo en http://localhost:3000
npm run build        # build de producción
npm run generate     # build estático
npm run preview       # preview del build
```

> Nota: los scripts en `package.json` están escritos con `yarn` en la sección
> de docs/README, pero el repo tiene `package-lock.json`, no `yarn.lock` —
> usa `npm run <script>` para mantener el lockfile consistente.

Variables de entorno (`.env`, no versionado): `API_BASE_URL`,
`API_LOCAL_BASE_URL`, `API_STATS_BASE_URL`, `API_LOCAL_STATS_BASE_URL`,
`API_VERSION`, `PROD`, `NUXT_NEWS_API_KEY`, `GRAVATAR_API_KEY`,
`GRAVATAR_API`. El plugin de axios cambia entre base local/prod según
`process.env.PROD`.

## Lint y formato

```bash
npm run lint          # eslint + prettier --check
npm run lintfix         # prettier --write + eslint --fix
```

Ejecuta `npm run lint` antes de dar por terminada cualquier tarea que
modifique código. Respeta el estilo existente: sin punto y coma, comillas
simples, 2 espacios de indentación (`.editorconfig`, `.prettierrc`).

No hay suite de tests configurada en este repo (no hay script `test` ni
runner instalado) — no inventes comandos de test que no existan.

## Convenciones a seguir

- **Rutas y autorización**: cualquier página nueva bajo `/user`, `/institute`
  o `/admin` debe registrarse en las listas `authRoutes` /
  `unAuthRoutes` / `publicRoutes` de `middleware/auth.global.ts`, si no,
  quedará inaccesible o mal redirigida.
- **Tipos primero**: antes de consumir datos del backend, define/reutiliza
  interfaces en `interfaces/` y DTOs en `dto/`, en vez de usar `any`.
- **Stores por dominio**: la lógica de sesión vive en `store/auth.ts`; no
  dupliques estado de usuario/autenticación en componentes.
- **Dos APIs backend**: usa `$axios` para la API principal y `$statsApi`
  para el servicio de estadísticas (institución/dashboard) — no las mezcles.
- **Componentes**: sigue la carpeta por feature existente en `components/`
  en vez de crear una carpeta plana nueva.
- **Traducciones**: los textos de enums/valores fijos (género, campus,
  datos demográficos) se traducen manualmente en `utils/translations/`, no
  hay librería de i18n instalada — sigue ese mismo patrón si agregas
  nuevos enums traducibles.
- **Estilo de commits**: mensajes cortos en inglés, tipo Conventional
  Commits quando aplica (`feat:`, `fix:`, `refactor:`), como se ve en el
  historial reciente del repo.

## Precauciones

- Este proyecto es SPA (`ssr: false`); no asumas que el código corre en el
  servidor — el middleware de auth ya hace `if (!process.server)` a propósito.
- No commitees `.env` ni credenciales.
- Las carpetas `.nuxt/` (generada) no se editan a mano; se regenera con
  `npm run dev` / `npm run build`.
