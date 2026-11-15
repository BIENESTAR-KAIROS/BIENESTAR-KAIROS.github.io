# Auditoría de seguridad de Bienestar KAIROS

Fecha: 14 de noviembre de 2026, America/Mexico_City.

## Dictamen

**El proyecto tiene controles útiles, pero todavía no reúne evidencia suficiente para presentarse como seguro para datos sensibles de bienestar.** Hay fallos de autorización, exposición innecesaria de campos sensibles y recuperación de cuentas que deben corregirse antes de ampliar su uso. Las mejoras de Gowther no protegen automáticamente los endpoints antiguos de Escanor que siguen registrados.

La prioridad es cerrar accesos indebidos y actualizar dependencias. El propietario confirmó posteriormente que la credencial histórica de MongoDB ya fue revocada; S05 queda cerrado en cuanto a revocación. No se ha demostrado una intrusión ni se afirma que todos los fallos locales estén desplegados. La severidad se refiere al impacto potencial del código; la prioridad indica el orden de intervención.

## Seguimiento de correcciones — 15 de noviembre de 2026

El propietario autorizó comenzar por los permisos de agenda y el aislamiento
institucional, confirmó la revocación de MongoDB y excluyó el chat por estar inactivo
y no público. Confirmó también la política de notas: solo el profesional asignado
con rol INSTITUTION_STAFF o INSTITUTION_ADMIN; estudiantes sin notas clínicas.

| Hallazgo | Estado actual                                                                      | Evidencia de corrección                                                                      |
| -------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| S01      | Corregido en código local; despliegue y tratamiento de citas históricas pendientes | Escanor `45e4850`: 64 pruebas de agenda                                                      |
| S03      | Corregido en código local; verificación del despliegue pendiente                   | Escanor `88aabbf`: 13 pruebas de aislamiento institucional                                   |
| S02      | Excluido de esta corrección por instrucción del propietario                        | Chat sin cambios; revisar antes de reactivarlo públicamente                                  |
| S05      | Revocación confirmada por el propietario; pendiente de revocación cerrado          | La observación provenía del registro del 11 de noviembre, no de una clave vigente encontrada |

Escanor pasó **57 suites, 679 pruebas y un snapshot**, además de lint y build.
Las pruebas nuevas ejercitan HTTP, validación y autorización con identidades y
persistencia sintéticas; no sustituyen una integración con MongoDB ni la
comprobación del servidor desplegado. Código, pruebas y contrato de permisos en
`B:docs/security-access-remediation.md`.

**Condición para desplegar S01:** las citas nuevas guardan una institución de origen
inmutable obtenida por el servidor. Las antiguas sin `instituteId` quedan bloqueadas,
incluso para el administrador global, hasta acreditar y asignar su institución
histórica. No se consultó ni migró la base productiva; no debe inferirse esa
procedencia de la membresía actual de los usuarios.

Los hallazgos S04 (cohortes pequeñas) y S06 (campos sensibles de autenticación)
continúan abiertos. Las secciones y sondas siguientes conservan la evidencia del
código originalmente auditado; los commits anteriores registran las correcciones.

## Alcance y evidencia

| Alias | Repositorio                | Commit revisado                          | Cobertura                                                                                |
| ----- | -------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| F     | BIENESTAR-KAIROS.github.io | c5c2fbdecc0ad3988a8278be00dfd455c568f026 | Sesión, cliente HTTP, chat, configuración, noticias y dependencias                       |
| B     | escanor-bienestarkairos    | 59c64666a2706cc2943fd08ee02b7c61aab85c62 | Autenticación, recuperación, agenda, chat, rutas institucionales y dependencias          |
| G     | gowther                    | 8db35fbc12cb38f0be3c5715a6a93126aea31b72 | Contratos, transporte de sesión, protección de publicaciones, CI, pruebas y dependencias |
| A     | fastapi_kairos             | 550558c7565d10cdcfe936dc31a371f7de57aa66 | Servicio retirado, configuración actual y evidencia documental del retiro                |

Los árboles estaban limpios al iniciar. La entrega inicial añadió el informe y evidencia sin secretos, sin modificar la aplicación. El seguimiento del 15 de noviembre, descrito a continuación, registra las correcciones locales posteriores; no hubo despliegue, cambios de credenciales ni acceso a datos productivos. Las referencias `F:`, `B:`, `G:` y `A:` indican archivo y línea del checkout correspondiente.

