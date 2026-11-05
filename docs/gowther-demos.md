# Configuración demo en administración general

Implementación local del 4 de noviembre de 2026. Ruta `/admin/demos`, exclusiva de
KAIROS_ADMIN. Sigue el contrato de Gowther ADR 0020. No instala un dispatcher, inicia
un worker desde HTTP ni reemplaza el generador heredado de asignación de Escanor.

## Recorrido

1. Elegir una institución. La selección es local a la pantalla: no cambia la cuenta,
   su membresía ni el contexto del panel institucional. Una institución inactiva no
   permite generar ni consultar demos.
2. Asignar la cantidad de usuarios de ejemplo mediante el formulario existente de
   Escanor, ahora ubicado aquí. El valor inicial sin asignación es 100. Se conservan
   las cantidades existentes, presets y máximo de 5,000 de ese servicio. La asignación
   puede completar ejemplos heredados; no los convierte en generaciones de Gowther.
3. Elegir un cuestionario activo, publicado y schema v2 del catálogo de la institución.
   Consultar la asignación/revisión/huella, configuraciones retenidas y trabajo actual.
4. Elegir distribución uniforme, normal o sesgo alto/bajo. La normal usa centro 0..1
   y dispersión 0.01..0.50 antes de truncar; sesgos usan intensidad 1..8. Cambiar de
   distribución restablece parámetros compatibles. Los controles orientan respuestas,
   no garantizan media o desviación exactas. Ajustes de dimensión son optativos.
5. Guardar y solicitar generación. Se crea una semilla Web Crypto de 32 bytes y se
   envía latestVersion+1 con la revisión de asignación y de definición observadas.
   El backend vuelve a comprobar todo y guarda configuración+job atómicamente.
6. Actualizar estado manualmente. En espera significa que el equipo debe ejecutar el
   worker por alcance en Gowther. No se muestra progreso porcentual inventado ni se
   hacen sondeos ilimitados. El worker sigue operándose según ADR 0019/0020.
7. Ver estadísticas demo consulta exclusivamente la generación activa, etiquetada
   sintética. Muestra media, mediana, moda, desviación poblacional y cobertura por
   dimensión/pregunta, con reglas de supresión y sus motivos. Una nueva generación
   no se muestra hasta estar completa. Sus controles se presentan separados del borrador.
8. Cancelar requiere una confirmación dentro de la pantalla. Cancela el job exacto;
   no borra la activa. La limpieza sigue siendo responsabilidad del worker acotado.

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

No hay lectura demo institucional en este paso; los informes reales conservan sus
rutas, períodos cerrados y política de publicación. No se mezclan resultados de ejemplo
heredados con generaciones activas de Gowther.

## Verificación

- `npm run lint` y `npm run build`.
- `node scripts/check-demo-setup.mjs`: contratos, cero, supresión, mínimo demo/real,
  render de resultados, allowlist, interceptor real Axios con transporte en memoria,
  autorización del frontend, reintentos exactos y respuestas tardías al cambiar contexto/sesión.
- `node scripts/check-statistics-publication.mjs`: regresión de informes reales.
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
