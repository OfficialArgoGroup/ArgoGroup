# ArgoHero — integración en la web de Group ARGO

Componente React del hero de la home: globo de puntos, logo 3D dorado y scroll que
"vuela" hasta Barcelona y luego suelta la página hacia la siguiente sección.
Sin dependencias nuevas: solo React 18+. Compatible con SSR/SSG.

## Archivos

```
src/components/ArgoHero/
  ArgoHero.jsx     el componente (markup, menú móvil, props)
  ArgoHero.css     estilos con prefijo ah- (no choca con Tailwind)
  globeScene.js    motor del canvas: globo, arco, marcadores, tarjetas, scroll
  landMask.js      mapa de tierra comprimido (~14 KB, ~22.000 puntos)
  argoMark.js      trazado oficial del símbolo ARGO
public/brand/
  argo-wordmark-cream.svg   wordmark del brandbook para la nav
```

## Cómo funciona (lo importante)

- **El scroll fijado.** `.ah-track` mide 320vh y dentro está el hero con
  `position: sticky`. Mientras haces scroll por esos 320vh el hero se queda fijo y
  `globeScene` convierte la posición en un progreso de 0 a 1 (subida → picado →
  cierre). Al acabar el track, el hero sube como cualquier bloque y aparece lo que
  venga después en la página. **La "siguiente sección" es simplemente el siguiente
  componente que pongas debajo de `<ArgoHero />`.**
- **Sin re-renders.** React pinta el markup una vez; `GlobeScene` dibuja el canvas y
  escribe opacidad/transform directamente en el DOM cada frame. Por eso el scroll va
  fluido aunque haya miles de puntos.
- **Rendimiento.** Se pausa cuando el hero sale de pantalla (IntersectionObserver),
  no dibuja lo que queda fuera de pantalla o detrás del globo, y en móvil usa una
  malla más ligera.
- **Accesibilidad.** Con `prefers-reduced-motion` el globo queda estático, el track
  se reduce a una pantalla y no hay animaciones.

## Props

| Prop | Por defecto | Para qué |
| --- | --- | --- |
| `links` | Servicios, Casos, Nosotros, Contacto → `#servicios`… | Enlaces de la nav y del menú móvil |
| `bookHref` | `#contacto` | Destino de «Book a call» |
| `workHref` | `#casos` | Destino de «See our work» |
| `showNav` | `true` | `false` si la web ya tiene un header global |
| `cards` | ROAS 4.2x · +38% leads · CPL −27% | Tarjetas del globo (cifras de ejemplo: cámbialas por casos reales) |
| `rotationSpeed` | `6` | Grados por segundo |
| `wordmarkSrc` | `/brand/argo-wordmark-cream.svg` | Ruta del wordmark |

## Prompt para Claude Code

Los archivos ya están en su sitio en el repo `ArgoGroup` (no se ha modificado ningún
archivo existente): `src/components/ArgoHero/`, `public/brand/argo-wordmark-cream.svg`
y `public/fonts/playfair-display-latin-wght-italic.woff2`. Pega esto en Claude Code:

> Integra el nuevo hero de la home que está en `src/components/ArgoHero/` (lee antes
> `src/components/ArgoHero/INTEGRATION.md`):
>
> 1. No modifiques el contenido de `globeScene.js`, `landMask.js` ni `argoMark.js`.
> 2. En `src/pages/Home.jsx`, sustituye el hero actual (`Hero.jsx`) por `<ArgoHero />`,
>    que debe ser el primer bloque de la página. Deja todas las secciones que van
>    después tal cual: la primera de ellas es la sección a la que llega el scroll.
>    Ojo: tengo cambios sin commitear en Hero.jsx, Navbar.jsx y Home.jsx; respétalos y
>    no borres `Hero.jsx` todavía, solo deja de usarlo en la home.
> 3. Ya tenemos `Navbar.jsx` global: en la home pásale a `ArgoHero` `showNav={false}`
>    o, si encaja mejor, oculta el Navbar en la home y deja la nav del hero. No quiero
>    dos navegaciones; elige y explícame por qué.
> 4. Conecta los enlaces con las rutas y anclas reales del sitio (Servicios, Casos,
>    Nosotros, Contacto), `bookHref` al enlace real de reserva y `workHref` a casos.
>    Respeta i18n (`src/i18n.js`): si los textos del hero deben ir traducidos, pásalos
>    por el sistema de i18n en vez de dejarlos fijos.
> 5. Las fuentes están auto-alojadas en `public/fonts`. Añade el `@font-face` de
>    `playfair-display-latin-wght-italic.woff2` (font-style: italic, font-weight 400 900,
>    font-display: swap) junto al de la Playfair normal, y comprueba que Inter cubre
>    300/400/500 (es variable, debería).
> 6. Revisa que `html`, `body` o el wrapper de la home no tengan `overflow: hidden` ni
>    `overflow-x: hidden`: rompe `position: sticky`. Si hace falta, usa `overflow-x: clip`.
>    Comprueba también que `ScrollProgress.jsx` y `Reveal.jsx` no interfieren.
> 7. Comprueba que la sección siguiente al hero tiene fondo `#0D0D0D` (o que el corte
>    se ve limpio) y que no hay un `margin-top` que deje un hueco.
> 8. Haz `npm run build` (incluye SSR y prerender) y revisa que pasa y que no hay errores
>    en consola. No hagas commit ni deploy: enséñame el diff primero.

## Si algo no va

- **El hero no se queda fijo al hacer scroll** → casi siempre es un `overflow` en un
  ancestro (punto 6) o un wrapper con `transform`.
- **Las tarjetas no aparecen** → solo se muestran si caben en los márgenes laterales
  (desde ~1280 px de ancho) y si su ciudad está de cara. En móvil se ocultan a propósito.
- **Fuentes distintas en el título** → falta Playfair Display 400 itálica (punto 5).
