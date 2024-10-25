import { saveConfig } from 'kotori-bot'

export function createAutoSave<T extends object>(
  target: T,
  file: string,
  type?: 'json' | 'toml' | 'yaml',
  master?: object
): T {
  return new Proxy(target, {
    get: (target, prop, receiver) => {
      const value = Reflect.get(target, prop, receiver)
      return value && (typeof value === 'object' || Array.isArray(value))
        ? createAutoSave(value, file, type, master ?? target)
        : value
    },
    set: (target, prop, newValue, receiver) => {
      const result = Reflect.set(target, prop, newValue, receiver)
      saveConfig(file, master ?? target, type ?? 'json')
      return result
    }
  })
}

export default createAutoSave
