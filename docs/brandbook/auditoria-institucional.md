# Auditoría institucional para brandbook KAIROS

Fecha de corte: 2026-09-22. Ventana solicitada interpretada como 2026-08-08 a 2026-09-22 (últimos 45 días). Inspección solo de lectura del código y de diffs/historial, sin sesión autenticada ni validación visual de runtime. Paths relativos al root `/Users/brunovitte/dev/BIENESTAR-KAIROS.github.io`.

## Evidencia temporal y alcance

`git log --since=2026-08-08 --until=2026-09-23 --name-status` identifica estos cambios institucionales:

- **cefbe8a — 2026-09-03**: rediseño de AppBarInstitute.vue, NavBarInstitue.vue, dashboard-institute.vue, layouts/institute.vue, pages/institute/dashboard.vue. Diff: 583 adiciones / 430 eliminaciones en 6 archivos incluyendo lockfile. El diff muestra retirada de app-bar `elevation=5 color=thirdy` y nueva barra lateral violeta de 272 px: evidencia de cambio visual real, no solo archivo tocado.
- **864befa — 2026-09-03**: reemplazo sustancial de my-users-dashboard.vue y user-detail.vue (1921 adiciones / 698 eliminaciones contando interfaces/traducciones). Nuevas tablas, gráfica de bienestar, estados de atención y agenda.
- **5a9ac8b — 2026-09-04**: reescritura my-stats.client.vue y 10 archivos nuevos en my-stats (config, composable y ocho componentes visuales).
- **fba7b52 — 2026-09-07**: catálogo my-quizzes.vue y nuevas quiz-card.vue / use-my-quizzes.ts.

**Excluir como autoridad visual:** pages/admin/dashboard/index.vue; pages/institute/login.vue; pages/institute/quizzes/add-quiz.vue y components/institute/my-quizzes/add-quiz-comp.vue; components/institute/my-users/clinic-history.vue, therapy-notes.vue, user-results.vue, answer-by-age.vue, answer-by-gender.vue, recommendations/calendar-recomendations.vue; components/institute/dashboard/daily-answer-volume.vue, resolved-quizzes.vue, terapy-balance.vue. No registran modificaciones dentro de la ventana. Las páginas wrapper sin estilo reciente no aportan lenguaje visual por sí mismas. En particular, la ruta `/institute/login` sí compone la UI renovada de AuthShell/LoginForm: no excluir la pantalla efectiva por la antigüedad del wrapper.

## Lenguaje derivado y reglas de uso

1. **Base calmada y jerarquía clara:** fondo gris lavanda #f5f4f8; superficies blancas, borde fino #efebf5; paneles amplios con esquinas 20–24 px; sin box-shadow explícito en componentes nuevos analizados. La profundidad se comunica por color, borde y agrupación. Fuente: layouts/institute.vue:16; dashboard/dashboard-institute.vue:126; my-quizzes/quiz-card.vue:105; my-stats/stats-summary.vue:222.
2. **Violeta profundo como ancla:** #3c2f52 en barra lateral, encabezados, métricas y panel destacado. #523f6e en superficies anidadas sobre fondo oscuro. #8475a0 en acciones, enlaces y gráficos neutros. #6d5f88 hover de acción. #cbadd8 en avatar y acento sobre oscuro. Fuentes: global/AppBarInstitute.vue:186,210,237,273; my-users/user-detail.vue:824; my-quizzes/quiz-card.vue:117,253,264.
3. **Pocos elementos de énfasis oscuro:** navegación persistente; una métrica hero para bienestar; tarjeta del cuestionario base de Kairos de solo lectura; panel lateral de próxima cita. El fondo oscuro tiene significado de jerarquía/contexto, no es decoración aleatoria. Fuentes: stats-summary.vue:232; quiz-card.vue:117; user-detail.vue:981.
4. **Controles pill:** botones, chips, badges, selects y navegación usan radio 999 px. Botón principal institucional alto 42 px, texto 14 px/700; botón de tarjeta 40 px, 13/700; CTA móvil de filtros 52 px, 15/800. Secundario blanco/borde 2 px #ded6ea, texto #3c2f52. Fuentes: my-stats/my-stats.client.vue:473; quiz-card.vue:229; stats-filters-sheet.vue:408.
5. **Iconos lineales:** SVG inline `fill=none`, trazo 2.5–2.75, extremos/uniones redondos; iconos de navegación 20 px, auxiliares 16–22 px. Convive MDI en menú móvil. Fuente: global/AppBarInstitute.vue:89 y 161; global/NavBarInstitue.vue:20; stats-empty-state.vue:105.

