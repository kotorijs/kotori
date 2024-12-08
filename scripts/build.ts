import { type Package, getPackages } from '@manypkg/get-packages'
import type { Options } from 'tsup'
import shell from 'shelljs'
import path from 'node:path'
import picomatch from 'picomatch'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const CWD = process.cwd()

function merge<T extends object>(...objects: T[]): T {
  return Object.assign({}, ...objects)
}

enum BuildType {
  Tsup = 0,
  ReScript = 1,
  None = 2
}

// 配置类型定义
interface BuildConfig {
  buildOptions: Record<string, Options>
  include: string[]
  exclude: string[]
  silent: boolean
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
  include: [],
  exclude: [],
  silent: process.argv.some((arg) => arg === '--silent')
}

// biome-ignore lint:
function getFileJson(filepath: string): Partial<Record<string, any>> {
  if (!existsSync(filepath)) return {}
  const str = readFileSync(filepath, 'utf-8')
  try {
    return JSON.parse(str)
  } catch (e) {
    throw new Error(`Parse Error at ${filepath}: ${String(e)}`)
  }
}

// 生成 banner 内容
function generateBanner(pkg: Package['packageJson'] & { author: string | string[]; license: string }): string {
  return `
/**
 * @Package ${pkg?.name ?? 'unknown'}
 * @Version ${pkg?.version ?? 'unknown'}
 * @Author ${Array.isArray(pkg?.author) ? pkg.author.join(', ') : pkg?.author ?? ''}
 * @Copyright 2024 Hotaru. All rights reserved.
 * @License ${pkg?.license ?? 'GPL-3.0'}
 * @Link https://github.com/kotorijs/kotori
 * @Date ${new Date().toLocaleString()}
 */
`
}

// 获取用户配置
function loadConfig(): BuildConfig {
  return defaultConfig
}

// 检查工作区根目录
function ensureWorkspaceRoot(): void {
  if (!existsSync(path.join(CWD, 'pnpm-workspace.yaml'))) {
    console.error('Please run this script from workspace root directory')
    shell.exit(1)
  }
}

// 匹配器工具函数
function isMatch(patterns: string | string[], input: string): boolean {
  return picomatch(patterns)(input)
}

// 判断包是否匹配过滤器
function matchesFilter(pkg: Package, filter?: string): boolean {
  if (!filter || filter === '*') return true
  if (filter.startsWith('./')) {
    // 路径匹配
    const [filterPath, pkgPath] = [path.resolve(CWD, filter), path.resolve(CWD, pkg.dir)]
    return pkgPath.startsWith(filterPath) || isMatch(filterPath, pkgPath)
  }
  // 包名匹配
  return isMatch(filter, pkg.packageJson.name)
}

// 判断是否使用 tsup 构建
function getBuildType(pkg: Package, config: BuildConfig): BuildType {
  const hasRescript = existsSync(path.join(pkg.dir, 'rescript.json'))

  if (hasRescript) {
    return config.include.some((pattern) => isMatch(pattern, pkg.packageJson.name))
      ? BuildType.Tsup
      : BuildType.ReScript
  }

  return config.exclude.some((pattern) => isMatch(pattern, pkg.packageJson.name)) ? BuildType.None : BuildType.Tsup
}

// 获取包的构建配置

function getBuildConfig(pkg: Package, config: BuildConfig): Options {
  const baseConfig = config.buildOptions['*'] || {}
  const [tsconfig, _] = ['tsconfig.json', 'package.json'].map((file) => getFileJson(path.join(pkg.dir, file)))

  // 构建入口配置，保持相对路径结构
  const pkgConfig: Options = {
    outDir: tsconfig?.compilerOptions?.outDir ?? './dist',
    banner: {
      // biome-ignore lint:
      js: generateBanner(pkg.packageJson as any)
    }
  }
  const matchingConfigs = Object.entries(config.buildOptions)
    .filter(([pattern]) => pattern !== '*' && isMatch(pattern, pkg.packageJson.name))
    .map(([, config]) => config)
  const options = merge(baseConfig, pkgConfig, ...matchingConfigs)
  return options
}

async function buildPackageByTsup(pkg: Package, config: BuildConfig): Promise<void> {
  shell.cd(pkg.dir)
  const cfg = getBuildConfig(pkg, config)
  writeFileSync(path.resolve(CWD, 'tsup.config.json'), JSON.stringify(cfg, null, 2))
  if (shell.exec('pnpm exec tsup', { silent: config.silent }).code !== 0) {
    throw new Error(`Failed to build ${pkg.packageJson.name}`)
  }
  rmSync(path.resolve(CWD, 'tsup.config.json'))
  shell.cd(CWD)
}

async function buildPackageByReScript(pkg: Package, config: BuildConfig): Promise<void> {
  shell.cd(pkg.dir)
  if (shell.exec('pnpm exec rescript', { silent: config.silent }).code !== 0) {
    throw new Error(`Failed to build ${pkg.packageJson.name} with rescript`)
  }
  shell.cd(CWD)
}

// 主构建函数
async function build(filter?: string) {
  try {
    ensureWorkspaceRoot()
    const config = loadConfig()
    if (config.silent) globalThis.console.log = () => {}

    const { packages } = await getPackages(CWD)
    const packagesToBuild = packages.filter((pkg) => matchesFilter(pkg, filter))

    if (packagesToBuild.length === 0) {
      console.log('No packages matched the filter criteria')
      return
    }

    console.log(`Building ${packagesToBuild.length} packages...`)
    await Promise.all(
      packagesToBuild.map((pkg) => {
        switch (getBuildType(pkg, config)) {
          case BuildType.Tsup:
            console.log(`Building ${pkg.packageJson.name} ...`)
            return buildPackageByTsup(pkg, config)
          // return Promise.resolve()
          case BuildType.ReScript:
            console.log(`Building ${pkg.packageJson.name} with rescript...`)
            return buildPackageByReScript(pkg, config)
          // return Promise.resolve()
          default:
            console.log(`Skipping ${pkg.packageJson.name}...`)
            return Promise.resolve()
        }
      })
    )

    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error)
    shell.exit(1)
  }
}

// 命令行参数处理
build(process.argv[2])

export { build }
