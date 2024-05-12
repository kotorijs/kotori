import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PLUGIN_PREFIX, Container } from '@kotori-bot/core';
import Decorators from './utils';

export function plugins(plugin: string | string[] | { name: string }) {
  let pkgName: string;
  if (!Array.isArray(plugin) && typeof plugin === 'object') {
    pkgName = plugin.name;
  } else {
    pkgName = JSON.parse(
      readFileSync(resolve(...(Array.isArray(plugin) ? plugin : [plugin]), 'package.json')).toString()
    ).name;
  }
  const pluginName = pkgName.split(PLUGIN_PREFIX)[1] ?? pkgName;
  const ctx = Container.getInstance().extends(undefined, pluginName);
  return new Decorators(ctx);
}

export default plugins;
