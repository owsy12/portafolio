import type { Metadata } from 'next';
import { projects } from '@/content/projects';
import { ProjectRow } from '@/components/ProjectRow';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Proyectos de software de Oswaldo Cobos: proyectos para clientes, individuales y académicos en equipo.',
  alternates: { canonical: '/proyectos' },
};

const groups = [
  { id: 'clientes', title: 'Proyectos para clientes' },
  { id: 'propios', title: 'Proyectos individuales' },
  { id: 'equipo', title: 'Proyectos académicos en equipo' },
] as const;

export default function ProjectsPage() {
  return (
    <div className="container-x max-w-[56rem] pb-24 pt-14 md:pt-20">
      <h1 className="font-serif text-[clamp(2.75rem,7vw,4rem)] leading-none">Proyectos</h1>
      <p className="mt-4 max-w-[40rem] text-lg leading-relaxed text-fg-2">
        Cada proyecto detalla mi participación y la evidencia que la respalda.
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
