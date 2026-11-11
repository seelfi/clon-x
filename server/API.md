# API de Clon de X

Referencia de la API implementada en `server/`. Las rutas `/api/auth`, `/api/users`, `/api/tweets`, `/api/feed` y `/api/follows` usan MySQL. Las rutas heredadas `/api/posts` son una excepción en memoria.

## Base y autenticación

- Base URL local: `http://localhost:3000/api` (el servidor escucha en el puerto `3000`).
- Las rutas que reciben datos esperan cuerpos JSON (`Content-Type: application/json`).
- Las rutas marcadas **Autenticada** requieren `Authorization: Bearer <token>`.
- El token JWT se obtiene al iniciar sesión, expira a las 2 horas y se valida con `JWT_SECRET`.
- Sin token, las rutas protegidas responden `401` con `{"message":"Token de autenticación requerido"}`. Un token inválido o expirado responde `401` con `{"message":"Token inválido o expirado"}`.
- Los ejemplos muestran los campos relevantes y tipos JSON devueltos; los identificadores y fechas son ilustrativos.

## Convenciones de paginación

Las respuestas paginadas tienen esta forma:

```json
{
  "items": [],
  "page": 1,
  "size": 10,
  "totalItems": 0,
  "totalPages": 0
}
```

`totalPages` es `Math.ceil(totalItems / size)`, por lo que es `0` cuando no hay resultados. Una página posterior a la última responde normalmente con `items: []` y conserva los metadatos calculados; el servidor no limita la página solicitada al último número disponible.

El máximo de `size` en feed, publicaciones de perfil y listas de seguidores/seguidos es 100. Los valores predeterminados y el modo de validar parámetros varían según la ruta, como se especifica en cada sección.

## Autenticación

### `POST /auth/register`

Registra una cuenta. **No requiere autenticación.**

Body:

```json
{
  "fullName": "Ana Pérez",
  "username": "ana",
  "email": "ana@example.com",
  "password": "contrasena123"
}
```

Los cuatro valores deben ser cadenas no vacías; `fullName`, `username` y `email` se recortan, el correo se convierte a minúsculas y debe tener formato de correo. La contraseña debe tener al menos 8 caracteres. `username` y `email` deben ser únicos.

Éxito `201` (el registro no devuelve token):

```json
{
  "message": "Usuario registrado correctamente",
  "user": { "id": 12, "fullName": "Ana Pérez", "username": "ana", "email": "ana@example.com" }
}
```

Otros estados: `400` datos inválidos, `409` nombre de usuario o correo ya registrado, `500` error del servidor.

### `POST /auth/login`

Inicia sesión. **No requiere autenticación.**

Body:

```json
{ "username": "ana", "password": "contrasena123" }
```

Éxito `200`:

```json
{
  "message": "Inicio de sesión exitoso",
  "token": "<jwt>",
  "user": { "id": 12, "fullName": "Ana Pérez", "username": "ana", "email": "ana@example.com" }
}
```

Otros estados: `400` campos inválidos o vacíos, `401` usuario o contraseña incorrectos, `500` error del servidor o `JWT_SECRET` no configurado.

## Usuarios y perfiles

Todas las rutas de esta sección requieren autenticación.

### `GET /users/me`

Devuelve los datos del usuario autenticado, incluidos los conteos agregados desde la base de datos.

Respuesta `200`:

```json
{
  "id": 12,
  "fullName": "Ana Pérez",
  "username": "ana",
  "email": "ana@example.com",
  "bio": "Hola",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "followersCount": 4,
  "followingCount": 7,
  "tweetsCount": 16,
  "retweetsCount": 3
}
```

`tweetsCount` cuenta las publicaciones propias y `retweetsCount` las republicaciones hechas por ese usuario. Otros estados: `404` usuario no encontrado, `500` error del servidor.

### `PUT /users/me/bio`

Actualiza la biografía del usuario autenticado. Body: `{"bio":"Texto de hasta 160 caracteres"}`. `bio` debe ser una cadena; se recorta antes de guardar.

Éxito `200`: `{"message":"Bio updated successfully","bio":"Texto de hasta 160 caracteres"}`. Otros estados: `400` tipo inválido o más de 160 caracteres, `404` usuario no encontrado/sin fila actualizada, `500` error del servidor.

