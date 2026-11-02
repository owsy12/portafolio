'use client';

import { useEffect, useMemo, useState } from 'react';

/* Recreación de los simuladores EXANI-I y USICAMM (WPF) a partir de sus vistas XAML
   y view models: pantallas, textos, colores, temporizador y cálculo de resultados.
   Las preguntas son EJEMPLOS escritos para el portafolio; el banco real del cliente
   (113 y 91 reactivos) no se publica. El logo del centro tampoco se incluye. */

type Sim = 'exani' | 'usicamm';
type MC = { kind: 'mc'; cat: string; reading?: string; q: string; options: string[]; correct: number };
type VF = { kind: 'vf'; cat: string; q: string; rows: { text: string; answer: boolean }[] };
type Rel = { kind: 'rel'; cat: string; q: string; concepts: { text: string; answer: string }[]; defs: { key: string; text: string }[] };
type Question = MC | VF | Rel;

const EXANI: Question[] = [
  { kind: 'mc', cat: 'Pensamiento matemático', q: 'Si 3x − 7 = 11, ¿cuál es el valor de x?', options: ['A) 4', 'B) 5', 'C) 6', 'D) 8'], correct: 2 },
  { kind: 'mc', cat: 'Pensamiento analítico', q: 'Continúa la serie: 2, 6, 12, 20, 30, …', options: ['A) 36', 'B) 40', 'C) 42', 'D) 44'], correct: 2 },
  { kind: 'mc', cat: 'Estructura de la lengua', q: '¿Qué palabra está escrita correctamente?', options: ['A) Exhuberante', 'B) Exuberante', 'C) Exhuverante', 'D) Esuberante'], correct: 1 },
  {
    kind: 'mc', cat: 'Comprensión lectora',
    reading: 'En una comunidad cafetalera, varias familias decidieron vender su grano juntas en lugar de hacerlo por separado. Al reunir su producción consiguieron mejores precios, compartieron el costo del transporte y pudieron invertir en una secadora que ninguna habría podido comprar sola.',
    q: '¿Cuál es la idea principal del texto?',
    options: ['A) El café se seca mejor con máquinas.', 'B) Organizarse en conjunto trajo beneficios a las familias.', 'C) El transporte del café es muy caro.', 'D) Las familias dejaron de producir café.'], correct: 1,
  },
  { kind: 'mc', cat: 'Pensamiento matemático', q: 'Un artículo de $800 tiene 15% de descuento. ¿Cuánto se paga?', options: ['A) $650', 'B) $680', 'C) $700', 'D) $720'], correct: 1 },
];

const USICAMM: Question[] = [
  {
    kind: 'mc', cat: 'Inclusión',
    q: 'En un grupo de quinto grado hay una alumna con discapacidad auditiva. ¿Qué acción favorece mejor su participación en clase?',
    options: ['A. Sentarla al fondo para que no se distraiga.', 'B. Usar apoyos visuales y verificar que siga las indicaciones.', 'C. Asignarle menos actividades que al resto.', 'D. Pedir a un compañero que haga las tareas por ella.'], correct: 1,
  },
  {
    kind: 'vf', cat: 'Evaluación', q: 'Indica si cada afirmación sobre la evaluación formativa es verdadera (V) o falsa (F).',
    rows: [
      { text: 'Se realiza durante el proceso para ajustar la enseñanza.', answer: true },
      { text: 'Su único propósito es asignar una calificación final.', answer: false },
      { text: 'La retroalimentación al alumno es parte central de ella.', answer: true },
    ],
  },
  {
    kind: 'rel', cat: 'Didáctica', q: 'Relaciona cada metodología con su descripción escribiendo la letra correspondiente.',
    concepts: [
      { text: 'Aprendizaje basado en proyectos', answer: 'B' },
      { text: 'Aprendizaje servicio', answer: 'C' },
      { text: 'Aprendizaje basado en problemas', answer: 'A' },
    ],
    defs: [
      { key: 'A', text: 'Parte de una situación problemática que el grupo analiza y resuelve.' },
      { key: 'B', text: 'Produce un resultado concreto a lo largo de varias etapas planificadas.' },
      { key: 'C', text: 'Vincula lo aprendido con una acción que beneficia a la comunidad.' },
    ],
  },
  {
    kind: 'mc', cat: 'Ciudadanía Digital',
    q: 'Un docente quiere compartir en redes sociales fotos de una actividad escolar. ¿Qué debe hacer primero?',
    options: ['A. Publicarlas sin rostros visibles únicamente.', 'B. Obtener el consentimiento de madres, padres o tutores.', 'C. Pedir permiso solo a los alumnos.', 'D. Compartirlas en un grupo privado sin avisar.'], correct: 1,
  },
];

