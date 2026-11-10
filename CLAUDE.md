# CLAUDE.md

Instrucciones para Claude Code en este repo. Lo usan Arnau y Hugo, cada uno en su ordenador. Lo que pone aquí vale para los dos. Lo que Claude recuerde en local de cada uno no se comparte.

Lee primero el [README](README.md): cómo arrancar la web, dónde está cada cosa, cómo se publica, las claves y las ramas abiertas.

## Al abrir el proyecto

Al empezar cada sesión, `.claude/hooks/sync.mjs` descarga lo nuevo de GitHub. Si es seguro, también pone al día la rama actual: solo avanza (*fast-forward*), solo cuando no hay cambios locales ni commits sin subir, y nunca sube nada. Si su mensaje dice que ha traído cambios, que hay algo pendiente o que hace falta `npm install`, cuéntaselo al usuario en una o dos líneas al principio de tu primera respuesta. Si no ha podido actualizar la rama, no lo arregles por tu cuenta (merge, rebase, stash): pregunta.

## Reglas

- **`main` es producción.** Todo lo que entra en `main` se publica solo en www.groupargous.com. Nunca hagas commit ni push directamente a `main`. Trabaja en una rama y pasa a `main` con un pull request que revise una persona.
- **No fusiones, no hagas push de nada que vaya a producción y no publiques sin que te lo pidan expresamente.** Subir una rama sí se puede: solo genera una vista previa en workers.dev.
- **No toques las ramas de otro trabajo en curso** (por ejemplo `design/web-seria` o `hugo/cambios-web`) salvo que te lo pidan. Para cambios en la web publicada, parte de `main` actualizado.
- **El repo es público.** Nada de claves, tokens, datos de clientes ni datos personales en el código, los commits o los pull requests.
- Pasa `npm test` antes de abrir un pull request. Si falla algo, di qué falla y si ya fallaba en `main`.

## Textos

- La web principal está en inglés y español: los textos están en `src/i18n.js`, con las mismas claves en `en` y `es`.
- Las landings de anuncios (`src/landing/growth`, `src/landing/systems`) usan el texto del cliente tal cual (`copy.js`). No lo reescribas, no lo recortes y no lo combines. El texto que no venía en el brief está marcado como `added` o «not in the brief».
- Las versiones en español de las landings (`copy.es.js`, en `/growth/es` y `/systems/es`) traducen `copy.js` clave por clave. Si cambias un texto en un idioma, avisa de que falta el otro.
- En español: tú, español de España y el vocabulario de la web («contactos» para *leads*, «primera llamada»).

## Formulario, CRM y Meta

- Los leads van al CRM (proyecto `argo-planning`) a través de `/api/lead` (`server/lead.js`). El cuerpo del envío es el contrato con el CRM (`src/landing/shared/crm.js`): no cambies nombres de campos sin acordarlo.
- El Píxel de Meta y la Conversions API dependen del consentimiento de cookies. Si cambias cookies, formulario o tracking, revisa que la política de privacidad y la de cookies sigan siendo ciertas.
