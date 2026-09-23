# Auditoría de diseño — área usuario

Corte: 2026-08-08–2026-09-22 inclusive. Solo lectura. `git status --short -- components/user pages/user` no muestra cambios locales. Se revisaron archivos Vue/TS de ambas carpetas y el historial de sus cambios. Los cinco commits elegibles sí incorporan reemplazos sustanciales de template/CSS, además de lógica: no se está deduciendo modernidad únicamente del mtime ni del mensaje del commit.

## Evidencia temporal

| Commit / fecha         | Superficies rediseñadas                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `563a7b3` / 2026-08-19 | Dashboard, check-in, tareas, bienestar, actividad, cita; 1,178 líneas nuevas y 62 eliminadas en usuario.         |
| `19524c4` / 2026-08-21 | Ayuda (prácticas, meditaciones, especialistas) y recomendaciones (personalizadas, libros, noticias, calendario). |
| `2955dc1` / 2026-08-21 | Perfil, historial, aviso de privacidad.                                                                          |
| `ea6c815` / 2026-08-25 | Cuestionario sociodemográfico y wrapper de página.                                                               |
| `fe5cbbc` / 2026-08-25 | Catálogo de cuestionarios, pregunta, navegación, contenedor y estados de carga.                                  |

Separar del sistema visual: cambios HTTP, stores, navegación/ramificación, interfaces, guardado de historial y `specialists-data.ts` son contenido/lógica. Su fecha no convierte sus datos en tokens.

Los wrappers `pages/user/profile/index.vue`, `pages/user/recomendations/index.vue` y `pages/user/get-help/index.vue` son antiguos pero montan los componentes rediseñados. No excluir estas pantallas por la fecha del wrapper.

## Reglas canónicas derivadas

### Base, color y tipo

- Figtree, sans-serif en todos los shells recientes. Dashboard `components/user/dashboard/dashboard.vue:235`; recomendaciones `components/user/recomendations/recomendations.vue:61`; preguntas `components/user/quiz/question.vue:447`.
- Canvas `#F4F8F9`, texto principal `#0E2A36`, tarjetas `#FFFFFF`. Ejemplo completo `dashboard.vue:234`.
- Marca fuerte / CTA / estado seleccionado prominente `#065C5D`. Turquesa `#07979F` para borde activo, foco y varios hovers. Teal claro `#6CC5CB` para gráficas/decoración/bordes hover. Superficie informativa `#DBF2F4`, selección sutil `#F0FAFA`. Referencias `quiz/quiz-navigation.vue:297`, `question.vue:605`, `dashboard/wellbeing-card.vue:56`.
- Texto secundario tiene variantes reales: `#5C7078` descripciones, `#5F767E` labels/metadatos, `#4B5F68` subtítulo. No afirmar un solo token ya consolidado.
- Bordes de tarjeta `#EAF1F2` (1px), control `#E3ECEE` (2px) o `#DDE8EA` (1.5px); deshabilitado `#CFDDE1`.
- Familia lavanda secundaria: `#F0EAF5` fondo, `#5C4A75` texto, `#8475A0` avatar. `profile.vue:241`, `:293`; cita usa además `#4A3A63`, `#3C2F52`, `#6A5A85` (`next-appointment-card.vue:68`).
- Aviso/advertencia: `#FDF4E7` + `#8A5A17` (`quiz-navigation.vue:313`). Error: `#FDECEC` + `#F6CCCC` borde + `#8A1C1C` texto (`demographic-survey.vue:1138`). No mezclar roles semánticos con lavanda editorial.
- H1 normal 28px/800/tracking -0.02em (`recomendations.vue:86`, `demographic-survey.vue:1033`), saludo 26px/800 (`dashboard.vue:267`). H1 móvil 22–23px en quiz/sociodemográfico. Pregunta 24px/800/line-height1.35/tracking -0.015em (`question.vue:493`), 20px móvil. Titulares tarjeta 16–20px, 700–800. Texto 14–15px, 400–600. Label pequeño 11–13px, 600–800. Eyebrow mayúsculas 12–13px con tracking .1–.12em (`dashboard.vue:259`, `:326`).

