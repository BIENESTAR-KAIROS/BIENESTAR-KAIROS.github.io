# Brandbook de Bienestar KAIROS

Edición 1.0 · 22 de septiembre de 2026 · HEAD `fba7b52`.

Ventana de referencia: 8 de agosto a 22 de septiembre de 2026 (45 días transcurridos). Actividad visual disponible: 18 de agosto a 7 de septiembre. Este documento distingue **observado**, **propuesto** y **heredado**. El PDF incluye las muestras visuales; este archivo conserva el contenido editable. No se cambió el código de la aplicación.

- [PDF visual](../../output/pdf/brandbook-bienestar-kairos.pdf)
- [Auditoría completa del frontend](auditoria-frontend.md)
- [Detalle del sistema de usuario](auditoria-usuario.md)
- [Detalle del sistema institucional](auditoria-institucional.md)

## 1. Brandbook del producto digital

Criterios visuales y editoriales para evolucionar la aplicación.

**Evidencia: EDICIÓN 1.0 / DERIVADA DEL FRONTEND.**

Acompañar a estudiantes.
Dar claridad a los equipos de bienestar.

Paleta · tipografía · componentes · contenido · evolución

Base: código e historial Git local. Corte de 45 días: 8 de agosto a 22 de septiembre de 2026. Última modificación disponible: 7 de septiembre. No es una validación del despliegue.

## 2. Qué cuenta como referencia

El criterio es el cambio visual real dentro del periodo, no la fecha aislada de un archivo.

**Evidencia: ALCANCE Y MÉTODO.**

Auditoría: 95 SFC (56 componentes, 35 páginas, 4 layouts); 10 commits; 49 SFC visuales y 5 wrappers tocados. 73 archivos cambiados en total.

### Observado

Estilo acreditado por diff y uso reciente. Una página antigua puede mostrar un componente nuevo.

### Propuesto

Regla recomendada para futuras modificaciones. Se identifica explícitamente; no está implantada en toda la app.

### Heredado

Estilo fuera del corte, placeholder o excepción dentro de una pantalla nueva. No usarlo como base.

Se revisaron rutas, descendientes, estilos, activos, configuración y cambios de soporte. El inventario completo y la trazabilidad por archivo están en docs/brandbook/auditoria-frontend.md.

## 3. La personalidad del producto

La interfaz reciente habla con cercanía al estudiante y con precisión a la institución.

**Evidencia: SÍNTESIS EDITORIAL / PROPUESTA DE CONTINUIDAD.**

### Cercana y respetuosa

Hablar de tú, usar frases breves y ofrecer un siguiente paso. “¿Cómo te sientes hoy?” representa mejor la voz que una orden impersonal.

### Clara y serena

Una acción principal por bloque, información agrupada y suficiente espacio en blanco. La calma proviene de la jerarquía y la legibilidad.

### Útil para acompañar

En el panel institucional: dato, contexto y acción. Las cifras deben explicar qué representan y distinguir falta de datos de valores reales.

### Honesta sobre sus límites

No transformar textos de tamizaje en diagnósticos ni promesas de privacidad en políticas verificadas. El brandbook define tono, no validación clínica o legal.

Nombre formal observado: “Bienestar KAIROS” en la aplicación. Marca breve observada: “Kairos”, acompañada de “bienestar mental”. Se propone conservar esta distinción en títulos y navegación.

## 4. Marca y activos originales

El rediseño reutiliza el panda y las ilustraciones existentes; no hay un logotipo nuevo en el periodo.

**Evidencia: OBSERVADO + REGLAS PROPUESTAS DE USO.**

### Archivos maestros disponibles

Activos: `public/logo-dark.png` y `public/logo-white.png`. Ambos PNG tienen 2250 × 2250 px y transparencia. Blanco: uso reciente verificado en navegación y AuthShell. Oscuro: variante disponible, sin uso reciente verificado.

### Proporción y protección

Conservar el formato 1:1 y evitar recortes, deformaciones, filtros o recoloración. Respetar el espacio interno del archivo.

Medidas observadas
AuthShell: 110 × 110 px. Navegación lateral: 34 × 34 dentro de un círculo de 48 px. Barra móvil: 40 × 40 px.

Regla propuesta
Reservar alrededor al menos 1/4 del ancho visible del símbolo. Para tamaños pequeños, acompañar el activo con “Kairos” en texto legible.

El logo completo pierde legibilidad a 34 px: el texto lateral compensa parcialmente. Diseñar un isotipo pequeño sería un trabajo posterior; este manual no inventa una versión oficial.

