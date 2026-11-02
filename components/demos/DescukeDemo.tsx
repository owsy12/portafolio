'use client';

import { useEffect, useRef, useState } from 'react';

const SRC = '/demos/descuke/index.html';

// Carga la aplicación real de Descuke (con base de datos simulada) dentro de un iframe.
// Se carga al pedirlo para no gastar datos del visitante si solo está leyendo.
export function DescukeDemo() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function start() {
    setStatus('loading');
    timer.current = setTimeout(() => setStatus(s => (s === 'loading' ? 'error' : s)), 15000);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line-2 bg-[#050310]">
        <div className="flex h-10 items-center justify-between gap-3 border-b border-line bg-surface px-3.5">
          <span className="truncate font-mono text-[0.7rem] text-muted">descuke · demo con datos ficticios</span>
          <a href={SRC} target="_blank" rel="noopener" className="shrink-0 text-xs font-medium text-emerald link-underline">
            Pantalla completa ↗
          </a>
        </div>
        <div className={`relative ${status === "idle" ? "h-64" : "h-[min(80dvh,760px)] min-h-[520px]"}`}>
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="max-w-md text-fg-2">
                Entra como administrador, relaciones públicas, hostess o mesero y recorre la aplicación real.
              </p>
              <button type="button" onClick={start} className="btn btn-primary">
                Iniciar demo
              </button>
              <a href={SRC} target="_blank" rel="noopener" className="text-sm text-muted link-underline">
                o ábrela en una pestaña nueva
              </a>
            </div>
          )}
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center" role="status">
              <span className="flex items-center gap-3 text-sm text-fg-2">
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
                Cargando la aplicación…
              </span>
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
              <p className="text-fg-2">La demo está tardando más de lo normal.</p>
              <a href={SRC} target="_blank" rel="noopener" className="btn btn-ghost">Abrir en una pestaña nueva</a>
            </div>
          )}
          {(status === 'loading' || status === 'ready' || status === 'error') && (
            <iframe
              src={SRC}
              title="Demo de Descuke con datos ficticios"
              className={`absolute inset-0 h-full w-full ${status === 'ready' ? '' : 'invisible'}`}
              onLoad={() => { if (timer.current) clearTimeout(timer.current); setStatus('ready'); }}
              allow="camera; clipboard-write"
            />
          )}
        </div>
      </div>
      <noscript>
        <p className="mt-3 text-sm text-muted">
          La demostración requiere JavaScript. Las capturas de pantalla están más abajo.
        </p>
      </noscript>
    </div>
  );
}
