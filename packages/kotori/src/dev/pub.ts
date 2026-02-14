import { confirm } from '@inquirer/prompts'
import { getPackagesSync } from '@manypkg/get-packages'
import { cd, exec } from 'shelljs'
import { CWD, ensureWorkspaceRoot, matchesFilter } from './common'

export async function pub2() {
  if (
    await confirm({
      default: false,
      message:
        'Are you sure you have built all packages in workspace (includes types for main packages) before publishing?'
    })
  ) {
    exec('pnpm -r publish --no-git-checks --access public')
  }
}

export default function pub(filters?: string) {
  const start = Date.now()
  let failed = 0
  try {
    ensureWorkspaceRoot()
    const pkgs = getPackagesSync(CWD).packages.filter((pkg) => matchesFilter(pkg, filters))
    if (pkgs.length === 0) {
      console.log('No packages matched the filter criteria')
      return
    }

    console.log(`Publishing ${pkgs.length} packages...`)
    for (const pkg of pkgs) {
      try {
        cd(pkg.dir)
        exec('pnpm publish --no-git-checks --access=public')
      } catch (err) {
        failed += 1
        console.error(err)
      }
    }
    console.log(
      `Publish summary: ${pkgs.length === failed} succeed, ${failed} failed, in ${(Date.now() - start) / 1000}s.`
    )
  } catch (err) {
    console.error('Publish failed.', err)
    process.exit(1)
  }
}
