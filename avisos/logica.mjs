/* Decide qué avisos tocan ahora. No hace red: recibe los datos y devuelve
   la lista. Las horas del tablero son "de reloj" (las que escribiste), así
   que todo se calcula en la zona horaria del dispositivo que las anotó.

   Qué avisa:
   - Parcial: la noche anterior a las 20:00, y 2 horas antes si tiene hora.
   - Reunión u otra cosa con hora: 1 hora antes.
   - Resumen del día a las 8:00, si hay algo para decir.                    */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const minutos = t => { const p = String(t).split(':'); return +p[0] * 60 + +p[1]; };
const diaNum = f => { const p = f.split('-').map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); };
const abs = (f, m) => diaNum(f) * 1440 + m;

/* fecha y minutos del día, en la zona horaria pedida */
export function reloj(instante, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(instante).forEach(x => { p[x.type] = x.value; });
  return { fecha: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}

function rango(i) {
  if (!i.hora) return null;
  const a = minutos(i.hora);
  let b = i.fin ? minutos(i.fin) : a + (i.tipo === 'parcial' ? 120 : 60);
  if (b <= a) b = a + 60;
  return [a, b];
}
function sePisan(a, b) {
  if (a.tipo === 'parcial' && b.tipo === 'parcial') return true;
  if (a.tipo === 'tarea' || b.tipo === 'tarea') return false;
  const x = rango(a), y = rango(b);
  return !!(x && y && x[0] < y[1] && y[0] < x[1]);
}
const falta = m => m >= 60 ? `en ${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `en ${m} min`;

export function calcular(items, instante, tz, enviados = {}) {
  const L = reloj(instante, tz), ahora = abs(L.fecha, L.min), salida = [];
  const todos = Object.entries(items || {}).filter(([, i]) => i && typeof i === 'object').map(([id, i]) => ({ ...i, id }));
  const vivos = todos.filter(i => i.fecha && !i.hecho);
  const pisa = {};
  vivos.forEach(a => vivos.forEach(b => {
    if (a.id < b.id && a.fecha === b.fecha && sePisan(a, b)) { (pisa[a.id] = pisa[a.id] || []).push(b); (pisa[b.id] = pisa[b.id] || []).push(a); }
  }));

  for (const i of vivos) {
    const dia = abs(i.fecha, 0), ini = i.hora ? dia + minutos(i.hora) : null;
    const C = i.c ? reloj(new Date(i.c), tz) : null, creado = C ? abs(C.fecha, C.min) : -Infinity;
    const ojo = pisa[i.id] ? ` Se pisa con ${pisa[i.id].map(x => x.titulo).join(' y ')}.` : '';
    const toca = (tipo, desde, hasta, t, b) => {
      const k = `${i.id}_${tipo}_${i.fecha}_${(i.hora || '').replace(':', '')}`;
      /* si lo anotaste cuando el aviso ya tenía que haber salido, no hace falta avisarte */
      if (ahora >= desde && ahora < hasta && creado < desde && !enviados[k]) salida.push({ k, t, b, tag: i.id });
    };
    if (i.tipo === 'parcial') {
      toca('vispera', dia - 240, dia, `Mañana: ${i.titulo}`, (i.hora ? `A las ${i.hora}.` : 'Es mañana.') + ojo);
      if (ini != null) toca('antes', ini - 120, ini, i.titulo, `Empieza ${falta(ini - ahora)}, a las ${i.hora}.${ojo}`);
    } else if (i.tipo !== 'tarea' && ini != null) {
      toca('antes', ini - 60, ini, i.titulo, `Empieza ${falta(ini - ahora)}, a las ${i.hora}.${ojo}`);
    }
  }

  const kd = `dia_${L.fecha}`;
  if (L.min >= 480 && L.min < 720 && !enviados[kd]) {
    const orden = (a, b) => (a.hora || '').localeCompare(b.hora || '');
    const deHoy = vivos.filter(i => i.fecha === L.fecha).sort(orden);
    const atrasadas = vivos.filter(i => i.tipo === 'tarea' && i.fecha < L.fecha).length;
    const maniana = vivos.filter(i => i.tipo === 'parcial' && diaNum(i.fecha) === diaNum(L.fecha) + 1);
    const lineas = deHoy.slice(0, 4).map(i => (i.hora ? `${i.hora} ` : '') + i.titulo);
    if (deHoy.length > 4) lineas.push(`y ${deHoy.length - 4} más`);
    if (deHoy.some(i => pisa[i.id] && pisa[i.id].some(x => x.fecha === L.fecha))) lineas.push('Ojo: hoy se te juntan cosas.');
    maniana.forEach(i => lineas.push(`Mañana: ${i.titulo}`));
    if (atrasadas) lineas.push(atrasadas === 1 ? 'Tenés una tarea atrasada.' : `Tenés ${atrasadas} tareas atrasadas.`);
    if (lineas.length) {
      const d = new Date(Date.UTC(...L.fecha.split('-').map((n, k) => k === 1 ? +n - 1 : +n)));
      salida.push({ k: kd, t: `Hoy, ${DIAS[d.getUTCDay()]} ${d.getUTCDate()}`, b: lineas.join('\n'), tag: 'dia' });
    }
  }
  return salida;
}