### `GET /users/search?q={texto}`

Busca por nombre de usuario o nombre completo. `q` se recorta. Si está vacío, responde `200` con `{"items":[]}`. La búsqueda devuelve como máximo 8 resultados y los ordena dando prioridad al username exacto, luego al prefijo del username y después al resto; dentro de cada grupo ordena por username ascendente.

Respuesta `200`:

```json
{"items":[{"id":12,"fullName":"Ana Pérez","username":"ana"}]}
```

Otros estados: `500` error del servidor.

### `GET /users/:username`

Devuelve el perfil público indicado por `username`, con conteos de ese usuario y el estado de seguimiento respecto al usuario autenticado.

Respuesta `200`:

```json
{
  "id": 12,
  "fullName": "Ana Pérez",
  "username": "ana",
  "bio": "Hola",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "followersCount": 4,
  "followingCount": 7,
  "tweetsCount": 16,
  "retweetsCount": 3,
  "isFollowing": true
}
```

`isFollowing` indica si el usuario autenticado sigue al perfil solicitado. En el perfil propio será `false` porque no existe auto-seguimiento. No se devuelve `email`. Otros estados: `404` perfil inexistente, `500` error del servidor.

### `GET /users/:username/tweets?page={page}&size={size}`

Devuelve publicaciones propias del perfil indicado, ordenadas de más recientes a más antiguas (desempate por id descendente). `page` y `size` por defecto son `1` y `10`. Se convierten con `parseInt`; valores ausentes, no convertibles o cero usan el valor predeterminado. Como `parseInt` acepta el prefijo entero, por ejemplo `2abc` se interpreta como `2`. Después de esa conversión se responde `400` si `page < 1`, `size < 1` o `size > 100`.

Respuesta `200`:

```json
{
  "items": [
    { "id": 91, "content": "Hola", "createdAt": "2026-02-02T10:30:00.000Z", "author": { "id": 12, "fullName": "Ana Pérez", "username": "ana" } }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 16,
  "totalPages": 2
}
```

Otros estados: `400` parámetros fuera de los límites anteriores, `404` perfil inexistente, `500` error del servidor.

Nota: estas rutas no validan explícitamente que el `offset` calculado siga siendo un entero seguro. Para páginas extremadamente grandes, el comportamiento depende de la consulta MySQL y puede terminar en `500`.

### `GET /users/:username/retweets?page={page}&size={size}`

Devuelve publicaciones republicadas por el perfil indicado, ordenadas por fecha de republicación descendente (desempate por id descendente). Usa los mismos valores predeterminados y validación `parseInt` descritos para `/users/:username/tweets`.

Respuesta `200`:

```json
{
  "items": [
    {
      "id": 91,
      "content": "Hola",
      "createdAt": "2026-02-02T10:30:00.000Z",
      "retweetedAt": "2026-02-03T09:00:00.000Z",
      "retweetedBy": "ana",
      "author": { "id": 18, "fullName": "Luis Díaz", "username": "luis" },
      "likesCount": 2,
      "retweetsCount": 1,
      "commentsCount": 0,
      "likedByMe": false,
      "retweetedByMe": true
    }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 3,
  "totalPages": 1
}
```

`retweetedBy` es el username del usuario cuyo listado de republicaciones se consulta; `author` es el autor original de la publicación. Los campos `likedByMe` y `retweetedByMe` corresponden al usuario autenticado. Otros estados: `400` parámetros inválidos, `404` perfil inexistente, `500` error del servidor.

### `GET /users/:username/followers?page={page}&size={size}`
### `GET /users/:username/following?page={page}&size={size}`

Devuelve, respectivamente, los seguidores del usuario y las cuentas que sigue. `page`/`size` por defecto son `1`/`10`; deben ser enteros seguros, `page >= 1` y `1 <= size <= 100`. Un offset no representable como entero seguro también produce `400`. Los elementos se ordenan por `fullName` ascendente y luego por `id` ascendente.

Respuesta `200` de ejemplo:

```json
{
  "items": [
    { "id": 22, "fullName": "Carlos Ruiz", "username": "carlos", "isFollowing": true },
    { "id": 25, "fullName": "Marta León", "username": "marta", "isFollowing": false }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 2,
  "totalPages": 1
}
```

