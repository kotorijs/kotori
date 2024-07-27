import fs from 'node:fs'
import path from 'node:path'
import TOML from '@iarna/toml'
import YAML from 'yaml'
import type { JsonMap } from '../types'
import { type ExecException, type ExecOptions, exec } from 'node:child_process'

type ConfigFileType = 'json' | 'toml' | 'yaml' | 'yml' /* | 'xml' | 'ini'  */ | 'text'

export const configFileType = ['json', 'toml', 'yaml', 'yml', 'text'] as const

export function loadConfig<T extends ConfigFileType = 'json'>(
  filename: string,
  type: T = 'json' as T,
  init: (T extends 'text' ? string : object) | undefined = undefined
): T extends 'text' ? string : JsonMap {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true })

  const isExists = fs.existsSync(filename)
  const defaultValue = type === 'text' ? String(init ?? '') : JSON.stringify(init ?? {})
  if (!isExists && init !== undefined) fs.writeFileSync(filename, defaultValue)

  const data = isExists ? fs.readFileSync(filename).toString() : defaultValue
  if (['yaml', 'yml'].includes(type)) return YAML.parse(data)
  if (type === 'toml') return TOML.parse(data) as T extends 'text' ? string : JsonMap
  if (type === 'text') return data as T extends 'text' ? string : JsonMap

  return JSON.parse(data)
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
  let content = ''
  if (typeof data === 'object') {
    switch (type) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        break
      case 'yaml':
        content = YAML.stringify(data)
        break
      case 'toml':
        content = TOML.stringify(data as JsonMap)
        break
      default:
        content = String(data)
    }
  } else {
    content = String(data)
  }

  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true })
  fs.writeFileSync(filename, content)
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
  let content = ''

  if (!fs.existsSync(filename)) {
    if (type === 'json') content = JSON.stringify(data)
    if (type === 'yaml') content = YAML.stringify(data)
    fs.writeFileSync(filename, content)
  }
}

export function supportTs() {
  try {
    require(path.resolve(__dirname, '../../testing.ts'))
    return true
  } catch {
    return false
  }
}

/**
 * Executes a command as a child process and streams its output.
 *
 * @param command - The command to execute
 * @returns A Promise that resolves with the ChildProcess object
 */
export function executeCommand(
  command: string,
  options: ExecOptions,
  callback: (error?: ExecException | null, stdout?: string, stderr?: string) => void
) {
  const child = exec(command, options, (error) => callback(error))
  if (child.stdout) child.stdout.on('data', (data) => callback(undefined, data))
  if (child.stderr) child.stderr.on('data', (data) => callback(undefined, undefined, data))
  return child
}
