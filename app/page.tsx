import Link from 'next/link';
import { projects, type Project } from '@/content/projects';
import { cvFiles, primaryCv, site, skills } from '@/content/site';
import { ProjectRow } from '@/components/ProjectRow';

const groups: { id: Project['group']; title: string; intro: string }[] = [
  { id: 'clientes', title: 'Para clientes', intro: 'Trabajo por encargo, entregado a alguien que lo pidió.' },
  { id: 'propios', title: 'Por mi cuenta', intro: 'Proyectos que hice solo, sin que nadie me los pidiera.' },
  { id: 'equipo', title: 'En equipo, en la universidad', intro: 'Proyectos de la carrera. En cada uno digo qué parte hice yo.' },
];

const experience = [
  {
    when: '2025',
    title: 'Simuladores EXANI-I y USICAMM',
    where: 'Centro de Formación Juan de Zumárraga, Perote',
    text: 'Mi primer encargo con un cliente. Hablé con ellos para entender qué necesitaban, programé solo dos aplicaciones de escritorio en C# y se las entregué funcionando. Las siguen usando.',
    tags: ['C#', 'WPF', 'MVVM'],
    href: '/proyectos/simuladores-exani-usicamm',
  },
  {
    when: '2026',
    title: 'SGPP y Propify',
    where: 'Universidad Veracruzana, en equipo',
    text: 'En SGPP hice buena parte de la capa de datos en Java, las pruebas con JUnit y el tema visual. En Propify rehíce el frontend completo en React.',
    tags: ['Java', 'JDBC', 'JUnit 5', 'React'],
    href: '/proyectos/sgpp',
  },
  {
    when: '2025',
    title: 'Pasadena y una API REST',
    where: 'Universidad Veracruzana',
    text: 'En Pasadena me tocó solo el frontend: las vistas del cliente en .NET MAUI. En la API de Node.js agregué pruebas, documentación y autenticación.',
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
              Estudio Ingeniería de Software en Xalapa. Hago aplicaciones web y de escritorio, y disfruto que la interfaz se
              sienta fluida y funcione bien.
            </p>
            <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-fg-2">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald" />
              <span>
                Busco mi primer trabajo como desarrollador: {site.availability.hours}, remoto desde México.
              </span>
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-5 lg:mt-0">
            <div className="flex flex-wrap gap-2.5">
              <a href={primaryCv.pdf} className="btn btn-primary" download>
                Descargar CV
              </a>
              <a href={`mailto:${site.email}`} className="btn btn-ghost">
                Escribirme
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
                Vivo en Xalapa y estudio Ingeniería de Software en la Universidad Veracruzana; termino en diciembre de 2027.
                Casi todo lo que sé lo aprendí haciendo proyectos, y me gusta mezclar la parte creativa con la lógica.
              </p>
              <p>
                Mi primer encargo de verdad fue para un centro de formación en Perote: dos{' '}
                <Link href="/proyectos/simuladores-exani-usicamm" className="link">simuladores de examen</Link> en C# que hice
                solo, desde platicar con el cliente hasta entregarlos. En los proyectos de la carrera casi siempre termino en la
                interfaz, la capa de datos y la documentación, como en{' '}
                <Link href="/proyectos/sgpp" className="link">SGPP</Link>.
              </p>
              <p>
                Por mi cuenta hice <Link href="/proyectos/descuke" className="link">Descuke</Link>, un sistema de
                reservaciones para un antro que se quedó en prototipo pero que puedes probar aquí, y un{' '}
                <Link href="/proyectos/aventura-captura-2d" className="link">juego en Godot</Link> que armé dirigiendo a Claude, una IA,
                para practicar cómo pedirle las cosas y cómo revisar lo que entrega.
              </p>
              <p>
                Fuera del código produzco beats en FL Studio y juego videojuegos. Ahora estoy aprendiendo Swift para hacer
                apps de iOS.
              </p>
            </div>

            <div className="mt-10 max-w-[40rem] rounded-xl border border-line p-5">
              <p className="text-sm text-muted">Ahora mismo · noviembre de 2026</p>
              <ul className="mt-3 space-y-2 text-fg-2">
                <li>Buscando trabajo junior, trainee, prácticas pagadas o proyectos freelance.</li>
                <li>Puedo dedicar {site.availability.hours}, de preferencia en remoto.</li>
                <li>Cursando la carrera y aprendiendo Swift en mis ratos libres.</li>
              </ul>
            </div>
          </section>

          <section id="proyectos" aria-labelledby="proyectos-title" className="scroll-mt-20 pt-24">
            <h2 id="proyectos-title" className="section-title">Proyectos</h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-fg-2">
              Cada uno tiene su página con lo que hice, cómo está hecho y lo que cambiaría hoy. Algunos los puedes probar
              ahí mismo.
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
              Todavía no he tenido un empleo formal como desarrollador. Esto es lo más parecido, en orden de importancia.
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
            <h2 id="skills-title" className="section-title">Con qué trabajo</h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-fg-2">
              Solo pongo lo que he usado en un proyecto que puedo enseñar. Al lado está dónde.
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
                Si tienes una vacante, un proyecto o solo quieres platicar sobre algo de aquí, escríbeme a{' '}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent('Hola Oswaldo')}`} className="link">{site.email}</a>.
                Te contesto por ahí.
              </p>
              <p className="mt-4">
                También estoy en <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link">LinkedIn</a> y
                en <a href={site.github} target="_blank" rel="noopener noreferrer" className="link">GitHub</a>.
              </p>
            </div>
            <div className="mt-10 max-w-[40rem]">
              <h3 className="text-sm text-muted">Mi CV, en PDF para enviar o en Word para editar</h3>
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