`isFollowing` en cada elemento indica si el usuario autenticado sigue a esa cuenta, tanto en la lista de seguidores como en la de seguidos. Otros estados: `400` paginación inválida, `404` usuario de la URL inexistente, `500` error del servidor.

## Feed

### `GET /feed?page={page}&size={size}&tab={tab}`

Requiere autenticación. `page` y `size` por defecto son `1` y `10`; `tab` por defecto es `forYou`. Se aceptan `forYou` y `following`. Los parámetros numéricos deben convertirse a enteros seguros, `page >= 1` y `1 <= size <= 100`; ausentes, vacíos, no numéricos y cero usan el valor predeterminado por la conversión `Number(value) || default`.

- `forYou`: incluye publicaciones propias, de cuentas seguidas y de otros usuarios (la consulta actual contempla todos esos grupos).
- `following`: incluye publicaciones propias y de cuentas que sigue el usuario autenticado.

Ordena por fecha de creación descendente y luego id descendente.

Respuesta `200`:

```json
{
  "items": [
    {
      "id": 91,
      "content": "Hola",
      "createdAt": "2026-02-02T10:30:00.000Z",
      "author": { "id": 12, "fullName": "Ana Pérez", "username": "ana" },
      "likesCount": 2,
      "retweetsCount": 1,
      "commentsCount": 0,
      "likedByMe": false,
      "retweetedByMe": false
    }
  ],
  "page": 1,
  "size": 10,
  "totalItems": 31,
  "totalPages": 4
}
```

Otros estados: `400` página/tamaño fuera de límites o `tab` desconocida, `500` error del servidor.

Nota: el feed valida que `page` y `size` sean enteros seguros, pero no valida por separado el `offset` calculado. Un `page` enorme que produzca un offset no seguro puede fallar al ejecutar la consulta y responder `500`.

## Publicaciones, reacciones y comentarios

Todas las rutas de esta sección requieren autenticación.

### `POST /tweets`

Crea una publicación. Body: `{"content":"Texto de la publicación"}`. `content` debe ser una cadena no vacía tras recortarla y tener como máximo 280 caracteres.

Éxito `201`:

```json
{
  "id": 91,
  "content": "Texto de la publicación",
  "createdAt": "2026-02-02T10:30:00.000Z",
  "author": { "id": 12, "fullName": "Ana Pérez", "username": "ana" }
}
```

Otros estados: `400` contenido inválido, `500` error del servidor.

### `POST /tweets/:id/like`

Alterna el “me gusta” del usuario autenticado para la publicación. `id` debe ser un entero seguro positivo.

Respuesta `200`: `{"tweetId":91,"liked":true,"likesCount":3}`. `liked` refleja el estado después de la operación. Otros estados: `400` id inválido, `404` publicación inexistente, `500` error del servidor.

### `POST /tweets/:id/retweet`

Alterna la republicación del usuario autenticado. `id` debe ser un entero seguro positivo.

Respuesta `200`: `{"tweetId":91,"retweeted":true,"retweetsCount":2}`. `retweeted` refleja el estado después de la operación. Otros estados: `400` id inválido, `404` publicación inexistente, `500` error del servidor.

### `GET /tweets/:id/comments`

Devuelve los comentarios de una publicación en orden de creación ascendente y, en caso de empate, id ascendente. `id` debe ser un entero seguro positivo.

Respuesta `200`:

```json
{
  "items": [
    { "id": 5, "content": "De acuerdo", "createdAt": "2026-02-02T10:35:00.000Z", "userId": 22, "fullName": "Carlos Ruiz", "username": "carlos" }
  ]
}
```

Otros estados: `400` id inválido, `404` publicación inexistente, `500` error del servidor.

### `POST /tweets/:id/comments`

Crea un comentario. Body: `{"content":"Texto del comentario"}`. `id` debe ser un entero seguro positivo; el contenido debe ser una cadena no vacía tras recortarla y tener como máximo 280 caracteres.

Éxito `201`:

```json
{ "id": 5, "content": "Texto del comentario", "createdAt": "2026-02-02T10:35:00.000Z", "userId": 22, "fullName": "Carlos Ruiz", "username": "carlos" }
```

