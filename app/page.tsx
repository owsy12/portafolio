import Link from 'next/link';
import { projects, type Project } from '@/content/projects';
import { cvFiles, primaryCv, site, skills } from '@/content/site';
import { ProjectRow } from '@/components/ProjectRow';

const groups: { id: Project['group']; title: string; intro: string }[] = [
  { id: 'clientes', title: 'Proyectos para clientes', intro: 'Software desarrollado por encargo y entregado al cliente.' },
  { id: 'propios', title: 'Proyectos individuales', intro: 'Desarrollados de forma independiente.' },
  { id: 'equipo', title: 'Proyectos académicos en equipo', intro: 'Universidad Veracruzana. Cada uno detalla mi participación.' },
];

const experience = [
  {
    when: '2025',
    title: 'Desarrollador de software · Simuladores EXANI-I y USICAMM',
    where: 'Centro de Formación Juan de Zumárraga, Perote (encargo independiente)',
    text: 'Primer encargo formal. Levanté los requerimientos con el cliente y desarrollé de forma individual dos aplicaciones de escritorio en C#/WPF. Ambas están entregadas y en uso.',
    tags: ['C#', 'WPF', 'MVVM'],
    href: '/proyectos/simuladores-exani-usicamm',
  },
  {
    when: '2026',
    title: 'SGPP y Propify',
    where: 'Universidad Veracruzana · proyectos en equipo',
    text: 'SGPP: capa de acceso a datos en Java, pruebas con JUnit 5 y tema visual. Propify: rediseño completo del frontend en React.',
    tags: ['Java', 'JDBC', 'JUnit 5', 'React'],
    href: '/proyectos/sgpp',
  },
  {
    when: '2025',
    title: 'Pasadena y API REST de usuarios',
    where: 'Universidad Veracruzana · proyectos en equipo',
    text: 'Pasadena: vistas del cliente en .NET MAUI. API REST: pruebas automatizadas, documentación con Swagger y autenticación con JWT.',
    tags: ['.NET MAUI', 'Node.js', 'Jest'],
    href: '/proyectos/pasadena',
  },
];

