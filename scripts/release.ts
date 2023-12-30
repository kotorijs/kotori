#!/usr/bin/env ts-node

const { spawnSync } = require('child_process');

const result = spawnSync('node.exe', ['-v']);
console.log(result.stdout.toString());
/* 

try {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: 'Input new version (major.minor.patch)',
      default: 'copyLeft',
    },
  ]);
  const result = spawnSync('dir');
  console.log(answers, result);
} catch (error) {
  console.log(`Unknown error: ${error}`);
}
 */
