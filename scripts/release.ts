#!/usr/bin/env ts-node

import { Package, getPackagesSync } from '@manypkg/get-packages';
import { error, log } from 'console';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const config = {
  branch: 'master',
  remote: 'origin',
  // registry: 'https://registry.npmjs.org/',
  main: 'kotori-bot',
  root: '@kotori-bot/root',
  sync: ['@kotori-bot/core'],
  include: '{packages,modules}/*/src/*.{ts,tsx}',
  hooks: {
    beforeAddcommit: [
      'pnpm run lint',
      'pnpm run format',
      'pnpm run version',
      'prettier --config .prettierrc "{{packages,modules}/*/package.json,package.json}" --write',
    ],
  },
};

const ROOT_DIR = resolve(__dirname, '../');
const WORKSPACE = getPackagesSync(ROOT_DIR);
const MAIN_PACKAGE = getTargetPackage(config.main, WORKSPACE.packages);

function getTargetPackage(pkgName: string, pkgs: Package[]) {
  const filterPackages = pkgs.filter(pkg => pkg.packageJson.name === pkgName);
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
    const entity = await execa(cmd, args, option);
    const { stdout, stderr } = entity;
    if (stderr) error('Error:', stderr, `\nAt "${cmd}"`);
    log(print ? `Result: ${stdout}` : `Success: ${cmd}`);
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
        .filter(pkg => !config.sync.includes(pkg.packageJson.name))
        .map(pkg => ({ name: `${pkg.packageJson.name}@${pkg.packageJson.version}`, value: pkg.relativeDir })),
    });
    return packages.filter(pkg => value.includes(pkg.relativeDir));
  }

  function parseVersion(version: string): number[] {
    let handle = version;
    if (handle.startsWith('v') || handle.startsWith('V')) handle = handle.substring(1);
    return handle.split('.').map(val => parseInt(val, 10));
  }

  function isUpdateVersion(pkgName: string, version: Version) {
    return prompt({
      type: 'confirm',
      name: 'value',
      message: `For ${pkgName} : update ${version} version?`,
      default: false,
    });
  }

  async function getVersion(pkg: Package) {
    const version = parseVersion(pkg.packageJson.version);
    if ((await isUpdateVersion(pkg.packageJson.name, 'Major')).value) return `v${version[0] + 1}.0.0`;
    if ((await isUpdateVersion(pkg.packageJson.name, 'Minor')).value) return `v${version[0]}.${version[1] + 1}.0`;
    return `v${version[0]}.${version[1]}.${version[2] + 1}`;
  }

  function setVersion(pkg: Package) {
    writeFileSync(resolve(pkg.dir, 'package.json'), JSON.stringify(pkg.packageJson), 'utf-8');
    log(`New version: ${pkg.packageJson.name}@${[pkg.packageJson.version]}`);
  }

  async function setVersions(pkgs: Package[]) {
    const mainPkg = getTargetPackage(config.main, pkgs);
    if (mainPkg) {
      pkgs.push(
        ...(config.sync
          .map(pkgName => getTargetPackage(pkgName, WORKSPACE.packages))
          .filter(pkg => !!pkg) as Package[]),
      );
      if (WORKSPACE.rootPackage) pkgs.push(WORKSPACE.rootPackage);
    }
    const res = await Promise.all(
      pkgs.map(async pkg => {
        const handle = pkg;
        /* Sync packages version by main package */
        if (
          config.sync.includes(pkg.packageJson.name) ||
          pkg.packageJson.name === WORKSPACE.rootPackage?.packageJson.name
        ) {
          handle.packageJson.version = MAIN_PACKAGE!.packageJson.version;
          return handle;
        }
        handle.packageJson.version = await getVersion(pkg);
        if (handle.packageJson.name === config.main) MAIN_PACKAGE!.packageJson.version = handle.packageJson.version;
        return handle;
      }),
    );
    res.forEach(pkg => setVersion(pkg));
  }

  async function handleGit(version: string) {
    if ((await execa('git tag -l')).stdout.includes(version)) {
      error(`Error: tag ${version} already exists`);
    }
    await step('git add .');
    await step(`git commit -m "release: ${version}"`);
    await step(`git tag ${version}`);
  }

  function publishPackages(pkgs: Package[]) {
    return pkgs.reduce(async (promise, pkg) => {
      await promise;
      return step('pnpm publish --access --access public', undefined, { cwd: pkg.dir });
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
  log('Run eslint and prettier...');
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
  const mainPkg = getTargetPackage(config.main, packages);
  if (mainPkg) {
    /* Step: spawn tag */
    log('Adding tag...');
    await handleGit(`v${mainPkg.packageJson.version}`);
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
  if (answer.push) await step(pushCommand);

  /* Step: checkout registry and publish */
  if (answer.publish) {
    log('Publish...');
    // const originRegistry = (await execa('pnpm config get registry')).stdout.replace(/(\n)|(\r)/g, '');
    // await execa(`pnpm config set registry "${config.registry}"`);
    await publishPackages(packages);
    // await execa(`pnpm config set registry "${originRegistry}"`);
  }
  /* ending */
  if (!answer.push) log(`\nPlease enter "${pushCommand}"`);
  log(`All ok!`);
})();
