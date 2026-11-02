import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const instrument = localFont({
  src: [
    { path: './fonts/instrument-serif-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-serif-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument',
  display: 'swap',
});
const geist = localFont({
  src: './fonts/Geist-Variable.woff2',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
});
const geistMono = localFont({
  src: './fonts/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

const description =
  'Estudiante de Ingeniería de Software en la Universidad Veracruzana. Desarrollo aplicaciones web y de escritorio con Java, C#/.NET, JavaScript y React. Disponible para empleo remoto de medio tiempo.';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.shortName} — ${site.role}`, template: `%s · ${site.shortName}` },
  description,
  applicationName: `${site.shortName} · Portafolio`,
  authors: [{ name: site.name, url: site.github }],
  keywords: ['desarrollador junior', 'Java', 'C#', '.NET', 'React', 'JavaScript', 'Firebase', 'Xalapa', 'remoto', 'México', 'portafolio'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: '/',
    siteName: `${site.shortName} · Portafolio`,
    title: `${site.shortName} — ${site.role}`,
    description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${site.shortName} — ${site.role}` }],
  },
  twitter: { card: 'summary_large_image', title: `${site.shortName} — ${site.role}`, description, images: ['/og.png'] },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#12120f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${instrument.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
