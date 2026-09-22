# Auditoría de procedencia visual — Bienestar KAIROS

Fecha de corte: 22 de septiembre de 2026. Ventana inclusiva: 8 de agosto–22 de septiembre de 2026 (45 días transcurridos). HEAD local: `fba7b52`; commit previo a la ventana: `ba2717f` (17-jun-2026). Auditoría de código e historial local, sin validación de despliegue ni sesión de navegador.

## Hallazgos y criterio

- Hay 10 commits en la ventana. La actividad real renovadora abarca 18-ago–07-sep; no hay commits locales del 08–22-sep.
- Inventario completo: 95 archivos Vue = 56 componentes + 35 páginas + 4 layouts. 54 fueron modificados: 45 componentes + 8 páginas + 1 layout. Hay 73 archivos cambiados en total.
- 49 SFC tienen cambio visual directo y 5 cambios de composición/wrappers. No se clasificó como nuevo un estilo solo por estar en archivo tocado.
- Rutas según la UI que componen: 18 renovadas, 1 mixta y 16 heredadas/incompletas. La clasificación no equivale a disponibilidad de la URL (hay middleware de sesión).
- Tema global Vuetify y settings.scss son anteriores al periodo. Algunos colores sobreviven porque son usados explícitamente en componentes nuevos; eso sí los hace evidencia actual por contexto de uso. Los tokens antiguos no usados no se deben convertir en canon.
- assets/css/main.css cambió principalmente comillas/formato; la novedad semántica es importar Figtree, línea 1. Catamaran, Handlee, Yantramanav, PT Sans Caption y fondos ilustrados globales son heredados.
- Ningún archivo de public/ ni assets/images/ cambió en esta ventana. El logo blanco y ciertas ilustraciones se reutilizan desde componentes nuevos; registrar como activos vigentes reutilizados, no como rediseño de logotipo.
- La estética nueva está implementada sobre todo en CSS scoped y a veces elementos HTML nativos; nombres de tema Vuetify como primary/thirdy no expresan de forma suficiente todos los roles visuales nuevos.
- El dashboard institucional ya NO usa los tres gráficos antiguos de su directorio. No asumir que todo archivo ubicado bajo feature renovada sigue activo.
- user-detail sigue montando CalendarRecomendations institucional antiguo. No confundirlo con components/user/recomendations/calendar-recomendations.vue, renovado el 21-ago.

## Reglas de clasificación

1. **Renovación visual directa:** el diff dentro de la ventana añade/cambia layout, color, tipografía, radio, estado visual o composición significativa de controles. Se revisó el bloque CSS/template frente a `ba2717f`; no basta la fecha del archivo.
2. **Wrapper de UI renovada:** la página o componente delega su aspecto a descendientes actualizados, sin introducir sistema visual propio. Se clasifica la ruta por el descendiente efectivo.
3. **Mixta:** contenedor con CSS nuevo que monta al menos un subcomponente visual fuera de ventana; documentar y excluir esa excepción del canon.
4. **Heredado:** sin renovación visual semántica en ventana. Los placeholders cuentan como incompletos aunque estén dentro del layout nuevo.
5. **Soporte no visual:** composables, DTO, tipos, stores, traducciones, lockfile y documentación; no prueban por sí solos un cambio de diseño.
6. **Activo heredado reutilizado:** logo o ilustración antiguo utilizado en una composición nueva; se admite el uso documentado y no se afirma que el activo fue rediseñado.
7. **Precaución con blame:** cambios de comillas pueden asignar una línea antigua al commit reciente. Ejemplo: `assets/css/main.css:11` tiene blame de ff1dee2, pero el diff acredita solo comillas del mismo background-image. Misma situación en Catamaran :17.

## Commits de renovación

| Fecha       | Commit  | Referencias visuales verificadas                                                    |
| ----------- | ------- | ----------------------------------------------------------------------------------- |
| 18-ago-2026 | ff1dee2 | AuthShell, LoginForm, register, forgot-password; introducción de Figtree            |
| 19-ago-2026 | 563a7b3 | Navegación del usuario, dashboard y 5 tarjetas; topbar móvil                        |
| 21-ago-2026 | 19524c4 | Ayuda y sus pestañas, recomendaciones, libros, noticias y calendario del usuario    |
| 21-ago-2026 | 2955dc1 | Perfil, historial, privacidad                                                       |
| 25-ago-2026 | ea6c815 | DemographicSurvey (nuevo componente), página extraída a wrapper                     |
| 25-ago-2026 | fe5cbbc | Cuestionarios disponibles, preguntas, navegación, marco de quiz y loaders de página |
| 03-sep-2026 | cefbe8a | Navegación y dashboard institucional, fondo del layout                              |
| 03-sep-2026 | 864befa | Listado de usuarios y detalle institucional (con modal heredado)                    |
| 04-sep-2026 | 5a9ac8b | Estadísticas institucionales, filtros, mapas, resumen, distribuciones y estados     |
| 07-sep-2026 | fba7b52 | Catálogo de cuestionarios institucionales y QuizCard                                |

