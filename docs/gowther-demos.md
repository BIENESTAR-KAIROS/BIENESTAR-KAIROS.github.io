# Configuración demo en administración general

Implementación local del 4 de noviembre de 2026. Ruta `/admin/demos`, exclusiva de
KAIROS_ADMIN. Sigue el contrato de Gowther ADR 0020 y el worker continuo de ADR 0021.
El proceso se inicia por separado con `make run-worker` en Gowther; no arranca desde
HTTP y reconcilia las asignaciones según ADR 0022. Escanor conserva el generador heredado
solo en producción hasta su migración.

## Recorrido

1. Elegir una institución. La selección es local a la pantalla: no cambia la cuenta,
   su membresía ni el contexto del panel institucional. Una institución inactiva no
   permite generar ni consultar demos.
2. Asignar la cantidad de usuarios de ejemplo mediante el formulario existente de
   Escanor, ahora ubicado aquí. El valor inicial sin asignación es 100. Se conservan
   las cantidades existentes, presets y máximo de 5,000 de ese servicio. La asignación
   en desarrollo/test registra un estado persistente: el worker genera los instrumentos
   compatibles con una normal inicial (centro 0.5, dispersión 0.15). No convierte
   historiales heredados en resultados de Gowther.
3. Elegir un cuestionario activo, publicado y schema v2 del catálogo de la institución.
   Consultar la asignación/revisión/huella, configuraciones retenidas y trabajo actual.
4. Elegir distribución uniforme, normal o sesgo alto/bajo. La normal usa centro 0..1
   y dispersión 0.01..0.50 antes de truncar; sesgos usan intensidad 1..8. Cambiar de
   distribución restablece parámetros compatibles. Los controles orientan respuestas,
   no garantizan media o desviación exactas. Ajustes de dimensión son optativos.
5. Guardar y solicitar generación. Se crea una semilla Web Crypto de 32 bytes y se
   envía latestVersion+1 con la revisión de asignación y de definición observadas.
   El backend vuelve a comprobar todo y guarda configuración+job atómicamente.
6. El worker continuo descubre y ejecuta la solicitud. Mantener una sola instancia de
   `make run-worker` en otra terminal de Gowther. Usar **Actualizar estado** para ver
   el avance: no hay sondeos ilimitados ni porcentajes inventados. Estar en espera
   no prueba que el proceso esté conectado; si no avanza, revisar el servicio.
7. Ver estadísticas demo consulta exclusivamente la generación activa, etiquetada
   sintética. Muestra media, mediana, moda, desviación poblacional y cobertura por
   dimensión/pregunta, con reglas de supresión y sus motivos. Una nueva generación
   no se muestra hasta estar completa. Sus controles se presentan separados del borrador.
8. Cambiar cantidad en la misma asignación retira la revisión obsoleta y regenera
   con los últimos controles y semilla de cada cuestionario. Quitar demos programa
   retiro y limpieza sin eliminar perfiles ni historial compartido. Reasignar inicia
   otra asignación con controles normales; no hereda los de la anterior.
9. Cancelar requiere una confirmación dentro de la pantalla. Cancela el job exacto;
   no borra la activa. El worker limpia automáticamente las candidatas terminales
   y generaciones retiradas, estas últimas después de al menos un minuto. La limpieza
   puede tardar más por trabajos en curso; mientras tanto se bloquea otra generación.

La API limita la lectura a 2,000 participantes y 200,000 observaciones como máximo;
el límite concreto viene en `maxParticipants`. Una asignación más grande bloquea
la solicitud con explicación; no se recorta ni muestrea. Las dimensiones que comparten
preguntas no pueden recibir dos ajustes explícitos: el frontend detecta solapamiento
si tiene la definición y Gowther siempre aplica la comprobación autoritativa.

## Sesión, aislamiento y reintentos

`$axios` consulta catálogo, etiquetas y asignaciones en Escanor. `$statsApi` solo
adjunta el bearer a rutas relativas de Gowther incluidas exactamente en la allowlist.
En demos exige ruta `/admin/demos`, rol global y selección institucional canónica;
manda `X-Kairos-Institution` como contexto solicitado. Escanor valida el contexto y
la autorización global en cada petición. El frontend no es la barrera de permisos.
No lleva credenciales de servicio ni guarda bearer en formularios, docs o jobs.

Cambiar institución/cuestionario invalida las consultas anteriores, aborta lecturas y
retira los resultados previos. Un cambio de sesión también descarta respuestas tardías.
Mientras una mutación está en curso o no se ha confirmado, la selección y los controles
quedan bloqueados. Ante timeout/red/5xx se mantiene en memoria el cuerpo exacto para
reintentar, sin generar nueva semilla ni incrementar la versión. Se puede dejar de
reintentar explícitamente y volver a consultar el estado, con advertencia de que la
solicitud puede haberse guardado. No se persiste el borrador tras recargar la página:
en ese caso se debe releer estado antes de crear una nueva solicitud.

