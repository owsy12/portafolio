import type { ArchLayer } from '@/content/projects';

/** Esquema por capas en HTML: se adapta a cualquier ancho y lo leen los lectores de pantalla. */
export function ArchDiagram({ layers }: { layers: ArchLayer[] }) {
  const hasMine = layers.some(l => l.nodes.some(n => n.mine));
  return (
    <figure className="rounded-xl border border-line p-3 sm:p-4">
      <ol className="flex flex-col gap-2" aria-label="Capas">
        {layers.map(layer => (
          <li key={layer.label} className="grid gap-2 sm:grid-cols-[7.5rem_1fr] sm:items-center">
            <p className="text-sm text-muted">{layer.label}</p>
            <ul className="flex flex-wrap gap-2">
              {layer.nodes.map(n => (
                <li
                  key={n.name}
                  className={`min-w-[8rem] flex-1 rounded-lg px-3 py-2 ${n.mine ? 'border border-emerald/45 bg-emerald/[0.06]' : 'border border-line bg-ink-2'}`}
                >
                  <p className={`text-sm ${n.mine ? 'text-fg' : 'text-fg-2'}`}>{n.name}</p>
                  {n.detail && <p className="mt-0.5 text-xs leading-snug text-muted">{n.detail}</p>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {hasMine && (
        <figcaption className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded border border-emerald/45 bg-emerald/[0.12]" />
          Lo que hice yo
        </figcaption>
      )}
    </figure>
  );
}
