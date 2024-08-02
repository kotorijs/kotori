import { resolve } from 'node:path'
import Decorators from './utils'

export * from './plugin'

export function plugins(plugin: string | string[] | { name: string }) {
  let pkgName: string
  if (!Array.isArray(plugin) && typeof plugin === 'object') {
    pkgName = plugin.name
  } else {
    pkgName = require(resolve(...(Array.isArray(plugin) ? plugin : [plugin]), 'package.json')).name
  }

  return new Decorators(pkgName)
}

export default plugins
