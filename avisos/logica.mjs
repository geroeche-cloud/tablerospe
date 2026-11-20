/* Arma los dos avisos del día: uno a la mañana y otro a la noche. No hace
   red: recibe el tablero y devuelve la lista de lo que toca mandar ahora.

   Cada aviso mezcla ánimo con lo que hay anotado: el parcial que se viene,
   lo del día, lo que se tildó. Las frases están en js/frases.json y se
   eligen según el día, para que no se repitan seguido. El nombre y los
   motivos personales no están acá: viven en el tablero (prefs).

   Las horas del tablero son "de reloj", así que todo se calcula en la zona
   horaria del dispositivo que las anotó.                                  */

const minutos = t => { const p = String(t).split(':'); return +p[0] * 60 + +p[1]; };
const diaNum = f => { const p = f.split('-').map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); };

/* fecha y minutos del día, en la zona horaria pedida */
export function reloj(instante, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(instante).forEach(x => { p[x.type] = x.value; });
  return { fecha: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}

/* completa una frase; si no hay nombre, lo saca sin dejar comas sueltas */
export function completar(frase, v) {
  let s = frase;
  if (!v.n) {
    s = s.replace(/^\{n\}, (.)/, (m, c) => c.toUpperCase()).replace(/, \{n\}/g, '').replace(/\{n\}/g, '');
  }
  s = s.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : ''));
  return s.replace(/\s+([.,:;!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}
/* elige una frase que cambia con el día y no se repite en días seguidos */
export const elegir = (lista, dia, sal = 0) => lista[(((dia * 7 + sal * 3) % lista.length) + lista.length) % lista.length];

const cuantas = (n, una, varias) => n === 1 ? una : `${n} ${varias}`;
const enLista = (its, max = 3) => {
  const x = its.slice(0, max).map(i => (i.hora ? `${i.hora} ` : '') + i.titulo);
  return x.join(', ') + (its.length > max ? ` y ${its.length - max} más` : '');
};

export function calcular(tablero, instante, FR) {
  const prefs = tablero.prefs || {}, tz = prefs.tz || 'America/Argentina/Buenos_Aires';
  const enviados = tablero.avisos || {};
  const L = reloj(instante, tz), hoy = diaNum(L.fecha), salida = [];
  const todos = Object.entries(tablero.items || {}).filter(([, i]) => i && typeof i === 'object').map(([id, i]) => ({ ...i, id }));
  const orden = (a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora || '').localeCompare(b.hora || '');
  const vivos = todos.filter(i => i.fecha && !i.hecho).sort(orden);
  const ultimo = i => (i.hasta && i.hasta > i.fecha ? i.hasta : i.fecha);     /* algo puede durar varios días */
  const delDia = d => vivos.filter(i => diaNum(i.fecha) <= d && d <= diaNum(ultimo(i)));
  const n = String(prefs.nombre || '').trim();
  const motivos = (Array.isArray(prefs.motivos) ? prefs.motivos : []).map(x => String(x).trim()).filter(Boolean);
  const h = i => (i.hora ? `, a las ${i.hora}` : '');
  const toca = (clave, hora, defecto) => {
    const desde = minutos(/^\d{1,2}:\d{2}$/.test(prefs[hora] || '') ? prefs[hora] : defecto);
    return L.min >= desde && L.min < desde + 180 && !enviados[clave];
  };

  /* ---------- a la mañana ---------- */
  const km = `m_${L.fecha}`;
  if (toca(km, 'h1', '08:00')) {
    const deHoy = delDia(hoy), parHoy = deHoy.find(i => i.tipo === 'parcial' && diaNum(i.fecha) === hoy);
    const parCerca = vivos.find(i => i.tipo === 'parcial' && diaNum(i.fecha) > hoy && diaNum(i.fecha) <= hoy + 3);
    const atras = vivos.filter(i => i.tipo === 'tarea' && diaNum(ultimo(i)) < hoy).length;
    const partes = [];
    if (parHoy) {
      partes.push(completar(elegir(FR.manana_parcial_hoy, hoy), { n, p: parHoy.titulo, h: h(parHoy) }));
      const resto = deHoy.filter(i => i !== parHoy);
      if (resto.length) partes.push(completar(elegir(FR.manana_hoy, hoy), { lista: enLista(resto, 2) }));
    } else if (parCerca) {
      const d = diaNum(parCerca.fecha) - hoy;
      partes.push(d === 1
        ? completar(elegir(FR.manana_parcial_manana, hoy), { n, p: parCerca.titulo, h: h(parCerca) })
        : completar(elegir(FR.manana_parcial_cerca, hoy), { n, p: parCerca.titulo, dias: `${d} días` }));
      if (deHoy.length) partes.push(completar(elegir(FR.manana_hoy, hoy), { lista: enLista(deHoy, 2) }));
    } else if (deHoy.length >= 3) {
      partes.push(completar(elegir(FR.manana_cargado, hoy), { n, c: deHoy.length, primero: (deHoy[0].hora ? `${deHoy[0].hora} ` : '') + deHoy[0].titulo }));
    } else if (deHoy.length) {
      partes.push(completar(elegir(FR.manana_normal, hoy), { n, lista: enLista(deHoy) }));
    } else {
      partes.push(completar(elegir(FR.manana_libre, hoy), { n }));
    }
    /* como mucho dos ideas por mensaje; lo atrasado se recuerda cada tres días, sin machacar */
    if (partes.length < 2) {
      if (atras && hoy % 3 === 0) partes.push(completar(elegir(FR.manana_atrasadas, hoy), { a: cuantas(atras, 'una cosa atrasada', 'cosas atrasadas') }));
      else if (motivos.length && hoy % 2 === 0) partes.push(completar(elegir(FR.motivo, hoy), { m: elegir(motivos, hoy, 1) }));
    }
    salida.push({ k: km, t: n ? `Buen día, ${n} ☀️` : 'Buen día ☀️', b: partes.join(' '), tag: 'manana' });
  }

  /* ---------- a la noche ---------- */
  const kn = `n_${L.fecha}`;
  if (toca(kn, 'h2', '21:00')) {
    const deManiana = delDia(hoy + 1), parMan = deManiana.find(i => i.tipo === 'parcial' && diaNum(i.fecha) === hoy + 1);
    const hechas = todos.filter(i => i.hecho && i.ht && reloj(new Date(i.ht), tz).fecha === L.fecha).length;
    const partes = [];
    if (parMan) {
      partes.push(completar(elegir(FR.noche_parcial_manana, hoy), { n, p: parMan.titulo, h: h(parMan) }));
    } else {
      partes.push(hechas
        ? completar(elegir(FR.noche_logros, hoy), { n, k: cuantas(hechas, 'una cosa', 'cosas') })
        : completar(elegir(FR.noche_tranqui, hoy), { n }));
      partes.push(deManiana.length
        ? completar(elegir(FR.noche_manana, hoy), { lista: enLista(deManiana) })
        : completar(elegir(FR.noche_manana_libre, hoy), {}));
    }
    if (parMan && motivos.length) partes.push(completar(elegir(FR.motivo, hoy), { m: elegir(motivos, hoy, 1) }));
    salida.push({ k: kn, t: n ? `Buenas noches, ${n} 🌙` : 'Buenas noches 🌙', b: partes.join(' '), tag: 'noche' });
  }
  return salida;
}
