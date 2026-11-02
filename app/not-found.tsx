import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60dvh] max-w-[44rem] flex-col justify-center py-20">
      <p className="text-sm text-muted">Error 404</p>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">Página no encontrada</h1>
      <p className="mt-4 text-lg text-fg-2">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/" className="link">Ir al inicio</Link>
        <Link href="/proyectos" className="link">Ver proyectos</Link>
      </p>
    </div>
  );
}
