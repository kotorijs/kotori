import build from 'packages/kotori/src/dev/build'

build(
  {
    ...require('../package.json').kotoriBuild,
    ignoreError: process.argv.includes('--ignoreError'),
    types: process.argv.includes('--types'),
    onlyTypes: process.argv.includes('--onlyTypes'),
    silent: process.argv.includes('--silent')
  },
  process.argv.filter((arg) => !arg.startsWith('-'))[2]
)
