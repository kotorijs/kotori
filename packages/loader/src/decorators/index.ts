// import { readFileSync } from 'node:fs'
// import { resolve } from 'node:path'
import { none } from '@kotori-bot/core'
import Decorators from './utils'

export * from './plugin'

export function plugins(plugin: string | string[] | { name: string }) {
  // let pkgName: string;
  // if (!Array.isArray(plugin) && typeof plugin === 'object') {
  //   pkgName = plugin.name
  // } else {
  //   pkgName = JSON.parse(
  //     readFileSync(resolve(...(Array.isArray(plugin) ? plugin : [plugin]), 'package.json')).toString()
  //   ).name
  // }
  // const ctx = Container.getInstance().extends(undefined, pkgName);
  none(plugin)
  return new Decorators()
}

export default plugins
