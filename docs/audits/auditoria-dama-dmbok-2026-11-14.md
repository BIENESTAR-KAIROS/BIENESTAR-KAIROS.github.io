# Segunda auditoría de gestión de datos — Bienestar KAIROS

Fecha de corte: 14 de noviembre de 2026, America/Mexico_City.
Comparación con la [auditoría inicial del 28 de octubre](auditoria-dama-dmbok-2026-10-28.md).

## Dictamen

**La alineación con DAMA-DMBOK mejoró sustancialmente en seguridad, arquitectura, integración, metadatos y publicación estadística.** El retiro de FastAPI y su sustitución por Gowther cambian los controles efectivos sobre los datos: autenticación institucional, separación real/demo, procedencia explícita, puntuación autoritativa en Escanor y publicaciones protegidas e inmutables.

Los tres riesgos prioritarios asociados al servicio anterior tienen avances comprobables: retiro de las rutas de FastAPI, revocación documentada de la credencial expuesta y sustitución de los informes que permitían recuperar filas individuales. No deben seguir presentándose como si la arquitectura de octubre continuara activa. El saneamiento del historial Git sigue pendiente, aunque la credencial histórica ya no permite autenticarse según la prueba operativa documentada.

**La alineación integral sigue siendo parcial.** Persisten fallos reproducibles de validación demográfica y brechas de integridad en Escanor. Faltan evidencias suficientes de gobierno organizacional, ciclo de vida, auditoría transversal y recuperación ensayada. Gowther incorpora controles analíticos sólidos, pero no resuelve por sí solo estos aspectos de todo el proyecto.

