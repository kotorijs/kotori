import { exec } from 'node:child_process'
import { setMaxListeners } from 'node:events'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { getPackagesSync, type Package } from '@manypkg/get-packages'
import { isMatch } from 'picomatch'
import shell from 'shelljs'
import type { Options } from 'tsup'
import { CWD, ensureWorkspaceRoot, matchesFilter } from './common'

enum BuildType {
  Tsup = 0,
  ReScript = 1,
  None = 2
}

interface BuildConfig {
  buildOptions: Record<string, Options>
  include: string[]
  exclude: string[]
  banner: string
  ignoreError: boolean
  types: boolean
  onlyTypes: boolean
  silent: boolean
}

const state = {
  succeed: 0,
  failed: 0
}

function execAsync(cmd: string, cwd: string, silent: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (!silent) {
        if (stdout) process.stdout.write(stdout)
        if (stderr) process.stderr.write(stderr)
      }
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let currentIndex = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++
      results[idx] = await fn(items[idx])
    }
  })
  await Promise.all(workers)
  return results
}

const defaultConfig: BuildConfig = {
  buildOptions: {
    '*': {
      clean: true,
      // dts: true,
      entryPoints: ['./src'],
      bundle: false
      // format: ['cjs', 'esm'],
      // target: 'es2020',
      // sourcemap: true,
    }
  },
  banner: '',
  include: [],
  exclude: [],
  ignoreError: false,
  types: false,
  onlyTypes: false,
  silent: false
}

function generateBanner(template: string, pkg: Package['packageJson'] & { author: string | string[]; license: string }): string {
  return Object.entries({
    name: pkg.name ?? '',
    version: pkg.version ?? '',
    author: Array.isArray(pkg.author) ? pkg.author.join(', ') : (pkg.author ?? ''),
    license: pkg.license ?? 'GPL-3.0',
    date: new Date().toLocaleString()
  }).reduce((acc, [key, value]) => acc.replaceAll(`%${key}%`, value), template)
}

function getBuildType(pkg: Package, config: BuildConfig): BuildType {
  const hasRescript = existsSync(path.join(pkg.dir, 'rescript.json'))

  if (hasRescript) {
    return config.include.some((pattern) => isMatch(pattern, pkg.packageJson.name)) ? BuildType.Tsup : BuildType.ReScript
  }

  return config.exclude.some((pattern) => isMatch(pattern, pkg.packageJson.name)) ? BuildType.None : BuildType.Tsup
}

function getBuildConfig(pkg: Package, config: BuildConfig): Options {
  const baseConfig = config.buildOptions['*'] || {}
  const [tsconfig, _] = ['tsconfig.json', 'package.json'].map((file) => {
    const filepath = path.join(pkg.dir, file)
    if (!existsSync(filepath)) return {}
    const str = readFileSync(filepath, 'utf-8')
    try {
      return JSON.parse(str)
    } catch (e) {
      throw new Error(`Parse Error at ${filepath}: ${String(e)}`)
    }
  })

  const pkgConfig: Options = {
    outDir: tsconfig?.compilerOptions?.outDir ?? './dist',
    banner: {
      // biome-ignore lint: *
      js: generateBanner(config.banner, pkg.packageJson as any)
    }
  }
  const matchingConfigs = Object.entries(config.buildOptions)
    .filter(([pattern]) => pattern !== '*' && isMatch(pattern, pkg.packageJson.name))
    .map(([, config]) => config)
  const options = { ...baseConfig, ...pkgConfig, ...matchingConfigs }
  return options
}

async function buildPackageByTsup(pkg: Package, config: BuildConfig): Promise<void> {
  const tsupFile = path.resolve(pkg.dir, 'tsup.config.json')
  try {
    const cfg = getBuildConfig(pkg, config)
    if (cfg.outDir && existsSync(path.resolve(pkg.dir, cfg.outDir))) {
      rmSync(path.resolve(pkg.dir, cfg.outDir), { recursive: true })
    }
    writeFileSync(tsupFile, JSON.stringify(cfg, null, 2))
    if (!config.onlyTypes) {
      await execAsync('pnpm exec tsup', pkg.dir, config.silent)
    }

    const isCorePackage = pkg.dir.replace(/\\/g, '/').includes('/packages/')
    if ((config.types || config.onlyTypes) && !isCorePackage) {
      await execAsync('pnpm exec tsc --build', pkg.dir, config.silent)
    }
    state.succeed += 1
  } catch (err) {
    state.failed += 1
    console.error(`Failed to build ${pkg.packageJson.name}:`, err)
    if (!config.ignoreError) process.exit(1)
  } finally {
    if (existsSync(tsupFile)) rmSync(tsupFile)
  }
}

