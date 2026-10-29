# API de Clon de X

## URL base

```text
http://localhost:3000/api
```

Las rutas JSON esperan cuerpos `application/json` cuando reciben un cuerpo. El formato de serialización de las fechas depende de `mysql2` y de la configuración de MySQL; aquí solo se documentan los campos que construye cada controlador.

## Autenticación JWT

Las rutas protegidas requieren un JWT en el encabezado:

```http
Authorization: Bearer <token>
```

El token se obtiene con `POST /auth/login` y el backend lo firma con expiración de dos horas. Si falta el encabezado Bearer o el token no es válido o expiró, el middleware devuelve `401 Unauthorized`.

Las excepciones sin JWT son `POST /auth/register`, `POST /auth/login` y las rutas heredadas en memoria `/api/posts`. Las demás rutas descritas abajo usan `authMiddleware`.

## Endpoints de autenticación

### `POST /auth/register`

Registra un usuario. No requiere autenticación.

**Cuerpo JSON:**

```json
{
  "fullName": "<nombre completo>",
  "username": "<nombre de usuario>",
  "email": "<correo>",
  "password": "<contraseña de al menos 8 caracteres>"
}
```

Los cuatro campos deben ser cadenas no vacías; se recortan nombre y username, y el correo se recorta y pasa a minúsculas. El correo debe coincidir con el patrón que valida el controlador. La contraseña debe tener al menos 8 caracteres.

**Éxito `201 Created`:** `{ message, user: { id, fullName, username, email } }`. La contraseña no se devuelve.

**Errores:** `400` por campos requeridos, correo inválido o contraseña corta; `409` si username o correo ya existen; `500` ante otro error del servidor.

### `POST /auth/login`

Inicia sesión con username y contraseña. No requiere autenticación.

**Cuerpo JSON:** `{ "username": "<nombre de usuario>", "password": "<contraseña>" }`.

**Éxito `200 OK`:** `{ message, token, user: { id, fullName, username, email } }`. El JWT expira en dos horas.

**Errores:** `400` si falta username o contraseña; `401` si el usuario o la contraseña no coinciden; `500` si falta `JWT_SECRET` o ocurre otro error del servidor.

## Usuarios

Todas las rutas de esta sección requieren JWT.

### `GET /users/me`

Devuelve el perfil del usuario autenticado.

**Éxito `200 OK`:** `{ id, fullName, username, email, bio, createdAt, followersCount, followingCount }`.

**Errores:** `404` si no se encuentra el usuario de la sesión; `500` ante otro error del servidor.

### `GET /users/:username`

Devuelve el perfil consultado. `:username` es el nombre de usuario de la ruta.

**Éxito `200 OK`:** `{ id, fullName, username, bio, createdAt, followersCount, followingCount, isFollowing }`. `isFollowing` representa si el usuario autenticado sigue el perfil consultado. La respuesta no incluye el correo.

**Errores:** `404` si no existe el username; `500` ante otro error del servidor.

### `GET /users/search?q=<texto>`

Busca por username o nombre completo. Si `q` está vacío o solo contiene espacios, devuelve `200 OK` con `{ "items": [] }`. La consulta limita la lista a ocho resultados.

**Éxito `200 OK`:** `{ items: [{ id, fullName, username }] }`.

**Error:** `500` ante un error del servidor.

### `PUT /users/me/bio`

Actualiza la biografía del usuario autenticado.

**Cuerpo JSON:** `{ "bio": "<texto>" }`. `bio` debe ser una cadena; el backend elimina espacios al inicio y al final y permite hasta 160 caracteres. Una cadena vacía es válida.

**Éxito `200 OK`:** `{ message, bio }`.

**Errores:** `400` si `bio` no es una cadena o supera 160 caracteres; `404` si no se encuentra el usuario; `500` ante otro error del servidor.

### Listas de seguidores y seguidos

