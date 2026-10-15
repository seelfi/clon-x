# Contrato de la API — Clon de X

## URL base

`http://localhost:3000/api`

## Convenciones generales

- Formato de intercambio de datos: JSON.
- Tipo de contenido: `application/json`.
- Los identificadores son numéricos.
- Las fechas se representan en formato ISO 8601.
- Las contraseñas nunca deben incluirse en las respuestas de la API.
- Las listas permiten paginación mediante los parámetros `page` y `limit`.

## 1. Usuarios y autenticación

### POST `/auth/register`

Registra un usuario nuevo.

**Solicitud:**

```json
{
  "fullName": "Pablo Alvarez",
  "username": "pablo_dev",
  "email": "pablo@example.com",
  "password": "Demo123!"
}
```

**Respuesta exitosa:** `201 Created`.

**Posibles errores:** `400 Bad Request`, `409 Conflict`.

### POST `/auth/login`

Permite iniciar sesión con las credenciales de un usuario.

**Solicitud:**

```json
{
  "username": "pablo_dev",
  "password": "Demo123!"
}
```

**Respuesta exitosa:** `200 OK`.

**Posibles errores:** `400 Bad Request`, `401 Unauthorized`.

### GET `/users/:username`

Obtiene el perfil público de un usuario, su cantidad de seguidores y la cantidad de usuarios que sigue.

**Respuesta exitosa:** `200 OK`.

**Posible error:** `404 Not Found`.

## 2. Publicaciones

### GET `/tweets?page=1&limit=10`

Obtiene una lista paginada de publicaciones.

- `page`: número de página solicitada.
- `limit`: cantidad máxima de publicaciones por página.

**Respuesta exitosa:** `200 OK`.

### POST `/tweets`

Crea una publicación para el usuario autenticado.

**Solicitud:**

```json
{
  "content": "¡Aprendiendo a construir mi propio clon de X!"
}
```

**Reglas:**

- El contenido es obligatorio.
- La publicación no puede superar los 280 caracteres.
- El autor se obtiene del usuario autenticado.

**Respuesta exitosa:** `201 Created`.

**Posibles errores:** `400 Bad Request`, `401 Unauthorized`.

## 3. Relaciones de seguimiento

### POST `/users/:username/follow`

Permite que el usuario autenticado siga al usuario indicado en la URL.

**Respuesta exitosa:** `200 OK`.

**Posibles errores:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`.

### DELETE `/users/:username/follow`

Permite dejar de seguir al usuario indicado en la URL.

**Respuesta exitosa:** `200 OK`.

**Posibles errores:** `401 Unauthorized`, `404 Not Found`.

### GET `/users/:username/followers?page=1&limit=10`

Obtiene la lista paginada de seguidores de un usuario.

**Orden:** alfabético por nombre completo.

**Respuesta exitosa:** `200 OK`.

### GET `/users/:username/following?page=1&limit=10`

Obtiene la lista paginada de usuarios que sigue una persona.

**Orden:** alfabético por nombre completo.

**Respuesta exitosa:** `200 OK`.

## 4. Estado de implementación

Este documento describe el contrato previsto para la API del proyecto Clon de X.

Las rutas y los comportamientos descritos son una especificación de diseño. No se consideran implementados hasta que se desarrollen y se prueben en el servidor Express.

El servidor actual conserva sus rutas iniciales `/api/posts`. Las rutas documentadas en este archivo deberán implementarse y validarse progresivamente.