Los resultados se validan antes de renderizar: marcador sintético, asignación,
generación, configuración, conteo, revisión y forma de métricas. El mínimo demo de
1 no altera el mínimo real de 10. No se admiten valores ocultos para métricas suprimidas.
Las tarjetas reutilizan la presentación de métricas existente, con colores del contexto
administrativo. Solo se usan etiquetas de la revisión actual cuando coincide con la
configuración del informe; una revisión anterior muestra IDs y aviso.

El avance inicial no incluía lectura demo institucional (ver la sección de lectura del 9 de noviembre); los informes reales conservan sus
rutas, períodos cerrados y política de publicación. No se mezclan resultados de ejemplo
heredados con generaciones activas de Gowther.

## Verificación

Las gráficas compartidas de media/mediana, dispersión y cobertura están descritas
en [informes institucionales](gowther-periods.md#gráficas-de-los-informes).
En demos usan la variante administrativa y la revisión de la generación activa;
conservan la etiqueta sintética y el fallback de nombres para revisiones anteriores.

- `npm run lint` y `npm run build`.
- `node scripts/check-demo-setup.mjs`: contratos, cero, supresión, mínimo demo/real,
  render de resultados, allowlist, interceptor real Axios con transporte en memoria,
  autorización del frontend, reintentos exactos y respuestas tardías al cambiar contexto/sesión.
- `node scripts/check-statistics-publication.mjs`: regresión de informes reales.
- `node scripts/check-publication-charts.mjs`: escalas independientes, cero,
  valores negativos, supresión y denominadores de cobertura, sin servicios.
- Los scripts usan únicamente fixtures sintéticas y Vue/TypeScript ya instalados;
  no leen `.env`, no hacen HTTP, no escriben Atlas y no agregan un runner ni dependencias.
- Revisión visual autenticada: 360, 768 y 1440 px; menú, foco, selección, controles
  uniforme/normal/alto/bajo, dimensiones, carga/error/vacío, espera/cancelación y resultados.
  Revisar esa parte por separado de las comprobaciones automáticas.

Referencias de diseño: brandbook, variante administrativa (sección 5), tipografía,
composición, formularios, datos y estados (8–16); auditorías frontend/institucional
como evidencia de patrones recientes y deuda heredada. No se adoptan como norma los
colores de bajo contraste ni los focos imperceptibles documentados. Nueva navegación
registrada en el brandbook; su PDF permanece pendiente de actualizar.

La generación automática respeta jobs cancelados/fallidos de la revisión vigente.
Guardar la misma cantidad no reinicia esos jobs: solicitar otra generación explícita
o cambiar efectivamente la asignación. Un cambio de definición no provoca recálculo
automático. El botón Guardar asignación no promete rellenar resultados heredados;
el mensaje de respuesta distingue `generationMode: gowther` de legacy. No se conoce
la disponibilidad del worker desde la UI; se mantiene Actualizar estado.

## Lectura desde el panel institucional (9 de noviembre de 2026)

`/institute/stats` incorpora el selector **Alumnos reales / Datos demo**, inicialmente
real. Cambiar de población desmonta la consulta anterior: no conserva resultados ni
peticiones pendientes entre vistas. La demo no necesita un período de evaluación y
no crea publicaciones reales. Reutiliza las gráficas/tablas con la variante violeta.

La consulta usa GET `/v1/statistics/demos/questionnaires/{id}` y su sufijo `/report`.
Escanor valida sesión/revocación, institución activa y membresía/rol vigente en una
ruta de servicio independiente. Personal institucional lee solo su institución;
el administrador global conserva su contexto institucional seleccionado. No se
habilitan los endpoints administrativos para ese personal. La UI no ofrece semillas,
controles de distribución, asignación, cancelación ni generación.

El estado distingue espera, ejecución, activación, fallo/cancelación y limpieza.
Sin asignación vigente explica el retiro; una revisión cambiada bloquea los datos
anteriores. Durante un reemplazo compatible puede mostrarse la generación activa
anterior con aviso. Los datos se limpian al cambiar sesión, institución o cuestionario;
las respuestas tardías se descartan. Una nueva consulta valida todo otra vez.
Etiquetas opcionales se usan solo si coinciden cuestionario y revisión.

Verificación: `npm run lint`, `npm run build`, `node scripts/check-demo-setup.mjs`.
Este último comprueba contratos, rechazo de mezcla real/demo/otra institución,
conteos, render, cambios de sesión/contexto y transporte de solo lectura. Referencias
visuales: brandbook secciones 5, 7–10, 12, 15–16 y 18–19; auditoría institucional.

Revisión visual autenticada: administrador global en contexto UP, ASSIST con 100
participantes sintéticos, 10 dimensiones y 70 preguntas. Se comprobaron las tres
vistas de gráfica y el cambio entre poblaciones sin conservar el informe anterior.
A 360 y 1440 px no se observó desbordamiento horizontal. La lectura de staff/admin
institucional se verificó con pruebas de autorización; no se usaron credenciales
personales de esos roles. No se crearon publicaciones reales durante la revisión.
