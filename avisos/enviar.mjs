/* Lee el tablero, decide qué avisos tocan y los manda a los dispositivos
   que los activaron. Lo corre GitHub Actions cada 10 minutos.

   OJO: los registros de Actions de un repo público los puede ver cualquiera.
   Acá no se imprime nunca la clave, ni títulos, ni direcciones: solo números. */
import webpush from 'web-push';
import { readFileSync } from 'node:fs';
import { calcular } from './logica.mjs';

const FRASES = JSON.parse(readFileSync(new URL('../js/frases.json', import.meta.url), 'utf8'));

const BASE = process.env.TABLERO_BASE || 'https://spe-tablero-default-rtdb.firebaseio.com';
const RAIZ = process.env.TABLERO_RAIZ || 'tableros';
const SITIO = process.env.TABLERO_SITIO || 'https://tablerospe.vercel.app';
const { TABLERO_CLAVE: CLAVE, VAPID_PUBLICA: PUB, VAPID_PRIVADA: PRIV } = process.env;
const PRUEBA = process.env.PRUEBA === '1' || process.env.PRUEBA === 'true';

const url = ruta => `${BASE}/${RAIZ}/${CLAVE}${ruta ? '/' + ruta : ''}.json`;
const pedir = async (ruta, opciones) => {
  const r = await fetch(url(ruta), opciones);
  if (!r.ok) throw new Error(`la base respondió ${r.status}`);
  return r.json();
};

async function mandar(sub, aviso) {
  const d = webpush.generateRequestDetails({ endpoint: sub.endpoint, keys: sub.keys },
    JSON.stringify({ t: aviso.t, b: aviso.b, tag: aviso.tag, url: SITIO }),
    { vapidDetails: { subject: SITIO, publicKey: PUB, privateKey: PRIV }, TTL: 3600, urgency: 'high' });
  const r = await fetch(d.endpoint, { method: d.method, headers: d.headers, body: d.body });
  return r.status;
}

async function main() {
  if (!CLAVE || !PUB || !PRIV) { console.log('Faltan los secretos del repo: no hago nada.'); return; }
  const tablero = await pedir('') || {};
  let subs = Object.entries(tablero.push || {}).filter(([, s]) => s && s.endpoint && s.keys);
  if (!subs.length) { console.log('Ningún dispositivo activó los avisos todavía.'); return; }
  const enviados = tablero.avisos || {};
  const avisos = PRUEBA
    ? [{ k: null, t: 'Acá estoy 👋', b: 'Si ves esto, los mensajes de Mi tablero te llegan bien. Vas a recibir dos por día.', tag: 'prueba' }]
    : calcular(tablero, new Date(), FRASES);

  let ok = 0, mal = 0, bajas = 0;
  for (const aviso of avisos) {
    let llego = false;
    for (const [id, sub] of subs) {
      let estado = 0;
      try { estado = await mandar(sub, aviso); } catch (e) { estado = 0; }
      if (estado >= 200 && estado < 300) { ok++; llego = true; }
      else if (estado === 404 || estado === 410) {       /* el dispositivo ya no existe */
        bajas++; subs = subs.filter(([x]) => x !== id);
        await pedir(`push/${id}`, { method: 'DELETE' }).catch(() => {});
      } else { mal++; console.log(`un envío falló con estado ${estado}`); }
    }
    if (aviso.k && llego) await pedir(`avisos/${aviso.k}`, { method: 'PUT', body: String(Date.now()) });
  }
  /* limpiar las marcas de avisos de hace más de dos semanas */
  const viejo = Date.now() - 14 * 864e5;
  for (const [k, t] of Object.entries(enviados)) if (typeof t === 'number' && t < viejo) await pedir(`avisos/${k}`, { method: 'DELETE' }).catch(() => {});
  console.log(`dispositivos: ${subs.length} · avisos: ${avisos.length} · entregados: ${ok} · fallidos: ${mal} · bajas: ${bajas}`);
  if (mal && !ok) process.exitCode = 1;
}

main().catch(e => { console.log('No se pudo: ' + e.message); process.exitCode = 1; });