async function buildPackageByReScript(pkg: Package, config: BuildConfig): Promise<void> {
  try {
    await execAsync('pnpm exec rescript', pkg.dir, config.silent)
    state.succeed += 1
  } catch (err) {
    state.failed += 1
    console.error(`Failed to build ${pkg.packageJson.name} with rescript:`, err)
    if (!config.ignoreError) process.exit(1)
  }
}

export default async function build(initConfig: Partial<BuildConfig>, filters?: string) {
  const start = Date.now()
  try {
    ensureWorkspaceRoot()
    const config: BuildConfig = {
      ...defaultConfig,
      ...initConfig,
      buildOptions: { ...defaultConfig.buildOptions, ...initConfig.buildOptions }
    }

    if (config.silent) globalThis.console.log = () => {}

    const pkgs = ((pkgs) => pkgs)(getPackagesSync(CWD).packages.filter((pkg) => matchesFilter(pkg, filters)))

    if (pkgs.length === 0) {
      console.log('No packages matched the filter criteria')
      return
    }

    if (config.onlyTypes || config.types) {
      pkgs
        .map((pkg) => path.join(pkg.dir, 'tsconfig.tsbuildinfo'))
        .filter(existsSync)
        .map((file) => rmSync(file))
    }

    console.log(`Building ${pkgs.length} packages...`)
    setMaxListeners(Number.POSITIVE_INFINITY)

    const isCorePackage = (pkg: Package) => pkg.dir.replace(/\\/g, '/').includes('/packages/')
    const corePkgs = pkgs.filter(isCorePackage)
    const modulePkgs = pkgs.filter((pkg) => !isCorePackage(pkg))

    const buildPkg = (pkg: Package) => {
      switch (getBuildType(pkg, config)) {
        case BuildType.Tsup:
          console.log(`Building ${pkg.packageJson.name} ...`)
          return buildPackageByTsup(pkg, config)
        case BuildType.ReScript:
          if (config.onlyTypes) {
            console.log(`Skiped to build ${pkg.packageJson.name} with rescript`)
            return Promise.resolve()
          }
          console.log(`Building ${pkg.packageJson.name} with rescript...`)
          return buildPackageByReScript(pkg, config)
        default:
          console.log(`Skipping ${pkg.packageJson.name}...`)
          return Promise.resolve()
      }
    }

    // Build packages/* first
    if (corePkgs.length > 0) {
      if (config.types || config.onlyTypes) {
        // Build packages JS in layered topological concurrency
        const layer0 = ['fluoro', '@kotori-bot/i18n', '@kotori-bot/tools']
        const layer1 = ['@kotori-bot/logger']
        const layer2 = ['@kotori-bot/core']
        const layer3 = ['@kotori-bot/loader']
        const layer4 = ['kotori-bot']

        const findPkg = (name: string) => corePkgs.find((p) => p.packageJson.name === name)

        for (const layer of [layer0, layer1, layer2, layer3, layer4]) {
          const currentPkgs = layer.map(findPkg).filter(Boolean) as Package[]
          await Promise.all(currentPkgs.map(buildPkg))
        }

        // Force compile all packages types via tsc in correct dependency order
        await execAsync(
          'pnpm exec tsc --build --force packages/fluoro/tsconfig.json packages/i18n/tsconfig.json packages/tools/tsconfig.json packages/logger/tsconfig.json packages/core/tsconfig.json packages/loader/tsconfig.json packages/kotori/tsconfig.json',
          CWD,
          config.silent
        )
      } else {
        await Promise.all(corePkgs.map(buildPkg))
      }
    }

    // Then build modules/* with concurrency pool (16 parallel workers)
    await mapConcurrent(modulePkgs, 16, buildPkg)

    console.log(
      `Build summary: ${state.succeed} succeed, ${state.failed} failed, ${pkgs.length - state.succeed - state.failed} skipped, in ${(Date.now() - start) / 1000}s.`
    )
    shell.exit(0)
  } catch (error) {
    console.error('Build failed:', error)
    shell.exit(1)
  }
}