### Forma, ritmo y composición

- Shell de escritorio padding 24px 36px 48px; móvil común 20px 18px 40px. `dashboard.vue:239`, `:409`; `profile.vue:220`; `recomendations.vue:66`, `:132`.
- Tarjeta estándar radio24, borde1px #EAF1F2, fondo blanco, padding20–28. Sombra frecuente `0 6px 20px -12px rgba(6,92,93,.35)` (`dashboard.vue:344`, `profile.vue:227`). Quiz elevado `0 18px 40px -24px rgba(6,92,93,.4)` y padding30 (`quiz.vue:264`).
- Radio20 en cards móviles de formulario (`quiz.vue:319`, `demographic-survey.vue:1713`); 16–18 controles/opciones; 999px botones, chips y avatares. Hero meditación radio28 (`guided-meditations.vue:121`) es variante, no defecto.
- Gaps frecuentes 8,12,16,20,24; también existen18,22,28. Se puede proponer escala4px para futuras adiciones, pero NO presentarla como sistema implementado universal.
- Dashboard grid `1fr 344px` y gap20 (`dashboard.vue:306`). Sociodemográfico `minmax(0,1fr) 340px` (`demographic-survey.vue:1059`). Colapsan a una columna <=1180px; tarjetas dashboard pasan de3 a1 <=720px. Preguntas usa700px, por lo que breakpoint global unificado sería recomendación futura.
- Sociodemográfico pares→una columna <=900px; móvil CTA sticky abajo, full-width; oculta nota secundaria, secciones acordeón (`demographic-survey.vue:1686`).

### Componentes y estados

- CTA primario de referencia `quiz-navigation.vue:343`: alto46px, radio999, Figtree15/700, fondo#065C5D, blanco, padding0 26; hover#07979F; deshabilitado#CFDDE1 y cursor not-allowed. Loading con verbo y elipsis (`Enviando…`, `:239`). Check-in es variante alto74px (`check-in-card.vue:253`); submit sociodemográfico54px/16/800 (`demographic-survey.vue:1334`). No inventar única altura existente.
- Secundario `quiz-navigation.vue:379`: blanco, borde2px #CFDDE1, texto#0E2A36; hover borde/texto#07979F; disabled opacity.45. Ghost fondo#F4F8F9 y texto#4B5F68, hover#DBF2F4 con#065C5D (`:359`).
- Inputs sociodemográficos `demographic-survey.vue:1285`: alto52, radio999, borde1.5px #DDE8EA, padding0 22, texto15/600. Foco borde#07979F + halo4px rgba(7,151,159,.14). Placeholder#8A9BA1. Opción de pregunta56px mínimo, radio18, borde2px #E3ECEE; selected #F0FAFA/borde#07979F/peso700 (`question.vue:590`).
- Radio22px; checkbox22px radio7 (`question.vue:620`, `:744`). Contenedor opción tiene focus-within con halo4px (`:614`, `:739`). Campo largo radio20, fondo#F6FCFC, padding18 20 y min-height150 (`:905`).
- Pills de recomendaciones: grupo blanco/radio999/borde1px/padding5; controles alto36,13px/600, activo oscuro/blanco/700. `recomendations.vue:96`.
- Tabs ayuda: barra blanca72px, controles48px,15px/600, subrayado3px teal y peso700 en activo; overflow-x:auto (`get-help.vue:62`). Estas dos familias son intencionales en el rediseño reciente; documentar usos, no imponer una como única actual.
- Chip pequeño26px con fuente11/700; badge de racha38px/13/700 (`dashboard.vue:281`, `:363`).
- Transiciones generalmente .15s ease en color/fondo/borde. Sin evidencia de un sistema de animación más amplio.

### Voz y activos