const CONF = {
  exani: { hours: 2, total: 113, questions: EXANI, next: 'Siguiente Pregunta >', finish: 'FINALIZAR EXAMEN' },
  usicamm: { hours: 3, total: 91, questions: USICAMM, next: 'Siguiente Reactivo >', finish: 'FINALIZAR VALORACIÓN' },
} as const;

type Answer = number | boolean[] | string[] | null;

function emptyAnswers(qs: readonly Question[]): Answer[] {
  return qs.map(q => (q.kind === 'mc' ? null : q.kind === 'vf' ? q.rows.map(() => null as unknown as boolean) : q.concepts.map(() => '')));
}

// Misma lógica que ExamenViewModel.TerminarExamen y ResultadosViewModel
function score(qs: readonly Question[], ans: Answer[], sim: Sim) {
  let ok = 0;
  qs.forEach((q, i) => {
    const a = ans[i];
    if (q.kind === 'mc' && a === q.correct) ok++;
    if (q.kind === 'vf' && Array.isArray(a) && q.rows.every((r, j) => (a as boolean[])[j] === r.answer)) ok++;
    if (q.kind === 'rel' && Array.isArray(a) && q.concepts.every((c, j) => String((a as string[])[j]).trim().toUpperCase() === c.answer)) ok++;
  });
  const pct = qs.length ? (ok / qs.length) * 100 : 0;
  // USICAMM: el original reutiliza el mensaje del EXANI-I; aquí se adapta a la evaluación docente
  const top = sim === 'exani' ? '¡Excelente desempeño! Estás listo para la universidad.' : '¡Excelente desempeño! Estás listo para la evaluación.';
  const msg = pct >= 90 ? top : pct >= 70 ? 'Buen trabajo, pero sigue practicando.' : 'Necesitas reforzar tus estudios.';
  const color = pct >= 90 ? '#2ecc71' : pct >= 70 ? '#f1c40f' : '#e74c3c';
  return { ok, pct, msg, color };
}