## Paleta institucional (roles observados)

| Rol                           | Color                                   | Evidencia                                            |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- |
| Fondo de aplicación           | #f5f4f8                                 | layouts/institute.vue:19; my-stats.client.vue:417    |
| Superficie                    | #ffffff                                 | stats-summary.vue:223; quiz-card.vue:109             |
| Superficie input/tabla        | #faf9fc                                 | stats-filters.vue:415; my-users-dashboard.vue:573    |
| Borde de panel                | #efebf5                                 | quiz-card.vue:110; stats-summary.vue:224             |
| Borde input                   | #ece7f3                                 | stats-filters.vue:414                                |
| Profundo / tinta de marca     | #3c2f52                                 | AppBarInstitute.vue:187; stats-summary.vue:208       |
| Acción / marca media          | #8475a0                                 | my-stats.client.vue:501; stats-filters-sheet.vue:412 |
| Hover de acción               | #6d5f88                                 | my-stats.client.vue:506                              |
| Acento lavanda                | #cbadd8                                 | user-detail.vue:743; quiz-card.vue:265               |
| Superficie anidada oscura     | #523f6e                                 | AppBarInstitute.vue:214,239                          |
| Texto oscuro alternativo      | #0e2a36                                 | dashboard-institute.vue:130; quiz-card.vue:114       |
| Texto cuerpo                  | #4b3f60, #4b5f68                        | my-quizzes.vue:162; quiz-card.vue:157                |
| Texto secundario              | #6b6080, #7d7391                        | stats-summary.vue:214; user-detail.vue:780           |
| Texto atenuado                | #9b8fb0, #9a90ad                        | dashboard-institute.vue:154; my-quizzes.vue:252      |
| Texto secundario sobre oscuro | #c3b6d8, #e6dff0                        | AppBarInstitute.vue:235,280                          |
| Positivo/activo suave         | #dbf2f4 / #065c5d                       | quiz-card.vue:130; my-users-dashboard.vue:678        |
| Neutral/pausado suave         | #f0eaf5 / #5c4a75                       | quiz-card.vue:137; my-users-dashboard.vue:684        |
| Favorable en analítica        | #3f8f7e / #edf6f3 / #2c6a5c             | stats-distribution.vue:241,265,279                   |
| Atención analítica            | #c77a1f / #fbf3e8 / #8a5a15             | stats-distribution.vue:233,261,275                   |
| Atención en usuarios          | #d69a4c / #fdf1e3 / #8a5a1f             | my-users-dashboard.vue:770,819; user-detail.vue:794  |
| Error                         | #b3261e; variante #8a3d3d sobre #fdf3f3 | user-detail.vue:691; my-quizzes.vue:177–179          |

Estos colores están en CSS scoped local; los nombres de rol de la tabla son una propuesta de catalogación, no tokens compartidos existentes. Variantes casi iguales no deben convertirse en nuevos colores oficiales por defecto.

## Tipografía y escala

Familia: Figtree, fallback sans-serif, declarada expresamente en todos los rediseños. Pesos 500 navegación normal, 600 metadatos, 700 acciones/etiquetas, 800 titulares/cifras. Referencias:

- Encabezado de vista: 19–21 px/800; estadísticas/cuestionarios 20 px; perfil 24 px. dashboard-institute.vue:157; my-quizzes.vue:132; user-detail.vue:772.
- Titular de sección: 18 px/800 en filtros/distribución/dimensiones; resumen 24 px/800, tracking -0.02em. stats-filters.vue:345; stats-summary.vue:203.
- Cuerpo: 14–15 px, interlineado 1.5–1.6. quiz-card.vue:153; dashboard-institute.vue:184.
- Etiquetas/metadata: 11–13 px, 600/700. Eyebrows mayúsculas 11–13 px, tracking 0.1–0.12em; table headers 11 px/700, 0.06em. stats-summary.vue:240; my-users-dashboard.vue:576.
- Métrica normal 26 px/800 inicio; 38 px/800 resumen; cifra hero 56 px/800 (-0.03em, line-height 1), móvil 46 px. dashboard-institute.vue:224; stats-summary.vue:255,315,387.
- Marca textual “Kairos” 17 px/800 y subtítulo “Panel de instituto” 12 px, junto al asset blanco. AppBarInstitute.vue:227.

## Espaciado, contenedores, responsive

