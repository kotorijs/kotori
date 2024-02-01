/* eslint import/no-extraneous-dependencies: 0 */
import minimist from 'minimist';
import { parseArgs } from 'util';

console.log(
  minimist(process.argv.slice(2), {
    string: ['help'],
    boolean: ['time'],
    alias: { help: 't' }
  })
);
