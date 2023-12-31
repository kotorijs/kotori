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
  sync: ['@kotori-bot/core'],
  include: '{packages,modules}/*/src/*.{ts,tsx}',
  hooks: {
    beforeAddcommit: ['pnpm run eslint', 'pnpm run format', 'pnpm run version'],
  },
};

const ROOT_DIR = resolve(__dirname, '../');

type Version = 'Major' | 'Minor' | 'Patch';

type Option = {
  cwd: string;
};

(async () => {
  const { prompt } = (await import('inquirer')).default;
  const { execa } = await import('execa');

  function getTargetPackage(pkgs: Package[], pkgName: string = config.main) {
    const filterPackages = pkgs.filter(pkg => pkg.packageJson.name === pkgName);
    if (filterPackages.length === 0) return null;
    return filterPackages[0];
  }

  async function getFilterPackages(dir: string = ROOT_DIR) {
    const { packages, rootPackage } = getPackagesSync(dir);
    const { value } = await prompt({
      type: 'checkbox',
      name: 'value',
      message: 'Select the package you need to update',
      choices: packages
        .filter(pkg => !config.sync.includes(pkg.packageJson.name))
        .map(pkg => ({ name: pkg.packageJson.name, value: pkg.relativeDir })),
    });
    const filterPackages = packages.filter(pkg => value.includes(pkg.relativeDir));
    const mainPkgJson = getTargetPackage(filterPackages)?.packageJson;
    if (!mainPkgJson) return filterPackages;
    /* Sync packages version by main package */
    config.sync.forEach(async pkgName => {
      const pkg = getTargetPackage(packages, pkgName);
      if (!pkg) return;
      pkg.packageJson.version = mainPkgJson.version;
      filterPackages.push(pkg);
    });
    if (!rootPackage) return filterPackages;
    rootPackage.packageJson.version = mainPkgJson.version;
    filterPackages.push(rootPackage);
    return filterPackages;
  }

  async function isUpdateVersion(pkgName: string, version: Version): Promise<boolean> {
    return (
      await prompt({
        type: 'confirm',
        name: 'value',
        message: `For ${pkgName} : update ${version} version?`,
        default: false,
      })
    ).value;
  }

  function setVersion(pkg: Package) {
    writeFileSync(resolve(pkg.dir, 'package.json'), JSON.stringify(pkg.packageJson), 'utf-8');
  }

  async function getVersion(pkg: Package) {
    const version = pkg.packageJson.version.split('.');
    if (await isUpdateVersion(pkg.packageJson.name, 'Major')) return `v${version[0] + 1}.0.0`;
    if (await isUpdateVersion(pkg.packageJson.name, 'Minor')) return `v${version[0]}.${version[1] + 1}.0`;
    return `v${version[0]}.${version[1]}.${version[2] + 1}`;
  }

  function publishPackages(pkgs: Package[]) {
    return new Promise(resolve => {
      pkgs.forEach(async (pkg, index) => {
        await step('pnpm publish --access --access public', undefined, { cwd: pkg.dir });
        if (index === pkgs.length - 1) resolve(undefined);
      });
    });
  }

  async function step(cmd: string, args?: string[], option: Option = { cwd: ROOT_DIR }, print: boolean = false) {
    try {
      const entity = await execa(cmd, args, option);
      const { stdout, stderr } = entity;
      if (stderr) error('Error:', stderr, `\nAt "${cmd}"`);
      log(print ? `Result: ${stdout}` : `Success: ${cmd}`);
    } catch (err) {
      error('Run Error:', error, `\nAt "${cmd}"`);
    }
  }

  function hooks(hooks: string[]) {
    return new Promise(resolve => {
      hooks.forEach(async (cmd, index) => {
        await step(cmd);
        if (index === hooks.length - 1) resolve(undefined);
      });
    });
  }

  /* Main Program */
  /* Step: check branch */
  if (!(await execa('git branch')).stdout.includes(`* ${config.branch}`)) {
    error(`Branch error! expected: ${config.branch}`);
    return;
  }

  /* Step: update version */
  const packages = await getFilterPackages();
  if (packages.length === 0) {
    log(`No package selected`);
  }
  packages.forEach(async pkg => {
    const handle = pkg;
    handle.packageJson.version = await getVersion(pkg);
    try {
      setVersion(handle);
    } catch (e) {
      error(`Error: write failed at package ${pkg.packageJson.name}`);
    }
  });
  log('Update version and write successful');

  /* Lifecycle: beforeAddcommit */
  await hooks(config.hooks.beforeAddcommit);

  const answer = await prompt([
    {
      type: 'confirm',
      name: 'push',
      message: 'Do you need push to remote branch?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'publish',
      message: 'Do you need publish all updated package?',
      default: true,
    },
  ]);
  const mainPkg = getTargetPackage(packages);
  if (mainPkg) {
    /* Step: spawn tag */
    const mainVersion = `v${mainPkg.packageJson.version}`;
    if ((await execa('git tag -l')).stdout.includes(mainVersion)) {
      console.error(`Error: tag ${mainVersion} already exists`);
    }
    await step('git add .');
    await step(`git commit -m "release: ${mainVersion}"`);
    await step(`git tag ${mainVersion}`);
    /* Step: zip main package */
    const answer = await prompt({
      type: 'confirm',
      name: 'value',
      message: 'Do you need zip main package?',
      default: true,
    });
    if (answer.value) await step('pnpm pack', undefined, { cwd: mainPkg.dir });
  }

  /* Step: push to remote branch */
  const pushCommand = `git push ${config.remote} ${config.branch} ${mainPkg ? '--tags' : ''}`;
  if (answer.push) step(pushCommand);

  /* Step: checkout registry and publish */
  const originRegistry = (await execa('pnpm config get registry')).stdout.replace(/(\n)|(\r)/g, '');
  await execa(`pnpm config set registry "${config.registry}"`);
  await publishPackages(packages);
  await execa(`pnpm config set registry "${originRegistry}"`);

  /* ending */
  if (!answer.push) log(`\nPlease enter "${pushCommand}"`);
  log(`All ok!`);
})();
