import cac from 'cac';
import { Loader, Logger } from '@kotori-bot/loader';
import { readFileSync } from 'fs';

const program = cac();

const pkg = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString());

program.version(pkg.verion, '-v, --version');

program
  .command('')
  .option('--dir [path]', 'Set running root dir of program')
  .action((options) => {
    Logger.info(options);
    new Loader({ mode: 'build' }).run();
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
