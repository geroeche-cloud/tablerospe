# SPE · Organización

Mesa de trabajo del SPE Student Chapter: qué hay que hacer, quién lo hace,
qué falta y qué está bloqueado. Sin cuentas ni contraseñas.

- **`index.html`** — toda la aplicación (tablero + mapa). Un solo archivo, sin dependencias.
- **`js/red-config.js`** — configuración de Firebase. Con ella, todo el grupo ve y
  edita lo mismo en tiempo real; sin ella, cada dispositivo funciona en modo local.
  Los pasos para activarla están escritos dentro del archivo (5 minutos, una sola vez).

## Datos

- Los datos viven en Firebase Realtime Database (gratis), no en este repositorio.
- Cada dispositivo guarda además una copia de seguridad local automática.
- Desde **Buscar → ⬇ Copia de seguridad** se descarga todo en un archivo `.json`.

## Publicar

Sitio estático puro: funciona en GitHub Pages, Vercel, Netlify o cualquier hosting.
