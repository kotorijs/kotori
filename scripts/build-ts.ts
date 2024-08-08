import { getPackagesSync } from '@manypkg/get-packages'
import { cd, exec } from 'shelljs'

for (const pkg of getPackagesSync(__dirname).packages) {
  try {
    cd(pkg.dir)
    exec('tsc --build')
  } catch (e) {
    console.error(e)
  }
}

console.log('Build d.ts BINGO!')