## 5. El sistema tiene dos variantes

Comparten tipografía, geometría y lenguaje. El color distingue el contexto de uso.

**Evidencia: OBSERVADO.**

### Estudiantes y acceso

Verde petróleo como ancla. Turquesa y cian claro como acompañamiento. Fondo frío suave y tarjetas blancas.

### Equipos institucionales

Violeta profundo en navegación. Lavanda en acciones, selección y acentos. Fondo gris violeta y superficies blancas.

Esquemas basados en código. Acción lavanda + blanco: combinación observada con contraste insuficiente para texto pequeño (p. 19); requiere ajuste antes de reutilizar. Administración global no tiene un diseño reciente.

### Administración general · extensión del 7 de octubre de 2026

**Evidencia: IMPLEMENTADO POR INSTRUCCIÓN DEL USUARIO, POSTERIOR A LA AUDITORÍA INICIAL.**

El administrador KAIROS utiliza el layout independiente `layouts/admin.vue` y `components/admin/AdminNavigation.vue`. Su ancla es el verde petróleo oscuro `#04474A`, un tono ya utilizado en el formulario sociodemográfico, más oscuro que el `#065C5D` de estudiantes. Conserva Figtree, canvas `#F4F8F9`, superficies blancas, iconos lineales y foco visible.

Navegación lateral de 272 px en escritorio; por debajo de 960 px, barra superior y menú temporal. El estado del menú es local a esta navegación. La única opción de sección inicial es **Recomendaciones**; el cierre de sesión permanece al pie. El acceso histórico `/admin/dashboard` redirige a `/admin/recommendations`. No se montan las barras de estudiante o institución en este layout.

Esta extensión incorpora una tercera variante de contexto; no altera la evidencia histórica de las dos variantes auditadas. El PDF está pendiente de incorporar la variante de administración general.

## 6. Paleta de estudiantes

Usar los colores por su función, no por los nombres históricos del tema Vuetify.

**Evidencia: OBSERVADO / VALORES RGB DEL CÓDIGO.**

- **Marca / acción fuerte** `#065C5D`: CTA y navegación.
- **Turquesa** `#07979F`: Borde activo y foco.
- **Cian claro** `#6CC5CB`: Gráficas y acentos.
- **Tinte suave** `#DBF2F4`: Chips e información.
- **Texto principal** `#0E2A36`: Títulos y contenido.

| Función            | Valor             | Aplicación observada                                |
| ------------------ | ----------------- | --------------------------------------------------- |
| Canvas             | #F4F8F9           | Páginas del usuario; auth usa #E7ECEE.              |
| Superficie / borde | #FFFFFF / #EAF1F2 | Tarjetas; auth utiliza controles #F6FCFC.           |
| Texto secundario   | #5C7078           | Convive con #5F767E y #4B5F68; aún sin token único. |

Blanco sobre #07979F o #6CC5CB no alcanza 4.5:1 para texto pequeño. Reservar estos tonos para acentos o usar texto oscuro. Ver tabla de contraste, página 19.

## 7. Paleta institucional y semántica

El violeta identifica el espacio. Los estados operativos conservan un significado separado.

**Evidencia: OBSERVADO.**

- **Ancla** `#3C2F52`: Navegación y base Kairos.
- **Acción** `#8475A0`: Valor actual; revisar contraste con blanco (p. 19).
- **Acento** `#CBADD8`: Detalle y selección.
- **Tinte** `#F0EAF5`: Chips y superficies.
- **Texto de acento** `#5C4A75`: Sobre tinte lavanda.

| Rol       | Colores observados          | Uso                                               |
| --------- | --------------------------- | ------------------------------------------------- |
| Base      | #F5F4F8 / #FFFFFF / #EFEBF5 | Canvas / tarjeta / borde institucional.           |
| Atención  | #C77A1F / #FBF3E8 / #8A5A15 | Dato, fondo y texto. Siempre añadir etiqueta.     |
| Favorable | #3F8F7E / #EDF6F3 / #2C6A5C | Dato, fondo y texto. No diagnostica por sí mismo. |

Los errores no tienen aún un único token: auth usa #C84B5D; el formulario sociodemográfico usa #8A1C1C sobre #FDECEC. Documentar la variante; unificar requiere una decisión posterior.

## 8. Figtree es la tipografía de continuidad

Familia incorporada el 18 de agosto y aplicada en los componentes renovados.

