'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/content/projects';

type Sized = GalleryImage & { w: number; h: number };

// Galería con visor. Cada miniatura es un enlace a la imagen completa, así que funciona sin JavaScript.
export function Gallery({ images }: { images: Sized[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const desktop = images.filter(i => !i.mobile);
  const mobile = images.filter(i => i.mobile);
  const all = [...desktop, ...mobile];

  const open = (i: number) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const go = useCallback((d: number) => setIndex(i => (i + d + all.length) % all.length), [all.length]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dlg.open) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go]);

  const current = all[index];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {desktop.map((img, i) => (
          <li key={img.src} className={i === 0 && desktop.length % 2 === 1 ? 'sm:col-span-2' : ''}>
            <Thumb img={img} onClick={open(i)} />
          </li>
        ))}
      </ul>
      {mobile.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-4">
          {mobile.map((img, i) => (
            <li key={img.src} className="w-[min(16rem,70vw)]">
              <Thumb img={img} onClick={open(desktop.length + i)} />
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[100dvh] w-full max-w-[100vw] bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        onClick={e => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
        aria-label="Visor de imágenes"
      >
        {current && (
          <div className="mx-auto flex max-w-6xl flex-col gap-3 p-3 sm:p-6">
            <div className="flex items-center justify-between gap-3 text-sm text-fg-2">
              <span className="font-mono text-xs text-muted">
                {index + 1} / {all.length}
              </span>
              <button type="button" onClick={() => dialogRef.current?.close()} className="btn btn-ghost !min-h-10" autoFocus>
                Cerrar
              </button>
            </div>
            <div className="relative flex items-center justify-center">
              <Image
                src={current.src}
                alt={current.alt}
                width={current.w}
                height={current.h}
                sizes="100vw"
                className={`max-h-[78dvh] w-auto rounded-xl border border-line-2 object-contain ${current.pixel ? 'pixelated' : ''}`}
                unoptimized={current.pixel}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => go(-1)} className="btn btn-ghost !min-h-10" aria-label="Imagen anterior">
                ←
              </button>
              <p className="text-center text-sm text-fg-2">{current.caption || current.alt}</p>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost !min-h-10" aria-label="Imagen siguiente">
                →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Thumb({ img, onClick }: { img: Sized; onClick: (e: React.MouseEvent) => void }) {
  return (
    <figure>
      <a
        href={img.src}
        onClick={onClick}
        className="group block overflow-hidden rounded-2xl border border-line bg-surface-2 transition-colors hover:border-line-2"
        aria-label={`Ampliar: ${img.alt}`}
      >
        <Image
          src={img.src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          sizes={img.mobile ? '256px' : '(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw'}
          className={`h-auto w-full transition-transform duration-500 group-hover:scale-[1.015] ${img.pixel ? 'pixelated' : ''}`}
          unoptimized={img.pixel}
        />
      </a>
      {img.caption && <figcaption className="mt-2 text-sm text-muted">{img.caption}</figcaption>}
    </figure>
  );
}