Se realizaron revisión dirigida con Graphify, dos consultas actuales de `npm audit`, `govulncheck`, diez comprobaciones sintéticas de código, tres suites existentes de autenticación y pruebas seleccionadas de Go. Las sondas públicas fueron cinco solicitudes HEAD sin credenciales. No se consultaron documentos MongoDB ni se ejecutaron ataques, escrituras o pruebas de carga en producción.

No se inspeccionaron mediante acceso administrativo Atlas, DigitalOcean, GitHub, sus registros de auditoría, respaldos o configuración efectiva de red. Tampoco se comparó cada archivo desplegado con estos commits. No es una revisión exhaustiva de cada endpoint, un pentest completo, una certificación ni una evaluación legal. No se revisó diseño ni se propusieron cambios visuales; el brandbook no requiere actualización.

Evidencia reproducible de resultados en [el directorio de esta auditoría](security-evidence-2026-11-14/). Las pruebas sintéticas ejercitan clases reales con persistencia simulada; no acreditan por sí mismas explotación HTTP en producción.

## Contexto de amenazas actuales

La campaña **wfx-loot**, iniciada el 10 de noviembre y publicada por Aikido el 12 de noviembre de 2026, utiliza cuentas GitHub comprometidas para introducir robo de secretos en workflows y hooks de instalación; puede revertir cambios y borrar ejecuciones rápidamente. Para KAIROS esto exige revisar también accesos y registros remotos, no solo el código actual. La búsqueda acotada en historiales locales desde el 24 de octubre no encontró los títulos de commits consultados ni rutas versionadas con `wfx`. No cubre PR, ramas eliminadas, ejecuciones remotas o malware con otros nombres. [Investigación original de Aikido](https://www.aikido.dev/blog/compromised-github-accounts-push-ci-secret-stealer-to-tens-of-thousands-of-repositories).

El incidente de Axios de marzo de 2026 afectó las versiones `1.14.1` y `0.30.4`, con la dependencia maliciosa `plain-crypto-js`. Ambos lockfiles actuales de KAIROS resuelven Axios `1.21.0`; no contienen aquellas versiones ni esa dependencia. Esto no descarta instalaciones históricas comprometidas, cachés o contaminación de una estación de trabajo. [Aviso de CSA del 1 de abril de 2026](https://www.csa.gov.sg/alerts-and-advisories/advisories/ad-2026-002/).

La campaña Shai-Hulud ya había mostrado el vínculo entre paquetes npm y robo de credenciales de desarrollo y nube. Las medidas de cadena de suministro deben cubrir a los desarrolladores, CI y artefactos publicados. [Alerta de CISA del 23 de septiembre de 2025](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/3f408db).

## Hallazgos y orden de corrección

P0 significa contención inmediata y corrección antes de ampliar acceso; P1, siguiente ciclo prioritario; P2, endurecimiento planificado. Los plazos posteriores son objetivos propuestos, no garantías de esfuerzo.

| ID  | Prioridad                   | Severidad contextual               | Hallazgo                                                                  | Evidencia                                          |
| --- | --------------------------- | ---------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| S01 | P0                          | Alta                               | Agenda sin autorización por cita ni institución                           | Código y prueba sintética                          |
| S02 | Excluido de esta corrección | Alta si se publica                 | Chat inactivo y no público según el propietario; código sin autenticación | Código, metadatos y prueba sintética               |
| S03 | P0                          | Alta                               | Estadísticas y seguimiento entre instituciones                            | Código y prueba sintética parcial                  |
| S04 | P0                          | Alta                               | Ruta antigua publica estadísticas de muestras insuficientes               | Código y prueba sintética                          |
| S05 | Cerrado: revocación         | Riesgo histórico                   | Credencial MongoDB revocada según confirmación del propietario            | Confirmación del 14 de noviembre de 2026           |
| S06 | P0                          | Alta                               | Perfil expone hash y tokens de recuperación/verificación                  | Serialización real con datos sintéticos            |
| S07 | P1                          | Alta                               | Recuperación acepta contraseña vacía y conserva sesiones anteriores       | Código y pruebas sintéticas                        |
| S08 | P1                          | Alta según exposición              | Rate limiting declarado pero no conectado en Nest                         | Revisión de registro de guards                     |
| S09 | P1                          | Media                              | Token persistente en navegador y cabeceras frontend insuficientes         | Código y HEAD público                              |
| S10 | P1                          | Alta según función alcanzable      | Dependencias con avisos vigentes                                          | Auditorías actuales                                |
| S11 | P2                          | Media si la clave está configurada | Clave de noticias usada desde el navegador                                | Flujo de código; valor desplegado no inspeccionado |
| S12 | P1                          | Brecha de aseguramiento            | Controles de cadena de suministro desiguales y operación sin verificar    | Repositorios y límites de acceso de esta revisión  |

### S01 Agenda y notas clínicas

`B:src/calendary/calendary.controller.ts:23` usa JWT, pero las operaciones de listado, lectura por paciente/ID, notas, finalización y borrado no pasan el actor al servicio. En `B:src/calendary/calendary.service.ts:51`, el listado vacío consulta únicamente `{isActive: true}` y devuelve documentos con notas, nombres y correos. Las operaciones desde la línea 134 actualizan notas sin permiso del profesional; `completedBy` procede del cuerpo enviado. El módulo sigue montado en `B:src/app.module.ts:62`.

**Impacto:** una cuenta autenticada podría consultar o alterar citas ajenas, incluso entre instituciones, si alcanza estas rutas. No necesita conocer un ID para intentar el listado general. La prueba confirmó consulta sin ámbito y escritura simulada de notas con autor elegido por el solicitante.

**Corrección y cierre:** pasar actor validado en todas las operaciones; filtrar por institución y relación paciente/profesional; exigir capacidad específica para notas; derivar autoría del servidor; sustituir `FilterQuery` recibido del cliente por un DTO acotado. Probar por HTTP cuentas A/B, paciente/profesional/staff y rechazo previo a leer o escribir. Responsable propuesto: backend.

### S02 Chat de evaluación

**Actualización del 14 de noviembre:** el propietario confirma que el servicio no funciona y no está público; por instrucción explícita se excluye de esta corrección y no se cambia su código. Los siguientes hallazgos describen el código auditado, no acreditan exposición actual. Deben resolverse antes de reactivarlo públicamente.

`B:src/assessment-session/controllers/post-assessment-session.controller.ts:17` y `:31` exponen prueba de inferencia y mensajes sin guards. No hay guard global de autenticación en el arranque revisado. `process-user-message.use-case.ts:98` usa el `userId` recibido y la persistencia crea una sesión si falta (`read-assessment-session.persistence.ts:14`). `F:pages/chat.vue:6` fija un usuario y cuestionario; `/chat` está declarado público en `F:middleware/auth.global.ts:43`.

**Impacto:** mezcla o falsificación de respuestas bajo identidades ajenas y consumo no autorizado de inferencia. No se probó extracción de conversaciones ni se llamó al modelo real.

**Corrección y cierre:** deshabilitar en producción el endpoint de prueba; exigir sesión y derivar el usuario del actor; validar propiedad de sesión y disponibilidad del cuestionario; limitar tamaño, frecuencia y concurrencia. Si se desea una demo pública, aislarla de usuarios y datos reales. Probar 401 sin sesión, rechazo de identidad ajena y ausencia de persistencia real en demos. Responsable: backend y frontend.

### S03 Aislamiento institucional incompleto

`B:src/questionnaire-result/controllers/get-questionnaire-result.controller.ts:86` exige un rol institucional, pero envía al caso de uso el instituto de la URL sin el actor. `get-institute-result-stats.use-case.ts:45` consulta ese ámbito directamente. En seguimiento, `B:src/tracking/controllers/get-tracking.controller.ts:57` tiene el mismo problema. Su caso de uso comprueba que el alumno pertenezca al instituto solicitado, pero no que quien consulta pertenezca a ese instituto (`get-user-monthly-report-by-institute.use-case.ts:21`).

**Impacto:** personal de A podría solicitar estadísticas o actividad de B con IDs válidos. Cambiar los encabezados de contexto no es necesario: el alcance procede de la URL. Conocer IDs no debe conceder permisos.

**Corrección y cierre:** derivar el ámbito desde la identidad actual y validar expresamente la selección global; retirar las rutas antiguas que ya no sean necesarias. Tests HTTP deben rechazar personal de A consultando B, incluso si alumno e instituto B coinciden. Responsable: backend.

### S04 Privacidad eludible por la ruta antigua

`B:src/questionnaire-result/domain/dto/request/institute-result-stats-filter.dto.ts` permite `minGroupSize=1`. El caso de uso usa ocho por defecto, devuelve `current`, `previous` y series temporales sin supresión general y solo filtra determinados grupos académicos. La prueba con un participante devolvió su promedio y serie aun con `sampleSufficient=false` (`get-institute-result-stats.use-case.ts:83`).

**Impacto:** exposición de resultados de grupos pequeños y posible inferencia individual, agravada por filtros demográficos y períodos variables. La ruta sigue en un controller montado, aunque el frontend haya migrado a Gowther.

**Corrección y cierre:** retirar esta vía o aplicar la política común en servidor: mínimo real de diez, supresión de valores y derivados, períodos registrados y protección entre publicaciones. El cliente no puede reducir el mínimo. Probar 0/1/9/10 participantes, complementos pequeños y consultas sucesivas. Responsable: backend y responsable de privacidad.

### S05 Credencial MongoDB histórica

`G:docs/qa/production-fastapi-retirement-2026-11-11.md`, sección «Credencial compartida y copia local de FastAPI», registra que la credencial incrustada de FastAPI coincidía con la de Escanor y **no fue revocada** durante el retiro. Se saneó el historial local; GitHub no se modificó y otras copias quedaron fuera de la comprobación. Esta auditoría no leyó el secreto ni intentó usarlo.

**Actualización del 14 de noviembre:** el propietario confirma que la credencial ya fue revocada después de aquel registro. Se cierra el pendiente de revocación con esa confirmación; no se encontró ni se comprobó una credencial vigente. La observación original se basaba en un documento histórico, no en un secreto localizado en el código actual.

Una copia de la credencial revocada ya no permite autenticarse. La posible presencia en clones o historial remoto es un asunto de saneamiento histórico, no evidencia de un acceso vigente. No hace falta repetir la rotación por este hallazgo. No se modifica el registro del 11 de noviembre, que conserva lo ocurrido en esa fecha.

### S06 Campos sensibles en respuestas de autenticación

`B:src/auth/controllers/get-auth.controller.ts:64` devuelve directamente el documento del usuario. La lectura por ID no proyecta campos y el esquema no los excluye de JSON. La serialización sintética confirmó `password` —un hash, no la contraseña en texto—, `resetPasswordToken` y `verificationToken`. El DTO de login elimina contraseña y verificación, pero conserva el token de recuperación (`B:src/auth/domain/dto/response/login.response.dto.ts:8`).

**Impacto:** un token de sesión robado puede revelar material de recuperación cuando exista un reset pendiente; también expone un hash innecesario. Esto no demuestra que se devuelvan perfiles de otros usuarios por `/auth/profile`.

**Corrección y cierre:** respuestas con lista explícita de campos permitidos y protección adicional en proyecciones/esquema. Eliminar tokens de todos los DTO de usuario y marcar respuestas de sesión como `no-store`. Pruebas de serialización de login, profile, refresh y directorios con tokens sintéticos deben verificar su ausencia. Responsable: backend.

### S07 Recuperación y ciclo de sesión

`B:src/auth/domain/dto/request/reset-password.request.dto.ts:4` solo exige cadenas; la contraseña vacía pasa validación. `auth-reset-password.use-case.ts:26` cambia el hash y limpia el reset, sin invalidar JWT previos. La prueba confirmó que el verificador de firma/claims sigue aceptando un token anterior; el código y ADR 0005 confirman que no existe cierre global al cambiar contraseña.

`auth-forgot-password.use-case.ts:24` distingue correos existentes por `success`, guarda el reset en claro y `auth-reset-password.use-case.ts:22` y `:33` lo incluyen en logs. La expiración de quince minutos y la aleatoriedad de 32 bytes son controles positivos, pero el consumo consulta y guarda en pasos separados.

**Corrección y cierre:** política de contraseña aplicada en backend en registro/cambio/reset; token de un uso almacenado como hash y consumido atómicamente; respuesta de recuperación uniforme; logs redactados; revocación global mediante versión de sesión o mecanismo equivalente. Exigir MFA o passkeys para cuentas privilegiadas y recuperación protegida. Probar tokens vencidos/reutilizados, solicitudes concurrentes, contraseña vacía y rechazo de todas las sesiones anteriores. Referencia: [recuperación segura de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). Responsable: backend.

### S08 Límites de intentos sin enforcement en Nest

`B:src/app.module.ts:80` configura `ThrottlerModule`, pero la búsqueda de `ThrottlerGuard`, `APP_GUARD`, `useGlobalGuards` y `@Throttle` en `src` no encontró registros. Importar el módulo no aplica por sí solo límites a login, recuperación o inferencia. No se verificó si el proxy aplica cuotas independientes.

**Corrección y cierre:** conectar guards, límites por cuenta/IP y límites de inferencia; configurar correctamente el proxy de confianza y almacenamiento compartido cuando haya varias instancias. Validar 429, reintentos, rechazo distribuido y que falsificar `X-Forwarded-For` no eluda el control. Evitar que un bloqueo por cuenta permita denegar servicio a terceros. Responsable: backend e infraestructura.

### S09 Sesión en navegador y cabeceras

`F:store/auth.ts:113` persiste bearer y perfil en `localStorage`, accesible a JavaScript del mismo origen. La expiración local no reemplaza la expiración firmada del servidor. Un XSS o script comprometido podría extraer el token; no se demostró una inyección XSS propia de la aplicación. [Orientación de OWASP sobre almacenamiento local](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

El HEAD de `https://app.bienestarkairos.com/` devolvió 200 sin cabeceras CSP, HSTS, X-Frame-Options, nosniff ni Referrer-Policy en esa respuesta. Escanor sí devolvió varias de ellas; no se heredan entre dominios. Gowther `/v1/session` devolvió `no-store` y `nosniff`, pero no HSTS en la respuesta observada. No se inspeccionaron CSP en meta, todas las rutas ni políticas de preload.

**Corrección y cierre:** evaluar una sesión con cookie HttpOnly/Secure y diseño same-site o BFF; incorporar CSRF y validación de origen al cambiar el transporte. La cookie reduce robo del token, no neutraliza todas las acciones de un XSS. Minimizar perfil almacenado. Configurar cabeceras en el host que sirve cada recurso, desplegar CSP inicialmente en modo de reporte y luego hacerla efectiva con orígenes justificados. Probar login/logout, navegación, PWA y recursos externos sin romper la aplicación. Responsable: frontend, backend e infraestructura.

### S10 Dependencias

Resultados sobre lockfiles locales completos, incluyendo herramientas de desarrollo:

| Proyecto | Críticas | Altas | Moderadas | Bajas | Total de entradas npm |
| -------- | -------- | ----- | --------- | ----- | --------------------- |
| Frontend | 0        | 2     | 19        | 3     | 24                    |
| Escanor  | 0        | 0     | 11        | 8     | 19                    |

Las entradas incluyen propagación transitiva: **no equivalen a 43 CVE independientes ni a 43 ataques explotables en producción**. Nuxt `3.21.1` concentra avisos; npm propone `3.21.11`, pero también informa rangos amplios que requieren verificar el resultado después de actualizar. Algunas sugerencias del backend son downgrades incompatibles: no aplicar `npm audit fix --force` automáticamente.

La ejecución remota por Server Islands necesita islas activas y un camino concreto de componentes dinámicos; no está demostrada en esta SPA con `ssr:false`. Las alertas de desarrollo deben evaluarse también en estaciones y CI. [Aviso oficial de Nuxt](https://github.com/nuxt/nuxt/security/advisories/GHSA-9473-5f9j-94wq).

Gowther: cero avisos alcanzables y cero en paquetes importados; un aviso a nivel de módulo, `GO-2026-5932`, sobre OpenPGP en `x/crypto`, que no se importa. Mantener seguimiento sin describirlo como una vulnerabilidad explotable de Gowther. [Registro oficial de Go](https://pkg.go.dev/vuln/GO-2026-5932).

**Corrección y cierre:** actualizar en cambios acotados, revisar lockfile, ejecutar build y regresión de autenticación/roles, repetir auditorías y justificar los avisos no aplicables con responsable y fecha de revisión. Verificar después el artefacto desplegado. FastAPI no se auditó con pip por estar retirado; no reactivarlo con sus dependencias abiertas ni sus rutas genéricas. Responsable: mantenimiento y CI.

### S11 Clave del proveedor de noticias

`F:nuxt.config.ts:5` define claves en `runtimeConfig.app`; `F:components/user/recomendations/news.vue:115` usa la de noticias en una URL enviada directamente desde el navegador. Si la integración funciona con una clave válida, esa clave es observable por el cliente. No se inspeccionó su valor desplegado ni se comprobó exposición de la clave Gravatar.

**Corrección y cierre:** mover la llamada a un backend con cuota, caché y alcance fijo; mantener allí la credencial y rotar la que haya quedado expuesta. Si el proveedor permite explícitamente una clave pública, documentar sus restricciones y límites. Probar que HTML, JavaScript y solicitudes del navegador no contienen secretos de proveedor. Responsable: frontend y backend.

### S12 Cadena de suministro y operación

Frontend y Escanor no tienen workflows versionados en `.github` en estos checkouts. Eso no demuestra ausencia de builds externos. Gowther sí tiene acciones fijadas por SHA, `persist-credentials:false`, permisos de lectura en build y publicación separada con token efímero, además de análisis de fuente y binarios. Deben conservarse esos controles; esta revisión no acredita la configuración remota de la organización.

**Mejoras:** extender CI reproducible con `npm ci`, revisión de scripts de instalación, análisis de dependencias y secretos actuales/históricos, pruebas de autorización y análisis estático. Aislar builds de credenciales productivas; revisar cambios de workflows y lockfiles; generar inventario de componentes y conservar procedencia del artefacto. No habilitar código de PR no confiables con secretos o permisos de escritura. Bloquear scripts inicialmente exige permitir de manera deliberada los pasos necesarios de Nuxt y binarios nativos; `--ignore-scripts` no es una defensa completa contra código ejecutado al importar paquetes.

Verificar MFA resistente al phishing, permisos mínimos y bajas de colaboradores en GitHub, Atlas y DigitalOcean. Revisar eventos, ramas y workflows remotos desde el inicio de wfx-loot; si hay ejecución maliciosa, investigar persistencia y revocar los secretos afectados. No se recomienda rotar todas las credenciales indiscriminadamente basándose solo en la noticia.

Quedan por acreditar firewall y escucha loopback, cuentas de servicio sin root, parcheo del sistema, cifrado/retención, separación efectiva Dev/Prod, alertas sobre accesos clínicos y exportaciones, respaldo aislado y restauración ensayada. El banner de Nginx no demuestra por sí solo vulnerabilidad: comprobar paquetes y parches del proveedor. Swagger es público según la sonda; limitar su exposición según necesidad sin tratar ocultarlo como sustituto de autorización. Responsable: infraestructura y responsable de seguridad.

## Controles comprobados que conviene conservar

- Escanor verifica firma HS256, expiración, usuario activo/verificado y revocación del token presentado. Las tres suites seleccionadas de logout/contexto/sesión aprobaron 40 pruebas.
- El cambio de contexto institucional para administradores se valida en backend y no modifica la membresía persistida. No debe sustituirse por confianza en headers o roles del navegador.
- Gowther exige validación de sesión y falla sin acceso cuando falta el validador; aplica `no-store`, límites de transporte y una capa de publicaciones protegidas. Pasaron los paquetes de pruebas `internal/httpapi` y `internal/publication`; `internal/session` no contiene tests propios.
- Las sondas sin credenciales recibieron 401 en profile y sesión Gowther. FastAPI `/fastapi/` respondió 410. Esto acredita esas rutas en este momento, no todo el cierre de puertos del servidor.
- La credencial ya no está incrustada en `A:main.py`; el arranque exige configuración explícita. El propietario confirma además la revocación; no hay que volver a retirar un literal que ya se eliminó.

## Plan y criterios para aceptar el riesgo

| Ventana propuesta      | Resultado esperado                                                                                                                                                                    | Responsable propuesto                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Primeras 24 a 48 horas | Identificar versión desplegada; contener agenda/rutas institucionales afectadas; eliminar campos sensibles de respuestas                                                              | Backend e infraestructura                 |
| Primera semana         | Corregir los hallazgos abiertos S01 a S08 (chat excluido y S05 cerrado) con regresión HTTP y dos instituciones sintéticas; actualizar dependencias prioritarias; verificar despliegue | Backend, frontend y QA                    |
| Dentro de 30 días      | MFA privilegiada, sesiones endurecidas, cabeceras, CI y revisión de accesos; ensayar restauración y respuesta a incidentes                                                            | Equipo técnico y responsable de seguridad |
| Seguimiento continuo   | Actualizaciones, alertas, revisión de permisos y evidencia por release; nueva auditoría tras cambios relevantes                                                                       | Propietarios de cada control              |

Para declarar un nivel de seguridad defendible, propongo adoptar **OWASP ASVS 5.0.0 nivel 2 como objetivo de verificación**, con controles adicionales según el riesgo de datos de salud. Es una propuesta para KAIROS, no una certificación obtenida ni una selección impuesta por OWASP. El estándar permite definir requisitos y comprobarlos con evidencia. [ASVS oficial](https://asvs.owasp.org/).

El cierre debe exigir:

1. Ningún P0 abierto; hallazgos altos corregidos o con mitigación comprobada y aceptación temporal explícita.
2. Matriz de acceso probada en HTTP: anónimo, estudiante, personal, administrador institucional y global; instituciones A/B; recursos propios/ajenos; tokens vencidos/revocados y contraseña cambiada.
3. Ningún secreto de recuperación ni hash de contraseña en respuestas o logs; credenciales históricas revocadas y permisos efectivos acreditados.
4. Privacidad aplicada a todas las rutas de datos y agregados, incluso las que ya no usa la interfaz.
5. Dependencias y artefactos revisados por release; avisos pendientes con aplicabilidad, fecha y responsable.
6. Accesos privilegiados protegidos, alertas operativas verificadas y restauración de un respaldo realizada con objetivos RPO/RTO acordados.
7. Pentest autenticado independiente sobre staging aislado después de las correcciones, con reevaluación de hallazgos y verificación del despliegue real.

La afirmación adecuada sería «controles verificados para un alcance, versión y fecha definidos, con riesgos residuales conocidos». Un escáner sin alertas o una auditoría puntual no garantiza seguridad permanente.

## Registro de comprobaciones

- `npm audit --package-lock-only --ignore-scripts --json`: frontend y Escanor; consulta actual satisfactoria después del fallo inicial de DNS del sandbox. No se instalaron paquetes ni se aplicaron correcciones.
- `make vuln` y análisis detallado con la herramienta instalada `govulncheck-v1.9.0`: resultados consignados en S10.
- Diez comprobaciones sintéticas adicionales: serialización de profile/login, agenda, metadatos y delegación de chat, reset vacío, vigencia criptográfica tras reset, mínimo de cohorte, publicación insuficiente y alcance de seguimiento. El primer intento de carga con transpile-only falló por metadata de Mongoose; la ejecución con comprobación de tipos pasó.
- `npm run test -- --runInBand --watchman=false --runTestsByPath ...`: tres suites de autenticación, 40 tests aprobados.
- `go test ./internal/httpapi ./internal/publication ./internal/session`: aprobación tras permitir puertos efímeros loopback que el sandbox bloqueaba inicialmente. No se ejecutaron integraciones Atlas.
- HEAD públicos: frontend 200, Swagger 200, FastAPI 410, Gowther sin bearer 401, profile sin bearer 401. No se enviaron POST a chat ni consultas autenticadas a datos reales.
- `http://localhost:3001` no respondió durante la revisión. No se inició otro servidor ni se realizó validación visual/autenticada en navegador.
- No se ejecutó un escaneo completo de secretos o malware del dispositivo, ni una auditoría remota de GitHub. Los indicadores locales negativos son una comprobación limitada.

Referencias internas principales: instrucciones de los cuatro repositorios; auditoría DAMA del 28 de octubre como antecedente; contratos y seguridad de Gowther, ADR 0004/0005/0006/0012/0013/0014/0015/0027 y evidencia del retiro de FastAPI del 11 de noviembre. Este informe no reemplaza sus decisiones ni modifica la auditoría histórica.
