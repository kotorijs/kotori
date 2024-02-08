#!/usr/bin/env ts-node

import { Package, getPackagesSync } from '@manypkg/get-packages';
import { error, log } from 'console';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const config = {
  branch: 'master',
  remote: 'origin',
  registry: 'https://registry.npmjs.org/',
  main: 'kotori-bot',
  root: '@kotori-bot/root',
  sync: ['@kotori-bot/core'],
  include: '{packages,modules}/*/src/*.{ts,tsx}',
  hooks: {
    beforeAddcommit: [
      'pnpm run lint',
      'pnpm run format',
      'pnpm run version',
      'prettier --config .prettierrc "{{packages,modules}/*/package.json,package.json}" --write'
    ]
  }
};

const ROOT_DIR = resolve(__dirname, '../');
const WORKSPACE = getPackagesSync(ROOT_DIR);

function getTargetPackage(pkgName: string, pkgs: Package[]) {
  const filterPackages = pkgs.filter((pkg) => pkg.packageJson.name === pkgName);
  if (filterPackages.length === 0) return null;
  return filterPackages[0];
}

type Version = 'Major' | 'Minor' | 'Patch';

type Option = {
  cwd: string;
};

(async () => {
  const { prompt } = (await import('inquirer')).default;
  const { execa } = await import('execa');

  async function step(cmd: string, args?: string[], option: Option = { cwd: ROOT_DIR }, print: boolean = false) {
    try {
      const entity = await execa(cmd, args, option);
      const { stdout, stderr } = entity;
      if (stderr) error('Error:', stderr, `\nAt "${cmd}"`);
      log(print ? `Result: ${stdout}` : `Success: ${cmd}`);
    } catch (err) {
      error(`Run error:`, err);
    }
  }

  function hooks(hooks: string[]) {
    return hooks.reduce(async (promise, cmd) => {
      await promise;
      return step(cmd);
    }, Promise.resolve());
  }

  async function checkBranch() {
    if (!(await execa('git branch')).stdout.includes(`* ${config.branch}`)) {
      error(`Branch error! expected: ${config.branch}`);
      return false;
    }
    return true;
  }

  async function getFilterPackages() {
    const { packages } = WORKSPACE;
    const { value } = await prompt({
      type: 'checkbox',
      name: 'value',
      message: 'Select the package you need to update',
      choices: packages
        .filter((pkg) => !config.sync.includes(pkg.packageJson.name))
        .map((pkg) => ({ name: `${pkg.packageJson.name}@${pkg.packageJson.version}`, value: pkg.relativeDir }))
    });
    return packages.filter((pkg) => value.includes(pkg.relativeDir));
  }

  function parseVersion(version: string): number[] {
    const handle = version;
    return handle.split('.').map((val) => parseInt(val, 10));
  }

  function isUpdateVersion(version: Version) {
    return prompt({
      type: 'confirm',
      name: 'value',
      message: `Do you want to update ${version} version?`,
      default: false
    });
  }

  async function genVersion() {
    if ((await isUpdateVersion(/* pkg.packageJson.name,  */ 'Major')).value)
      return (version: number[]) => `${version[0] + 1}.0.0`;
    if ((await isUpdateVersion('Minor')).value) return (version: number[]) => `${version[0]}.${version[1] + 1}.0`;
    return (version: number[]) => `${version[0]}.${version[1]}.${version[2] + 1}`;
  }

  function setVersion(pkg: Package) {
    writeFileSync(resolve(pkg.dir, 'package.json'), JSON.stringify(pkg.packageJson), 'utf-8');
    log(`New version: ${pkg.packageJson.name}@${[pkg.packageJson.version]}`);
  }

  async function setVersions(pkgs: Package[]) {
    const getVersion = await genVersion();
    const mainPkg = getTargetPackage(config.main, pkgs);
    if (mainPkg) {
      config.sync.forEach((pkgName) => {
        const pkg = getTargetPackage(pkgName, WORKSPACE.packages);
        if (!pkg) return;
        pkg.packageJson.version = mainPkg.packageJson.version;
        pkgs.push(pkg);
      });
      if (WORKSPACE.rootPackage) pkgs.push(WORKSPACE.rootPackage);
    }
    pkgs.forEach((pkg) => {
      const pkgJson = pkg.packageJson;
      pkgJson.version = getVersion(parseVersion(pkg.packageJson.version));
      setVersion(pkg);
    });
  }

  async function handleGit(version: string) {
    if ((await execa('git tag -l')).stdout.includes(version)) {
      error(`Error: tag ${version} already exists`);
    }
    await step('git add .');
    await step(`git commit -m "release: ${version}"`);
    await step(`git tag v${version}`);
  }

  function publishPackages(pkgs: Package[]) {
    return pkgs.reduce(async (promise, pkg) => {
      await promise;
      return step('pnpm publish --access public', undefined, { cwd: pkg.dir });
    }, Promise.resolve());
  }

  /* Main Program */
  /* Step: check branch */
  if (!(await checkBranch())) return;

  /* Step: update version */
  const packages = await getFilterPackages();
  if (packages.length === 0) {
    log(`No package selected`);
  }
  await setVersions(packages);

  /* Lifecycle: beforeAddcommit */
  log('Run eslint, prettier and conventional-changelog...');
  await hooks(config.hooks.beforeAddcommit);

  /* Step: spawn tag */
  const mainPkg = getTargetPackage(config.main, packages);
  if (mainPkg) {
    await handleGit(mainPkg.packageJson.version);
    log('Adding tag...');
    /* Step: zip main package */
    const answer = await prompt({
      type: 'confirm',
      name: 'value',
      message: 'Do you need zip main package?',
      default: true
    });
    if (answer.value) await step('pnpm pack --pack-destination', [ROOT_DIR], { cwd: mainPkg.dir });
  }

  /* Step: push to remote branch */
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'push',
      message: 'Do you need push to remote branch?',
      default: true
    },
    {
      type: 'confirm',
      name: 'publish',
      message: 'Do you need publish all updated package?',
      default: true
    }
  ]);
  const pushCommand = `git push ${config.remote} ${config.branch} ${mainPkg ? '--tags' : ''}`;
  if (answer.push) await step(pushCommand);

  /* Step: checkout registry and publish */
  if (answer.publish) {
    log('Publish...');
    const originRegistry = (await execa('pnpm config get registry')).stdout;
    await execa('pnpm config set registry', [config.registry ?? originRegistry]);
    await publishPackages(packages.filter((pkg) => pkg.packageJson.private !== true));
    await execa(`pnpm config set registry`, [originRegistry]);
  }

  /* ending */
  if (!answer.push) log(`\nPlease enter "${pushCommand}"`);
  log(`All ok!`);
})();