export default function Home() {
  return (
    <div className="container-x">
      <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        {/* ───── Columna fija con la presentación ───── */}
        <aside className="pt-14 lg:sticky lg:top-14 lg:flex lg:h-[calc(100dvh-3.5rem)] lg:flex-col lg:justify-between lg:pb-10 lg:pt-16">
          <div>
            <h1 className="font-serif text-[clamp(3rem,10vw,4.25rem)] leading-[0.95] tracking-[-0.01em]">
              Andrés Oswaldo <span className="italic text-fg-2">Cobos</span>
            </h1>
            <p className="mt-4 text-lg text-fg">Desarrollador de software</p>
            <p className="mt-3 max-w-sm leading-relaxed text-fg-2">
              Estudiante de Ingeniería de Software. Desarrollo aplicaciones web y de escritorio con Java, C#/.NET y JavaScript.
            </p>
            <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-fg-2">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald" />
              <span>
                Disponible para puestos junior, trainee, prácticas o proyectos freelance: {site.availability.hours}, modalidad remota.
              </span>
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-5 lg:mt-0">
            <div className="flex flex-wrap gap-2.5">
              <a href={primaryCv.pdf} className="btn btn-primary" download>
                Descargar CV
              </a>
              <a href={`mailto:${site.email}`} className="btn btn-ghost">
                Contacto
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-2">
              <li><a href={site.github} target="_blank" rel="noopener noreferrer" className="link">GitHub</a></li>
              <li><a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link">LinkedIn</a></li>
              <li><a href={`mailto:${site.email}`} className="link">{site.email}</a></li>
            </ul>
          </div>
        </aside>

        {/* ───── Contenido ───── */}
        <div className="pb-24 lg:pt-16">
          <section id="sobre-mi" aria-labelledby="sobre-title" className="scroll-mt-20 pt-14 lg:pt-0">
            <h2 id="sobre-title" className="section-title">Sobre mí</h2>
            <div className="prose-body mt-6 max-w-[40rem] text-[1.05rem] leading-[1.75] text-fg-2">
              <p>
                Soy estudiante de Ingeniería de Software en la Universidad Veracruzana (egreso previsto: diciembre de 2027).
                Mi primer encargo formal fueron dos{' '}
                <Link href="/proyectos/simuladores-exani-usicamm" className="link">simuladores de examen</Link> en C# para un
                centro de formación en Perote, desarrollados de forma individual y actualmente en uso.
              </p>
              <p>
                En proyectos académicos en equipo me he enfocado en interfaces, acceso a datos y documentación, como en{' '}
                <Link href="/proyectos/sgpp" className="link">SGPP</Link>. De forma individual desarrollé{' '}
                <Link href="/proyectos/descuke" className="link">Descuke</Link>, un prototipo de reservaciones con
                demostración en línea, y un{' '}
                <Link href="/proyectos/aventura-captura-2d" className="link">juego en Godot</Link> desarrollado con
                asistencia de IA (Claude) como práctica de ingeniería de prompts.
              </p>
            </div>
          </section>

          <section id="proyectos" aria-labelledby="proyectos-title" className="scroll-mt-20 pt-24">
            <h2 id="proyectos-title" className="section-title">Proyectos</h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-fg-2">
              Cada proyecto detalla mi participación y su arquitectura. Algunos incluyen una demostración interactiva.
            </p>
            {groups.map(g => {
              const list = projects.filter(p => p.group === g.id);
              return (
                <div key={g.id} className="mt-12">
                  <h3 className="font-serif text-2xl italic text-fg">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted">{g.intro}</p>
                  <ul className="mt-4 space-y-2">
                    {list.map((p, i) => (
                      <li key={p.slug}>
                        <ProjectRow project={p} priority={g.id === 'clientes' && i === 0} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          <section id="experiencia" aria-labelledby="exp-title" className="scroll-mt-20 pt-24">
            <h2 id="exp-title" className="section-title">Experiencia</h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-fg-2">
              Experiencia con cliente y proyectos académicos relevantes.
            </p>
            <ol className="mt-8 space-y-2">
              {experience.map(e => (
                <li key={e.title}>
                  <div className="group relative grid gap-1 rounded-xl p-3 transition-colors hover:bg-ink-2 sm:-mx-4 sm:grid-cols-[6rem_1fr] sm:gap-6 sm:p-4">
                    <p className="text-sm text-muted sm:pt-1">{e.when}</p>
                    <div>
                      <h3 className="text-lg font-medium text-fg">
                        <Link href={e.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                          {e.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted">{e.where}</p>
                      <p className="mt-2 leading-relaxed text-fg-2">{e.text}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {e.tags.map(t => <li key={t} className="tag">{t}</li>)}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="habilidades" aria-labelledby="skills-title" className="scroll-mt-20 pt-24">
            <h2 id="skills-title" className="section-title">Habilidades técnicas</h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-fg-2">
              Junto a cada tecnología se indica el proyecto en el que la utilicé.
            </p>
            <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {skills.map(g => (
                <div key={g.group}>
                  <dt className="font-serif text-xl italic text-fg">{g.group}</dt>
                  <dd>
                    <ul className="mt-3 space-y-1.5">
                      {g.items.map(i => (
                        <li key={i.name} className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-1.5 text-[0.95rem]">
                          <span className="text-fg">{i.name}</span>
                          <span className="text-right text-sm text-muted">{i.where}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="contacto" aria-labelledby="contacto-title" className="scroll-mt-20 pt-24">
            <h2 id="contacto-title" className="section-title">Contacto</h2>
            <div className="mt-6 max-w-[40rem] text-[1.05rem] leading-[1.75] text-fg-2">
              <p>
                Para vacantes, prácticas o proyectos, quedo a sus órdenes en{' '}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent('Contacto desde el portafolio')}`} className="link">{site.email}</a>.
              </p>
              <p className="mt-4">
                Perfiles: <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link">LinkedIn</a> ·{' '}
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="link">GitHub</a>
              </p>
            </div>
            <div className="mt-10 max-w-[40rem]">
              <h3 className="text-sm text-muted">Currículum (PDF y Word)</h3>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {cvFiles.map(cv => (
                  <li key={cv.pdf} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div lang={cv.lang}>
                      <p className="text-fg">{cv.label}</p>
                      <p className="text-sm text-muted">{cv.description}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <a href={cv.pdf} download className="link" aria-label={`${cv.label} en PDF`}>PDF</a>
                      <a href={cv.docx} download className="link" aria-label={`${cv.label} en Word`}>Word</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
