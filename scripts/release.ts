#!/usr/bin/env ts-node

import { readFileSync } from 'fs';
import { resolve } from 'path';

(async () => {
  try {
    const inquirer = (await import('inquirer')).default;
    const Execa = await import('execa');
    const { execa } = Execa;

    const echo = async (cmd: string, args?: string[], option?: unknown) => {
      const entity = await execa(cmd, args, option as undefined);
      const { stdout: result, stderr: error } = entity;
      console.info(result.trim() ? `Result: ${result}` : `Success: ${cmd}`);
      if (error) console.error('Error:', error, `\nAt "${cmd}"`);
    };
    const dirs = (...args: string[]) => resolve(__dirname, ...args);
    const hooks = (hooks: string[]) =>
      new Promise(resolve => {
        hooks.forEach(async (cmd, index) => {
          await echo(cmd);
          if (index === hooks.length - 1) resolve(undefined);
        });
      });

    /* check branch */
    const config = JSON.parse(readFileSync(dirs('config.json')).toString());
    if (!(await execa('git branch')).stdout.includes(`* ${config.branch}`)) {
      console.error(`Branch error! expected: ${config.branch}`);
      return;
    }

    /* LifeCycle: BeforeVersion */
    /* code lint and format by eslint and prettier */
    await hooks(config.beforeVersion);

    /* update version info by changeset */
    await echo('pnpm changeset version');
    const defaultVersion = JSON.parse(readFileSync(dirs(config.package, 'package.json')).toString()).version.split('.');
    const answer = await inquirer.prompt([
      {
        type: 'number',
        name: 'major',
        message: 'Input major version',
        default: defaultVersion[0],
      },
      {
        type: 'number',
        name: 'minor',
        message: 'Input minor version',
        default: defaultVersion[1],
      },
      {
        type: 'number',
        name: 'patch',
        message: 'Input patch version',
        default: defaultVersion[2],
      },
      {
        type: 'confirm',
        name: 'submit',
        message: 'Do you want to submit it immediately?',
        default: true,
      },
    ]);

    /* handle tag */
    const version = `v${answer.major}.${answer.minor}.${answer.patch}`;
    if ((await execa('git tag -l')).stdout.includes(version)) {
      console.error(`Error: tag ${version} already exists`);
      return;
    }
    await echo(`git tag ${version}`);

    /* LifeCycle: BeforeAddcommit */
    /* spawn changelog by conventional-changelog */
    await hooks(config.beforeAddcommit);

    /* auto commit and push remote branch */
    if (!answer.submit) return;
    const answer2 = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'push',
        message: 'Do you need auto push to remote branch?',
        default: false,
      },
    ]);
    await echo('git add .');
    await echo(`git commit -m 'chore: ${version}'`);
    if (!answer2.push) {
      console.info(`All ok!\nPlease enter "git push origin ${config.branch} --tags"`);
      return;
    }
    echo(`git push origin ${config.branch} --tags`);

    const answer3 = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'pack',
        message: 'Do you need auto pack main package?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'publish',
        message: 'Do you need auto publish all package?',
        default: false,
      },
    ]);
    if (answer3.pack) echo('pnpm pack', undefined, { cwd: config.main });
    if (answer3.pack) echo('pnpm changeset publish --no-git-tag');
  } catch (error) {
    console.error('Unexpected error: ', error);
  }
})();
