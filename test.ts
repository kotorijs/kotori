/* eslint import/no-extraneous-dependencies: 0 */
import minimist from 'minimist';
import Tsu from 'tsukiko';

interface obj<T = any> {
  [propName: string]: T;
}

const cmd = new Command(`echo <context> [context2:number] [context3=default]`);
cmd
  .option('prefix', 'prefix:string 内容')
  .option('t', 'time:number 时间选项')
  .alias(['别名1', '别名2'])
  .help('这是具体说明')
  .action(() => {});

console.log(Command.run(process.argv.slice(2).join(' '), cmd.meta));
