import type { Metadata } from 'next';
import { projects } from '@/content/projects';
import { ProjectRow } from '@/components/ProjectRow';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Proyectos de software de Oswaldo Cobos: trabajo para clientes, proyectos propios y proyectos en equipo.',
  alternates: { canonical: '/proyectos' },
};

const groups = [
  { id: 'clientes', title: 'Para clientes' },
  { id: 'propios', title: 'Por mi cuenta' },
  { id: 'equipo', title: 'En equipo, en la universidad' },
] as const;

export default function ProjectsPage() {
  return (
    <div className="container-x max-w-[56rem] pb-24 pt-14 md:pt-20">
      <h1 className="font-serif text-[clamp(2.75rem,7vw,4rem)] leading-none">Proyectos</h1>
      <p className="mt-4 max-w-[40rem] text-lg leading-relaxed text-fg-2">
        Todo lo que he hecho que vale la pena enseñar. En cada página explico qué parte hice yo y cómo se puede comprobar.
      </p>
      {groups.map(g => (
        <section key={g.id} className="mt-14" aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`} className="font-serif text-2xl italic">{g.title}</h2>
          <ul className="mt-4 space-y-2">
            {projects.filter(p => p.group === g.id).map(p => (
              <li key={p.slug}><ProjectRow project={p} /></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