Se mantienen las 11 áreas de DAMA-DMBOK 2 como referencia comparativa. Son disciplinas de gestión, no una lista de funciones que un backend pueda aprobar automáticamente. Esta revisión no asigna porcentaje de madurez, certificación ni conclusión de cumplimiento legal. Las prioridades y criterios de cierre son propuestas para KAIROS. Referencia oficial consultada: [DAMA-DMBOK Framework](https://www.damadmbok.org/dmbok-framework).

## Alcance y calidad de la evidencia

| Alias | Repositorio                  | Commit local inspeccionado                 |
| ----- | ---------------------------- | ------------------------------------------ |
| F     | `BIENESTAR-KAIROS.github.io` | `c5c2fbdecc0ad3988a8278be00dfd455c568f026` |
| B     | `escanor-bienestarkairos`    | `59c64666a2706cc2943fd08ee02b7c61aab85c62` |
| G     | `gowther`                    | `8db35fbc12cb38f0be3c5715a6a93126aea31b72` |

Los tres árboles estaban limpios al comenzar. FastAPI se trata como componente retirado; no se ejecutó ni se recuperó su historial remoto. Se usaron los grafos existentes para localizar contratos y flujos, y luego se contrastaron código, pruebas, cambios desde octubre y registros operativos.

Se distinguen tres niveles:

- **Verificado ahora:** inspección de código, pruebas locales y tres sondas públicas sin autenticación.
- **Documentado:** actuaciones productivas registradas entre el 11 y el 14 de noviembre. Se revisó su evidencia escrita, sin repetir acceso a Atlas o al servidor.
- **No evidenciado / pendiente:** no acreditado en el material revisado; puede existir fuera de estos repositorios. No se interpreta automáticamente como ausencia de un proceso.

Los commits locales no se equiparan a las versiones desplegadas. El registro más reciente de Escanor identifica la release productiva `f5d0e09ad7a58666706bf9a2fec072c30a73c07a`; la documentación de despliegue identifica Gowther v0.1.0, commit `11baae0e729cc4d90190b23c1d5beb3cfd73a1bb`. No se verificaron remotamente esos binarios en esta auditoría.

No se consultaron datos personales, credenciales ni colecciones Mongo; no se hicieron migraciones, simulaciones productivas o cambios de configuración. Tampoco se solicitó un informe real autenticado: la primera consulta elegible puede persistir una publicación. No se realizó revisión visual ni de accesibilidad; esta auditoría no modifica criterios del brandbook. La única incorporación es este informe.

## Mejoras comprobables desde octubre

1. **Retiro de la superficie antigua.** El registro operativo acredita eliminación del proceso, entorno y proyecto productivo de FastAPI. La sonda pública actual a `/fastapi/docs` devuelve 410. Gowther no ofrece el explorador genérico de bases, colecciones y documentos que originó H01.
2. **Identidad institucional validada en el servidor.** Gowther delega la sesión a Escanor mediante una credencial de servicio separada, valida el contexto y los permisos y falla de forma cerrada. El frontend limita los destinos que reciben el bearer. El logout incorpora revocación persistida; el alcance es el token presentado, no todas las sesiones. Referencias: B `validate-gowther-session.use-case.ts`, `docs/token-revocation.md`; G `internal/httpapi/statistics.go:98`; F `plugins/axios.ts:61`.
3. **Credencial histórica revocada y ambientes separados.** La nota del 11 de noviembre dejó la cuenta compartida pendiente; la del 13 acredita su sustitución y rechazo de autenticación en Atlas. La del 14 registra saneamiento posterior de código y artefactos. Desarrollo tiene una cuenta distinta, con permisos sobre su base. B `src/config/database.config.ts:3` ya no contiene URI de respaldo. Esto mejora H02 y H10; no equivale a certificar todos los clones o snapshots.
4. **Protección estadística aplicada antes de entregar la respuesta.** Gowther fija un mínimo real de 10 participantes, suprime celdas/complementos pequeños y resultados relacionados, y usa la misma respuesta para cohortes vacías o insuficientes. Los períodos reales son registrados, cerrados y no solapados. La publicación persistida no se recalcula al cambiar la fuente. Referencias: G `internal/analytics/types.go:12`, `internal/publication/protect.go:52`, `internal/publication/service.go:116`.
5. **Procedencia y calidad semántica explícitas.** Escanor captura `analyticsPopulation` desde el usuario autenticado y `analyticsSnapshot` con revisión, huella y estados de respuesta/puntuación dentro de la transacción de entrega. Gowther distingue ausente, inválido, no aplicable, no puntuado y cero válido; aplica el umbral de omisión obligatoria sin sustituirlo por cero. El cálculo selecciona el último intento por persona/revisión dentro del período. Referencias: B `src/common/analytics-population.ts:1`, `save-definition-answer.use-case.ts:30`, `save-definition-result.use-case.ts:17`; G `internal/analytics/query.go:20`, `metrics.go:65`.
6. **Separación real/demo visible en el flujo activo.** F `pages/institute/stats.client.vue:1` usa `PublicationStats` y `DemoStats`, con población real inicial. Las demos tienen configuraciones y generaciones identificables, evaluación oficial de Escanor, activación controlada y ejecución fuera de HTTP. La prueba productiva documentada de ASSIST alcanzó 500 participantes en aproximadamente 17 segundos; es evidencia acotada de esa carga, no capacidad demostrada para cualquier cuestionario o para 2,000 participantes.
7. **Pruebas y entrega más disciplinadas.** Escanor pasa de 472 a 602 pruebas; Gowther incorpora pruebas de privacidad, contratos, concurrencia y fallos, además de CI con análisis estático, detector de carreras, compilación y revisión de vulnerabilidades configurados. Hay registros de releases, checksums, cortes y comprobaciones posteriores. Sigue pendiente llevar controles equivalentes a la integración continua de F y B.

La supresión por tamaño de grupo y la inmutabilidad reducen divulgación; no constituyen una garantía absoluta de anonimato frente a correlaciones entre instrumentos, revisiones u otras fuentes. Ese riesgo debe tener un responsable y revisión periódica de las políticas de publicación.

## Comparación de los 14 hallazgos originales

“Cerrado en el alcance” significa que se corrigió la condición concreta identificada, no que toda el área DAMA esté resuelta.

| Hallazgo original                                  | Estado al corte                                            | Qué cambió y qué falta                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H01 — FastAPI sin autorización propia              | **Cerrado en el servicio sustituido**                      | Retiro documentado y 410 público actual. Gowther autentica y deriva institución; no admite exploración arbitraria de Mongo. Falta una nueva comprobación autenticada productiva completa de la matriz de roles e instituciones.                                                                          |
| H02 — Credencial incrustada                        | **Riesgo activo contenido; saneamiento histórico parcial** | Rotación, revocación y rechazo de la cuenta antigua documentados; defaults eliminados y artefactos saneados. Persisten límites explícitos sobre Git, clones, cachés y snapshots. La prioridad residual es saneamiento coordinado, no una nueva rotación de la cuenta ya revocada.                        |
| H03 — Filas individuales y umbral reducible        | **Cerrado en el flujo reemplazado**                        | Las rutas antiguas se retiraron; el nuevo informe aplica mínimo 10, supresión complementaria, períodos controlados y persistencia inmutable. Pruebas locales aprobadas. Mantener revisión de inferencias entre publicaciones y verificación de la versión desplegada.                                    |
| H04 — Demografía sin validación anidada            | **Abierto; reproducido**                                   | El DTO exterior sigue usando solo `IsObject`. Un objeto sintético con edad −99, género inválido y una propiedad demográfica desconocida atraviesa `ValidationPipe`, incluso con whitelist y rechazo de propiedades no permitidas. No se insertó en Mongo.                                                |
| H05 — Perfil e historial no atómicos               | **Abierto; confirmado en código**                          | Se actualiza el perfil antes de insertar historial, sin sesión compartida; la siguiente versión se calcula leyendo la anterior. No se midieron pérdidas o duplicados reales.                                                                                                                             |
| H06 — Unicidad de identidad sin garantía declarada | **Abierto; índice desplegado no verificado**               | `UserSchema.indexes()` sigue mostrando únicamente índices de demos y de institución. No hay índice único de correo declarado; no se consultaron índices de Atlas ni se midieron duplicados.                                                                                                              |
| H07 — Consentimiento y ciclo de vida               | **Sin evidencia suficiente de cierre**                     | La limpieza de demos y el TTL de revocaciones son avances específicos, pero no sustituyen una política para perfiles, respuestas, resultados, texto libre, publicaciones y respaldos. Falta acreditar aceptación/finalidad versionada donde corresponda y disposición trazable.                          |
| H08 — Gobierno de datos                            | **Mejoró lo técnico; pendiente lo organizacional**         | ADR, contratos y fuentes de autoridad están mucho más claros. No se encontró una matriz aceptada de responsables de datos, custodios, aprobación de indicadores e incidentes de calidad.                                                                                                                 |
| H09 — Auditoría transversal                        | **Parcial**                                                | Mejores snapshots analíticos, trabajos, releases y registros operativos. No se acreditó un registro transversal protegido que reconstruya accesos sensibles, cambios de roles/membresías y decisiones administrativas. Un log de despliegue no cubre esos eventos.                                       |
| H10 — Recuperación y aislamiento                   | **Mejora importante; parcial**                             | Cuentas diferenciadas, permisos comprobados en registros operativos, loopback, servicio dedicado de Gowther, checksums y procedimientos de corte. Falta ensayo integral de restauración con RPO/RTO y reconciliación. Escanor conserva `readWrite` sobre toda la base, incluidas colecciones de Gowther. |
| H11 — Contratos, metadatos y catálogos             | **Mejora importante; parcial**                             | Contratos v1/v2, huellas, OpenAPI y normalización explícita. El flujo activo ya no selecciona una base arbitraria. Permanecen catálogo organizacional incompleto, catálogos demográficos distribuidos y código heredado con `BienestarKairosDev`.                                                        |
| H12 — Historia, población y BI                     | **Corregido en el nuevo diseño; cierre operativo parcial** | Procedencia capturada, institución histórica de la entrega, real/demo separados, retomas deterministas y límites que producen error en vez de truncar silenciosamente. Falta medir elegibilidad/calidad de históricos reales y probar el recorrido real completo con un conjunto controlado.             |
| H13 — Procedencia de contenido e IA                | **Sin mejora de cierre demostrada**                        | La trazabilidad analítica mejoró, pero el esquema de respuestas de IA sigue sin versión de modelo/prompt por evaluación. No se acreditó catálogo integral de fuente, licencia, aprobación y revisión del contenido.                                                                                      |
| H14 — Pruebas y calidad continua                   | **Mejora importante; parcial**                             | 602 pruebas de B, suite Go con detector de carreras y tres verificaciones de F aprobadas. G sí tiene CI versionado. F eliminó su workflow anterior y F/B no tienen `.github` en estos checkouts; no se verificó CI externo. Las métricas operativas de calidad siguen pendientes.                        |

## Cobertura de las 11 áreas DAMA-DMBOK

| Área                                          | Evolución                                                   | Próxima evidencia necesaria                                                  |
| --------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Gobierno de datos                             | Decisiones técnicas y contratos más explícitos              | Responsables por activo, políticas aprobadas y tratamiento de excepciones    |
| Arquitectura de datos                         | Escanor como autoridad; Gowther separado y acotado          | Mapa vigente de flujos y privilegios efectivos entre servicios               |
| Modelado y diseño                             | Snapshots, revisiones y procedencia más consistentes        | Validación anidada, unicidad canónica y transacciones demográficas           |
| Almacenamiento y operación                    | Mejores despliegues, cuentas y generaciones                 | Restauración ensayada, RPO/RTO, capacidad y alertas                          |
| Seguridad de datos                            | Mayor avance: retiro, revocación, autorización y privacidad | Reducir permisos amplios de Escanor y sostener pruebas cruzadas              |
| Integración e interoperabilidad               | Contratos explícitos y evaluación centralizada              | Contratos F/B/G bloqueantes en CI y manejo de datos históricos incompatibles |
| Documentos y contenido                        | Mejor evidencia operativa y ADR                             | Procedencia/licencia/aprobación de contenido y documentación vigente         |
| Datos maestros y de referencia                | Autoridad de identidad/membresía más definida               | Catálogos canónicos, normalización de correo y responsables de cambios       |
| Almacenes de datos e inteligencia de negocios | Informes reproducibles y poblaciones separadas              | Aprobar significado de indicadores y validar cobertura real histórica        |
| Metadatos                                     | Huellas, revisiones, políticas y estados analíticos         | Diccionario transversal, clasificación, responsables y linaje de negocio     |
| Calidad de datos                              | Calidad analítica comprobada con muchas más pruebas         | Calidad en captura, integridad concurrente y medición operacional            |

No se propone comprar un almacén de datos ni incorporar otra plataforma para satisfacer el marco. La siguiente inversión útil está en cerrar integridad, responsabilidades y evidencia operativa sobre la arquitectura existente.

## Pendientes priorizados y criterios de cierre

Las prioridades son de esta auditoría: **P1**, siguiente ciclo de endurecimiento; **P2**, consolidación planificada. No se observó en las comprobaciones actuales una repetición activa de los tres P0 originales. Esto no sustituye una prueba de penetración ni una inspección completa del despliegue.

### P1 — Calidad e integridad al capturar datos: H04, H05 y H06

**Evidencia:** B `src/user/domain/dto/request/user-student-data-patch.request.dto.ts:5`, `student-data.request.dto.ts:15`, `src/user/domain/use-cases/update-user-student-data.use-case.ts:40`, `src/demographic-history/domain/use-cases/save-demographic-history.use-case.ts:20` y `src/user/domain/schemas/user.schema.ts:23`. Estos puntos no cambiaron respecto del corte anterior.

**Acciones propuestas:** DTO anidado con transformación y validación explícitas; reglas acordadas de rangos y catálogos; actualización de perfil e historial en una transacción; control de concurrencia de versión; normalización de correo e índice único después de inventariar y resolver posibles colisiones.

**Cierre verificable:** payloads inválidos rechazados antes de persistir; fallo de historial revierte el perfil; dos solicitudes concurrentes no duplican versión ni saltan la restricción de actualización; correo canónico concurrente produce un registro y un conflicto controlado. Verificar los índices efectivos sin asumir que el esquema local describe Atlas. Responsables propuestos: backend y responsable del dato demográfico/identidad.

### P1 — Gobierno, ciclo de vida y trazabilidad: H07, H08 y H09

**Acciones propuestas:** catálogo inicial de identidad, membresía, demografía, instrumentos, respuestas/resultados, contenido/IA y publicaciones; responsable de decisión y custodio por activo; clasificación, finalidad, reglas de acceso, calidad y conservación. Acordar los plazos con quien corresponda, sin inventarlos desde ingeniería. Definir eventos auditables mínimos con actor, sujeto, institución, acción, motivo, resultado y correlación, sin copiar respuestas sensibles o tokens.

**Consideración nueva por la inmutabilidad:** definir qué sucede si una publicación debe retirarse por error de origen o decisión de conservación. Un procedimiento de retiro/suspensión debe conservar la trazabilidad y evitar liberar una segunda versión que permita calcular diferencias sensibles. No resolverlo sobrescribiendo silenciosamente el informe ni alterando la política en su clave.

**Cierre verificable:** responsables aceptados y un caso sintético reconstruible desde captación hasta disposición, incluyendo derivados y respaldo; un cambio administrativo puede reconstruirse sin depender de consola. Responsables: producto, privacidad, backend y representantes institucionales.

### P1 — Permisos de Escanor y recuperación: H10

**Evidencia nueva:** B `docs/mongo-credential-rotation-2026-11-13.md:7` documenta que la nueva cuenta productiva tiene `readWrite` sobre toda `BienestarKairos`, incluidas las colecciones de Gowther. La separación de cuentas es real, pero la protección insert-only de la cuenta de Gowther no impide que otra cuenta con permisos más amplios altere esas colecciones. Es un riesgo de alcance ante una escritura accidental o compromiso de Escanor; no se observó alteración de informes.

**Acciones propuestas:** inventariar operaciones de Escanor, definir permisos por colecciones según necesidad y probarlos antes de retirar privilegios. Ensayar restauración aislada de fuente, períodos, publicaciones, revocaciones y estado demo, con reconciliación de relaciones y checksums. El registro del corte mantiene Escanor bajo PM2 como root; planificar un usuario de servicio con permisos acotados. Conservar credenciales nuevas en cualquier reversión: las recetas anteriores a la revocación ya no son válidas.

**Cierre verificable:** Escanor completa sus operaciones y se le deniega mutar publicaciones de Gowther salvo necesidad explícitamente aprobada; restauración medida dentro de RPO/RTO acordados, con acceso y revocaciones consistentes. Responsables: infraestructura y backend.

### P2 — Worker: distinguir incompatibilidad permanente de fallo transitorio

**Evidencia:** G `docs/qa/production-worker-start-2026-11-11.md:68` registra el Sociodemográfico con `multiple_choice` no soportado por el generador y ciclos incompletos con reintento de 30 segundos. El retiro posterior acepta mantener ese pendiente. G `internal/dispatch/dispatch.go:62` acumula fallos y `Run` aplica el backoff global; `cmd/worker/daemon.go` emite un aviso genérico. Los cursores avanzan y las fases posteriores se intentan: no se afirma bloqueo total ni que esa incompatibilidad sea la única causa del aviso.

**Acciones propuestas:** distinguir capacidad no soportada, autorización revocada y fallo temporal; aislar/quarantinar la asignación incompatible hasta un cambio de revisión o configuración; observabilidad con motivo estable y alcance seudónimo. No intentar generar datos con un tipo de pregunta no soportado para evitar el error.

**Cierre verificable:** una asignación incompatible no produce reintento indefinido indiferenciado ni penaliza continuamente el ritmo global; otra asignación válida y la limpieza progresan. Confirmar primero si el estado productivo documentado sigue vigente. Responsables: Gowther y operación.

### P2 — Completar la evidencia de BI real y de capacidad: H11 y H12

**Acciones propuestas:** medir agregadamente entregas sin snapshot/procedencia, pares inconsistentes y revisiones no elegibles; decidir exclusión documentada o migración específica, sin inventar afiliación histórica. Mantener un diccionario de indicador con unidad, denominador, período, retomas y causas de supresión. Probar un flujo real con datos sintéticos controlados, separado de las demos del producto, y cargas representativas dentro de los límites actuales.

**Cierre verificable:** captura → snapshot → normalización → publicación → frontend conserva el significado acordado; cambios de membresía no reclasifican históricos; exceso de límites no devuelve cifras parciales; reemplazo/limpieza y recuperación cumplen el presupuesto medido. La prueba ASSIST de 500 no autoriza extrapolar capacidad a 2,000 ni ampliar a 5,000.

### P2 — CI, documentación, historial y contenido: H02, H11, H13 y H14

- Incorporar en F/B CI de lint, compilación y pruebas relevantes con el runtime declarado, sin que esto implique despliegue automático. Integrar las tres verificaciones de estadísticas del frontend; mantener contratos entre servicios.
- Reconciliar documentación vigente con QA histórico. G `docs/contracts.md:5–12` todavía afirma ausencia de despliegue y readiness 503, aunque los registros posteriores acreditan producción. Preservar las notas históricas, pero marcar qué estado fue sustituido y enlazar rotación/saneamiento del 13–14 de noviembre.
- Inventariar y retirar consumidores/código/configuración legacy después de verificar referencias. F `components/institute/my-stats/stats-config.ts:7` aún fija `BienestarKairosDev`; el flujo activo inspeccionado ya usa Gowther, por lo que no se presenta como fuga productiva demostrada.
- Coordinar saneamiento de historia publicada de Escanor/FastAPI y copias conocidas; no reescribir ramas o eliminar respaldos silenciosamente. La evidencia más reciente confirma revocación, pero limita expresamente qué Git, snapshots y clones fueron saneados.
- Completar procedencia, licencia cuando aplique, aprobación y revisión de instrumentos/contenido. B `src/assessment-session/domain/schemas/answer-assessment-session.schema.ts:8` conserva respuesta del modelo y puntaje, pero no versión de modelo/prompt por evaluación; agregar metadatos suficientes para reconstruirla sin duplicar texto sensible innecesario.

**Cierre verificable:** cambios incompatibles bloqueados por CI; documentación principal describe el estado vigente; inventario legacy resuelto; alcance de saneamiento registrado; un instrumento, recomendación y sesión sintética de IA tienen procedencia reconstruible. Responsables: ingeniería, operación y contenido/producto.

## Validación realizada en esta auditoría

| Comprobación                                                     | Resultado y alcance                                                                                                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escanor: `npm run test -- --runInBand --silent --watchman=false` | **55 suites, 602 pruebas y 1 snapshot aprobados.**                                                                                                               |
| Gowther: `go test -race -count=1 -json ./...`                    | **17 paquetes aprobados; 471 entradas de prueba/subprueba aprobadas, 10 omitidas; un paquete sin pruebas.** No comparar este conteo directamente con el de Jest. |
| F: `node scripts/check-statistics-publication.mjs`               | **Aprobado:** contrato, alcance, valores protegidos, cero, render, rutas y cancelación de contexto.                                                              |
| F: `node scripts/check-demo-setup.mjs`                           | **Aprobado:** contratos demo, separación poblacional, reintentos y carreras de sesión/contexto.                                                                  |
| F: `node scripts/check-publication-charts.mjs`                   | **Aprobado:** escalas, ceros/negativos, supresión, denominadores y render accesible automatizado. No sustituye revisión visual.                                  |
| Reproducción sintética de H04                                    | **Brecha confirmada:** el DTO exterior acepta edad −99, género inválido y propiedad demográfica desconocida. Solo ejecución en memoria.                          |
| `UserSchema.indexes()`                                           | Solo índices demo e institución; **no acredita unicidad de correo**. No se inspeccionó Atlas.                                                                    |
| HEAD público `/fastapi/docs`                                     | **410**, compatible con el retiro documentado.                                                                                                                   |
| HEAD público `/v1/session`                                       | **401**, con desafío bearer y `Cache-Control: no-store`.                                                                                                         |
| HEAD público `/api/v1/auth/internal/session`                     | **404**, consistente con bloqueo público de la ruta interna.                                                                                                     |

Las tres sondas se hicieron sobre `https://escanor.bienestarkairos.com`, sin sesión ni datos personales. No prueban autorización autenticada entre instituciones ni todos los endpoints.

Los primeros intentos de pruebas Go/Jest fallaron por restricciones del sandbox al abrir puertos loopback (`bind: operation not permitted` / `listen EPERM`). Al repetir con permiso para esos puertos, las suites indicadas aprobaron. No se trataron esos fallos iniciales como defectos del producto.

Las 10 pruebas Go omitidas son integraciones opcionales de Atlas, contratos con Escanor y un informe preparado de desarrollo. Se excluyeron variables de integración de la ejecución; no se habilitaron estas pruebas ni se usaron conexiones productivas. No se ejecutó `make check` completo, escaneo de vulnerabilidades, build general ni lint de los repositorios: no hubo modificación de código. La presencia de esas tareas en CI de Gowther se verificó en el workflow; no se comprobó la última ejecución remota.

No se midió calidad de la base real, cobertura histórica elegible, restauración, cumplimiento de RPO/RTO, rendimiento máximo ni experiencia autenticada de navegador. Estas limitaciones quedan como criterios de cierre, no como pruebas aprobadas.

## Evidencia operativa que actualiza el diagnóstico

Se debe leer en orden temporal: una nota de preparación o retiro anterior no invalida una corrección posterior.

- G [corte productivo de las APIs, 11 de noviembre](../../../gowther/docs/qa/production-api-cutover-2026-11-11.md).
- G [prueba ASSIST de 500 participantes](../../../gowther/docs/qa/production-assist-500-2026-11-11.md).
- G [arranque del worker y limitación del Sociodemográfico](../../../gowther/docs/qa/production-worker-start-2026-11-11.md).
- G [retiro de FastAPI y limpieza inicial](../../../gowther/docs/qa/production-fastapi-retirement-2026-11-11.md).
- B [rotación, revocación y recuperación del entorno Dev, 13–14 de noviembre](../../../escanor-bienestarkairos/docs/mongo-credential-rotation-2026-11-13.md).
- B [saneamiento posterior de código y artefactos, 14 de noviembre](../../../escanor-bienestarkairos/docs/retired-credential-cleanup-2026-11-14.md).

## Secuencia recomendada

1. **Primero:** H04/H05, validación demográfica e historial atómico, con pruebas de entradas inválidas, fallo y concurrencia.
2. **En el mismo ciclo:** inventario de unicidad de correo y privilegios de Escanor; acordar responsables y políticas mínimas de datos.
3. **Después:** recuperación ensayada, auditoría transversal y recorrido real controlado de estadísticas.
4. **Consolidación:** worker incompatible, CI F/B, documentación vigente, catálogo de contenido/metadatos y saneamiento histórico coordinado.

La ganancia más importante ya conseguida es que la analítica dejó de depender de acceso genérico a la base y pasó a publicar resultados con identidad, procedencia y reglas explícitas. El siguiente avance DAMA depende de extender esa disciplina a la captura y a la gestión operativa y organizacional de los datos.
