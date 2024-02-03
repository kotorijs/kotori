#!/usr/bin/env node

import cac from 'cac';
import { Loader } from '@kotori-bot/loader';
import { readFileSync } from 'fs';

const program = cac();

const pkg = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString());

program.version(pkg.verion);

program
  .command('serve')
  .option('--mode [value]', 'Set running mode of program')
  .option('--dir [path]', 'Set running root dir of program')
  .action((...args) => {
    console.log(args);
    new Loader().run();
  });
