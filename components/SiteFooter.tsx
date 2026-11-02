import { site } from '@/content/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="container-x flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name} · {site.location}
        </p>
        <p>Hecho con Next.js y Tailwind CSS · actualizado en noviembre de 2026</p>
      </div>
    </footer>
  );
}
