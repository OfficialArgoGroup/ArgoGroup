# Web de Group ARGO

El código de [www.groupargous.com](https://www.groupargous.com): la web principal (home, páginas de servicio, About, contacto, legales) y las dos landings de anuncios de Meta, `/growth` y `/systems`.

Está hecha con React + Vite. Se publica como un Worker de Cloudflare (`argo-web`) que sirve las páginas ya generadas y responde a las llamadas `/api/*` del formulario y del tracking.

> **`main` es producción.** Todo lo que entra en `main` se publica solo en groupargous.com en un par de minutos. Trabaja siempre en otra rama y pasa a `main` con un pull request.

## Arrancarla en tu ordenador

Necesitas [Node.js 22](https://nodejs.org/) y Git.

### En Mac (una sola vez)

1. **Git:** abre la app Terminal y escribe `git --version`. Si no está instalado, macOS ofrece instalar las «herramientas de línea de comandos»: acepta y espera a que termine.
2. **Node.js 22:** descarga el instalador para macOS (versión 22) de https://nodejs.org/en/download e instálalo como cualquier app. Comprueba con `node -v` en una ventana nueva de Terminal.
3. **Editor:** [Visual Studio Code](https://code.visualstudio.com) para abrir la carpeta y editar los archivos (tiene su propia Terminal: menú *Terminal → New Terminal*).
4. **Iniciar sesión en GitHub:** al primer `git push` GitHub no acepta la contraseña de la cuenta. Lo más fácil es instalar [GitHub Desktop](https://desktop.github.com) e iniciar sesión con la cuenta de ARGO: desde ahí se puede clonar, cambiar de rama, hacer commit y subir sin comandos. Si prefieres la Terminal, instala [GitHub CLI](https://cli.github.com) y ejecuta `gh auth login` una vez.

### Descargar y arrancar

En la Terminal (en Mac, por ejemplo dentro de `~/Documents`):

```bash
git clone https://github.com/OfficialArgoGroup/ArgoGroup.git
cd ArgoGroup
npm install
npm run dev
```

Abre la dirección que imprime (normalmente http://localhost:5173). Al guardar un archivo, la página se actualiza sola.

En local el formulario no llega al CRM y no se envía nada a Meta: las claves solo existen en Cloudflare (ver [Claves](#claves-secrets)).

### Mantenerlo al día

Si abres el proyecto con Claude Code, cada vez que empiezas una sesión descarga lo nuevo de GitHub (`.claude/hooks/sync.mjs`). Si en tu ordenador no hay cambios a medias, pone tu rama al día él solo. Nunca sube nada: para que el otro vea tu trabajo, tienes que hacer commit y push (o pedírselo a Claude). Sin Claude Code, haz `git pull` antes de empezar.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Web en local con recarga automática. |
| `npm run build` | Genera la web final en `dist/`: el HTML de cada página, sitemap, robots.txt, llms.txt y las versiones en Markdown. |
| `npm test` | Hace la build y pasa todos los tests. Pásalo antes de cada pull request. |
| `npm run serve:dist` | Sirve `dist/` como lo haría Cloudflare (URLs limpias, 404 real), para revisar la build. |
| `npm run lint` | Revisa el código con ESLint. |

## Dónde está cada cosa

| Qué quieres cambiar | Dónde |
|---|---|
| Textos de la web (home, servicios, About, contacto, títulos y descripciones de Google) | `src/i18n.js` |
| Datos de la empresa (email, teléfono, WhatsApp, dirección web) | `src/site.js` |
| Secciones de la home y su orden | `src/pages/Home.jsx`, `src/sections.js` |
| Páginas de cada servicio (`/digital-marketing`, `/ai-technology`, `/creative-brand`): URL y valor `servicio` para el CRM | `src/services.js`, `src/pages/ServicePage.jsx` (textos en `src/i18n.js`) |
| Páginas | `src/pages/` |
| Piezas de la página (menú, hero, servicios, formulario, banner de cookies, pie…) | `src/components/` |
| Estilos | `src/styles/` (+ Tailwind en `tailwind.config.js`) |
| Landings de anuncios `/growth` y `/systems` | `src/landing/` (+ `growth.html`, `systems.html`) |
| Imágenes, logos, fuentes, favicon | `public/` |
| Textos legales (privacidad, cookies, términos) | `src/pages/PrivacyPolicy.jsx`, `CookiePolicy.jsx`, `TermsOfService.jsx` |
| Formulario → CRM | `server/lead.js` |
| Píxel de Meta y Conversions API | `src/lib/tracking.js`, `src/lib/consent.js`, `server/meta.js`, `server/meta-capi.js` |
| El Worker de Cloudflare (redirecciones, cabeceras, rutas `/api/*`) | `server/worker.js`, `wrangler.jsonc` |
| Tests | `tests/` |

Las versiones en Markdown de cada página (para buscadores e IA) salen solas de `src/i18n.js` al hacer la build: no hay que tocarlas aparte.

## Cómo publicar un cambio

1. Parte de `main` actualizado y crea una rama:
   ```bash
   git checkout main
   git pull
   git checkout -b copy/texto-hero
   ```
   Nombres que usamos: `copy/…` textos, `feat/…` algo nuevo, `fix/…` arreglos, `design/…` diseño, `legal/…` legales.
2. Haz los cambios y míralos con `npm run dev`.
3. Pasa los tests: `npm test`. Si alguno falla, lee el mensaje: suele decir qué texto o página esperaba.
4. Sube la rama:
   ```bash
   git add -A
   git commit -m "copy: nuevo texto del hero"
   git push -u origin copy/texto-hero
   ```
5. **Vista previa:** Cloudflare construye cada rama que subes y la publica en
   `https://<rama>-argo-web.sweet-poetry-73fa.workers.dev` (la `/` del nombre de la rama pasa a `-`, p. ej. `copy-texto-hero-argo-web…`). La dirección exacta aparece en el check «Workers Builds: argo-web» del commit o del pull request en GitHub. Las vistas previas nunca envían nada a Meta.
6. Abre un pull request hacia `main` en GitHub y revisadlo entre los dos.
7. **Merge = publicar.** Al fusionarlo, Cloudflare construye `main` y lo publica en groupargous.com. Comprueba que el check de «Workers Builds» sale en verde y mira la web.

Si una publicación sale mal, revierte el pull request en GitHub (botón «Revert») y fusiona la reversión: vuelve a publicarse la versión anterior.

## Despliegue (Cloudflare)

- Cuenta de Cloudflare: info@groupargous.com. Worker: **argo-web**. Ahí están las builds, los logs y las claves.
- Cloudflare está conectado a este repo de GitHub (Workers Builds): rama `main` → producción, cualquier otra rama → vista previa.
- El dominio groupargous.com (DNS incluido) también está en Cloudflare. `groupargous.com` y `http://` redirigen a `https://www.groupargous.com`.
- No hace falta desplegar a mano ni usar `wrangler deploy`.

## Claves (secrets)

El código lee estas claves, pero **nunca van en el repo** (es público). Están en Cloudflare → Workers → argo-web → Settings → Variables and Secrets.

| Clave | Para qué | Si falta |
|---|---|---|
| `CRM_LEADS_URL` | Dirección del CRM (argo-planning) donde llega cada lead. | `/api/lead` responde 503 y el formulario muestra un error. |
| `CRM_ENTRADA_SECRETO` | Clave compartida con el CRM para aceptar los leads. | Igual que arriba. |
| `CRM_BYPASS_SECRET` | Solo para mandar leads a una vista previa protegida del CRM en Vercel. | En producción no hace falta. |
| `META_PIXEL_ID` | Píxel de Meta. | No se envía nada a Meta (los leads sí llegan al CRM). |
| `META_CAPI_TOKEN` | Conversions API de Meta (eventos desde el servidor). | Igual que arriba. |
| `META_TEST_EVENT_CODE` | Solo para pruebas en Events Manager → Test events. Quitarla después. | — |

## Tracking y consentimiento

- El Píxel y la Conversions API solo funcionan en groupargous.com. En local, vistas previas y workers.dev no se envía nada.
- Va ligado al banner de cookies. En las landings depende del país: en la UE/EEE, Reino Unido y Suiza espera a «Aceptar»; en el resto carga de entrada y el banner permite rechazarlo (`src/landing/shared/region.js`, país desde `/api/geo`).
- Para que tus propias visitas no cuenten, abre una vez `https://www.groupargous.com/?argo_internal=1` en cada navegador (`?argo_internal=0` lo quita).
- Si cambias algo de cookies, formulario o tracking, revisa que la política de privacidad y la de cookies sigan diciendo la verdad.

## Ramas abiertas ahora (noviembre 2026)

- **`design/web-seria`**: el rediseño en curso. La home solo nombra los servicios, y cada servicio tiene su propia página (`/digital-marketing`, `/ai-technology`, `/creative-brand`) con material real. Hay un hero nuevo y cambios en About. **No está listo para producción.** Falta decidir si «Why ARGO» se queda también en la home, el primer pantallazo negro frente al resto de la web en crema y el horario fijo del contacto. Además le faltan los textos provisionales que ya están publicados (PR #31): habrá conflictos en `src/i18n.js` y `src/content/markdown.js` al juntarlos.
- **`fix/tracking-unico`** (PR #30, no fusionar todavía): un único módulo para Píxel y CAPI. `design/web-seria` parte de esta rama.
- PR #7 `feat/landings-crm`: vista previa antigua, no fusionar.
- **`hugo/cambios-web`**: cambios de Hugo en la home y las páginas de servicio, encima de `design/web-seria`.
- **`feat/landings-es`**: versiones en español de las landings (`/growth/es`, `/systems/es`). Los textos están pendientes de revisión: todavía no hay que fusionarla.

## Pendientes

- **CRM: valor propio para Creatividad y marca.** Los contactos que llegan desde `/creative-brand` se envían con `servicio: 'otro'`, porque el CRM (argo-planning) todavía no acepta `creatividad_marca`. Cuando lo acepte, cámbialo en `src/services.js` y en la lista de `tests/content.test.js`. Mientras tanto, el campo `pagina` dice de qué página viene el contacto.
