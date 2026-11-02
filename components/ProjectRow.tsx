import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/content/projects';
import { imageSize } from '@/lib/images';

const demoLabel = (p: Project) =>
  p.demo === 'descuke' ? 'Demo con el código real' : p.demo ? 'Recreación para probar' : p.gallery.length ? 'Capturas' : null;

/** Fila de proyecto: miniatura a la izquierda, texto a la derecha. Toda la fila es un enlace. */
export function ProjectRow({ project: p, priority = false }: { project: Project; priority?: boolean }) {
  const size = p.cover ? imageSize(p.cover) : null;
  const label = demoLabel(p);
  return (
    <article className="group relative grid gap-4 rounded-xl p-3 transition-colors hover:bg-ink-2 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:p-4 sm:-mx-4">
      <div className="self-start overflow-hidden rounded-lg border border-line bg-surface sm:mt-1">
        {p.cover && size ? (
          <Image
            src={p.cover}
            alt=""
            width={size.w}
            height={size.h}
            sizes="(min-width: 640px) 208px, 100vw"
            priority={priority}
            className={`aspect-[16/10] h-auto w-full object-cover object-top ${p.coverStyle === 'pixel' ? 'pixelated' : ''}`}
            unoptimized={p.coverStyle === 'pixel'}
          />
        ) : (
          <div className="flex aspect-[16/10] flex-col justify-end p-3">
            <span className="font-serif text-xl italic leading-tight text-fg-2">{p.stack.slice(0, 2).join(' · ')}</span>
            <span className="mt-1 text-xs text-muted">Sin capturas públicas</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">
          {p.year} · {p.kindLabel}
        </p>
        <h3 className="mt-1 text-lg font-medium leading-snug text-fg">
          <Link href={`/proyectos/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.title}
            <span aria-hidden="true" className="ml-1.5 inline-block text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-emerald">
              →
            </span>
          </Link>
        </h3>
        <p className="mt-1.5 leading-relaxed text-fg-2">{p.tagline}.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">Mi parte: {p.role.charAt(0).toLowerCase() + p.role.slice(1)}.</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tecnologías">
          {p.stack.slice(0, 5).map(s => (
            <li key={s} className="tag">{s}</li>
          ))}
          {label && <li className="tag !bg-transparent !px-0 !text-emerald">· {label}</li>}
        </ul>
      </div>
    </article>
  );
}
