import { existsSync } from 'node:fs'
import path from 'node:path'
import shell from 'shelljs'
import picomatch from 'picomatch'
import type { Package } from '@manypkg/get-packages'

export const CWD = process.cwd()

export function ensureWorkspaceRoot(): void {
  if (!existsSync(path.join(CWD, 'pnpm-workspace.yaml'))) {
    console.error('Please run this commamd from workspace root directory')
    shell.exit(1)
  }
}

export function isMatch(patterns: string | string[], input: string): boolean {
  return picomatch(patterns)(input)
}

export function matchesFilter(pkg: Package, filter?: string): boolean {
  if (!filter || filter === '*') return true
  if (filter.startsWith('./')) {
    const [filterPath, pkgPath] = [path.resolve(CWD, filter), path.resolve(CWD, pkg.dir)]
    return pkgPath.startsWith(filterPath) || isMatch(filterPath, pkgPath)
  }
  return isMatch(filter, pkg.packageJson.name)
}
