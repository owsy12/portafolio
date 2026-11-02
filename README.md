# Portafolio — Oswaldo Cobos

Portafolio personal hecho con **Next.js 16, React 19, TypeScript y Tailwind CSS 4**. Todas las páginas se generan como HTML estático, así que el contenido se ve aunque JavaScript no cargue.

## Requisitos

- Node.js 20 o superior (probado con Node 22)
- npm

## Comandos

```bash
npm install          # instala dependencias
npm run dev          # desarrollo en http://localhost:3000
npm run build        # build de producción
npm run start        # sirve el build de producción
npm run typecheck    # revisa tipos de TypeScript
```

## Variables de entorno

Solo hay una, y es opcional:

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (metadatos, Open Graph, `sitemap.xml`, `robots.txt`). Si no la defines se usa `https://oswaldo-cobos.vercel.app`. |

Copia `.env.example` a `.env.local` para desarrollo, o agrégala en Vercel → *Settings → Environment Variables*.

## Publicar en Vercel

1. Sube esta carpeta a un repositorio nuevo de GitHub (sin `node_modules` ni `.next`).
2. En vercel.com → *Add New → Project* → importa el repositorio. Vercel detecta Next.js solo; no cambies nada del build.
3. Cuando tengas la URL definitiva, agrégala como `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar.
4. Pon esa URL en tu CV (ver «Actualizar el CV»), en LinkedIn y en tu perfil de GitHub.

## Estructura

```
app/                      Rutas (App Router)
  page.tsx                Inicio: hero, proyectos, sobre mí, experiencia, habilidades, contacto
  proyectos/page.tsx      Lista completa con filtros
  proyectos/[slug]/       Página de cada proyecto (se genera desde content/projects.ts)
  sitemap.ts, robots.ts   SEO
  fonts/                  Tipografías locales (Instrument Serif, Geist, Geist Mono)
components/               Componentes reutilizables
  demos/DescukeDemo.tsx   Iframe con la demo de Descuke
  demos/SgppDemo.tsx      Recreación interactiva del SGPP (JavaFX)
  demos/PasadenaDemo.tsx  Recreación de las vistas .NET MAUI de Pasadena
  demos/SimuladoresDemo.tsx  Recreación de los simuladores EXANI-I y USICAMM (WPF), con preguntas de ejemplo
content/
  site.ts                 Tus datos, disponibilidad, CVs y habilidades
  projects.ts             Catálogo de proyectos (la única fuente de verdad)
  images.json             Tamaños de las imágenes (lo llena el script de imágenes)
public/
  cv/                     CVs en PDF y DOCX
  projects/<slug>/        Capturas en .webp
  demos/descuke/          Código real de Descuke con una base de datos simulada
  og.png                  Imagen para compartir en redes
tools/
  cv/                     Generador de los CVs
  images/                 Conversión de capturas a .webp
```

## Agregar un proyecto

1. Guarda las capturas (PNG) y conviértelas:
   ```bash
   pip install pillow
   python3 tools/images/process_images.py '[{"src":"captura.png","slug":"mi-proyecto","name":"inicio"}]'
   ```
   Crea `public/projects/mi-proyecto/inicio.webp` y registra su tamaño en `content/images.json`.
   Para pixel art agrega `"pixel": true`; para capturas de celular, `"maxw": 780`.
2. En `content/projects.ts`, copia un proyecto existente, cambia el `slug` y llena los campos.
   La página `/proyectos/mi-proyecto`, la tarjeta, los filtros y el sitemap se actualizan solos.
3. Si un proyecto no tiene capturas, deja `cover` vacío: la tarjeta muestra un esquema de su arquitectura o un fragmento de código (`code`).

## Actualizar el CV

El contenido está en `tools/cv/cv_content.js` (las tres versiones: Junior ES, Junior EN y Backend). Para regenerarlas:

```bash
npm install --no-save docx
NO_PHONE=1 node tools/cv/build_cv.js public/cv   # versión para la web, sin teléfono
CV_PHONE="+52 ..." node tools/cv/build_cv.js cv-privado   # versión con teléfono, para enviar por correo (no se sube a Git)
cd public/cv && for f in *.docx; do soffice --headless --convert-to pdf "$f"; done
```

Para agregar la URL del portafolio al encabezado del CV, llena `portfolio` al final de `cv_content.js`.
Revisa siempre que cada PDF siga ocupando una sola página.
Si cambias los nombres de archivo, actualiza `cvFiles` en `content/site.ts`.

## La demo de Descuke

`public/demos/descuke/` es el código real de la aplicación con estos cambios:

- `src/js/config/firebase.config.js` ya no se conecta a Firebase: implementa la misma API (Firestore + Auth) en memoria del navegador (`sessionStorage`). No contiene credenciales.
- `src/js/config/demo-seed.js` genera nombres, reservas y cuentas ficticias. `src/js/data/products-catalog.js` es un catálogo inventado (no son los productos ni los precios reales).
- Se quitaron los logos del negocio: los archivos de imagen se borraron y en su lugar aparece el nombre en texto.
- `demo/demo-panel.js` agrega el panel flotante para cambiar de rol y reiniciar los datos. Los QR apuntan a la página de mesa de la demo.

Cuentas de la demo (contraseña `demo1234`): `admin`, `valeria` (RP), `camila` (hostess), `luis` (mesero).

## Accesibilidad y diseño responsivo

- El contenido nunca empieza con `opacity: 0`. Las animaciones solo usan `transform` y se desactivan con *reducir movimiento*.
- El menú móvil usa `<details>`, así que abre y cierra aunque JavaScript falle.
- Respeta las áreas seguras del iPhone (`viewport-fit=cover` y `env(safe-area-inset-*)`).
- Navegación con teclado, enlace para saltar al contenido, textos alternativos en todas las imágenes.