- Padding de vista institucional 24px 32px 40px, gap 16–22 px. En móvil 20px 20px 32px; cuestionarios 20px 16px 32px. my-stats.client.vue:415,677; user-detail.vue:667; my-quizzes.vue:101,261.
- Cards: padding 18 px resumen corto, 22 px datos/cards, 24–26 px paneles amplios/hero; gap 10–20 px. Radios observados: 20 (dashboard),22 (usuario/cuestionarios),24 (analítica),34 arriba en bottom sheet.
- Sidebar 272 px, esquina superior derecha 32 px, padding 22px 16px; marca en círculo 48 px con imagen 34 px. Navegación alto 46 px y gap 6 px. AppBarInstitute.vue:57,186,195,210,268.
- Mobile app bar `smAndDown`, fondo #3c2f52, elevation 0, esquinas inferiores 24 px, logo 40 px. NavBarInstitue.vue:15,37.
- Dashboard 4 columnas -> 2 <=1100 ->1 <=600. dashboard-institute.vue:193,241.
- Cuestionarios 3->2 <=1100->1 <=700. my-quizzes.vue:182,255.
- Resumen analítico 1.35fr+3fr ->2 <=1280 ->1 <=700. stats-summary.vue:217,376.
- Analítica paneles 2->1 <=1100. my-stats.client.vue:606,671.
- Perfil principal + lateral de 330 px -> una columna <=1100. user-detail.vue:851,1150.
- Filtros en escritorio 5 columnas -> 2 <=1100; en `useDisplay().mobile` panel móvil con botón y bottom sheet. stats-filters.vue:392,516; my-stats.client.vue:24,266; stats-filters-sheet.vue:60.
- Tabla usuarios conserva scroll horizontal; padding 20 px <=760. my-users-dashboard.vue:561,857.
- Esta diversidad de 600/700/760/1100/1280 y `useDisplay.mobile` es código observado, no una escala responsive unificada. El brandbook puede recomendar homologar después.

## Componentes y estados

### Tablas

Tabla principal: cabecera alto 46, filas 62, fuente 14, celdas px14 y extremos22; fondo cabecera #faf9fc; separador #f4f1f8. Avatar iniciales 36; nombre 700 + correo12 muted. Pills 25 px altura. Fila entera clicable, tabindex y Enter; hover/focus fondo #faf8fd. Fila atención fondo #fffaf3, avatar ámbar, score+barra, CTA “Contactar”. Paginación círculos34, activa #3c2f52 blanco. Referencias my-users-dashboard.vue:338,352,561–737,823.

Detalle usuario repite gramática con tabla más densa: cabecera42, filas50. user-detail.vue:920–948.

### Filtros

Select nativo dentro de pill50, borde2, label13/700; cuando aplicado: borde #8475a0 y fondo #f7f4fa. Chips activos32 con botón quitar y aria-label; “Limpiar filtros”; tamaño de muestra y barra siempre visibles. Fuente stats-filters.vue:118,278,408–488. Mobile bottom sheet blanco radio34 superior, grabber44x5, opciones de periodo en 4 columnas (46 alto), selects54, CTA “Aplicar filtros”52. stats-filters-sheet.vue:218,275,310,408.

### Estados

- Loading textual explícito: “Cargando tus estadísticas…”/“Cargando usuarios…”. No inventar skeleton como patrón existente. my-stats.client.vue:307; my-users-dashboard.vue:327.
- Error informa imposibilidad y acción breve: “No pudimos generar el CSV. Intenta de nuevo.” my-stats.client.vue:162. Banner blanco con texto rojo/borde tenue; cuestionarios tiene fondo rojo suave.
- Vacío distingue “No encontramos usuarios que coincidan con …” de “Todavía no hay usuarios registrados.” my-users-dashboard.vue:329.
- Muestra insuficiente explica motivo (“dejarían de ser anónimos”), muestra filtros removibles y propone ampliar periodo con número de respuestas recuperadas. stats-empty-state.vue:114–163.
- Primer periodo muestra progreso real hacia mínimo de respuestas y CTA “Recordar a quienes faltan”. stats-empty-state.vue:184–229.
- Sin dato se muestra `—`, no 0. dashboard-institute.vue:30; stats-summary.vue:128,169.
- Disabled: opacidad .55, cursor not-allowed. quiz-card.vue:241. Botones actuales de cuestionarios están permanentemente deshabilitados: tratar como funcionalidad pendiente, no comportamiento objetivo.

### Movimiento y foco

Hover de navegación/dimensiones 150ms ease; progreso 250ms ease. AppBarInstitute.vue:284; stats-dimensions.vue:177,230; stats-summary.vue:297. No box-shadow explícito ni motion decorativo en la muestra. Inputs focus borde violeta, fondo blanco; filas foco solo cambio de fondo con outline:none en usuarios (deuda de visibilidad). user-detail.vue:1125; my-users-dashboard.vue:602.

