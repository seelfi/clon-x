# Clon de X — Backend

## Descripción

Backend del proyecto Clon de X, una aplicación web inspirada en la red social X. Este servidor proporciona la base para construir una API REST utilizando Node.js, Express y MySQL.

Actualmente, el proyecto cuenta con la conexión a MySQL, el modelo de datos, los datos de prueba y una ruta inicial para consultar publicaciones.

## Tecnologías

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- bcryptjs
- cors

## Requisitos previos

Antes de ejecutar el proyecto, debes tener instalado:

- Node.js y npm.
- XAMPP con MySQL iniciado, o un servidor MySQL equivalente.
- Git para gestionar el código fuente.

## Instalación

Desde la carpeta `server`, ejecuta:

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`.

## Configuración de variables de entorno

Crea un archivo `.env` dentro de la carpeta `server` con la configuración correspondiente a tu instalación de MySQL.

Las variables utilizadas por el proyecto deben coincidir con las que lee `db.js`. Consulta `.env.example` para conocer los nombres esperados.

**No subas el archivo `.env` a GitHub**, ya que puede contener credenciales.

## Base de datos

1. Inicia MySQL desde XAMPP.
2. Crea la base de datos `clon_x`.
3. Configura las credenciales de conexión en `.env`.
4. Ejecuta el script de datos iniciales:

```bash
npm run seed
```

El script `seed.js` carga los datos de prueba para facilitar el desarrollo y las pruebas.

## Ejecución del servidor

Para iniciar el servidor:

```bash
npm start
```

Para ejecutarlo en modo de desarrollo:

```bash
npm run dev
```

La dirección local del servidor es:

`http://localhost:3000`

## Endpoints disponibles actualmente

### Consultar publicaciones

**GET** `/api/posts`

Devuelve las publicaciones almacenadas actualmente por la ruta inicial del servidor.

### Crear una publicación

**POST** `/api/posts`

Recibe un objeto JSON con `content` y `author`. Ambos campos son obligatorios en la implementación inicial.

Ejemplo:

```json
{
  "content": "Mi primera publicación de prueba",
  "author": "usuario_demo"
}
```

## Contrato de la API

El archivo `API.md` documenta las rutas previstas para usuarios, autenticación, publicaciones y relaciones de seguimiento.

Las rutas que todavía no se han implementado deben considerarse parte del diseño futuro, no endpoints disponibles.

## Estructura principal

- `server.js`: configuración del servidor Express y rutas iniciales.
- `db.js`: conexión a MySQL.
- `seed.js`: carga de datos de prueba.
- `test-db.js`: comprobación de la conexión a la base de datos.
- `API.md`: contrato previsto de la API.
- `.env.example`: plantilla de variables de entorno, cuando esté configurada.

## Estado del proyecto

El backend se encuentra en desarrollo. La conexión a la base de datos y la carga de datos de prueba están preparadas. La autenticación y las rutas completas de usuarios, publicaciones y seguimiento se implementarán progresivamente.