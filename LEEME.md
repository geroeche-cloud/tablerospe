# Mi tablero

Calendario personal para parciales, reuniones y pendientes. Es una
aplicación web que se instala en el teléfono. Nació del tablero del SPE
Student Chapter (la versión del grupo quedó en `main`, commit `9adbcaa`).

## Qué hace

- **Calendario del mes** arriba: un punto por cada cosa, los días de parcial
  en rojo y un signo de exclamación donde se juntan dos cosas.
- **Lo próximo**, con la cuenta regresiva en vivo.
- **Lo que viene**, en una sola lista: cuánto falta para cada cosa, lo
  atrasado primero y lo que no tiene fecha al final.
- **Choques**: avisa cuando dos cosas se pisan de horario, cuando hay dos
  parciales el mismo día y cuando dos parciales quedan en días seguidos.
  Avisa también antes de guardar.
- **Varios días**: algo puede durar más de un día (`Congreso del 25 al 27
  de noviembre`); en el calendario se ve como una franja.
- **Frases** que cambian en el saludo y festejo al tildar una tarea.
- **Anotar** con el botón +: se escribe en una línea y completa solo el
  tipo, el día y la hora. `Parcial de Física 2 el viernes 18hs`,
  `Reunión SPE mañana a las 19`, `Entregar TP de Química el lunes`.
- Tocar un día muestra solo ese día. Deslizar el calendario cambia de mes.

## Avisos al teléfono

Se activan en Ajustes → Avisos, en cada dispositivo. Son dos mensajes por
día, a la mañana (8:00) y a la noche (21:00); el horario se cambia en
Ajustes. Cada uno mezcla ánimo con lo que hay anotado: el parcial que se
viene, lo del día, lo que se tildó. Las frases están en `js/frases.json`.
El nombre y los motivos personales se cargan en Ajustes → Sobre vos y se
guardan en el tablero, no en el repo.

Los manda GitHub Actions (`.github/workflows/avisos.yml`), que corre
`avisos/enviar.mjs` cada 10 minutos; pueden llegar con unos minutos de
demora. Necesita tres datos guardados en el repo: los secretos
`TABLERO_CLAVE` (la clave del link personal) y `VAPID_PRIVADA`, y la
variable `VAPID_PUBLICA`. Si se cambia el link personal hay que actualizar
`TABLERO_CLAVE`. Para mandar un aviso de prueba: pestaña Actions → Avisos →
Run workflow. En iPhone solo funcionan con la app instalada.

## Identidad

Oscura, con rojo iluminado y plata: el fondo y las superficies siguen los
tonos oscuros de Cursemos Ingeniería, los títulos y la cuenta regresiva
van en titanio, y el isotipo oficial (`icons/isotipo.png`, sin modificar)
aparece en el saludo y en el ícono. Tipografías de la marca: Space Grotesk
e Inter. El rojo es propio de esta app personal: no forma parte de la
paleta de Cursemos, que es azul y metal.

## Archivos

- `index.html`: toda la aplicación.
- `js/red-config.js`: conexión a Firebase y las reglas que hay que publicar.
- `js/frases.json`: las frases de la app y de los avisos.
- `manifest.webmanifest`, `manifest-ios.webmanifest`, `sw.js`, `icons/`: lo
  que la hace instalable y que abra sin conexión.
- `avisos/`, `.github/workflows/avisos.yml`: el emisor de los avisos.

## Instalarla en el teléfono

Abrir el link personal en el navegador del teléfono. En Android (Chrome):
menú de los tres puntos → "Instalar app". En iPhone (Safari): Compartir →
"Agregar a inicio". Necesita estar publicada con https.

## Privacidad y datos

- No hay cuentas ni contraseñas. Se abre con un **link personal** que termina
  en `#clave=...`; sin esa clave no se puede leer ni escribir nada. Está en
  Ajustes, con un botón para copiarlo y otro para cambiarlo.
- Los datos se guardan siempre en el dispositivo y, con las reglas de
  Firebase publicadas, también en la nube para ver lo mismo en el celular y
  la compu. Sin las reglas, cada dispositivo guarda lo suyo.
- Ajustes → Copia de seguridad descarga todo en un `.json` y lo restaura.