**Evidencia: OBSERVADO.**

400 Regular · 500 Medium
600 SemiBold · 700 Bold
800 ExtraBold

Escala del área de usuario

Jerarquía de usuario: página 28 px/800; saludo 26 px/800; tarjeta 16-20 px/700-800; cuerpo 14-15 px/400-600; metadatos 11-13 px/600-800. H1 de acceso: `clamp(2.25rem, 4vw, 3.8rem)`, peso 800, line-height 1.02. Pregunta: 24 px/800, 20 px en móvil.

Institución: vistas 19-21 px; perfil 24 px; cifras 38 px y hero 56 px (46 móvil). Catamaran, Handlee, Yantramanav y PT Sans Caption son legado. Propuesta: conservar Figtree y títulos semánticos h1/h2/h3.

## 9. Espacio, forma y profundidad

La suavidad se construye con radios amplios, bordes tenues y sombras teñidas.

**Evidencia: OBSERVADO + NORMALIZACIÓN PROPUESTA.**

Radios observados: tarjeta de usuario/acceso 24 px; tarjeta institucional 20-24 px; píldoras, acciones y chips 999 px.

### Ritmo observado

Gaps 8, 12, 16, 20 y 24 px; también 18, 22 y 28. Padding de tarjeta: 20-28 px; formulario quiz: 30 px.

### Página de usuario

Desktop: 24 px arriba, 36 px laterales y 48 px abajo. Móvil habitual: 20 / 18 / 40 px.

### Sombras de usuario / auth

Tarjeta: 0 6px 20px -12px rgba(6,92,93,.35). Auth: 0 18px 40px -12px rgba(6,92,93,.28).

Institución: paneles con borde y sin sombra explícita; padding de vista 24 / 32 / 40 px. Propuesta: escala de 4 px para nuevas medidas; no es aún una regla global.

Excepciones legítimas: tarjeta de quiz institucional 22 px; hero de meditación 28 px; esquina superior derecha del drawer 32 px. Evitar convertir cada excepción en un nuevo token general.

## 10. Composición y adaptación

Conservar la prioridad del contenido cuando disminuye el ancho disponible.

**Evidencia: OBSERVADO / LOS ESQUEMAS NO ESTÁN A ESCALA.**

Orden único

Acción visible

Sin columnas forzadas

Estructura de usuario observada: drawer de 272 px; dashboard `1fr + 344px`; sociodemográfico con columna de 340 px. A 1180 px se apila la columna de apoyo; móvil habitual 720 px y quiz 700 px; navegación con umbral md de 960 px.

Institución: dashboard de 4 a 2 y a 1 columnas (1100 / 600 px). Perfil: 1fr + 330 px, apilado a 1100. Catálogo: 3 a 2 y a 1 (1100 / 700).

Auth: máximo 1180 px, grid 1.15fr / 0.85fr y apilado a 960 px. Usuario: apoyo se apila a 1180; móvil habitual 720 (quiz 700). Propuesta: revisar 360, 768 y 1440 px; aún no hay escala responsive única.

## 11. Navegación que orienta

La ubicación activa se reconoce por forma, contraste y peso tipográfico.

**Evidencia: OBSERVADO.**

### Una estructura estable

Marca arriba, grupos al centro y ayuda o salida al pie. Ítem alto 46 px y radio 999 px.

### Activo visible

Blanco sobre navegación oscura, texto del color del contexto y peso 700. Hover: blanco a 8% de opacidad.

Propuesta: añadir aria-current y foco visible coherente. No depender únicamente del cambio de color.

Nombres de archivo históricos: AppBarUser / AppBarInstitute contienen los drawers; NavBarUser / NavBarInstitue contienen las barras móviles. No deducir la anatomía solo del nombre.

Actualización editorial · 22 de septiembre de 2026: por decisión del usuario, la sección `/user/quiz` se llama “Queremos conocerte” en la navegación de estudiantes (escritorio y móvil) y en las indicaciones que remiten a ella. Coincide con el acceso del dashboard. La auditoría inicial se conserva como evidencia histórica; el PDF está pendiente de incorporar esta actualización.

## 12. Formularios y acciones

Etiqueta visible, ayuda próxima al control y respuesta clara al enviar.

**Evidencia: OBSERVADO + AJUSTES DE ACCESIBILIDAD PROPUESTOS.**

### Medidas de referencia

Auth: alto 50 px, borde 2 px, radio 999 px, texto 15 px. Sociodemográfico: alto 52 px y borde 1.5 px.

