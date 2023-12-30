#!/usr/bin/env ts-node

import { readFileSync } from 'fs';
import { resolve } from 'path';

(async () => {
  try {
    const inquirer = (await import('inquirer')).default;
    const { execa } = await import('execa');
    const config = JSON.parse(readFileSync(resolve(__dirname, 'config.json')).toString());
    const defaultVersion = JSON.parse(readFileSync(resolve(__dirname, config.package)).toString()).version.split('.');
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
    const version = `v${answer.major}.${answer.minor}.${answer.patch}`;
    if ((await execa('git tag -l')).stdout.includes(version)) {
      console.error(`Error: tag ${version} already exists`);
      return;
    }
    console.info(`Return: ${(await execa(`git tag ${version}`)).stdout}`);
    if (!answer.submit) return;
    console.info(`Return: ${(await execa(`git push origin ${config.branch} --tags`)).stdout}`);
  } catch (error) {
    console.error('Unexpected error: ', error);
  }
})();
