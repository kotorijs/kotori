import { type Package, getPackagesSync } from '@manypkg/get-packages'
import type { Options } from 'tsup'
import shell from 'shelljs'
import path from 'node:path'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { setMaxListeners } from 'node:events'
import { CWD, ensureWorkspaceRoot, matchesFilter } from './common'
import { isMatch } from 'picomatch'

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

function generateBanner(
  template: string,
  pkg: Package['packageJson'] & { author: string | string[]; license: string }
): string {
  return Object.entries({
    name: pkg.name ?? '',
    version: pkg.version ?? '',
    author: Array.isArray(pkg.author) ? pkg.author.join(', ') : pkg.author ?? '',
    license: pkg.license ?? 'BAN-ZHINESE-USING',
    date: new Date().toLocaleTimeString()
  }).reduce((acc, [key, value]) => acc.replaceAll(`%${key}%`, value), template)
}

function getBuildType(pkg: Package, config: BuildConfig): BuildType {
  const hasRescript = existsSync(path.join(pkg.dir, 'rescript.json'))

  if (hasRescript) {
    return config.include.some((pattern) => isMatch(pattern, pkg.packageJson.name))
      ? BuildType.Tsup
      : BuildType.ReScript
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
      // biome-ignore lint:
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
  shell.cd(pkg.dir)
  const tsupFile = path.resolve(CWD, 'tsup.config.json')
  try {
    const cfg = getBuildConfig(pkg, config)
    if (cfg.outDir && existsSync(cfg.outDir)) rmSync(cfg.outDir, { recursive: true })
    writeFileSync(tsupFile, JSON.stringify(cfg, null, 2))
    if (!config.onlyTypes && shell.exec('pnpm exec tsup', { silent: config.silent }).code !== 0) {
      throw new Error(`Failed to build ${pkg.packageJson.name}`)
    }

    const isMainPack = pkg.packageJson.name === 'kotori-bot'
    if ((config.types || config.onlyTypes) && (!pkg.dir.includes('packages') || isMainPack)) {
      const child = shell.exec('tsc --build', {}, () => {})
      if (!config.silent) process.stdin.on('data', (data) => child.stdin?.write(data))
      await new Promise((resolve, reject) =>
        child.on('exit', (code) =>
          code === 0 ? resolve(null) : reject(new Error(`Failed to build ${pkg.packageJson.name} types`))
        )
      )
    }
    state.succeed += 1
  } catch (err) {
    state.failed += 1
    console.error(err)
    if (!config.ignoreError) shell.exit(1)
  } finally {
    if (existsSync(tsupFile)) rmSync(tsupFile)
    shell.cd(CWD)
  }
}

async function buildPackageByReScript(pkg: Package, config: BuildConfig): Promise<void> {
  shell.cd(pkg.dir)
  try {
    if (shell.exec('pnpm exec rescript', { silent: config.silent }).code !== 0) {
      throw new Error(`Failed to build ${pkg.packageJson.name} with rescript`)
    }
    state.succeed += 1
  } catch (err) {
    state.failed += 1
    console.error(err)
    if (!config.ignoreError) shell.exit(1)
  } finally {
    shell.cd(CWD)
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
    await Promise.all(
      pkgs.map((pkg) => {
        switch (getBuildType(pkg, config)) {
          case BuildType.Tsup:
            console.log(`Building ${pkg.packageJson.name} ...`)
            return buildPackageByTsup(pkg, config)
          // return Promise.resolve()
          case BuildType.ReScript:
            if (config.onlyTypes) {
              console.log(`Skiped to build ${pkg.packageJson.name} with rescript`)
              return
            }
            console.log(`Building ${pkg.packageJson.name} with rescript...`)
            return buildPackageByReScript(pkg, config)
          // return Promise.resolve()
          default:
            console.log(`Skipping ${pkg.packageJson.name}...`)
            return Promise.resolve()
        }
      })
    )

    console.log(
      `Build summary: ${state.succeed} succeed, ${state.failed} failed, ${pkgs.length - state.succeed - state.failed} skipped, in ${(Date.now() - start) / 1000}s.`
    )
    shell.exit(0)
  } catch (error) {
    console.error('Build failed:', error)
    shell.exit(1)
  }
}
