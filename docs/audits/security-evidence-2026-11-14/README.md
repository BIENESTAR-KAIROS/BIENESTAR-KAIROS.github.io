# Evidencia de la auditoría de seguridad

Fecha del informe: 14 de noviembre de 2026, America/Mexico_City.

- `frontend-npm-audit.json` y `escanor-npm-audit.json`: respuestas del registro npm sobre los lockfiles revisados. Las entradas transitivas no son vulnerabilidades independientes.
- `gowther-vuln.txt`: análisis detallado con govulncheck instalado; distingue módulos, paquetes y funciones alcanzables.
- `escanor-auth-tests.txt` y `gowther-tests.txt`: últimas ejecuciones satisfactorias de las pruebas seleccionadas. No son la suite completa.
- `public-headers.json`: cinco HEAD sin credenciales; solo conserva estado y una lista de cabeceras de seguridad/configuración, sin cookies.
- `synthetic-probes.json`: diez comprobaciones locales con datos sintéticos, sin base de datos ni inferencia real.
- `synthetic-probes.cjs.txt`: código de esas comprobaciones, guardado como evidencia textual. Usa el checkout local de Escanor y sus dependencias ya instaladas. No carga `.env` ni crea conexiones.

Para repetir las comprobaciones sintéticas en esta estación, copiar el texto a un archivo temporal con extensión `.cjs` y ejecutarlo con Node. Si cambia la ubicación del checkout, ajustar `root`. Las aserciones describen el comportamiento vulnerable observado: **deben dejar de cumplirse al corregirlo**; no son tests de aceptación de seguridad.

Los archivos no contienen credenciales reales. Los valores de contraseña, hash y tokens en el código de prueba son marcadores sintéticos. La comprobación JWT verifica firma/claims después del reset; la ausencia de invalidación global se fundamenta adicionalmente en el código y contrato de revocación.

La evidencia corresponde a los commits del informe. No identifica el commit exacto desplegado ni reemplaza revisión de eventos remotos, pruebas entre cuentas en staging o diagnóstico de permisos efectivos de Atlas.