export function SimuladoresDemo() {
  const [sim, setSim] = useState<Sim>('exani');
  return (
    <div className="overflow-hidden rounded-2xl border border-line-2" style={{ fontFamily: '"Segoe UI",system-ui,sans-serif' }}>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface p-2" role="tablist" aria-label="Simulador">
        {(['exani', 'usicamm'] as Sim[]).map(s => (
          <button
            key={s}
            role="tab"
            type="button"
            aria-selected={s === sim}
            onClick={() => setSim(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${s === sim ? 'bg-emerald/15 text-fg ring-1 ring-emerald/40' : 'text-fg-2 hover:text-fg'}`}
          >
            {s === 'exani' ? 'EXANI-I' : 'USICAMM'}
          </button>
        ))}
        <span className="ml-auto hidden font-mono text-xs text-muted sm:inline">WPF · recreación con preguntas de ejemplo</span>
      </div>
      {/* key fuerza un estado nuevo al cambiar de simulador */}
      <Simulator key={sim} sim={sim} />
    </div>
  );
}

function Simulator({ sim }: { sim: Sim }) {
  const conf = CONF[sim];
  const [screen, setScreen] = useState<'inicio' | 'examen' | 'resultados'>('inicio');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => emptyAnswers(conf.questions));
  const [seconds, setSeconds] = useState(conf.hours * 3600);

  useEffect(() => {
    if (screen !== 'examen') return;
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [screen]);
  useEffect(() => { if (screen === 'examen' && seconds === 0) setScreen('resultados'); }, [seconds, screen]);

  const result = useMemo(() => score(conf.questions, answers, sim), [conf.questions, answers, sim]);
  const time = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
  const q = conf.questions[idx];
  const last = idx === conf.questions.length - 1;

  function start() { setAnswers(emptyAnswers(conf.questions)); setIdx(0); setSeconds(conf.hours * 3600); setScreen('examen'); }
  function next() { if (last) setScreen('resultados'); else setIdx(i => i + 1); }
  const setAns = (v: Answer) => setAnswers(a => a.map((x, i) => (i === idx ? v : x)));

  if (screen === 'inicio') return sim === 'exani' ? <InicioExani onStart={start} /> : <InicioUsicamm onStart={start} />;
  if (screen === 'resultados') return <Resultados r={result} total={conf.questions.length} onExit={() => setScreen('inicio')} />;

  const accent = sim === 'exani' ? '#005A9C' : '#1A5276';
  return (
    <div className="flex min-h-[560px] flex-col" style={{ background: sim === 'exani' ? '#fff' : '#F4F6F9', color: '#212F3D' }}>
      {sim === 'exani' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ background: '#F8F9FA', borderColor: '#e5e7eb' }}>
          <div>
            <p className="text-[18px]" style={{ color: '#555' }}>Pregunta <b style={{ color: accent }}>{idx + 1}</b><span className="text-[14px]" style={{ color: '#999' }}>/{conf.questions.length}</span></p>
            <p className="text-[13px]" style={{ color: '#777' }}>{q.cat}</p>
          </div>
          <span className="rounded-md px-3 py-1.5 font-mono text-[20px] font-bold tabular-nums" style={{ background: '#FFF0F0', color: '#D9534F' }} aria-label="Tiempo restante">{time}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white sm:px-6" style={{ background: accent }}>
          <div>
            <p className="text-[20px] font-bold sm:text-[24px]">Simulador USICAMM 2026</p>
            <p className="text-[15px]" style={{ color: '#AED6F1' }}>Tema: {q.cat}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px]" style={{ color: '#AED6F1' }}>Tiempo Restante</p>
            <p className="font-mono text-[24px] font-bold tabular-nums" aria-label="Tiempo restante">{time}</p>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[950px] flex-1 px-4 py-5 sm:px-6">
        {sim === 'usicamm' && <p className="mb-2 text-[17px] font-semibold" style={{ color: '#7F8C8D' }}>Reactivo {idx + 1}</p>}
        {q.kind === 'mc' && q.reading && (
          <div className="mb-4 rounded-lg p-4 text-[15px] leading-relaxed" style={{ background: sim === 'exani' ? '#F8F9FA' : '#E8F6F3', color: '#333' }}>{q.reading}</div>
        )}
        <p className="mb-4 text-[19px] font-semibold leading-snug sm:text-[21px]">{q.q}</p>

        {q.kind === 'mc' && (
          <div className="space-y-2" role="radiogroup" aria-label="Opciones">
            {q.options.map((o, i) => {
              const on = answers[idx] === i;
              return (
                <label key={o} className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-[16px] transition-colors sm:text-[17px]" style={{ borderColor: on ? accent : '#dfe3e8', background: on ? '#EEF5FB' : '#fff' }}>
                  <input type="radio" name={`q-${idx}`} checked={on} onChange={() => setAns(i)} className="mt-1" style={{ accentColor: accent }} />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.kind === 'vf' && (
          <div className="space-y-2">
            {q.rows.map((r, j) => {
              const a = (answers[idx] as boolean[]) ?? [];
              return (
                <div key={r.text} className="flex flex-col gap-2 rounded-lg border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: '#dfe3e8' }}>
                  <span className="text-[16px]">{r.text}</span>
                  <span className="flex gap-4" role="radiogroup" aria-label={`Afirmación ${j + 1}`}>
                    {[true, false].map(v => (
                      <label key={String(v)} className="flex items-center gap-1.5 text-[17px] font-semibold">
                        <input type="radio" name={`vf-${idx}-${j}`} checked={a[j] === v} onChange={() => setAns(a.map((x, k) => (k === j ? v : x)))} style={{ accentColor: accent }} />
                        {v ? 'V' : 'F'}
                      </label>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {q.kind === 'rel' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {q.concepts.map((c, j) => {
                const a = (answers[idx] as string[]) ?? [];
                return (
                  <div key={c.text} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: '#EAEDED' }}>
                    <span className="flex-1 text-[15px]">{c.text}</span>
                    <span aria-hidden="true" className="text-[20px]" style={{ color: '#7F8C8D' }}>⮕</span>
                    <input
                      aria-label={`Letra para ${c.text}`}
                      maxLength={1}
                      value={a[j] ?? ''}
                      onChange={e => setAns(a.map((x, k) => (k === j ? e.target.value.toUpperCase() : x)))}
                      className="h-10 w-12 rounded border bg-white text-center text-[18px] font-bold uppercase"
                      style={{ borderColor: '#bfc5ca' }}
                    />
                  </div>
                );
              })}
            </div>
            <ul className="space-y-2">
              {q.defs.map(d => (
                <li key={d.key} className="rounded-lg border bg-white px-3 py-2.5 text-[15px]" style={{ borderColor: '#dfe3e8' }}>
                  <b>{d.key}.</b> {d.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t px-4 py-3 sm:px-6" style={{ background: sim === 'exani' ? '#FAFAFA' : '#fff', borderColor: '#e5e7eb' }}>
        <button type="button" onClick={next} className="rounded-md px-5 py-3 text-[16px] font-semibold text-white sm:text-[17px]" style={{ background: accent }}>
          {last ? conf.finish : conf.next}
        </button>
      </div>
    </div>
  );
}

function InicioExani({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[560px] items-center justify-center p-5" style={{ background: '#F0F2F5', color: '#333' }}>
      <div className="w-full max-w-[640px] text-center">
        <p className="text-[24px] font-bold sm:text-[28px]">Centro de formación Juan de Zumarraga</p>
        <p className="mt-1 text-[17px]" style={{ color: '#666' }}>Simulador de Examen de Ingreso</p>
        <div className="mt-6 rounded-lg bg-white p-5 text-left shadow-sm">
          <p className="font-bold">Instrucciones:</p>
          <ul className="mt-2 space-y-1.5 text-[15px]" style={{ color: '#444' }}>
            <li>• El examen consta de 4 módulos: Matemáticas, Pensamiento Analítico, Estructura de la lengua y Comprensión lectora.</li>
            <li>• Tienes un tiempo límite global.</li>
            <li>• No podrás pausar el examen una vez iniciado.</li>
            <li>• Al finalizar verás tus estadísticas.</li>
          </ul>
        </div>
        <button type="button" onClick={onStart} className="mt-6 rounded-md px-8 py-3.5 text-[16px] font-bold text-white" style={{ background: '#005A9C' }}>
          COMENZAR EXAMEN
        </button>
        <p className="mt-4 text-[12px]" style={{ color: '#5f6368' }}>Demo con 5 preguntas de ejemplo · el original tiene 113 reactivos y 2 horas</p>
      </div>
    </div>
  );
}

function InicioUsicamm({ onStart }: { onStart: () => void }) {
  const G = '#691C32', D = '#DDC9A3';
  return (
    <div className="flex min-h-[560px] flex-col bg-white">
      <div className="h-16 sm:h-20" style={{ background: G }} aria-hidden="true" />
      <div className="flex flex-1 items-center justify-center p-5">
        <div className="w-full max-w-[560px] text-center">
          <p className="text-[19px] font-bold tracking-wide sm:text-[22px]" style={{ color: G }}>SIMULADOR TIPO USICAMM</p>
          <p className="mt-1 text-[26px] font-extrabold sm:text-[32px]" style={{ color: '#333' }}>ADMISIÓN DOCENTE 2026</p>
          <p className="mt-1 text-[16px] sm:text-[18px]" style={{ color: '#666' }}>Educación Básica y Media Superior</p>
          <button type="button" onClick={onStart} className="mt-8 inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-[18px] font-bold text-white shadow-[0_4px_0_#CCCCCC] sm:text-[20px]" style={{ background: G }}>
            COMENZAR EVALUACIÓN <span aria-hidden="true" className="text-[22px]" style={{ color: D }}>➜</span>
          </button>
          <p className="mt-4 text-[12px]" style={{ color: '#5f6368' }}>Demo con 4 reactivos de ejemplo · el original tiene 91 reactivos y 3 horas</p>
        </div>
      </div>
      <div className="px-4 py-2.5 text-center text-[12px] text-white" style={{ background: G }}>
        Centro de Formación Juan de Zumárraga | Herramienta de práctica interna
      </div>
    </div>
  );
}

function Resultados({ r, total, onExit }: { r: ReturnType<typeof score>; total: number; onExit: () => void }) {
  return (
    <div className="flex min-h-[560px] items-center justify-center p-5" style={{ background: '#F0F2F5' }}>
      <div className="w-full max-w-[460px] rounded-lg bg-white p-8 text-center shadow-sm" role="status">
        <p className="text-[26px] font-bold" style={{ color: '#333' }}>Examen Finalizado</p>
        <p className="mt-3 text-[56px] font-extrabold leading-none" style={{ color: r.color }}>{r.pct.toFixed(1).replace(/\.0$/, '')}%</p>
        <p className="mt-2 text-[17px]" style={{ color: '#777' }}>{r.ok} de {total} aciertos</p>
        <p className="mt-4 text-[18px]" style={{ color: '#555' }}>{r.msg}</p>
        <button type="button" onClick={onExit} className="mt-6 rounded-md px-6 py-3 text-[15px] font-bold text-white" style={{ background: '#D9534F' }}>
          SALIR DEL SIMULADOR
        </button>
        <p className="mt-2 text-[12px]" style={{ color: '#5f6368' }}>En la demo vuelve al inicio; en el original cierra la aplicación.</p>
      </div>
    </div>
  );
}
