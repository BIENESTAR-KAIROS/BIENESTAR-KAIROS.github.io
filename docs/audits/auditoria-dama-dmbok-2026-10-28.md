# Auditoría inicial de gestión de datos — Bienestar KAIROS

Fecha: 28 de octubre de 2026 (America/Mexico_City). Contexto informado: backend en Dev.

## Dictamen y alcance

**Alineación parcial con DAMA-DMBOK.** Existen controles técnicos valiosos, especialmente en cuestionarios versionados y analítica reciente. Persisten brechas comprobadas de seguridad, privacidad, validación e integridad; el gobierno y la operación de los datos requieren evidencia adicional. No procede declarar cumplimiento integral ni asignar un porcentaje de madurez con esta revisión.

Se utiliza DAMA-DMBOK 2, revisión 2024, como marco de evaluación de sus 11 áreas de conocimiento. DAMA describe esta revisión como una actualización que conserva la estructura y alcance del marco. Esta auditoría es un diagnóstico de alineación, no una certificación ni una evaluación legal. Las prioridades y criterios de cierre son propuestas específicas para KAIROS, no una lista oficial de requisitos DAMA. Referencias: [marco de DAMA-DMBOK](https://www.damadmbok.org/dmbok-framework) y [alcance de la revisión 2024](https://dama.org/dama-dmbok-revision/).

Se inspeccionaron código, contratos, esquemas, pruebas y documentación de tres repositorios:

| Alias | Repositorio                         | Commit inspeccionado                       |
| ----- | ----------------------------------- | ------------------------------------------ |
| F     | `BIENESTAR-KAIROS.github.io` — Nuxt | `94b9c9363223d29d7ff0684cd86f9c7b6ed69b07` |
| B     | `escanor-bienestarkairos` — NestJS  | `effbd843b750a4e4eeda603e2f45c670e88d05e0` |
| A     | `fastapi_kairos` — analítica        | `320548ac667aa76eb08884dda59b14e90d33a228` |

Los tres árboles de trabajo estaban limpios al iniciar. Las referencias `F:`, `B:` y `A:` siguientes indican archivo y línea dentro de esos repositorios. La única incorporación de esta tarea es este informe.

Se ejecutaron pruebas locales y comprobaciones con objetos sintéticos. No se consultaron documentos de MongoDB, no se ejecutaron migraciones ni se modificaron servicios, credenciales o configuraciones. No se verificaron la versión desplegada, el aislamiento de red, los permisos efectivos de Atlas, los respaldos o la existencia de datos reales en Dev. La exposición pública de una ruta depende además de infraestructura no inspeccionada.

La revisión cubre gestión de datos; no propone cambios visuales. No se realizó una revisión de diseño, móvil/escritorio o accesibilidad, ni fue necesario modificar o aplicar el brandbook a este informe.

### Lectura de la evidencia

- **Comprobado:** visible en código o reproducido localmente; se especifica cuál de los dos.
- **Riesgo inferido:** consecuencia posible del diseño; no implica que haya ocurrido en la base.
- **No evidenciado:** no se encontró en los repositorios revisados; puede existir fuera de ellos.
- **P0:** contención prioritaria antes de permitir acceso no confiable o usar datos reales.
- **P1:** corregir en el siguiente ciclo de endurecimiento y antes de ampliar el uso institucional.
- **P2:** mejora estructural planificada, con responsable y criterio de aceptación.

## Cobertura de las 11 áreas

Esta tabla clasifica evidencia, no otorga una puntuación oficial de madurez.

| Área DAMA-DMBOK                             | Base observada                                                                           | Brecha principal                                                                                  | Estado y hallazgos                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Gobierno de datos                           | Dominios de negocio y permisos de aplicación                                             | Responsables de datos, decisiones, políticas, finalidades y escalamiento sin evidencia documental | No evidenciado a nivel organizacional; H07–H09  |
| Arquitectura de datos                       | Separación frontend, API transaccional y analítica; documentación de arquitectura        | Lectura directa del modelo operativo, rutas heredadas y selección de base desde el cliente        | Parcial; H01, H11                               |
| Modelado y diseño                           | Esquemas Mongoose, referencias, revisiones y snapshots de resultados                     | Restricciones demográficas, unicidad y temporalidad incompletas                                   | Parcial; H04–H06, H12                           |
| Almacenamiento y operación                  | Índices, transacciones en cuestionarios, migraciones con respaldo y reversión            | Restauración integral, RPO/RTO, monitoreo y separación efectiva de ambientes por verificar        | Parcial / operación no verificada; H10          |
| Seguridad de datos                          | JWT, roles, verificación de cuentas, bcrypt y contexto institucional en NestJS           | FastAPI sin autorización propia, URI con credenciales y salida de datos individuales              | Brechas críticas comprobadas en código; H01–H03 |
| Integración e interoperabilidad             | DTOs, Swagger, clientes separados, contratos nuevos por cuestionario                     | Semántica duplicada y compatibilidad de tipos entre servicios sin contrato común verificable      | Parcial; H11, H14                               |
| Documentos y contenido                      | Cuestionarios publicados/borrador; recomendaciones con revisión y autor de actualización | Fuente, licencia, revisión del contenido y procedencia de respuestas de IA incompletas            | Parcial; H13                                    |
| Datos maestros y de referencia              | IDs institucionales, catálogo de cuestionarios y población demo canónica                 | Identidad de usuario no protegida en el esquema activo; enums y nombres distribuidos              | Parcial; H06, H11                               |
| Data warehousing e inteligencia de negocios | Agregaciones por revisión, filtros, cobertura y separación demo/real disponibles         | Semántica temporal, rutas heredadas, mezcla por omisión y publicación de grupos pequeños          | Parcial; H03, H12                               |
| Metadatos                                   | Versiones de esquema/evaluación, snapshots y timestamps                                  | Catálogo de datos, responsables, clasificación y linaje integral no evidenciados                  | Parcial técnico; H09, H11, H13                  |
| Calidad de datos                            | Validadores de cuestionarios y pruebas automatizadas                                     | Demográficos inválidos, historial no atómico y ausencia de métricas operativas de calidad         | Parcial; H04–H06, H14                           |

## Fortalezas que conviene conservar

1. **Trazabilidad de evaluaciones.** `B:src/questionnaire-result/domain/schemas/questionnaire-result.schema.ts:48` conserva `schemaVersion`, `definitionSnapshot`, evaluación y recomendaciones; también existe `scoringVersion`. Evita depender exclusivamente de la definición actual para interpretar un resultado antiguo.
2. **Guardado transaccional de cuestionarios.** `B:src/questionnaire-answer/domain/use-cases/save-definition-answer.use-case.ts:29` coordina respuesta, resultado, intento y recomendaciones en una transacción, con validación y manejo de conflictos.
3. **Identidad y pertenencia.** `B:src/auth/domain/strategies/jwt-strategy.ts:27` verifica usuario activo y verificado. `resolve-institution-context.use-case.ts:15` restringe el contexto seleccionado al administrador KAIROS. Esto es evidencia del flujo revisado, no certificación de todos los endpoints.
4. **Analítica reciente más consistente.** `A:routes/questionnaire_analytics.py:94` elige el último resultado por alumno y revisión. Desde la línea 207 protege puntajes con muestras insuficientes y desde la línea 245 excluye preguntas con pocos participantes. No publica texto libre ni fechas individuales en esa agregación.
5. **Demos identificables.** `B:src/common/institution-membership.ts:3` y `A:routes/questionnaire_analytics.py:80` usan `isDemo`, `demoDataset` y membresías explícitas. Es una base útil para separar población sintética.
6. **Migraciones y pruebas.** Hay procedimientos de migración con respaldo, transacciones, idempotencia y reversión; además pasaron 40 suites / 472 pruebas del backend principal y 6 pruebas unitarias de analítica.

## Hallazgos priorizados

### H01 — P0 — Acceso a datos de FastAPI sin autorización propia

**Comprobado en código.** `A:main.py:24–43` monta los routers sin dependencias de autenticación. `A:routes/documents.py:21–101` permite seleccionar base y colección, consultar con un filtro JSON y devolver documentos sin proyección de campos. `routes/databases.py:6` enumera bases accesibles por la cuenta Mongo. Los endpoints nuevos de estadísticas también reciben `institute_id` sin vincularlo a un actor autenticado. El cliente `F:plugins/axios.ts:49–59` no agrega a `$statsApi` el token utilizado por la API principal.

**Impacto:** quien alcance el servicio podría leer datos permitidos por la cuenta de Mongo, incluyendo campos que NestJS sí excluye, o solicitar estadísticas de otra institución. El filtro por institución limita una consulta, pero no acredita que quien la solicita pertenezca a ella. No se comprobó accesibilidad desde Internet ni los privilegios efectivos de esa cuenta.

**Mejora:** separar el explorador administrativo del servicio institucional; deshabilitar sus rutas en despliegues compartidos; autenticar FastAPI o interponer un servicio autenticado; derivar y validar el alcance institucional del actor; usar una cuenta Mongo con permisos mínimos y bases explícitas.

**Cierre:** pruebas HTTP sin sesión, con rol estudiantil y entre instituciones A/B deben negar las operaciones correspondientes; un cliente no debe elegir bases arbitrarias ni recuperar secretos o perfiles completos mediante la API analítica. Responsable propuesto: backend + infraestructura.

### H02 — P0 — Credenciales Mongo incorporadas al código

**Comprobado en código versionado.** `A:main.py:14` contiene un valor alternativo de `MONGO_URI` con usuario y contraseña. Se verificó su presencia sin mostrar el valor ni intentar utilizarlo. Que `.env` esté ignorado no protege este literal.

**Impacto:** el secreto se distribuye con el código; una configuración ausente puede conectar al destino del fallback. No se verificó si la credencial sigue vigente.

**Mejora:** retirar el fallback y hacer fallar el arranque cuando falte configuración; revocar o rotar la credencial si continúa vigente; revisar su uso y distribución histórica; incorporar detección de secretos. La remoción del literal no invalida copias anteriores.

**Cierre:** ausencia de credenciales en el árbol actual, evidencia de revocación o de que ya no eran válidas, configuración obligatoria y privilegios mínimos documentados. Responsable: infraestructura + backend. No se realizó rotación durante esta auditoría.

### H03 — P0 — La privacidad no se aplica uniformemente en las respuestas

**Comprobado en código y reproducción sintética.** `A:routes/analytics.py:1182–1194` admite `min_group_size=1`. En `1240–1277` proyecta identificador de alumno, puntaje, edad, género, código postal y hábitos; en `1406–1407` devuelve esas filas en `students`, incluso cuando `sample_sufficient` es falso. El resumen heredado, `835–861`, informa la insuficiencia pero sigue devolviendo estadísticas. Ambos routers siguen registrados.

Con un agregado simulado de una persona y mínimo 8 se obtuvo `sample_sufficient=false` y **una fila individual**. Con mínimo 1 también se publicó una celda del mapa. No se usaron alumnos reales.

**Impacto:** ocultar una gráfica en el frontend no elimina el dato de la respuesta HTTP; el piso del mapa no protege los registros individuales. Los cruces pueden permitir identificación o inferencias sobre una persona.

**Mejora:** aplicar la política en el servidor, eliminar filas individuales del contrato institucional y fijar un mínimo que el cliente no pueda reducir. Revisar también bandas, histogramas, categorías raras y diferencias entre consultas. En la ruta nueva, `A:routes/questionnaire_analytics.py:234–244`, bandas e histogramas se publican según el tamaño de la métrica completa; falta evaluar la política por celda, no asumir anonimato por tener ocho personas en total.

**Cierre:** con muestras 1–7 no salen puntajes ni filas individuales por ninguna ruta institucional; el parámetro no reduce el piso; pruebas adicionales cubren celdas pequeñas y filtros sucesivos. Responsable: analítica + responsable de privacidad. El valor 8 es una regla existente del proyecto, no una garantía universal de anonimato ni un requisito numérico de DAMA.

### H04 — P1 — Validación demográfica insuficiente en el backend

**Comprobado con el ValidationPipe configurado por la aplicación.** `B:src/user/domain/dto/request/user-student-data-patch.request.dto.ts:5` valida `studentData` solo como objeto; no activa validación anidada. `student-data.request.dto.ts:60` trata los demográficos como objeto. `B:src/user/persistence/update-user.persistence.ts:18` los mezcla en el documento mediante un pipeline.

Una entrada sintética con `age=-99`, género fuera del enum y campos demográficos inesperados atravesó el pipe con whitelist y `forbidNonWhitelisted`. Esto prueba la aceptación por la validación de entrada; no se hizo una escritura para afirmar el resultado efectivo en MongoDB.

**Mejora:** DTOs anidados con transformación y validación explícitas; límites acordados para edad, código postal y año de estudio; control de campos permitidos y catálogos; reglas también para actualizaciones y rutas alternativas. Considerar validadores de colección para invariantes críticas.

**Cierre:** casos inválidos se rechazan antes de persistir; casos válidos y variaciones institucionales siguen aceptándose. Agregar métricas de completitud, validez y rechazo. Responsable: backend + responsable funcional de datos demográficos.

### H05 — P1 — Perfil e historial demográfico pueden divergir

**Comprobado en código; fallos de datos no medidos.** `B:src/user/domain/use-cases/update-user-student-data.use-case.ts:40–43` actualiza el perfil y luego inserta el historial sin una transacción compartida. `B:src/demographic-history/domain/use-cases/save-demographic-history.use-case.ts:21–25` calcula la siguiente versión leyendo la anterior. El esquema declara un índice por usuario y fecha, sin unicidad usuario/versión.

**Riesgo inferido:** si falla la segunda escritura, el perfil cambia sin historial; dos solicitudes concurrentes pueden calcular la misma versión y superar simultáneamente la comprobación de disponibilidad.

**Mejora:** transacción o mecanismo de consistencia explícito; control de concurrencia e idempotencia; unicidad de versión por usuario y comprobación atómica del permiso de actualizar.

**Cierre:** pruebas de fallo intermedio y solicitudes simultáneas no dejan un perfil sin su versión ni versiones duplicadas; registrar también actor y motivo cuando interviene un administrador. Responsable: backend.

### H06 — P1 — Unicidad del correo no declarada en el esquema activo

**Comprobado en el modelo local; índices desplegados pendientes.** `B:src/user/domain/schemas/user.schema.ts:22` declara correo requerido, sin unicidad. La inspección de `UserSchema.indexes()` mostró solamente los índices de demos y de institución. `create-user.use-case.ts:28–33` realiza una búsqueda previa y una inserción posterior.

**Riesgo inferido:** si la colección no tiene un índice único creado externamente, registros concurrentes pueden duplicar la identidad. No se afirma que haya duplicados ni que falte un índice manual en Dev.

**Mejora:** definir la normalización e identidad canónica; auditar duplicados de manera agregada; reconciliarlos con revisión antes de crear el índice; traducir conflictos a una respuesta consistente.

**Cierre:** verificar índice efectivo y su regla de normalización, y probar altas concurrentes del mismo correo. Responsable: backend + responsable de identidad.

### H07 — P1 — Evidencia de consentimiento y ciclo de vida incompleta

**No evidenciado en los flujos revisados.** Existe aviso de privacidad en `F:components/user/privacy-policy/privacy-policy.vue`, pero los modelos de usuario, registro e historial revisados no registran una aceptación versionada con finalidad, fecha y versión del aviso. Tampoco se encontró una política operativa de retención y disposición por tipo de dato.

**Impacto:** no se puede demostrar con estos repositorios qué información se presentó al usuario, qué tratamiento se autorizó ni cómo se conserva, revoca, anonimiza o elimina el dato a través de respuestas, resultados, sesiones, logs y respaldos. Un proceso externo podría cubrir parte de esto y debe aportar evidencia. No se emite una conclusión de incumplimiento legal.

**Mejora:** acordar finalidades y fundamento del tratamiento con el responsable correspondiente; registrar los eventos necesarios de aceptación y revocación; definir retención por categoría, excepciones, borrado/anonimización y tratamiento de respaldos. Evitar fijar plazos arbitrarios desde ingeniería.

**Cierre:** política aprobada y un caso sintético trazable desde registro hasta revocación/disposición, con evidencia en cada sistema afectado. Responsable: producto + privacidad + backend.

### H08 — P1 — Roles de aplicación no equivalen a gobierno de datos

**No evidenciado en documentación revisada.** Los roles KAIROS/institución/alumno y la organización por dominios resuelven permisos y responsabilidades de software. No se localizaron responsables de decisión por activo de datos, custodios operativos, acuerdos institucionales de uso, clasificación ni proceso de resolución de incidentes de calidad.

**Mejora:** una matriz pequeña de responsabilidades para identidad, membresía, demografía, instrumentos, resultados, recomendaciones y estadísticas. Asignar quién decide definiciones y acceso, quién mantiene la calidad y quién opera la infraestructura; documentar decisiones y excepciones.

**Cierre:** responsables nominales aceptan sus funciones y existe un procedimiento utilizado para aprobar un cambio de definición y resolver un incidente. Responsable: dirección/producto con representantes institucionales. Los nombres concretos siguen pendientes de asignación.

### H09 — P1 — Trazabilidad de cambios parcial

**Parcialmente comprobado.** Hay timestamps, snapshots, `changedFields` demográficos y `updatedBy` en recomendaciones. No se encontró un registro transversal de auditoría para acceso sensible, exportaciones, cambios de roles/membresía, definiciones, configuración de acceso y operaciones administrativas. El historial demográfico revisado no distingue actor y sujeto.

**Mejora:** definir eventos auditables con actor, institución, acción, entidad, fecha, resultado, motivo y correlación. Protegerlos contra alteraciones y acceso indebido, con retención definida; registrar diferencias mínimas, sin copiar respuestas sensibles ni tokens a logs.

**Cierre:** reconstruir un cambio administrativo y una exportación autorizada usando un caso sintético, sin depender de logs de consola. Responsable: backend + operación + gobierno de datos.

### H10 — P1 — Recuperación y aislamiento operativo por demostrar

**Evidencia parcial.** `B:scripts/migrate-global-questionnaire.ts:97` contempla respaldos y reversión; `B:docs/admin-users-and-demos.md:27` reconoce respaldos con documentos sensibles. `B:docs/Deployment.md:5` todavía dice que el proceso de despliegue no está definido. Estos respaldos de migración no prueban recuperación integral ante pérdida de la base.

**No verificado:** programación y cifrado de respaldos, restauraciones ensayadas, pérdida de datos tolerable (RPO), tiempo de recuperación (RTO), alertas, permisos efectivos, segregación de cuentas Dev/producción y uso exclusivo de datos sintéticos o adecuadamente desidentificados en Dev.

**Mejora:** inventario de ambientes, cuentas y categorías de datos; runbook de restauración; objetivos RPO/RTO acordados; monitoreo de fallos, latencia y calidad; proteger y dar caducidad a copias temporales de migraciones según política. No borrar respaldos como parte de esta auditoría.

**Cierre:** restauración aislada documentada, tiempos medidos y reconciliación de conteos/relaciones; prueba de que la cuenta analítica solo accede a las bases y operaciones aprobadas. Responsable: infraestructura.

### H11 — P2 — Contratos, metadatos y catálogos distribuidos

**Comprobado en código.** `F:components/institute/my-stats/stats-config.ts:7` fija `BienestarKairosDev` para el flujo heredado. La ruta nueva resuelve la base desde configuración en `A:routes/questionnaire_analytics.py:27`. `A:routes/analytics.py:377` mantiene reglas de Bienestar30; el backend principal también evalúa cuestionarios. La compatibilidad admite identificadores como string/ObjectId y enums con distintas representaciones. Hay catálogos demográficos tanto en F como en B.

**Impacto:** cambiar un servidor no garantiza que todos los consumidores consulten el ambiente esperado; reglas y nombres pueden divergir. No se comprobó una divergencia concreta de puntajes ni un cruce real entre ambientes. Tampoco se encontró un diccionario integral que explique cada campo, su dueño y usos.

**Mejora:** mapa de flujos y fuentes de verdad; contratos versionados generables y pruebas entre servicios; catálogo de datos con significado, tipo, clasificación, dueño, origen, consumidores, regla de calidad y retención; IDs estables de campus/departamentos y catálogos canónicos. Consolidar gradualmente los cálculos sobre resultados evaluados y retirar rutas heredadas tras inventariar consumidores.

**Cierre:** un resultado puede rastrearse desde captura hasta indicador; F deja de elegir una base; un cambio incompatible se detecta en CI. Responsable: arquitectura + backend + analítica.

### H12 — P2 — Semántica temporal y poblacional de BI por formalizar

**Comprobado en código.** `A:routes/questionnaire_analytics.py:94–108` une resultados históricos con el perfil actual de `users`; `280–309` cuenta la población actualmente activa/elegible. API y frontend ofrecen demo/real, pero ambos inician con `population=all` (`F:components/institute/my-stats/use-questionnaire-stats.ts:30`). La analítica heredada agrupa por documento de respuesta además de alumno y limita algunas lecturas a 10,000 filas (`A:routes/analytics.py:37`, `1240`, `1281`).

**Riesgo inferido:** cambiar membresía, campus o actividad puede reclasificar históricos; las retomas o truncamientos pueden afectar cobertura en rutas antiguas. La mezcla de demos es útil para demostraciones, pero no debe convertirse accidentalmente en evidencia institucional real. No se midió su incidencia en la base.

**Mejora:** especificar si cada indicador describe población actual o población al responder; incorporar snapshot o vigencia temporal donde se requiera historia reproducible; aprobar definiciones de numerador, denominador, unidad, periodo, retomas y exclusiones. Separar explícitamente población real y sintética en los productos analíticos; controlar celdas pequeñas conforme a H03. Evaluar vistas/materialización solo si carga y necesidades lo justifican: DAMA no obliga a comprar un data warehouse.

**Cierre:** casos sintéticos de cambio de campus, traslado, baja, retoma y demo producen valores acordados y reproducibles; ningún límite devuelve un total parcial sin indicarlo. Responsable: analítica + responsable institucional del indicador.

### H13 — P2 — Procedencia del contenido y de respuestas de IA incompleta

**Parcialmente comprobado.** Cuestionarios y recomendaciones tienen estados/revisiones y algunos campos de autoría. Los esquemas revisados no documentan de forma estructurada fuente/licencia del instrumento o contenido, aprobación del responsable y próxima revisión. `B:src/assessment-session/domain/schemas/answer-assessment-session.schema.ts:8` conserva respuesta del usuario, respuesta del modelo y puntaje, pero no identificador/versión de modelo y prompt por evaluación.

**Mejora:** catálogo de contenido con procedencia, licencia cuando aplique, versión y aprobación; captura de modelo/configuración/prompt versionado y regla de evaluación para resultados asistidos por IA. Definir finalidad, minimización y retención del texto libre. Verificar documentación o procesos externos antes de concluir que no existen autorizaciones de uso.

**Cierre:** seleccionar un instrumento, una recomendación y una sesión sintética y reconstruir qué contenido/regla/modelo produjo la salida y quién autorizó su uso. Responsable: contenido + producto + backend/IA.

### H14 — P2 — Pruebas existentes sin cobertura suficiente de gestión de datos

**Comprobado.** Las suites existentes pasan, pero H03 y H04 también se reprodujeron. No se encontró CI versionado en los backends revisados. El workflow de F (`.github/workflows/nuxtjs.yml`) construye/despliega sin ejecutar su lint y usa Node 20, mientras `package.json` declara 25.x. `A:AGENTS.md` dice que no existen pruebas, aunque el README y `tests/` ya documentan una suite con unittest.

**Mejora:** incorporar controles de contrato, autorización cruzada, datos inválidos, concurrencia, privacidad y restauración; mantener instrucciones y runtime alineados. Definir seguimiento de completitud, validez, unicidad, integridad referencial, consistencia y actualidad con umbrales, responsable y respuesta a alertas.

**Cierre:** CI bloquea regresiones relevantes y hay un reporte periódico de calidad con incidencias atendidas. No basta un porcentaje de cobertura de código. Responsable: ingeniería + responsables de datos.

## Plan propuesto y criterios de avance

Los periodos son una secuencia orientativa; requieren asignar responsables y capacidad. No se programaron tareas ni se implementaron correcciones.

| Etapa           | Trabajo                                                        | Evidencia de salida                                                                                                            |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Inmediata       | H01–H03: contener explorador, secretos y exposición individual | Accesos negativos y pruebas de privacidad; credencial revocada o invalidez comprobada; rutas y permisos efectivos documentados |
| Siguiente ciclo | H04–H07: validación, atomicidad, identidad y ciclo de vida     | Pruebas de fallos/concurrencia, índice verificado y política de aceptación/retención con responsables                          |
| En paralelo     | H08–H10: gobierno, auditoría y recuperación                    | Matriz de responsabilidades, eventos trazables y ensayo de restauración con RPO/RTO medidos                                    |
| Consolidación   | H11–H14: contratos, catálogo, BI, contenido y calidad continua | Diccionario inicial, linaje de un indicador, semántica aprobada y controles en CI                                              |

Para empezar sin burocracia excesiva, el catálogo puede ser un documento versionado con siete activos: usuarios, instituciones/membresías, demográficos, cuestionarios, respuestas/resultados, recomendaciones y sesiones de IA. Los roles propuestos pueden recaer inicialmente en pocas personas; deben quedar explícitos.

### Indicadores iniciales propuestos

No hay línea base medida en MongoDB. Estas son comprobaciones a implementar y acordar:

| Indicador                                                              | Objetivo inicial propuesto                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| Lecturas institucionales no autorizadas                                | 0 casos exitosos en matriz de pruebas por actor e institución |
| Respuestas institucionales con filas personales o puntajes suprimibles | 0 en el corpus de pruebas de privacidad                       |
| Datos críticos inválidos aceptados                                     | 0 en validación y medición agregada de calidad                |
| Correos canónicos duplicados / referencias huérfanas                   | 0 tras inventario y reconciliación aprobada                   |
| Cambios demográficos sin historial o con versión duplicada             | 0 en pruebas concurrentes y reconciliación                    |
| Activos críticos con dueño, clasificación, finalidad y retención       | 100% de los siete activos iniciales                           |
| Resultados nuevos con procedencia requerida                            | 100% según contrato de cada modalidad                         |
| Restauración                                                           | Cumplir RPO/RTO acordados, todavía sin valores definidos      |

## Verificaciones realizadas y límites

| Comprobación                                                                                                      | Resultado                                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| NestJS: `npm test -- --runInBand --silent --watchman=false`                                                       | 40 suites y 472 pruebas aprobadas                                                                      |
| FastAPI: `env -u ANALYTICS_TEST_MONGO_URI -u ANALYTICS_TEST_DB .venv/bin/python -m unittest discover -s tests -v` | 6 pruebas unitarias aprobadas; 3 de integración omitidas por requerir configuración explícita de Mongo |
| Pipe NestJS con DTO demográfico y valores sintéticos inválidos                                                    | Aceptó el objeto; confirma H04 en la capa de entrada                                                   |
| Handler demográfico con Mongo simulado y una fila                                                                 | Devuelve fila con mínimo 8; con mínimo 1 devuelve además celda del mapa; confirma H03 en el handler    |
| Índices declarados por `UserSchema.indexes()`                                                                     | Dos índices; ninguno único por correo. Índices reales pendientes                                       |
| Inspección del fallback Mongo                                                                                     | Literal con usuario/contraseña en archivo versionado; sin mostrar ni probar credenciales               |
| Revisión de repositorios y documentación                                                                          | Fuentes y hallazgos referenciados; no se alteró código de aplicación                                   |

El primer intento de Jest falló por acceso de Watchman a su directorio de estado dentro del sandbox; el reintento autorizado fuera del sandbox y con Watchman desactivado pasó. Las pruebas se ejecutaron en el runtime local disponible (Node 26.11.1), no en el Node 25 declarado por el proyecto; no se valida aquí la matriz de runtimes de CI.

No se ejecutó lint de aplicación porque no se modificó código. La verificación visual autenticada, la prueba HTTP contra Dev y el perfilado de datos reales quedan fuera de esta fase. Una suite verde demuestra sus casos cubiertos; no cierra por sí sola las brechas de este informe.

### Evidencia necesaria para la siguiente fase

1. Inventario real de Dev: versión desplegada, rutas accesibles, frontera de red, cuenta Mongo y permisos; confirmar si contiene información personal real.
2. Responsables y políticas que existan fuera de Git: finalidad, acuerdos institucionales, consentimiento, retención y solicitudes de titulares.
3. Configuración de respaldo, restauraciones previas, objetivos de continuidad y logs operativos.
4. Perfilado de solo lectura con resultados agregados: duplicados, nulos críticos, rangos inválidos, tipos mixtos, referencias huérfanas, versiones y población demo/real. No exportar documentos individuales al repositorio.
5. Matriz de autorización con cuentas sintéticas de alumno, institución A, institución B y KAIROS; pruebas HTTP de todas las rutas vigentes.

Estos puntos permiten pasar del diagnóstico de código a una auditoría operativa verificable, sin confundir ausencia de evidencia en Git con ausencia de controles organizacionales.
