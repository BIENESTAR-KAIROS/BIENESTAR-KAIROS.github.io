# Períodos institucionales en Gowther

Implementación local del 4 de noviembre de 2026.

## Pantalla y permisos

En **Mis configuraciones → Períodos de análisis** (`/institute/settings`), la
institución consulta sus intervalos. El administrador general usa el contexto
institucional existente. El bloque funciona aunque todavía no exista una
configuración de secuencia de cuestionarios.

La cuenta con `statistics:periods:write` puede registrar un intervalo; el personal
con `statistics:read` solo consulta. Los permisos vienen de `/v1/session`, mediante
una acción del store de autenticación. Se vuelven a consultar antes de un alta;
Gowther/Escanor autorizan cada petición independientemente de lo que muestre Vue.

El formulario usa una zona IANA explícita (por defecto America/Mexico_City),
interpreta fechas y horas en esa zona y convierte a UTC. Rechaza horas inexistentes
o repetidas por horario estacional. El fin no se incluye: para abarcar un día
completo, seleccionar las 00:00 del siguiente. La vista previa muestra el intervalo
y la zona antes de la confirmación de permanencia. No existe edición ni borrado.

Máximo 120 períodos por institución y 366 días por período. La interfaz comprueba
solapamientos; la restricción autoritativa y atómica vive en Gowther. Una respuesta
ambigua obliga a actualizar la lista antes de volver a enviar. No hay reintentos
POST automáticos. Cambiar de institución/cuenta o desmontar la pantalla cancela
peticiones y descarta sus respuestas, permisos y borrador anteriores.

## Transporte y configuración

Se usa `$statsApi` para ambas generaciones de analítica durante la migración.
**Solo las rutas relativas exactas** `/v1/session`, `/v1/statistics/periods` y
`/v1/statistics/questionnaires/{ObjectId}` se
redirigen al origen configurado de Gowther y reciben el bearer de `store/auth`.
Las rutas de analítica anteriores conservan su origen y comportamiento. No se
reconfigura globalmente `API_LOCAL_STATS_BASE_URL` ni se sustituye la API anterior.

Variables públicas de origen (no contienen credenciales):

```dotenv
# npm run dev: valor por defecto si se omite.
API_LOCAL_GOWTHER_BASE_URL=http://127.0.0.1:8082
# Build de producción: configurar solo al desplegar Gowther por HTTPS.
API_GOWTHER_BASE_URL=
```

Usar el puerto real de `HTTP_ADDR` en el `.env` de Gowther; en esta Mac se configuró
`http://127.0.0.1:8081`. Reiniciar Nuxt cuando se cambie el `.env`. Los orígenes no
admiten usuario, contraseña, query ni path adicional. En desarrollo se permite
HTTP loopback; en build se exige HTTPS. Un origen productivo ausente falla sin
mandar la sesión a otra API como alternativa.

En Gowther:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

Lista de orígenes exactos separados por comas, sin slash final ni comodines.
`http://127.0.0.1:3001` es otro origen: agregarlo solo si se usa esa dirección.
Gowther permite preflight para las rutas y métodos conocidos, bearer y cabeceras
institucionales. No permite cookies ni la credencial privada entre servicios.
`ESCANOR_SERVICE_TOKEN`/`GOWTHER_SERVICE_TOKEN` y las URI Mongo nunca van al frontend.
La base fuente de Escanor y las conexiones de Gowther deben corresponder al mismo
entorno de desarrollo.

## Verificación

- `npm run lint` y `npm run build`.
- Comprobación del conversor horario: UTC, México, fechas inválidas, horas omitidas
  y repetidas en Tijuana. Sin dependencias nuevas ni runner de tests instalado.
- Navegador integrado con sesión real de desarrollo: listado vacío autorizado,
  formulario administrativo, fechas invertidas, vista previa, confirmación y foco.
- Revisión responsive a 360 y 1440 px, sin desbordamiento horizontal del documento.
- Las pruebas de Go cubren CORS permitido/rechazado y que no sustituya autenticación.

No se envían intervalos ficticios a Atlas para probar la UI: los períodos son
permanentes. El alta y reintento se verifican con almacenamiento sintético en la
suite de Gowther; la revisión del navegador no acredita una escritura real.

## Consulta de informes reales