## Evidencia de líneas

- `assets/css/main.css:1`: Figtree añadido el 18-ago; resto de familias preexistentes.
- `components/global/AuthShell.vue:44`: inicio CSS renovado; fondo rgb(231,236,238) en :48, Figtree :52, panel verde :71.
- `components/global/AppBarUser.vue:258`: CSS renovado; verde #065c5d :260, Figtree :270. Logo reutilizado :71; texto Kairos/bienestar mental :74–75.
- `components/global/NavBarUser.vue:13`: topbar móvil cambia elevation 4→0, fondo greenShadow→#065C5D, logo 60→40; radios inferiores 24px :38–39.
- `components/global/AppBarInstitute.vue:185`: CSS renovado; fondo #3c2f52 :187 y Figtree :197.
- `layouts/institute.vue:16`: fondo #f5f4f8 añadido.
- `components/institute/dashboard/dashboard-institute.vue:125`: CSS renovado; fondo :128, Figtree :129, header blanco :134, tarjeta radio 20px :202.
- `components/user/dashboard/dashboard.vue:233`: CSS renovado; Figtree :235, fondo #f4f8f9 :237.
- `components/user/get-help/get-help.vue:52`: CSS renovado; Figtree :54, fondo #f4f8f9 :56.
- `components/user/recomendations/recomendations.vue:57`: CSS renovado; Figtree :59, fondo #f4f8f9 :61, píldora activa #065c5d :125.
- `components/institute/my-users/user-detail.vue:666`: CSS renovado; fondo #f5f4f8 :669, Figtree :674, botón principal #8475a0 :825. Excepción heredada montada :608.

## Todas las rutas (35)