### Foco y error

Auth: borde #6CC5CB + halo 4 px a 16%. Error #C84B5D y mensaje bajo el campo. Vincular el mensaje con aria-describedby es propuesta.

### Tres acciones, tres intensidades

Primario relleno; secundario blanco con borde; terciario tipo enlace. En carga: verbo + puntos, bloqueo de doble envío y estado visible.

Alturas existentes: 46 px en quiz, 50 en auth, 54 en envío demográfico. El check-in tiene una variante de 74 px.

No sustituir la etiqueta por placeholder. Propuesta: conservar texto oscuro en hover o mantener el fondo petróleo; el hover turquesa actual pierde contraste con blanco.

## 13. Tarjetas y patrones de contenido

Agrupar por propósito y terminar cada bloque con una acción comprensible.

**Evidencia: OBSERVADO.**

### Tarjeta de recurso

Ilustración, badge de contexto, título “Queremos ayudarte”, descripción “Prácticas y especialistas” y acción al pie.

### Cuestionario base institucional

Superficie violeta profunda, etiqueta “Base de Kairos · solo lectura”, título, descripción, metadatos y acciones al pie.

### Próxima cita

Título y estado visible. Cuando no hay cita programada, mostrar el siguiente paso. Los textos de estas muestras son ilustrativos.

Dos patrones de pestañas conviven: subrayadas para Ayuda; segmentadas en píldora para Recomendaciones. Elegir por contexto y mantener el patrón dentro de cada sección.

Actualización de navegación · 22 de septiembre de 2026: por decisión del usuario, “Recomendaciones” se integra como primera pestaña de “Queremos ayudarte”, seguida de “Prácticas del bienestar”, “Meditaciones guiadas” y “Conoce especialistas”. Conserva íntegro su contenido y sus controles internos “Personalizadas”, “Libros” y “Noticias”. Se elimina su entrada independiente del menú y su tarjeta del dashboard; la ruta anterior lleva a `/user/get-help?tab=recommendations`. En “Para ti hoy” quedan “Queremos conocerte” y “Queremos ayudarte”, distribuidas en dos columnas y una columna a 720 px o menos. La barra de Ayuda admite desplazamiento horizontal en pantallas estrechas y foco visible. La auditoría inicial se conserva; el PDF está pendiente de incorporar esta integración.

Esquemas con textos ilustrativos. El botón lavanda + blanco reproduce una deuda de contraste (p. 19). En el catálogo institucional actual, ver/editar/duplicar están deshabilitados; no se presentan como disponibles.

## 14. Cuestionarios: progreso sin presión

Cada respuesta debe ser reconocible y cada avance debe conservar contexto.

**Evidencia: OBSERVADO.**

Una selección clara, con etiqueta y estado visible.

### Anatomía

Indicador de avance, pregunta, opciones y navegación. Titular 24 px; 20 px en móvil.

### Estados

Opción mínimo 56 px, radio 18 y borde 2 px. Selección: #F0FAFA y borde turquesa. Foco de grupo con halo.

Variantes: radio, checkbox, escala, select, número y texto libre. El sociodemográfico se apila y usa acordeones en móvil.

Propuesta: conservar h1/h2 reales, navegación por teclado y foco en todos los tipos de pregunta. finish-quiz.vue está fuera de la ventana: el cierre heredado no define el estilo futuro.

## 15. Datos que llevan a una acción

La interfaz institucional combina lectura rápida, contexto y detalle progresivo.

**Evidencia: OBSERVADO / DATOS ILUSTRATIVOS.**

### Número + contexto

Mostrar periodo, unidad, cobertura y población base. El denominador importa tanto como el total.

### Forma según ancho

Dimensiones en barras; distribución apilada en móvil; mapa con alternativa de lista por código postal.

Estado explícito: atención, promedio o favorable deben aparecer como etiqueta. Cero, sin respuesta, sin cobertura y protegido no son equivalentes.

Los umbrales de cobertura, anonimato y puntuación pertenecen a reglas operativas del producto. No son tokens de marca ni criterios clínicos validados por esta auditoría.

## 16. Diseñar también lo que falta

Los estados son parte del componente, no pantallas improvisadas al final.

**Evidencia: OBSERVADO / CRITERIO PROPUESTO DE CONSISTENCIA.**

### Cargando

Observado: mensaje de carga. Propuesta: reservar altura o añadir skeleton para evitar saltos.

### Vacío

Explicar qué falta y ofrecer una acción que el usuario pueda realizar.

