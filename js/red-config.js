/* ============================================================
   Configuración de la red de organización (organizacion.html)

   SIN esto, la página funciona en "modo local": cada uno ve
   solo lo suyo. CON esto, todo el grupo ve y edita lo mismo
   en tiempo real, sin login.

   Cómo activarlo (una sola vez, 5 minutos):
   1. Entrá a https://console.firebase.google.com y creá un
      proyecto (ej: "spe-organizacion"). No hace falta Analytics.
   2. Menú Build → Realtime Database → Crear base de datos →
      modo bloqueado da igual, después en la pestaña "Reglas" pegá:
         { "rules": { "mesa": { ".read": true, ".write": true } } }
      y publicá las reglas.
   3. En la rueda ⚙ → Configuración del proyecto → "Tus apps" →
      icono </> (app web) → registrala y copiá el objeto
      firebaseConfig que te muestra.
   4. Pegalo acá abajo reemplazando el null, así:

   var RED_FIREBASE_CONFIG = {
     apiKey: "...",
     authDomain: "spe-organizacion.firebaseapp.com",
     databaseURL: "https://spe-organizacion-default-rtdb.firebaseio.com",
     projectId: "spe-organizacion",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };

   Importante: tiene que incluir "databaseURL" (si no aparece,
   agregala; es la URL que muestra Realtime Database arriba).
============================================================ */

var RED_FIREBASE_CONFIG = null;
