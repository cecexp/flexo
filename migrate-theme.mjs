import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// ─── Mapa de reemplazos: [buscar, reemplazar] ─────────────────────────────────
const REPLACEMENTS = [

  // Fondos oscuros → tokens fluxo
  ['dark:bg-gray-950',   'bg-fluxo-bg'],
  ['dark:bg-gray-900',   'bg-fluxo-bg2'],
  ['dark:bg-gray-800',   'bg-fluxo-bg3'],
  ['dark:bg-gray-700',   'bg-fluxo-bg4'],

  // Fondos claros → tokens fluxo
  ['bg-white',           'bg-fluxo-bg'],
  ['bg-gray-50',         'bg-fluxo-bg2'],
  ['bg-gray-100',        'bg-fluxo-bg3'],

  // Texto oscuro → tokens fluxo
  ['dark:text-white',        'text-fluxo-txt'],
  ['dark:text-gray-100',     'text-fluxo-txt'],
  ['dark:text-gray-300',     'text-fluxo-txt2'],
  ['dark:text-gray-400',     'text-fluxo-txt2'],
  ['dark:text-gray-500',     'text-fluxo-txt3'],
  ['dark:text-gray-600',     'text-fluxo-txt3'],

  // Texto claro → tokens fluxo
  ['text-gray-900',          'text-fluxo-txt'],
  ['text-gray-700',          'text-fluxo-txt2'],
  ['text-gray-500',          'text-fluxo-txt2'],
  ['text-gray-400',          'text-fluxo-txt3'],

  // Bordes → tokens fluxo
  ['dark:border-gray-800',   'border-fluxo-border'],
  ['dark:border-gray-700',   'border-fluxo-border2'],
  ['border-gray-200',        'border-fluxo-border'],
  ['border-gray-300',        'border-fluxo-border2'],

  // Verde emerald → neón fluxo
  ['dark:text-emerald-400',  'text-neon'],
  ['text-emerald-500',       'text-neon'],
  ['text-emerald-600',       'text-neon-dim'],
  ['bg-emerald-500',         'bg-neon'],
  ['dark:bg-emerald-500\\/10', 'bg-neon-muted'],
  ['bg-emerald-50',          'bg-neon-muted'],
  ['hover:bg-emerald-400',   'hover:bg-neon-dim'],
  ['dark:border-emerald-500\\/50', 'border-neon'],

  // Hover y estados
  ['dark:hover:bg-gray-800', 'hover:bg-fluxo-bg3'],
  ['dark:hover:bg-gray-700', 'hover:bg-fluxo-bg4'],
  ['hover:bg-gray-100',      'hover:bg-fluxo-bg3'],
  ['dark:hover:text-white',  'hover:text-fluxo-txt'],
  ['hover:text-gray-900',    'hover:text-fluxo-txt'],
  ['dark:hover:border-gray-600', 'hover:border-fluxo-border2'],

  // Amber / alertas
  ['dark:text-amber-400',    'text-fluxo-amber'],
  ['text-amber-700',         'text-fluxo-amber'],

]

// ─── Recorre archivos recursivamente ─────────────────────────────────────────
function walk(dir) {
  let files = []
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    if (statSync(full).isDirectory()) files = [...files, ...walk(full)]
    else if (['.tsx', '.ts'].includes(extname(f))) files.push(full)
  }
  return files
}

// ─── Aplica reemplazos ────────────────────────────────────────────────────────
const targets = ['app', 'components'].flatMap(walk)
let totalFiles = 0, totalChanges = 0

for (const file of targets) {
  let src = readFileSync(file, 'utf8')
  let changes = 0

  for (const [from, to] of REPLACEMENTS) {
    const regex = new RegExp(from, 'g')
    const next = src.replace(regex, to)
    if (next !== src) { changes += (src.match(regex) || []).length; src = next }
  }

  if (changes > 0) {
    writeFileSync(file, src, 'utf8')
    console.log(`✓ ${file} — ${changes} reemplazos`)
    totalFiles++; totalChanges += changes
  }
}

console.log(`\n✅ ${totalFiles} archivos · ${totalChanges} reemplazos totales`)