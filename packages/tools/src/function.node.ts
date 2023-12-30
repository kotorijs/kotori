import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { ConfigFileType } from './types';

export function loadConfig(
  filename: string,
  type: ConfigFileType = 'json',
  init: object | string = {},
  autoCreate: boolean = false,
): object | null | unknown[] | string {
  const dirname: string = path.dirname(filename);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
  const isExistsFile = fs.existsSync(filename);
  const defaultValue = typeof init === 'string' ? init : JSON.stringify(init);
  if (!isExistsFile && autoCreate) fs.writeFileSync(filename, defaultValue);
  const data = isExistsFile ? fs.readFileSync(filename).toString() : defaultValue;
  if (type === 'yaml') return YAML.parse(data);
  if (type === 'txt') return data;
  return JSON.parse(data);
}

export function saveConfig(filename: string, data: object | string, type: ConfigFileType = 'json'): void {
  let content: string = '';
  if (typeof data === 'object' && type === 'json') content = JSON.stringify(data);
  else if (typeof data === 'object' && type === 'yaml') content = YAML.stringify(data);
  else content = data as string;

  const dirname: string = path.dirname(filename);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

  fs.writeFileSync(filename, content);
}

export function createConfig(filename: string, data?: object, type: ConfigFileType = 'json'): void {
  let content: string = '';
  if (!fs.existsSync(filename)) {
    if (type === 'json') content = JSON.stringify(data);
    if (type === 'yaml') content = YAML.stringify(data);
    fs.writeFileSync(filename, content);
  }
}
