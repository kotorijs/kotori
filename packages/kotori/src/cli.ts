import cac from 'cac';
import { Loader, Logger } from '@kotori-bot/loader';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const program = cac();

const { version } = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString());
program.version(version, '-v, --version');
program.help();

program
  .command('')
  .option('-D, --dir [path]', 'Set running root dir of program', {
    default: ''
  })
  .option('-M, --mode [name]', 'Set running mode of program,build or dev', {
    default: 'build'
  })
  .option('-L, --log [name]', 'Set level of log output', {
    default: 'build'
  })
  .action((options) => {
    new Loader({ mode: options.mode, dir: resolve(process.cwd(), options.dir), log: Number(options.log) }).run();
  });

program
  .command('ui')
  .option('-l, --lang', 'Set view language of ui')
  .action((options) => {
    Logger.info('ui', options);
  });

program.command('module').action(() => Logger.info('module'));
program.command('module search <name>').action(() => Logger.info('module search'));
program.command('module download <name>').action(() => Logger.info('module download'));

program.parse();
