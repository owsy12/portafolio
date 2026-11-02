import Link from 'next/link';
import { site } from '@/content/site';
import { MobileMenuCloser } from './MobileMenuCloser';

const nav = [
  { href: '/#sobre-mi', label: 'Sobre mí' },
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/#experiencia', label: 'Experiencia' },
  { href: '/#contacto', label: 'Contacto' },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-line/80 bg-ink/90 backdrop-blur supports-[backdrop-filter]:bg-ink/75"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-[1.35rem] leading-none text-fg" aria-label={`${site.shortName}, inicio`}>
          {site.shortName}
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm text-fg-2">
            {nav.map(n => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-fg">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Menú móvil con <details>: funciona aunque JavaScript no cargue */}
        <details className="group md:hidden" id="mobile-menu">
          <summary className="flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-fg-2" aria-label="Abrir menú">
            <span className="group-open:hidden">Menú</span>
            <span className="hidden group-open:inline">Cerrar</span>
          </summary>
          <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-line bg-ink">
            <nav aria-label="Principal móvil" className="container-x py-3">
              <ul className="flex flex-col">
                {nav.map(n => (
                  <li key={n.href}>
                    <Link href={n.href} className="block border-b border-line/70 py-3.5 text-lg text-fg" data-close-menu>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </details>
        <MobileMenuCloser />
      </div>
    </header>
  );
}
