/* ============================================================
   Configuración de Firebase del tablero SPE (proyecto: spe-tablero)

   Con esto, todo el grupo ve y edita lo mismo en tiempo real,
   sin login. Los datos viven en Realtime Database bajo "mesa/".

   Reglas publicadas en la pestaña "Reglas" de Realtime Database:
     { "rules": { "mesa": { ".read": true, ".write": true } } }
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
