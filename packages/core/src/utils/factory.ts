import type { I18n } from '@kotori-bot/i18n'
import { stringTemp } from '@kotori-bot/tools'
import type { CommandArgType, Message, MessageMapping } from '../types'
import { MessageList, MessageSingle, Messages } from '../components'

/**
 * Create a format function base on i18n instance
 * @param i18n - i18n instance
 * @returns - format function
 */
export function formatFactory(i18n: I18n) {
  function format(
    template: string,
    data: Record<string, CommandArgType | undefined> | (CommandArgType | undefined)[]
  ): string

  function format<T extends keyof MessageMapping>(
    template: string,
    data: (Message<T> | CommandArgType | undefined)[]
  ): MessageList<T | 'text'>

  function format<T extends keyof MessageMapping>(
    template: string,
    data: Record<string, Message | CommandArgType | undefined> | (Message<T> | CommandArgType | undefined)[]
  ): string | MessageList<T | 'text'> {
    if (!Array.isArray(data)) {
      for (const key of Object.keys(data)) {
        if (data[key] === undefined || data[key] === null) continue
        if (typeof data[key] !== 'string') data[key] = String(data[key])
        data[key] = i18n.locale(data[key] as string)
      }
      return stringTemp(i18n.locale(template), data as Record<string, string>)
    }

    const isPureString = (Array.isArray(data) ? data : Object.values(data)).every(
      (value) => !(value instanceof MessageList || value instanceof MessageSingle)
    )

    const parts = i18n.locale(template).split(/(\{[0-9]+\})/)
    const result: (Message | string)[] = []
    let currentString = ''

    for (const part of parts) {
      if (part === undefined || part === null) continue
      if (!part.match(/^\{[0-9]+\}$/)) {
        currentString += part
        continue
      }
      const index = Number.parseInt(part.slice(1, -1), 10)
      const value = data[index]
      if (value === undefined || value === null) continue

      if (value instanceof MessageList || value instanceof MessageSingle) {
        if (currentString) {
          result.push(currentString)
          currentString = ''
        }
        result.push(value)
      } else {
        currentString += String(value)
      }
    }

    if (currentString) result.push(currentString)
    return isPureString ? result.join('') : (Messages(...result) as MessageList<T | 'text'>)
  }

  return format
}
