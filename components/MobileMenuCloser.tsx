'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Mejora progresiva del menú móvil: lo cierra al elegir un enlace, al cambiar de
// página o al pulsar Escape. Sin JavaScript, el <details> sigue funcionando.
export function MobileMenuCloser() {
  const pathname = usePathname();

  useEffect(() => {
    const menu = document.getElementById('mobile-menu') as HTMLDetailsElement | null;
    if (!menu) return;
    menu.open = false;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-close-menu]')) menu.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    };
    menu.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      menu.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pathname]);

  return null;
}
