import cac from 'cac';
import { Loader, Logger } from '@kotori-bot/loader';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  .option('-L, --level [name]', 'Set level of log output', {
    default: 'build'
  })
  .action((options) => {
    const Kotori = new Loader({
      mode: options.mode,
      dir: options.dir ? resolve(process.cwd(), options.dir) : undefined,
      level: Number(options.log)
    });
    Kotori.run();
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