| Archivo de página                             | Estado efectivo       | Motivo                                                                                                                                                          |
| --------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/admin/dashboard/index.vue`             | Heredada / incompleta | Placeholder «hello admin»; no hay diseño admin válido para extrapolar                                                                                           |
| `pages/auth/reset-password.vue`               | Heredada / incompleta | Formulario de restablecimiento antiguo; distinto del forgot-password renovado                                                                                   |
| `pages/chat.vue`                              | Heredada / incompleta | Chat antiguo (último cambio 17-jun); excluir como patrón                                                                                                        |
| `pages/forgot-password.vue`                   | Renovada              | AuthShell + formulario renovado (ff1dee2)                                                                                                                       |
| `pages/index.vue`                             | Renovada              | Wrapper sin cambios; LoginPage/AuthShell/LoginForm renovados (ff1dee2)                                                                                          |
| `pages/institute/dashboard.vue`               | Renovada              | Contenedor + dashboard-institute renovados (cefbe8a)                                                                                                            |
| `pages/institute/login.vue`                   | Renovada              | Wrapper sin cambios; LoginPage/AuthShell/LoginForm renovados (ff1dee2)                                                                                          |
| `pages/institute/my-users/[userId].vue`       | Mixta                 | Contenedor user-detail renovado (864befa), pero CalendarRecomendations institucional (30-abr) se sigue montando en user-detail:608; excluir ese modal del canon |
| `pages/institute/my-users/clinic-history.vue` | Heredada / incompleta | ClinicHistory + UserResults/TherapyNotes antiguos                                                                                                               |
| `pages/institute/my-users/index.vue`          | Renovada              | Wrapper sin cambios; my-users-dashboard renovado (864befa)                                                                                                      |
| `pages/institute/quizzes/add-quiz.vue`        | Heredada / incompleta | AddQuizComp antiguo; listado renovado no renueva este formulario                                                                                                |
| `pages/institute/quizzes/index.vue`           | Renovada              | Wrapper sin cambios; my-quizzes + quiz-card renovados (fba7b52)                                                                                                 |
| `pages/institute/stats.client.vue`            | Renovada              | Wrapper sin cambios; módulo my-stats y ocho subcomponentes renovados (5a9ac8b)                                                                                  |
| `pages/register.vue`                          | Renovada              | Wrapper sin cambios; register/AuthShell renovados (ff1dee2)                                                                                                     |
| `pages/user/dashboard/index.vue`              | Renovada              | Wrapper simplificado; dashboard y cinco tarjetas nuevos (563a7b3)                                                                                               |
| `pages/user/get-help/index.vue`               | Renovada              | Wrapper sin cambios; get-help y sus tres pestañas renovados (19524c4)                                                                                           |
| `pages/user/guided-maditation/index.vue`      | Heredada / incompleta | Placeholder; la meditación renovada vive dentro de /user/get-help                                                                                               |
| `pages/user/history/index.vue`                | Renovada              | Wrapper extraído; history nuevo (2955dc1)                                                                                                                       |
| `pages/user/login/index.vue`                  | Renovada              | Wrapper sin cambios; LoginPage/AuthShell/LoginForm renovados (ff1dee2); accesibilidad de esta URL no validada en navegador                                      |
| `pages/user/meet-specialist/index.vue`        | Heredada / incompleta | Placeholder; especialistas renovados viven dentro de /user/get-help                                                                                             |
| `pages/user/news/index.vue`                   | Heredada / incompleta | Placeholder; noticias renovadas viven dentro de /user/recomendations                                                                                            |
| `pages/user/privacy-policy/index.vue`         | Renovada              | Wrapper extraído; privacy-policy nuevo (2955dc1)                                                                                                                |
| `pages/user/profile/index.vue`                | Renovada              | Wrapper sin cambios; profile renovado (2955dc1)                                                                                                                 |
| `pages/user/quiz/[id].vue`                    | Renovada              | Loader nuevo + quiz/question/quiz-navigation renovados (fe5cbbc)                                                                                                |
| `pages/user/quiz/demographic.vue`             | Renovada              | Wrapper extraído; demographic-survey nuevo (ea6c815)                                                                                                            |
| `pages/user/quiz/finish-quizz.vue`            | Heredada / incompleta | FinishQuiz antiguo (03-abr), aunque el flujo de responder esté renovado                                                                                         |
| `pages/user/quiz/index.vue`                   | Renovada              | Loader nuevo + posible-quizzes renovado (fe5cbbc)                                                                                                               |
| `pages/user/quiz/results.vue`                 | Heredada / incompleta | Placeholder; no convertirlo en referencia                                                                                                                       |
| `pages/user/quizzes/index.vue`                | Heredada / incompleta | Placeholder; distinto de /user/quiz renovado                                                                                                                    |
| `pages/user/recomendations/index.vue`         | Renovada              | Wrapper sin cambios; recomendaciones/calendario/libros/noticias renovados (19524c4)                                                                             |
| `pages/user/recomended-books/index.vue`       | Heredada / incompleta | Placeholder; libros renovados viven dentro de /user/recomendations                                                                                              |
| `pages/user/register/campus-info.vue`         | Heredada / incompleta | Formulario universitario antiguo (06-abr)                                                                                                                       |
| `pages/user/update-my-data/index.vue`         | Heredada / incompleta | Placeholder                                                                                                                                                     |
| `pages/user/verification.vue`                 | Heredada / incompleta | Pantalla/proceso de verificación antiguo (24-mar)                                                                                                               |
| `pages/user/wellnes-practices/index.vue`      | Heredada / incompleta | Placeholder; prácticas renovadas viven dentro de /user/get-help                                                                                                 |

## Todos los componentes (56)

| Archivo                                                                     | Estado                 | Último commit      | Evidencia / alcance                                                                   |
| --------------------------------------------------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `components/global/AppBarInstitute.vue`                                     | Renovación visual      | cefbe8a 2026-09-03 | CSS directo desde línea 185                                                           |
| `components/global/AppBarUser.vue`                                          | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 258                                                           |
| `components/global/AuthShell.vue`                                           | Renovación visual      | ff1dee2 2026-08-18 | CSS directo desde línea 44                                                            |
| `components/global/NavBarInstitue.vue`                                      | Renovación visual      | cefbe8a 2026-09-03 | CSS directo desde línea 36                                                            |
| `components/global/NavBarUser.vue`                                          | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 36                                                            |
| `components/institute/dashboard/daily-answer-volume.vue`                    | Heredado               | a6685e0 2025-05-31 | No se encontró uso actual en pages/components; eliminado del dashboard renovado       |
| `components/institute/dashboard/dashboard-institute.vue`                    | Renovación visual      | cefbe8a 2026-09-03 | CSS directo desde línea 125                                                           |
| `components/institute/dashboard/resolved-quizzes.vue`                       | Heredado               | d322485 2025-05-31 | No se encontró uso actual en pages/components; eliminado del dashboard renovado       |
| `components/institute/dashboard/terapy-balance.vue`                         | Heredado               | a6685e0 2025-05-31 | No se encontró uso actual en pages/components; eliminado del dashboard renovado       |
| `components/institute/my-quizzes/add-quiz-comp.vue`                         | Heredado               | 295b713 2025-06-18 | Formulario antiguo independiente del listado nuevo                                    |
| `components/institute/my-quizzes/my-quizzes.vue`                            | Renovación visual      | fba7b52 2026-09-07 | CSS directo desde línea 100                                                           |
| `components/institute/my-quizzes/quiz-card.vue`                             | Renovación visual      | fba7b52 2026-09-07 | CSS directo desde línea 104                                                           |
| `components/institute/my-stats/my-stats.client.vue`                         | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 414                                                           |
| `components/institute/my-stats/stats-dimension-detail.vue`                  | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 160                                                           |
| `components/institute/my-stats/stats-dimensions.vue`                        | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 109                                                           |
| `components/institute/my-stats/stats-distribution.vue`                      | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 152                                                           |
| `components/institute/my-stats/stats-empty-state.vue`                       | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 221                                                           |
| `components/institute/my-stats/stats-filters-sheet.vue`                     | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 218                                                           |
| `components/institute/my-stats/stats-filters.vue`                           | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 321                                                           |
| `components/institute/my-stats/stats-map.vue`                               | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 237                                                           |
| `components/institute/my-stats/stats-summary.vue`                           | Renovación visual      | 5a9ac8b 2026-09-04 | CSS directo desde línea 191                                                           |
| `components/institute/my-users/answer-by-age.vue`                           | Heredado               | 490d172 2025-06-12 | No se encontró uso actual en pages/components                                         |
| `components/institute/my-users/answer-by-gender.vue`                        | Heredado               | 490d172 2025-06-12 | No se encontró uso actual en pages/components                                         |
| `components/institute/my-users/clinic-history.vue`                          | Heredado               | 658c211 2025-06-26 | Montado en /institute/my-users/clinic-history; conserva subcomponentes antiguos       |
| `components/institute/my-users/my-users-dashboard.vue`                      | Renovación visual      | 864befa 2026-09-03 | CSS directo desde línea 446                                                           |
| `components/institute/my-users/recommendations/calendar-recomendations.vue` | Heredado               | 83a6788 2026-04-30 | Montado por user-detail renovado:608; NO confundir con calendario de usuario renovado |
| `components/institute/my-users/therapy-notes.vue`                           | Heredado               | 658c211 2025-06-26 | Montado dentro de clinic-history antiguo                                              |
| `components/institute/my-users/user-detail.vue`                             | Renovación visual      | 864befa 2026-09-03 | CSS directo desde línea 666; exceptuar calendario institucional heredado              |
| `components/institute/my-users/user-results.vue`                            | Heredado               | 658c211 2025-06-26 | Montado dentro de clinic-history antiguo                                              |
| `components/login/LoginForm.vue`                                            | Renovación visual      | ff1dee2 2026-08-18 | CSS directo desde línea 154                                                           |
| `components/login/LoginPage.vue`                                            | Wrapper de UI renovada | ff1dee2 2026-08-18 | Composición AuthShell/LoginForm; no CSS propio                                        |
| `components/register/register.vue`                                          | Renovación visual      | ff1dee2 2026-08-18 | CSS directo desde línea 301                                                           |
| `components/user/dashboard/check-in-card.vue`                               | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 159                                                           |
| `components/user/dashboard/dashboard.vue`                                   | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 233                                                           |
| `components/user/dashboard/monthly-activity.vue`                            | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 84                                                            |
| `components/user/dashboard/next-appointment-card.vue`                       | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 66                                                            |
| `components/user/dashboard/today-tasks.vue`                                 | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 68                                                            |
| `components/user/dashboard/wellbeing-card.vue`                              | Renovación visual      | 563a7b3 2026-08-19 | CSS directo desde línea 54                                                            |
| `components/user/get-help/get-help.vue`                                     | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 52                                                            |
| `components/user/get-help/guided-meditations.vue`                           | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 92                                                            |
| `components/user/get-help/meet-specialist.vue`                              | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 102                                                           |
| `components/user/get-help/wellnes-practices.vue`                            | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 66                                                            |
| `components/user/history/history.vue`                                       | Renovación visual      | 2955dc1 2026-08-21 | CSS directo desde línea 125                                                           |
| `components/user/privacy-policy/privacy-policy.vue`                         | Renovación visual      | 2955dc1 2026-08-21 | CSS directo desde línea 495                                                           |
| `components/user/profile/profile.vue`                                       | Renovación visual      | 2955dc1 2026-08-21 | CSS directo desde línea 214                                                           |
| `components/user/quiz/demographic-survey.vue`                               | Renovación visual      | ea6c815 2026-08-25 | CSS directo desde línea 991                                                           |
| `components/user/quiz/finish-quiz.vue`                                      | Heredado               | 955b666 2026-04-03 | Cierre de quiz antiguo independiente del flujo renovado                               |
| `components/user/quiz/posible-quizzes.vue`                                  | Renovación visual      | fe5cbbc 2026-08-25 | CSS directo desde línea 95                                                            |
| `components/user/quiz/question.vue`                                         | Renovación visual      | fe5cbbc 2026-08-25 | CSS directo desde línea 445                                                           |
| `components/user/quiz/quiz-navigation.vue`                                  | Renovación visual      | fe5cbbc 2026-08-25 | CSS directo desde línea 245                                                           |
| `components/user/quiz/quiz.vue`                                             | Renovación visual      | fe5cbbc 2026-08-25 | CSS directo desde línea 157                                                           |
| `components/user/recomendations/books-recomendations.vue`                   | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 307                                                           |
| `components/user/recomendations/calendar-recomendations.vue`                | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 278                                                           |
| `components/user/recomendations/custom-recomendations.vue`                  | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 159                                                           |
| `components/user/recomendations/news.vue`                                   | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 311                                                           |
| `components/user/recomendations/recomendations.vue`                         | Renovación visual      | 19524c4 2026-08-21 | CSS directo desde línea 57                                                            |

## Layouts (4)

| Archivo                   | Evaluación                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `layouts/default.vue`     | Wrapper antiguo que ahora monta navegación de usuario renovada; no es evidencia de estilos propios nuevos                             |
| `layouts/institute.vue`   | Renovado en cefbe8a; fondo institucional #f5f4f8 + navegación nueva                                                                   |
| `layouts/empty-login.vue` | Antiguo; imagen de fondo heredada. AuthShell renueva el contenido de login/register/forgot, no todas las páginas que usan este layout |
| `layouts/empty.vue`       | Wrapper antiguo sin CSS                                                                                                               |

## Cambios no visuales y límites

El historial no contiene commits exclusivamente funcionales entre estos diez: todos tienen alguna renovación visual verificada. Sin embargo, las siguientes modificaciones por archivo son de soporte funcional/documental y no acreditan estilos nuevos:

- `AGENTS.md`
- `components/institute/my-quizzes/use-my-quizzes.ts`
- `components/institute/my-stats/stats-config.ts`
- `components/institute/my-stats/use-my-stats.ts`
- `components/user/get-help/specialists-data.ts`
- `dto/request/user/user-student-demographic-data.request.dto.ts`
- `interfaces/checkin/check-in.interface.ts`
- `interfaces/quizzes/institute-quiz.interface.ts`
- `interfaces/stats/institute-stats.interface.ts`
- `interfaces/user/demographic-history.interface.ts`
- `interfaces/user/paginated-users.interface.ts`
- `package-lock.json`
- `store/quiz.ts`
- `store/user.ts`
- `utils/translations/demographic.ts`
- `utils/translations/index.ts`
- `utils/translations/roles.ts`
- `utils/translations/values.ts`

El análisis se basa en git log, git diff ba2717f..HEAD, importaciones/templates actuales y CSS añadido. Una ruta vieja puede montar un componente nuevo, y una renovada puede conservar un modal viejo. No se infiere adopción a nivel de aplicación de un solo color aislado. No se verificaron endpoints, datos reales, contraste, desempeño ni capturas de producción en esta auditoría de historia.
