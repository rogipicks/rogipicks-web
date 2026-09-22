'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Fuerza el scroll a la parte superior al cargar la página Y en cada cambio de
 * ruta (p. ej. al pulsar un enlace del footer o de la navbar), porque Next.js
 * App Router mantiene la posición de scroll entre navegaciones cliente.
 * Chrome también restaura la posición de scroll de la sesión anterior al abrir
 * una pestaña nueva, y el `scroll-behavior: smooth` global hace que la página
 * "aparezca" desplazada unos píxeles. Con esto cualquier carga o navegación
 * sin ancla (#hash) empieza arriba del todo, de forma instantánea.
 */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, searchParams]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopOnRouteChange />
    </Suspense>
  );
}

