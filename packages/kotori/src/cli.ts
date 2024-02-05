import cac from 'cac';
import { Loader } from '@kotori-bot/loader';
import { readFileSync } from 'fs';
import { obj } from '.';

const program = cac();

const pkg = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString());

program.version(pkg.verion, '-v, --version');

program
  .command('')
  .option('--dir [path]', 'Set running root dir of program')
  .action((options) => {
    (globalThis as obj).env_mode = 'build';
    new Loader().run();
  });

program
  .command('ui')
  .option('-l, --lang', 'Set view language of ui')
  .action((options) => {
    console.log('ui');
  });

program.command('module').action(() => console.log('module'));
program.command('module search <name>').action(() => console.log('module search'));
program.command('module download <name>').action(() => console.log('module download'));
program.parse();
