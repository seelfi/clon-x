# Clon de X

Aplicación web inspirada en X. Permite registrarse e iniciar sesión, publicar tweets, explorar el feed, visitar perfiles y gestionar relaciones de seguimiento e interacciones con publicaciones.

## Autoría

- **Autor:** Juan Pablo Alvarez Monsalve.
- Proyecto académico individual de la asignatura de Desarrollo Web.

## Tecnologías

- **Frontend:** React, React Router y Vite.
- **Backend:** Node.js y Express.
- **Base de datos:** MySQL, mediante `mysql2`.
- **Autenticación y configuración del servidor:** JSON Web Tokens, `bcryptjs`, `dotenv` y `cors`.

## Requisitos previos

- Node.js y npm, en versiones compatibles con las dependencias del proyecto.
- MySQL instalado y en ejecución. También puede utilizarse MySQL desde XAMPP.
- Una base de datos configurada para la aplicación. El archivo de ejemplo propone el nombre `clon_x`.

## Instalación

Instala las dependencias del frontend desde la carpeta raíz:

```bash
npm install
```

Instala las dependencias del backend desde su carpeta:

```bash
cd server
npm install
```

## Variables de entorno

El frontend y el backend utilizan configuraciones separadas.

### Frontend: `VITE_API_URL`

El frontend lee `VITE_API_URL` para determinar la URL base de la API. Si no se define, el código utiliza `http://localhost:3000/api`.

Para cambiarla, copia `.env.example` de la raíz como `.env` y ajusta `VITE_API_URL` a la URL de la API. El archivo de ejemplo contiene el valor local predeterminado y no incluye secretos.

### Backend

Copia `server/.env.example` como `server/.env` y ajusta sus variables a tu instalación. El ejemplo incluye:

| Variable | Uso |
| --- | --- |
| `DB_HOST` | Servidor MySQL. |
| `DB_PORT` | Puerto MySQL. |
| `DB_USER` | Usuario de MySQL. |
| `DB_PASSWORD` | Contraseña del usuario de MySQL. |
| `DB_NAME` | Nombre de la base de datos. |
| `JWT_SECRET` | Clave que utiliza el backend para firmar tokens. Configura un valor propio en tu entorno local. |
| `CORS_ORIGIN` | Origen del frontend permitido por CORS. El ejemplo usa `http://localhost:5173`. |

No publiques los archivos `.env` ni incluyas credenciales reales en el repositorio.

## Preparar MySQL

Crea una base de datos vacía con el mismo nombre configurado en `DB_NAME` (el ejemplo usa `clon_x`). En MySQL Workbench, selecciónala como esquema predeterminado, abre `server/schema.sql` y ejecuta el archivo para crear las tablas, claves e índices requeridos. Las instrucciones detalladas están en [`server/README.md`](server/README.md).

El seed es únicamente para datos de prueba y elimina registros existentes antes de insertarlos. No lo ejecutes en una base que contenga datos que quieras conservar.

## Ejecutar la aplicación

Inicia MySQL y comprueba que la configuración del backend corresponde a tu entorno. Luego abre dos terminales.

**Terminal 1 — backend**, desde la carpeta `server`:

```bash
npm run dev
```

El script de producción disponible para iniciar el backend es `npm start`.

**Terminal 2 — frontend**, desde la carpeta raíz:

```bash
npm run dev
```

Vite sirve el frontend en desarrollo. El origen local indicado por defecto para CORS es `http://localhost:5173`; si Vite utiliza otro origen, actualiza `CORS_ORIGIN` en `server/.env` para que coincida.

## Estructura principal

```text
src/                 Frontend React: páginas, componentes, servicios y estilos
server/              API Express, rutas, conexión MySQL y configuración del backend
server/API.md        Referencia de endpoints de la API
```

Consulta [`server/API.md`](server/API.md) para la documentación de los endpoints.

## Comprobaciones del frontend

Desde la raíz del proyecto:

```bash
npm run lint
npm run build
```