- Segunda persona y cercanía: “Buen día, [nombre]”, “Para ti hoy”, “¿Cómo te sientes hoy?”, “Queremos conocerte”, “Queremos ayudarte” (`dashboard.vue:52`, `:61`, `:153`, `:189`; check-in:74).
- Acciones directas: “Responder el cuestionario” (`posible-quizzes.vue:87`), “Anterior”, “Siguiente”, “Finalizar” (`quiz-navigation.vue:215`). Usar verbos concretos, contadores y confirmación de progreso; “Te faltan N preguntas”, “Ya respondiste todas las preguntas” (`:176`).
- Baja fricción expresada con duración y siguiente efecto: “Tarda 10 segundos…” (`check-in-card.vue:78`). Es microcopy actual, no garantía que el brandbook deba prometer sin validar funcionalidad.
- Mensajes de privacidad/apoyo cálidos (`profile.vue:188`); no trasladar promesas legales/clínicas al brandbook como política validada.
- Assets actuales referenciados: `/image-dashboard-16.png` cuestionarios; `/image-dashboard-19.png` ayuda; `/image-dashboard-20.png` recomendaciones, racha, reseña; `/calendar.png` citas; `/image-specialist-22.png` especialista. Aunque sus archivos sean antiguos, el uso en composición reciente sí los valida como activos vigentes. El rediseño los muestra en tarjetas respiradas, contain78x78 en dashboard (`:374`).
- Iconografía reciente SVG outline, viewBox24, stroke currentColor, puntas/uniones redondas, grosor generalmente2.75 (2.6–3.4 según marca/checkbox), tamaño16–20px. Badges circulares/pastel. No afirmar que toda la app usa esta familia: aún hay Vuetify/MDI legacy.
- Libros usan portadas reales o gradiente teal fallback (`books-recomendations.vue:347`), noticias fondos pastel gradiente (`news.vue:29`). No elevar esos gradientes a principal de marca.

## Legacy / fuera del canon

- `components/user/quiz/finish-quiz.vue` último cambio `955b666` 2026-04-03: conserva Handlee, utilidades Vuetify, patrón anterior. El flujo quiz moderno desemboca aquí pero sus estilos quedan fuera.
- `pages/user/quiz/finish-quizz.vue` monta FinishQuiz con layout empty-login; no confundir con el rediseño del cuestionario.
- `pages/user/update-my-data/index.vue` (2025-04-04) placeholder literal “update my data”; `pages/user/quiz/results.vue` (2025-03-25) placeholder “resultados del cuestionario”. No usar como referencia visual.
- `pages/user/register/campus-info.vue` cambió 2026-04-06 por casting: fuera del corte temporal.

## Divergencias / propuestas (separar de observado)

1. Tokens CSS duplicados/hardcoded entre componentes; proponer centralización semántica conservando apariencia. Familias de gray/radios/gaps aún no totalmente normalizadas.
2. Breakpoints700 vs720 y distintos gutters quiz; acordar700 o720 para evoluciones, no declarar norma global retrospectiva.
3. Contrastes calculados sobre colores planos mediante luminancia sRGB: blanco/#065C5D7.79:1; blanco/#07979F3.54:1; blanco/#6CC5CB2.00:1; #5F767E/#F4F8F9 ~4.49:1; placeholder#8A9BA1/blanco2.88:1. Recomendación: no heredar texto pequeño blanco sobre teal claro en futuros hover. Ejemplos `today-tasks.vue:160`, `profile.vue:484`, CTA quiz:hover `quiz-navigation.vue:404`.
4. Foco explícito sólido para inputs/opciones; `question.vue:788` select tiene outline:none sin estilo focus específico, y tabs/botones no muestran patrón focus-visible común. Proponer halo consistente, respetar teclado y reduced-motion al consolidar.
5. Header visual a veces usa span en lugar de h1 (dashboard/perfil/recomendaciones); documentar jerarquía visual y semántica por separado para no copiar esa deuda.
6. Nombres typo históricos (`recomendations`, `posible-quizzes`, `wellnes`, `guided-maditation`) son rutas/código existentes, no estándares editoriales.
