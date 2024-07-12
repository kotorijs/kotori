import env from 'dotenv'
import cac from 'cac'
import { Loader, Logger } from '@kotori-bot/loader'
import { resolve } from 'node:path'

env.config()

const program = cac()

const { version } = require(resolve(__dirname, '../package.json'))

program.version(version, '-v, --version')
program.help()

program
  .command('')
  .option('-D, --dir [path]', 'Set running root dir of program', {
    default: ''
  })
  .option('-M, --mode [name]', 'Set running mode of program,build or dev', {
    default: 'build'
  })
  .option('-L, --level [number]', 'Set level of log output', {
    default: 25
  })
  .option('-C, --config [name]', 'Set name of config file', {
    default: 'kotori'
  })
  .option('-U, --use-color [bool]', 'Set wether use logger colors', {
    default: false
  })
  .option('-L, --log [booo]', 'Set level of log output', {
    default: true
  })
  .action((options) => {
    const Kotori = new Loader({
      mode: options.mode || (process.env.NODE_ENV === 'production' ? 'build' : 'dev'),
      dir: options.dir ?? process.env.DIR,
      level: Number(options.log ?? process.env.LOG_LEVEL) || undefined,
      useColor: options['use-color'] || process.env.USE_COLOR !== 'off'
    })
    Kotori.run()
  })

program
  .command('ui')
  .option('-l, --lang', 'Set view language of ui')
  .action((options) => {
    //     ██╗  ██╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗
    // ██║ ██╔╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗██║
    // █████╔╝ ██║   ██║   ██║   ██║   ██║██████╔╝██║
    // ██╔═██╗ ██║   ██║   ██║   ██║   ██║██╔══██╗██║
    // ██║  ██╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║██║
    // ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝
    // `
    // TODO: refer nonebot
    Logger.info('ui', options)
  })

program.command('module').action(() => Logger.info('module'))
program.command('module search <name>').action(() => Logger.info('module search'))
program.command('module download <name>').action(() => Logger.info('module download'))

program.parse()
