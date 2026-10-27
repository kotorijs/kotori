import { execSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const dirs = ['packages', 'modules/platform', 'modules/tools', 'modules/base', 'modules/amuse']
const tsconfigList: string[] = []

for (const dir of dirs) {
  const fullDir = resolve(root, dir)
  if (!existsSync(fullDir)) continue
  for (const name of readdirSync(fullDir)) {
    const pkgTsconfig = resolve(fullDir, name, 'tsconfig.json')
    if (existsSync(pkgTsconfig)) {
      tsconfigList.push(pkgTsconfig)
    }
  }
}

let hasError = false
for (const config of tsconfigList) {
  const rel = config.replace(root, '').replace(/^[\\/]/, '')
  console.log(`Checking types: ${rel}`)
  try {
    execSync(`npx tsc -p "${config}" --noEmit`, { stdio: 'inherit' })
  } catch {
    hasError = true
    console.error(`Type check failed in ${rel}`)
  }
}

if (hasError) {
  process.exit(1)
} else {
  console.log('All type checks passed!')
}

