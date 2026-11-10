// Runs each time Claude Code opens this project (.claude/settings.json,
// SessionStart), on Windows and on Mac alike. It downloads what is new on
// GitHub and, when that is safe, brings the current branch up to date:
//
//   - only fast-forward: it never merges, rebases or overwrites anything;
//   - only when there are no local changes and no local commits unpushed;
//   - it never pushes, so nothing reaches production (main) on its own.
//
// What it prints goes to Claude, who tells the person in a line or two.
// Offline or any git error: it says so and lets the session start.

import { execFileSync } from 'node:child_process'

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }).trim()

const lines = []
const report = () => {
  if (lines.length) console.log(['Sincronización con GitHub al abrir el proyecto:', ...lines].join('\n'))
}

try {
  try {
    git('fetch', '--prune', '--quiet', 'origin')
  } catch {
    lines.push('- No se pudo conectar con GitHub: el proyecto no se ha actualizado.')
    report()
    process.exit(0)
  }

  const branch = git('branch', '--show-current')
  let upstream = null
  try { upstream = git('rev-parse', '--abbrev-ref', '@{u}') } catch { /* branch not on GitHub */ }

  if (!branch) {
    lines.push('- No estás en ninguna rama (HEAD suelto): no se ha actualizado nada.')
  } else if (!upstream) {
    lines.push(`- La rama ${branch} todavía no está subida a GitHub.`)
  } else {
    const [ahead, behind] = git('rev-list', '--left-right', '--count', 'HEAD...@{u}').split(/\s+/).map(Number)
    const dirty = git('status', '--porcelain', '--untracked-files=no') !== ''

    if (behind && !ahead && !dirty) {
      const before = git('rev-parse', 'HEAD')
      git('merge', '--ff-only', '--quiet', '@{u}')
      lines.push(`- Rama ${branch}: actualizada con ${behind} cambio(s) nuevo(s) de GitHub:`)
      lines.push(...git('log', '-n', '10', '--format=%an: %s', `${before}..HEAD`).split('\n').map((line) => `    · ${line}`))
      if (git('diff', '--name-only', before, 'HEAD').split('\n').includes('package-lock.json')) {
        lines.push('- Han cambiado las dependencias: hace falta `npm install`.')
      }
    } else if (behind) {
      const why = [dirty && 'hay cambios sin guardar en un commit', ahead && `hay ${ahead} commit(s) sin subir`].filter(Boolean).join(' y ')
      lines.push(`- Rama ${branch}: hay ${behind} cambio(s) nuevo(s) en GitHub, pero no se ha actualizado sola porque ${why}.`)
    } else if (ahead) {
      lines.push(`- Rama ${branch}: tienes ${ahead} commit(s) sin subir a GitHub.`)
    }
  }

  if (branch && branch !== 'main') {
    const missing = Number(git('rev-list', '--count', 'HEAD..origin/main'))
    if (missing) lines.push(`- main (lo publicado) tiene ${missing} cambio(s) que la rama ${branch} todavía no incluye.`)
  }
} catch {
  lines.push('- La sincronización con GitHub ha fallado: revisa `git status`.')
}

report()
