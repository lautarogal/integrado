# Integración Tecnica4DL + Informatec4

La sección **Noticias** de Tecnica4DL ahora obtiene las noticias publicadas desde la API de Informatec4.

## Cómo ejecutarlo

### 1. Iniciar Informatec4

Abrir una terminal dentro de:

`informatec4-main`

Ejecutar:

```bash
npm install
npm run dev
```

Por defecto quedará disponible en:

`http://localhost:3000`

> Informatec necesita tener configurada su `DATABASE_URL` en `.env` para poder leer las publicaciones.

### 2. Iniciar Tecnica4DL

Abrir `index.html` mediante **Live Server** (recomendado) o cualquier servidor HTTP para archivos estáticos.

Por ejemplo, si Live Server usa el puerto 5500:

`http://127.0.0.1:5500/index.html`

### 3. Publicar una noticia

Desde Informatec4:

1. Iniciar sesión como ADMIN o EDITOR.
2. Ir al Dashboard.
3. Crear una publicación.
4. Activar **Publicada**.
5. Guardarla.

La noticia aparecerá automáticamente en **Tecnica4DL → Noticias**.

## Qué se modificó

- `scripts/noticias.js`: dejó de usar noticias de ejemplo y consulta `/api/posts?published=true&limit=6`.
- `informatec4-main/next.config.ts`: habilita CORS para las consultas públicas de noticias.
- `informatec4-main/middleware.ts`: permite las peticiones `OPTIONS` necesarias para CORS.

## Cambiar el puerto de Informatec

Si Informatec no usa el puerto 3000, modificar en:

`scripts/noticias.js`

las constantes:

```js
const INFORMATEC_API = "http://localhost:3000/api/posts";
const INFORMATEC_WEB = "http://localhost:3000";
```