La ruta existente **Mis estadísticas** (`/institute/stats`) consume ahora Gowther.
Reemplaza en esa ruta la consulta antigua de cuestionarios con filtros libres y
población mixta. Los otros consumidores de la analítica anterior conservan su API;
no hay fallback automático ni se envía el bearer de Gowther a sus endpoints.

1. Registrar un período de la institución en Mis configuraciones.
2. Esperar a su fin; solo los intervalos marcados `closed` por el servidor aparecen
   en el selector de informes. Actualizar opciones vuelve a consultar ese estado.
3. Elegir cuestionario, revisión y período, y pulsar **Consultar informe**. Cargar
   la página o cambiar una selección no calcula ni publica un informe.
4. La primera consulta elegible guarda el informe inmutable. La pantalla explica
   este efecto antes de consultar. Consultas posteriores conservan el mismo informe.

El catálogo procede de `GET /questionnaire` en Escanor, autorizado para la institución
efectiva; incluye cuestionarios publicados schema 2, incluso inactivos. El catálogo
solo ofrece la revisión actual. Para una anterior se indica su número conocido,
sin inventar un listado de revisiones existentes. El servidor decide si hay entregas
compatibles; la ausencia y los grupos pequeños conservan el mismo sobre protegido.
La pantalla no admite fechas libres, combinaciones de períodos, filtros demográficos,
exportación ni población demo. El flujo de simulación sigue siendo otro avance.

La sesión se valida antes de cargar opciones y antes de consultar. La petición lleva
exactamente `definitionRevision`, `from`, `until`; institución y permisos se resuelven
en Escanor/Gowther. El cliente verifica alcance, contrato de publicación y estructura
antes de dibujar. Cambios de cuenta, token, institución, revisión o período invalidan
peticiones anteriores y limpian resultados. No se persisten informes en storage ni se
reintenta automáticamente una consulta.

Se muestran media, mediana, todas las modas (o «Sin moda»), desviación poblacional,
rango, cobertura, razones y advertencias, con el redondeo solo en presentación.
Las preguntas informativas publicadas sin valores numéricos muestran su cobertura.
Un cero válido permanece cero; un valor protegido no se sustituye ni se reconstruye.
Sin total definido no se suman dimensiones para fabricar uno. La cobertura protegida
permanece oculta. Las omisiones describen ausencias, no un porcentaje de sesgo.
Los reintentos distinguen promedio entre todos y entre repetidores, y respetan la
supresión del bloque completo. La fecha de cálculo y las fechas del alcance se
presentan en `America/Mexico_City`, indicada explícitamente.

Los nombres actuales de preguntas/dimensiones se consultan opcionalmente mediante
`GET /questionnaire/{id}/definition` solo para la revisión actual, comprobando ID y
revisión. Si no coinciden, no están disponibles o se consulta una revisión anterior,
se conserva una referencia al ID de la métrica/pregunta; nunca se atribuyen etiquetas
actuales a resultados históricos. Un catálogo de revisiones y etiquetas históricas
congeladas requiere ampliar el contrato; no se deducen desde respuestas individuales.

Verificación reproducible sin red, `.env` ni base de datos:

```bash
node scripts/check-statistics-publication.mjs
```

Usa Node, TypeScript y Vue ya instalados con el proyecto; no instala un runner ni
dependencias. Comprueba contrato/alcance, supresión, cero, preguntas informativas,
modas, reintentos, render con fixtures, allowlist de rutas, bloqueo de períodos
abiertos y descarte de respuestas tardías al cambiar de institución. Con
`--preview /ruta/absoluta/ejemplo.html` genera una vista estática sintética aislada
para revisar los componentes; no añade rutas de prueba ni datos demo a la aplicación.
Se ejecutaron también lint, build y revisión visual del estado autenticado sin
períodos y del render sintético. La primera publicación con datos de desarrollo
queda pendiente de registrar un período real elegido por la institución; no se
crearon períodos ni publicaciones en Atlas durante este avance.

Referencias visuales: brandbook, secciones 5, 7–12, 15–16 y 19–21, y auditoría
institucional. Se preservan Figtree, violeta institucional, superficies y radios.
El botón nuevo usa violeta profundo con blanco; foco visible, etiquetas, estados
anunciados y columnas apiladas en móvil. La auditoría inicial es histórica; no se
modifica el brandbook por incorporar este bloque local.
