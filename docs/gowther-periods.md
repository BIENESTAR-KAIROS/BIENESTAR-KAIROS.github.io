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
**Solo las rutas relativas exactas** `/v1/session` y `/v1/statistics/periods` se
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

Referencias visuales: brandbook, secciones 5, 7–12, 15–16 y 19–21, y auditoría
institucional. Se preservan Figtree, violeta institucional, superficies y radios.
El botón nuevo usa violeta profundo con blanco; foco visible, etiquetas, estados
anunciados y columnas apiladas en móvil. La auditoría inicial es histórica; no se
modifica el brandbook por incorporar este bloque local.