Otros estados: `400` id o contenido inválidos, `404` publicación inexistente, `500` error del servidor.

## Seguimiento

Todas las rutas requieren autenticación.

### `POST /follows`

Sigue la cuenta identificada por `username`. Body: `{"username":"carlos"}`.

Éxito `201`: `{"message":"User followed successfully","user":{"id":22,"fullName":"Carlos Ruiz","username":"carlos"}}`.

Otros estados: `400` falta username o se intenta seguirse a sí mismo, `404` usuario destino inexistente, `409` ya se sigue a ese usuario, `500` error del servidor.

### `DELETE /follows`

Deja de seguir la cuenta identificada por `username`. Body: `{"username":"carlos"}`.

Éxito `200`: `{"message":"User unfollowed successfully","username":"carlos"}`. Otros estados: `400` falta username o se intenta dejar de seguirse a sí mismo, `404` usuario inexistente o no había relación que eliminar, `500` error del servidor.

### `GET /follows/:username/status`

Devuelve si el usuario autenticado sigue al username indicado.

Respuesta `200`: `{"isFollowing":true}`. Otros estados: `404` usuario inexistente, `500` error del servidor.

### Rutas heredadas de listas

`GET /follows/:username/followers?page={page}&size={size}` y `GET /follows/:username/following?page={page}&size={size}` son alias heredados de las rutas equivalentes bajo `/users/:username`. Ambas requieren autenticación y usan el mismo controlador, validación, orden, paginación, estructura de respuesta e `isFollowing` por elemento.

## Rutas heredadas de posts en memoria

Estas rutas están montadas en `/api/posts`, no requieren JWT y no consultan MySQL. El arreglo se inicializa al arrancar el proceso con un registro demostrativo y se pierde al reiniciar el servidor. No corresponde al feed de tweets.

### `GET /posts`

Devuelve el arreglo actual, por ejemplo:

```json
[{ "id": 1, "content": "¡Nuestra API REST ya está en construcción!", "author": "usuario_demo", "likes": 0 }]
```

### `POST /posts`

Body esperado: `{"content":"Hola","author":"ana"}`. El controlador comprueba que ambos valores sean truthy, crea un objeto en memoria con `id` igual al tamaño actual más uno y `likes: 0`, y responde `201` con ese objeto. Si falta uno de los valores, responde `400` con `{"error":"El contenido y el autor son obligatorios"}`. No aplica las validaciones, autenticación ni persistencia de `/tweets`.

## Resumen de endpoints implementados

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Registro |
| POST | `/auth/login` | No | Inicio de sesión y emisión de JWT |
| GET | `/users/me` | Sí | Usuario autenticado y conteos |
| PUT | `/users/me/bio` | Sí | Actualización de biografía |
| GET | `/users/search` | Sí | Búsqueda de usuarios |
| GET | `/users/:username` | Sí | Perfil y conteos |
| GET | `/users/:username/tweets` | Sí | Publicaciones paginadas del perfil |
| GET | `/users/:username/retweets` | Sí | Republicaciones paginadas del perfil |
| GET | `/users/:username/followers` | Sí | Seguidores paginados |
| GET | `/users/:username/following` | Sí | Seguidos paginados |
| GET | `/feed` | Sí | Feed paginado |
| POST | `/tweets` | Sí | Crear publicación |
| POST | `/tweets/:id/like` | Sí | Alternar “me gusta” |
| POST | `/tweets/:id/retweet` | Sí | Alternar republicación |
| GET | `/tweets/:id/comments` | Sí | Listar comentarios |
| POST | `/tweets/:id/comments` | Sí | Crear comentario |
| POST | `/follows` | Sí | Seguir usuario |
| DELETE | `/follows` | Sí | Dejar de seguir usuario |
| GET | `/follows/:username/status` | Sí | Consultar relación de seguimiento |
| GET | `/follows/:username/followers` | Sí | Alias heredado de lista de seguidores |
| GET | `/follows/:username/following` | Sí | Alias heredado de lista de seguidos |
| GET | `/posts` | No | Listar posts heredados en memoria |
| POST | `/posts` | No | Crear post heredado en memoria |
