# Backend de Clon de X

## Propósito y arquitectura

Este backend implementa la API REST de Clon de X con Node.js y Express, y utiliza MySQL para guardar usuarios, publicaciones y relaciones. `server.js` carga las variables de entorno, configura JSON y CORS, y monta los routers. `db.js` crea un pool de conexiones con `mysql2`; `authMiddleware.js` valida los tokens JWT en las rutas protegidas. La lógica de listas de seguidores y seguidos está en `controllers/followLists.js`.

## Requisitos previos

- Node.js y npm en versiones compatibles con las dependencias y los scripts del proyecto.
- Un servidor MySQL en ejecución, por ejemplo MySQL de XAMPP.
- Una base de datos vacía cuyo nombre coincida con `DB_NAME`.

### Estado de preparación de la base de datos

`schema.sql` crea las tablas `users`, `tweets`, `follows`, `tweet_likes`, `retweets` y `comments`, con claves foráneas, restricciones únicas e índices usados por las consultas del backend. El esquema usa InnoDB y `utf8mb4`.

Para una instalación nueva:

1. Crea una base de datos vacía con el nombre configurado en `DB_NAME` (el valor de ejemplo es `clon_x`).
2. En MySQL Workbench, establece esa base como esquema predeterminado, abre `server/schema.sql` y ejecútalo. Si trabajas desde la carpeta `server`, el archivo está en `schema.sql`.
3. Copia y configura `server/.env.example` como se explica abajo. El backend requiere que la base y las tablas existan antes de iniciar las rutas que consultan MySQL.

`schema.sql` solo crea tablas que todavía no existen; no borra registros ni modifica tablas existentes. El script `seed.js` no crea el esquema: elimina registros de `follows`, `tweets` y `users` antes de insertar datos de prueba. Úsalo únicamente en una base desechable, nunca como instalador de esquema ni en una base con información que debas conservar.

## Instalación

Desde esta carpeta (`server`), instala las dependencias:

```bash
npm install
```

## Variables de entorno y conexión MySQL

Copia el archivo `.env.example` de esta carpeta como `.env` y configura los valores para tu entorno. No incluyas credenciales reales en el repositorio ni compartas el archivo `.env`.

| Variable | Propósito |
| --- | --- |
| `DB_HOST` | Host del servidor MySQL. |
| `DB_PORT` | Puerto de MySQL. |
| `DB_USER` | Usuario de conexión a MySQL. |
| `DB_PASSWORD` | Contraseña de ese usuario. |
| `DB_NAME` | Base de datos que utiliza el pool de conexiones. El ejemplo indica `clon_x`. |
| `JWT_SECRET` | Secreto utilizado para firmar y verificar tokens de autenticación. Configura un valor propio en tu entorno. |
| `CORS_ORIGIN` | Origen web autorizado por CORS. El ejemplo usa `http://localhost:5173`; si no está definido o está vacío, el servidor usa ese mismo origen local predeterminado. |

`db.js` pasa las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` a `mysql2/promise`. La aplicación requiere que la base de datos y sus tablas existan antes de usar las rutas que consultan MySQL.

## Iniciar el backend

Ejecuta los comandos desde esta carpeta (`server`).

Modo de desarrollo, con reinicio al cambiar archivos:

```bash
npm run dev
```

Inicio normal:

```bash
npm start
```

El servidor escucha en `http://localhost:3000`.

## Rutas y funciones principales

Las rutas se montan bajo `/api`:

- **Autenticación (`/api/auth`):** registro e inicio de sesión.
- **Usuarios (`/api/users`):** perfil de la sesión, perfil por username, búsqueda, actualización de biografía, listas paginadas de seguidores y seguidos, publicaciones y retuits del perfil.
- **Feed (`/api/feed`):** feed autenticado con pestañas `forYou` y `following` y paginación.
- **Tweets (`/api/tweets`):** creación de publicaciones, likes, retuits y consulta o creación de comentarios.
- **Seguimiento (`/api/follows`):** seguir y dejar de seguir, estado de seguimiento. También conserva rutas de consulta de seguidores y seguidos.

El servidor mantiene además las rutas heredadas `/api/posts` GET y POST. Estas operan sobre un arreglo en memoria del proceso; no son las rutas del feed de MySQL.

Consulta [`API.md`](API.md) para los métodos, parámetros y respuestas documentados de los endpoints actuales.

## Archivos principales

- `server.js`: configuración de Express, CORS y montaje de rutas.
- `loadEnv.js`: carga variables desde `.env`.
- `db.js`: pool de conexiones MySQL.
- `routes/`: rutas de autenticación, usuarios, feed, tweets y seguimiento.
- `controllers/followLists.js`: consultas paginadas de seguidores y seguidos.
- `middleware/authMiddleware.js`: validación de autenticación JWT.
- `API.md`: documentación de referencia de la API.
