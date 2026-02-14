import { resolve } from 'node:path'
import { Container, executeCommand, loadConfig, Symbols, supportTs } from '@kotori-bot/core'
import { BUILD_MODE, CONFIG_NAME, DEV_MODE, Loader, Logger } from '@kotori-bot/loader'
import cac from 'cac'
import daemon from './daemon'
import build from './dev/build'
import { CWD } from './dev/common'
import pub from './dev/pub'
import { mainScope } from './gui'
import env from './utils/env'

const program = cac()

program.version(require('../package.json'), '-v, --version')
program.help()

program
  .command('')
  .option('--daemon', 'Set daemon process')
  .option('--mode [name]', 'Set running mode of program, build or dev')
  .option('--dir [path]', 'Set running root dir of program')
  .option('--config [name]', 'Set name of config file')
  .option('--level [number]', 'Set level of log output')
  .option('--port [number]', 'Set port of server')
  .option('--dbPrefix [string]', 'Set prefix of database')
  .option('--noColor', 'Do not use logger colors')
  .action((options) => {
    const loaderOptions = Object.assign(env, { mode: (options.mode ?? env.mode) === DEV_MODE ? DEV_MODE : BUILD_MODE })
    if (options.dir !== undefined) loaderOptions.dir = options.dir
    if (options.config) loaderOptions.config = options.config
    if (options.level !== undefined) loaderOptions.level = Number.parseInt(options.level)
    if (options.port !== undefined) loaderOptions.port = Number.parseInt(options.port)
    if (options.dbPrefix) loaderOptions.dbPrefix = options.dbPrefix
    if (options.noColor) loaderOptions.noColor = true
    if (options.daemon || loaderOptions.mode === BUILD_MODE) loaderOptions.daemon = true

    const virtualEnv = {
      ...process.env,
      NODE_ENV: loaderOptions.mode === DEV_MODE ? 'dev' : 'build',
      CONFIG: loaderOptions.config,
      DIR: loaderOptions.dir,
      PORT: loaderOptions.port !== undefined ? String(loaderOptions.port) : undefined,
      LEVEL: loaderOptions.level !== undefined ? String(loaderOptions.level) : undefined,
      NO_COLOR: loaderOptions.noColor !== undefined ? (loaderOptions.noColor ? 'on' : 'off') : undefined,
      IS_DAEMON: 'on'
    }
    // Auto checkout running environment when using daemon
    if (!options.daemon && loaderOptions.mode === DEV_MODE && !supportTs()) {
      Logger.error('You need to transform running environment to use dev mode')
      // Exec tsx child process to support typescript file dynamic import when in dev mode but no daemon
      const child = executeCommand(
        `npm exec tsx "${resolve(__filename)}"`,
        { cwd: process.cwd(), env: virtualEnv },
        (error, stdout, stderr) => {
          if (stdout) process.stderr.write(stdout)
          if (stderr) process.stderr.write(stderr)
          if (error) process.stderr.write(error.message)
        }
      )
      process.stdin.on('data', (data) => child.stdin?.write(data))
      return
    }

    if (loaderOptions.daemon && !env.isDaemon) return daemon(virtualEnv)
    const loader = new Loader(loaderOptions)
    loader.meta.version = require(resolve(__dirname, '../package.json')).version
    Container[Symbols.setInstance](loader)
    loader.run()
  })

program
  .command('ui', 'Run the interactive GUI')
  .alias('gui')
  .action(() => {
    mainScope()
  })

program
  .command('build [filters]', 'Build the workspace')
  .option('--silent', 'Do not output logs')
  .option('--types', 'Build types')
  .option('--onlyTypes', 'Build only types')
  .option('--ignoreError', 'Ignore error when building')
  .action((filters, options) => {
    build(options, { ...(loadConfig(resolve(CWD, env.config ?? CONFIG_NAME), 'toml') ?? {}), ...filters })
  })

program.command('pub [filters]', 'Publish the workspace').action((filters) => pub(filters))

// program.command('module search <name>').action(() => Logger.info('module search'))
// program.command('module download <name>').action(() => Logger.info('module download'))

program.on('command:*', () => {
  Logger.error('Invalid command: %s', program.args.join(' '))
  process.exit(1)
})

program.parse()