Las listas actuales están disponibles bajo `/users`. Ambas aceptan `page` (predeterminado `1`) y `size` (predeterminado `10`). `page` y `size` deben ser enteros seguros; `page` debe ser al menos `1`, y `size` debe estar entre `1` y `100`. La ordenación es por nombre completo ascendente y, para desempatar, por ID ascendente.

**`GET /users/:username/followers?page=1&size=10`** devuelve quién sigue al usuario indicado.

**`GET /users/:username/following?page=1&size=10`** devuelve a quién sigue el usuario indicado.

**Éxito `200 OK`** para ambas rutas:

```json
{
  "items": [
    { "id": 1, "fullName": "<nombre completo>", "username": "<nombre de usuario>" }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

Si no hay resultados, `items` está vacío y `totalPages` es `0`.

**Errores:** `400` por parámetros no válidos o un offset no representable como entero seguro; `404` si no existe el perfil; `500` ante otro error del servidor.

### `GET /users/:username/tweets?page=1&size=10`

Devuelve las publicaciones escritas por el usuario indicado. `page` predeterminado `1`; `size` predeterminado `10`; el tamaño máximo aceptado es `100`. Los valores se convierten con `parseInt`; valores que resultan en cero o `NaN` usan el valor predeterminado. Valores negativos, `size` mayor que `100` o menor que `1` producen `400`.

**Éxito `200 OK`:** `{ items, page, size, totalItems, totalPages }`. Cada item contiene `id`, `content`, `createdAt` y `author: { id, fullName, username }`. Los resultados se ordenan por fecha descendente y luego por ID descendente.

**Errores:** `404` si no existe el username; `500` ante otro error del servidor.

### `GET /users/:username/retweets?page=1&size=10`

Devuelve las publicaciones que el usuario indicado ha retuiteado. Usa los mismos valores predeterminados y validaciones de `page` y `size` que la ruta de tweets de perfil.

**Éxito `200 OK`:** `{ items, page, size, totalItems, totalPages }`. Cada item contiene `id`, `content`, `createdAt`, `retweetedAt`, `retweetedBy`, `author: { id, fullName, username }`, `likesCount`, `retweetsCount`, `commentsCount`, `likedByMe` y `retweetedByMe`. Se ordena por fecha del retuit descendente y luego por ID del retuit descendente.

**Errores:** `404` si no existe el username; `500` ante otro error del servidor.

## Feed

### `GET /feed?page=1&size=10&tab=forYou`

Requiere JWT. `page` predeterminado `1`, `size` predeterminado `10`, y `tab` predeterminado `forYou`. Los valores aceptados para `tab` son `forYou` y `following`. `page` y `size` deben ser enteros seguros positivos; `size` no puede superar `100`.

- `forYou` incluye publicaciones propias, de cuentas seguidas y de otros usuarios.
- `following` incluye publicaciones propias y de cuentas seguidas.

**Éxito `200 OK`:** `{ items, page, size, totalItems, totalPages }`. Cada item contiene `id`, `content`, `createdAt`, `author: { id, fullName, username }`, `likesCount`, `retweetsCount`, `commentsCount`, `likedByMe` y `retweetedByMe`. Se ordenan por fecha descendente y luego por ID descendente.

Una página superior a la última devuelve `200 OK` con `items` vacío y los metadatos calculados para la consulta.

**Errores:** `400` por parámetros de paginación inválidos o `tab` no admitida; `500` ante otro error del servidor.

Nota de implementación: el parser del feed convierte valores ausentes, vacíos, cero o no numéricos de `page`/`size` a sus valores predeterminados antes de validarlos.

## Tweets

Todas las rutas de esta sección requieren JWT.

### `POST /tweets`

Crea una publicación del usuario autenticado.

**Cuerpo JSON:** `{ "content": "<texto de hasta 280 caracteres>" }`. El contenido debe ser una cadena no vacía después de recortarla.

**Éxito `201 Created`:** `{ id, content, createdAt, author: { id, fullName, username } }`.

**Errores:** `400` si el contenido falta, no es una cadena, está vacío o supera 280 caracteres; `500` ante otro error del servidor.

### `POST /tweets/:id/like`

Alterna el like del usuario autenticado para el tweet indicado. No requiere cuerpo.

**Éxito `200 OK`:** `{ tweetId, liked, likesCount }`, donde `liked` refleja el nuevo estado.

**Errores:** `400` si `:id` no es un entero seguro positivo; `404` si el tweet no existe; `500` ante otro error del servidor.

### `POST /tweets/:id/retweet`

Alterna el retuit del usuario autenticado. No requiere cuerpo.

**Éxito `200 OK`:** `{ tweetId, retweeted, retweetsCount }`, donde `retweeted` refleja el nuevo estado.

**Errores:** `400` si `:id` no es un entero seguro positivo; `404` si el tweet no existe; `500` ante otro error del servidor.

### `GET /tweets/:id/comments`

Devuelve los comentarios del tweet en orden ascendente por fecha y luego por ID.

**Éxito `200 OK`:** `{ items: [{ id, content, createdAt, userId, fullName, username }] }`.

**Errores:** `400` si `:id` no es un entero seguro positivo; `404` si el tweet no existe; `500` ante otro error del servidor.

### `POST /tweets/:id/comments`

Crea un comentario del usuario autenticado.

**Cuerpo JSON:** `{ "content": "<texto de hasta 280 caracteres>" }`. El contenido debe ser una cadena no vacía después de recortarla.

**Éxito `201 Created`:** `{ id, content, createdAt, userId, fullName, username }`.

**Errores:** `400` si el ID no es válido o el contenido falta, está vacío o supera 280 caracteres; `404` si el tweet no existe; `500` ante otro error del servidor.

## Seguimiento

Todas las rutas de esta sección requieren JWT. Las acciones reciben `username` en el cuerpo JSON, no como parámetro de ruta.

### `POST /follows`

Sigue al usuario indicado.

**Cuerpo JSON:** `{ "username": "<nombre de usuario>" }`.

**Éxito `201 Created`:** `{ message, user: { id, fullName, username } }`.

**Errores:** `400` si falta username o se intenta seguir a sí mismo; `404` si el usuario no existe; `409` si ya lo sigue; `500` ante otro error del servidor.

### `DELETE /follows`

Deja de seguir al usuario indicado.

**Cuerpo JSON:** `{ "username": "<nombre de usuario>" }`.

**Éxito `200 OK`:** `{ message, username }`.

**Errores:** `400` si falta username o se intenta dejar de seguirse a sí mismo; `404` si el usuario no existe o la relación no existe; `500` ante otro error del servidor.

### `GET /follows/:username/status`

Indica si el usuario autenticado sigue al username de la ruta.

**Éxito `200 OK`:** `{ "isFollowing": true }` o `{ "isFollowing": false }`.

**Errores:** `404` si no existe el usuario; `500` ante otro error del servidor.

### Rutas heredadas de consulta de listas

El router también conserva `GET /follows/:username/followers?page=1&size=10` y `GET /follows/:username/following?page=1&size=10`, con el mismo middleware y controlador paginado que las rutas `/users/:username/...`.

## Rutas heredadas en memoria

Además de las rutas que consultan MySQL, `server.js` define `GET /api/posts` y `POST /api/posts`. No requieren JWT y usan un arreglo en memoria del proceso; no forman parte del feed de MySQL y los datos agregados con POST no se persisten en la base de datos.

- `GET /api/posts` devuelve el arreglo de publicaciones en memoria.
- `POST /api/posts` recibe `{ "content": "<contenido>", "author": "<autor>" }`. Si falta cualquiera de los valores, responde `400` con `{ error }`; si los recibe, devuelve `201 Created` con `{ id, content, author, likes }`.

## Alcance y verificación

Los métodos, cuerpos, campos y códigos de respuesta descritos aquí se derivan de la inspección estática de los routers, controladores y middleware. No implica que se hayan probado solicitudes contra un servidor o una base de datos en ejecución. Los errores de base de datos y otras excepciones internas se responden generalmente como `500` con un mensaje genérico.