### Error

Decir qué no pudo completarse y ofrecer reintento cuando exista.

### Sin cobertura

Explicar que aún no hay base suficiente para la lectura. Sugerir ampliar periodo.

### Protegido

Conservar el aviso de privacidad de la muestra; no sustituir un valor oculto por cero.

### Acción no disponible

Deshabilitado reconocible y causa comprensible. Evitar promesas de desarrollo en la UI.

El catálogo de cuestionarios y el módulo de estadísticas aportan estados recientes. Propuesta: extender el mismo criterio a todo el producto y anunciar cambios relevantes con regiones de estado accesibles.

## 17. Iconos e ilustraciones

Iconos funcionales para orientarse; ilustraciones existentes para dar cercanía.

**Evidencia: OBSERVADO + CRITERIO DE CONTINUIDAD.**

SVG outline, currentColor, extremos redondos, viewBox 24. En navegación: 20 px y trazo 2.5.

Activos reutilizados: /image-dashboard-16.png cuestionarios; /image-dashboard-19.png ayuda; /image-dashboard-20.png recomendaciones; /image-specialist-22.png especialista; /calendar.png citas.

Propuesta: reutilizar la familia local antes de añadir una distinta. No mezclar iconos 3D, rellenos pesados o fotografías genéricas como identidad principal. Mantener contain y texto alternativo según función.

## 18. Una voz cálida y concreta

Mantener el mismo tono en títulos, acciones, mensajes y datos.

**Evidencia: OBSERVADO + EJEMPLOS EDITORIALES PROPUESTOS.**

| Situación             | Referencia que conviene seguir               | Evitar en nuevas pantallas                         |
| --------------------- | -------------------------------------------- | -------------------------------------------------- |
| Bienvenida            | “¡Qué gusto verte!” / “Buen día, [nombre]”   | Saludos burocráticos o euforia excesiva.           |
| Acción                | “Iniciar sesión”, “Anterior”, “Finalizar”    | “Aceptar” cuando no explica el efecto.             |
| Error                 | “No pudimos iniciar sesión con esos datos.”  | Culpar al usuario o mostrar excepciones técnicas.  |
| Vacío (propuesta)     | “Todavía no hay respuestas en este periodo.” | “No data” o presentar un cero ambiguo.             |
| Datos institucionales | Periodo + total + base + interpretación      | Un porcentaje sin denominador o contexto.          |
| Confianza (propuesta) | Describir funciones y límites comprobados.   | Prometer anonimato absoluto o emitir diagnósticos. |

Usar español claro y consistente; mayúsculas solo en etiquetas breves. Corregir microcopy técnico heredado (“llega en el siguiente paso”, “Sustituye al radar”) al diseñar futuras versiones.

## 19. Contraste y acceso: deuda visible

Conservar una apariencia reciente no exige reproducir sus problemas de legibilidad.

**Evidencia: CÁLCULO sRGB + REGLAS PROPUESTAS.**

| Texto / fondo     | Contraste | Evaluación sobre colores planos |
| ----------------- | --------- | ------------------------------- |
| #FFFFFF / #065C5D | 7.787:1   | Apto para texto normal          |
| #FFFFFF / #8475A0 | 4.172:1   | No apto para texto normal       |
| #FFFFFF / #07979F | 3.538:1   | No apto para texto normal       |
| #FFFFFF / #6CC5CB | 2.003:1   | No apto para texto normal       |
| #5F767E / #F4F8F9 | 4.485:1   | Por debajo de 4.5:1             |
| #C84B5D / #FFFFFF | 4.545:1   | Apto para texto normal          |

Texto: objetivo WCAG AA 4.5:1; texto grande 3:1. Las ratios se evalúan sin redondear. No constituye una certificación de accesibilidad.

Interacción propuesta: foco visible, etiquetas asociadas, teclado completo y zoom habilitado. Diseñar acciones principales de al menos 44 px por comodidad.

WCAG 2.2: SC 1.4.3 contraste, SC 2.4.7 foco visible y SC 2.5.8 objetivo mínimo 24 × 24 CSS px con excepciones. El valor 44 px de este manual es una recomendación de diseño, no el mínimo AA.

