import { cpSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const docs = resolve(root, 'docs')

rmSync(docs, { recursive: true, force: true })
cpSync(dist, docs, { recursive: true })
writeFileSync(resolve(docs, '.nojekyll'), '')

console.log('Copied dist/ → docs/ for GitHub Pages (branch source /docs).')
