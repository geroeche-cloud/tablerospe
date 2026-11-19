/* ============================================================
   Nube del tablero personal (Firebase Realtime Database).

   Cada tablero vive en  tableros/<clave>/items , donde <clave> es
   el código largo que va al final del link personal (#clave=...).
   Sin ese código no se puede leer ni escribir nada, y nadie puede
   listar qué tableros existen.

   Reglas a publicar en la pestaña "Reglas" de Realtime Database
   (reemplazan a las del tablero del SPE, que quedan cerradas):

   {
     "rules": {
       "tableros": {
         "$clave": {
           ".read":  "$clave.length >= 32",
           ".write": "$clave.length >= 32"
         }
       }
     }
   }

   Si no se publican, el tablero funciona igual pero guarda todo
   solo en el dispositivo donde se usa.
============================================================ */

var RED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA1ohBblkVc07LtGvpfEPJWNqFnc-8p4IQ",
  authDomain: "spe-tablero.firebaseapp.com",
  databaseURL: "https://spe-tablero-default-rtdb.firebaseio.com",
  projectId: "spe-tablero",
  storageBucket: "spe-tablero.firebasestorage.app",
  messagingSenderId: "783027102466",
  appId: "1:783027102466:web:2529dbc26481bc265b181b"
};

/* Carpeta de la base donde se guardan los tableros. */
var RED_RAIZ = "tableros";

/* Clave pública con la que se firman los avisos al teléfono. No es secreta:
   la secreta está guardada en los secretos del repo de GitHub. */
var AVISOS_CLAVE_PUBLICA = "BIQP-2T93XvzlGjqCJSmxx_Q3VEdy7du3T7MTZkjOhcf1GyvM7meAlF7aFJM45L9Ymyg6rSpj_3HpR6z9G5F3PE";