Fuentes: [Contraste WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Foco visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [Tamaño mínimo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## 20. Qué dejar atrás y qué conservar

La procedencia protege al equipo de copiar patrones desactualizados.

**Evidencia: MIGRACIÓN PROPUESTA / SIN CAMBIOS EN LA APP.**

### Conservar

Figtree, contexto teal/violeta, superficies blancas, radios suaves, jerarquía clara, iconos outline y activos reutilizados en pantallas nuevas.

### Excluir del canon

Reset-password, verificación, campus-info, finish-quiz, alta de cuestionarios, historial clínico y calendario institucional heredado.

### Primero: cerrar discontinuidades

Alinear acceso y cierre de cuestionarios con sus pantallas nuevas. Revisar el calendario antiguo incrustado en user-detail.

Después: migrar formularios institucionales y clínicos con componentes del mismo contexto. Admin y rutas placeholder requieren diseño específico.

### En cada cambio: corregir sin propagar

Contraste de hover, foco, placeholders y títulos semánticos. El viewport actual limita zoom con maximum-scale=1.

Consolidación: extraer tokens y componentes compartidos después de elegir la variante. El tema Vuetify anterior no debe decidir el nuevo CTA por sí solo.

Los fondos ilustrados globales, fuentes anteriores y componentes de gráficas abandonados son legado. Su presencia en el repositorio no les da prioridad sobre la composición nueva.

## 21. Cómo usar este manual en un cambio

Una receta verificable para diseño, implementación y revisión.

**Evidencia: CONVENCIÓN PROPUESTA / AÚN NO IMPLEMENTADA.**

| Alias propuesto                   | Estudiante          | Institución         |
| --------------------------------- | ------------------- | ------------------- |
| --kairos-action / --kairos-nav    | #065C5D / #065C5D   | #8475A0 / #3C2F52   |
| --kairos-canvas / --kairos-border | #F4F8F9 / #EAF1F2   | #F5F4F8 / #EFEBF5   |
| --kairos-surface / --kairos-text  | #FFFFFF / #0E2A36   | #FFFFFF / #0E2A36   |
| --kairos-font                     | Figtree, sans-serif | Figtree, sans-serif |

### 1. Elegir referencia

Tomar un componente de la ventana que resuelva el mismo problema. Usar el inventario para detectar descendientes antiguos.

2. Diseñar estados: normal, hover, foco, seleccionado, carga, vacío, error y deshabilitado según la interacción.

### 3. Verificar y registrar

Revisar responsive, contraste, teclado, zoom, datos largos y texto. Actualizar el manual cuando cambie una regla compartida.

4. Implementar: seguir las carpetas existentes, contratos tipados y autorización de rutas. Ejecutar npm run lint al cambiar código.

Alias documentales, aún no implementados. #8475A0 es el valor observado: su combinación con blanco exige ajuste de contraste (p. 19) antes de nuevos usos. Mantener excepciones junto al componente.

## 22. Trazabilidad y mantenimiento

Cada familia visual del brandbook tiene una referencia concreta en el historial.

**Evidencia: FUENTES DEL REPOSITORIO / EDICIÓN 1.0.**

| Fecha / commit   | Familia          | Archivos de referencia                                                  |
| ---------------- | ---------------- | ----------------------------------------------------------------------- |
| 18 ago · ff1dee2 | Acceso           | global/AuthShell.vue; login/LoginForm.vue; register/register.vue        |
| 19 ago · 563a7b3 | Usuario          | global/AppBarUser.vue; user/dashboard/dashboard.vue                     |
| 21 ago · 19524c4 | Recursos         | user/get-help/get-help.vue; user/recomendations/recomendations.vue      |
| 21 ago · 2955dc1 | Cuenta           | user/profile/profile.vue; user/history/history.vue                      |
| 25 ago · ea6c815 | Datos personales | user/quiz/demographic-survey.vue                                        |
| 25 ago · fe5cbbc | Cuestionarios    | user/quiz/question.vue; user/quiz/quiz-navigation.vue                   |
| 03 sep · cefbe8a | Institución      | global/AppBarInstitute.vue; institute/dashboard/dashboard-institute.vue |
| 03 sep · 864befa | Usuarios         | institute/my-users/my-users-dashboard.vue; user-detail.vue              |
| 04 sep · 5a9ac8b | Estadísticas     | institute/my-stats/my-stats.client.vue y subcomponentes                 |
| 07 sep · fba7b52 | Catálogo         | institute/my-quizzes/my-quizzes.vue; quiz-card.vue                      |

Rutas de esta tabla relativas a components/. La auditoría editable incluye los 95 SFC, fechas, líneas y excepciones. Esquemas redibujados a partir de CSS; no se validaron pantallas autenticadas en ejecución.