## Visualización de datos

- Número + unidad + periodo + interpretación breve + acción. “Bienestar promedio”, “de 5”, delta, texto de lectura; “Respondentes” acompaña cobertura. stats-summary.vue:116–175.
- Ordenar dimensiones ascendente para priorizar; barra14 redondeada; promedio con 1 decimal y delta firmado; dato clicable abre detalle. stats-dimensions.vue:32,59,195–237.
- Histograma con franjas etiquetadas “Requiere atención”, “En el promedio”, “Bienestar alto”; eje, cuentas, porcentajes y acción acompañan color. Barras radio8 arriba, alto máximo190, fondo grupal suave. stats-distribution.vue:64–140,216–278; stats-config.ts:127.
- Móvil cambia histograma a barra apilada y leyenda con counts; etiquetas internas solo >=10%. Mapa pasa a lista de tres zonas prioritarias. stats-distribution.vue:64–76; stats-map.vue:15,136,194.
- Detalle de usuario: serie única lavanda #cbadd8, ámbar #d69a4c bajo umbral; línea discontinua etiquetada, tooltip y tabla repiten información. Eje y grilla tenue, sin leyenda redundante; tooltip profundo con radio10. user-detail.vue:138–233.
- Mapa agrega por CP y explicita zonas ocultas por muestra insuficiente; ordena de menor a mayor, presenta score y respuestas. stats-map.vue:53,108–148,194–226.
- Paleta y etiquetas deben expresar estado sin depender únicamente de color. Esto está especialmente bien resuelto en gráfica de usuario.
- Umbrales de anonimato/cobertura/score son parámetros del producto observados en stats-config.ts:15–29,127. No representan validación científica ni deben elevarse a política universal de marca.

## Voz y microcopy para preservar (derivada)

Español cercano, segunda persona (“tu población”, “tus cuestionarios”), verbos concretos (“Ver detalle”, “Filtra tu población”, “Guardar esta vista”, “Contactar”), texto breve que explica lo que cambió o falta. Fechas humanas/locales es-MX: “Actualizado hoy, HH:MM”, “ayer”, “Últimos 30 días”; contadores con singular/plural y denominador si existe. Evidencia my-stats.client.vue:69–101; quiz-card.vue:20–35; stats-filters.vue:33–55.

Mensajes interpretativos traducen lenguaje técnico: “Qué tan parejo” acompaña desviación estándar; score se acompaña de unidad y escala. Mantener claridad y apoyo, pero revisar formulaciones como “la población que peor está”, “jala el promedio” por tono/precisión.

## Inconsistencias / no canonizar

1. Radios20/22/24, spacing18/22/26 y breakpoints600/700/760 varían. Documentar valores actuales y proponer familias, sin afirmar que ya hay tokens compartidos.
2. Duplicados de tinta/metadata (#0e2a36 vs #3c2f52; #4b3f60 vs #4b5f68; #6b6080 vs #7d7391; #9b8fb0 vs #9a90ad) requieren futura homologación.
3. Dos paletas de atención similares (ámbar stats #c77a1f y usuarios #d69a4c) y errores distintos (b3261e vs 8a3d3d) no son variantes deliberadamente documentadas.
4. Header inicio/usuarios blanco con divider vs estadísticas/cuestionarios integrado en fondo: patrón de vista aún inconsistente.
5. `row:focus-visible { outline: none; background: #faf8fd }` en tabla de usuarios es señal demasiado tenue potencialmente; los botones/chips no establecen patrón global de foco explícito.
6. Iconos SVG propios y MDI coexisten. No declarar una sola librería como sistema nuevo obligatorio.
7. Crear/Editar/Duplicar cuestionarios deshabilitados y “Disponible en el siguiente paso” (my-quizzes.vue:32–36,95; quiz-card.vue:76–98): no ofrecer como interacción completa ni elevar copy temporal a voz oficial.
8. Copy “Sustituye al radar: en barras ordenadas…” en stats-dimensions.vue:46 describe una decisión interna de diseño, no información necesaria para usuario. Debe quedar como comentario de diseño en el brandbook, no copy recomendado de producto.
9. Frases de representatividad por 30% y apertura al10% son reglas operativas existentes; el análisis de marca no verifica pertinencia clínica/estadística.
10. Nombres AppBarInstitute/NavBarInstitue están semánticamente invertidos (primero es drawer y segundo appbar); no usar filename como nombre del patrón.

No se editaron archivos del repositorio. `git status --short` vacío al finalizar auditoría.
