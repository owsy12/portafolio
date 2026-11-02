import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, projects } from '@/content/projects';
import { imageSize } from '@/lib/images';
import { ArchDiagram } from '@/components/ArchDiagram';
import { Gallery } from '@/components/Gallery';
import { DescukeDemo } from '@/components/demos/DescukeDemo';
import { SgppDemo } from '@/components/demos/SgppDemo';
import { PasadenaDemo } from '@/components/demos/PasadenaDemo';
import { SimuladoresDemo } from '@/components/demos/SimuladoresDemo';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.title}: ${p.tagline.charAt(0).toLowerCase() + p.tagline.slice(1)}`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: {
      title,
      description: p.summary,
      url: `/proyectos/${p.slug}`,
      images: p.cover ? [{ url: p.cover }] : [{ url: '/og.png', width: 1200, height: 630 }],
    },
  };
}

function Section({ id, title, children, wide = false }: { id: string; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section aria-labelledby={id} className={`mt-16 ${wide ? '' : 'max-w-[42rem]'}`}>
      <h2 id={id} className="font-serif text-[1.85rem] leading-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(i => (
        <li key={i} className="flex gap-3 leading-relaxed text-fg-2">
          <span aria-hidden="true" className="select-none text-muted">–</span>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

const demoTitle: Record<string, string> = {
  descuke: 'Demostración',
  sgpp: 'Recreación interactiva',
  pasadena: 'Recreación interactiva',
  simuladores: 'Recreación interactiva',
};

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const idx = projects.findIndex(x => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const gallery = p.gallery.map(g => ({ ...g, ...imageSize(g.src) }));
  const cover = p.cover && !p.demo ? { src: p.cover, ...imageSize(p.cover) } : null;

  return (
    <article className="container-x max-w-[60rem] pb-24 pt-10 md:pt-14">
      <Link href="/#proyectos" className="text-sm text-muted transition-colors hover:text-fg">
        ← Todos los proyectos
      </Link>

      <header className="mt-8 max-w-[44rem]">
        <p className="text-sm text-muted">
          {p.year} · {p.kindLabel} · {p.status}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.98] tracking-[-0.01em]">{p.title}</h1>
        <p className="mt-3 font-serif text-[1.5rem] italic leading-snug text-fg-2">{p.tagline}.</p>
        {p.evidence.links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {p.evidence.links.map(l => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link">{l.label} ↗</a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {cover && (
        <figure className="mt-10 overflow-hidden rounded-xl border border-line">
          <Image
            src={cover.src}
            alt={p.coverAlt || p.title}
            width={cover.w}
            height={cover.h}
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className={`h-auto w-full ${p.coverStyle === 'pixel' ? 'pixelated' : ''}`}
            unoptimized={p.coverStyle === 'pixel'}
          />
        </figure>
      )}

      <Section id="de-que-va" title="Descripción">
        <div className="prose-body text-[1.05rem] leading-[1.75] text-fg-2">
          <p>{p.summary}</p>
          <p>{p.problem}</p>
        </div>
      </Section>

      {p.demo && (
        <section id="demo" aria-labelledby="demo-title" className="mt-16 scroll-mt-20">
          <div className="max-w-[42rem]">
            <h2 id="demo-title" className="font-serif text-[1.85rem] leading-tight">{demoTitle[p.demo]}</h2>
            {p.demoNote && <p className="mt-3 leading-relaxed text-fg-2">{p.demoNote}</p>}
          </div>
          <div className="mt-6">
            {p.demo === 'descuke' && <DescukeDemo />}
            {p.demo === 'sgpp' && <SgppDemo />}
            {p.demo === 'pasadena' && <PasadenaDemo />}
            {p.demo === 'simuladores' && <SimuladoresDemo />}
          </div>
        </section>
      )}

      <Section id="mi-parte" title="Mi participación">
        <p className="mb-4 text-fg-2">{p.team}.</p>
        <List items={p.contributions} />
        <p className="mt-6 border-l-2 border-line-2 pl-4 text-sm leading-relaxed text-muted">{p.evidence.text}</p>
      </Section>

      <Section id="que-hace" title="Funcionalidades">
        <List items={p.features} />
      </Section>

      <Section id="como-esta-hecho" title="Arquitectura" wide>
        <div className="max-w-[42rem]">
          <p className="leading-relaxed text-fg-2">{p.architecture.text}</p>
          <p className="mt-4 text-sm text-muted">
            <span className="text-fg-2">Tecnologías:</span> {p.stack.join(', ')}.
          </p>
        </div>
        <div className="mt-6">
          <ArchDiagram layers={p.architecture.layers} />
        </div>
      </Section>

      {p.decisions.length > 0 && (
        <Section id="decisiones" title="Decisiones técnicas">
          <div className="space-y-6">
            {p.decisions.map(d => (
              <div key={d.title}>
                <h3 className="font-medium text-fg">{d.title}</h3>
                <p className="mt-1 leading-relaxed text-fg-2">{d.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {p.retro && p.retro.length > 0 && (
        <Section id="si-lo-hiciera-hoy" title="Mejoras identificadas">
          <List items={p.retro} />
        </Section>
      )}

      {p.code && (
        <Section id="codigo" title="Fragmento de código">
          <figure className="overflow-hidden rounded-xl border border-line bg-ink-2">
            <figcaption className="border-b border-line px-4 py-2.5 font-mono text-xs text-muted">{p.code.file}</figcaption>
            <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-fg-2" tabIndex={0}>
              <code>{p.code.source}</code>
            </pre>
          </figure>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section id="capturas" title="Capturas" wide>
          <Gallery images={gallery} />
        </Section>
      )}

      {p.notes && p.notes.length > 0 && (
        <Section id="notas" title="Notas">
          <List items={p.notes} />
        </Section>
      )}

      <nav aria-label="Siguiente proyecto" className="mt-20 border-t border-line pt-8">
        <p className="text-sm text-muted">Siguiente proyecto</p>
        <Link href={`/proyectos/${next.slug}`} className="group mt-1 inline-flex items-baseline gap-2">
          <span className="font-serif text-3xl">{next.title}</span>
          <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-emerald">→</span>
        </Link>
        <p className="mt-1 text-fg-2">{next.tagline}.</p>
      </nav>
    </article>
  );
}
