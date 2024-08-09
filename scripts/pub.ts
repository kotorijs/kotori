import { getPackagesSync } from '@manypkg/get-packages'
import { cd, exec } from 'shelljs'

for (const pkg of getPackagesSync(__dirname).packages) {
  try {
    cd(pkg.dir)
    exec('pnpm publish --no-git-checks --access=public')
  } catch (e) {
    console.error(e)
  }
}

console.log('Publish BINGO!')
