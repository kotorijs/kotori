import fs from 'node:fs';
import path from 'node:path';
import TOML from '@iarna/toml';
import YAML from 'yaml';
import { JsonMap } from '../types';

type ConfigFileType = 'json' | 'toml' | 'yaml' /* | 'xml' | 'ini'  */ | 'text';

export function loadConfig<T extends ConfigFileType = 'json'>(
  filename: string,
  type: T = 'json' as T,
  init: (T extends 'text' ? string : JsonMap) | undefined = undefined
): T extends 'text' ? string : JsonMap {
  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

  const isExists = fs.existsSync(filename);
  const defaultValue = type === 'text' ? String(init ?? '') : JSON.stringify(init ?? {});
  if (!isExists && init !== undefined) fs.writeFileSync(filename, defaultValue);

  const data = isExists ? fs.readFileSync(filename).toString() : defaultValue;
  if (type === 'yaml') return YAML.parse(data);
  if (type === 'toml') return TOML.parse(data) as T extends 'text' ? string : JsonMap;
  if (type === 'text') return data as T extends 'text' ? string : JsonMap;

  return JSON.parse(data);
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
  let content = '';
  if (typeof data === 'object') {
    switch (type) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'yaml':
        content = YAML.stringify(data);
        break;
      case 'toml':
        content = TOML.stringify(data as JsonMap);
        break;
      default:
        content = String(data);
    }
  } else {
    content = String(data);
  }

  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
  fs.writeFileSync(filename, content);
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
  let content = '';

  if (!fs.existsSync(filename)) {
    if (type === 'json') content = JSON.stringify(data);
    if (type === 'yaml') content = YAML.stringify(data);
    fs.writeFileSync(filename, content);
  }
}
