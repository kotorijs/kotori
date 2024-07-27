import type { I18n } from '@kotori-bot/i18n'
import { stringTemp } from '@kotori-bot/tools'
import type { CommandArgType } from '../types'

export function cancelFactory() {
  return {
    get() {
      return () => this.fn()
    },
    fn() {
      this.value = true
    },
    value: false
  }
}

export function formatFactory(i18n: I18n) {
  return (template: string, data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]) => {
    const params = data
    if (Array.isArray(params)) {
      let str = i18n.locale(template)
      params.forEach((value, index) => {
        if (value === undefined || value === null) return
        str = str.replaceAll(`{${index}}`, i18n.locale(typeof value === 'string' ? value : String(value)))
      })
      return str
    }
    for (const key of Object.keys(params)) {
      if (params[key] === undefined || params[key] === null) continue
      if (typeof params[key] !== 'string') params[key] = String(params[key])
      params[key] = i18n.locale(params[key] as string)
    }
    return stringTemp(i18n.locale(template), params as Record<string, string>)
  }
}
