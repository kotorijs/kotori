import { type ColorsAdapterImpl, colorsIdentity } from '../utils'
import type { colors } from './terminal'

const cssStyles = {
  reset: 'color:inherit; background-color:inherit;',
  bold: 'font-weight:bold;',
  dim: 'opacity:0.5;',
  italic: 'font-style:italic;',
  underline: 'text-decoration:underline;',
  inverse: 'color:#ffffff; background-color:#000000;',
  hidden: 'visibility:hidden;',
  strikethrough: 'text-decoration:line-through;',
  black: 'color:#000000;',
  red: 'color:#FF0000;',
  green: 'color:#00FF00;',
  yellow: 'color:#FFFF00;',
  blue: 'color:#0000FF;',
  magenta: 'color:#FF00FF;',
  cyan: 'color:#00FFFF;',
  white: 'color:#FFFFFF;',
  gray: 'color:#808080;',
  bgBlack: 'background-color:#000000;',
  bgRed: 'background-color:#FF0000;',
  bgGreen: 'background-color:#00FF00;',
  bgYellow: 'background-color:#FFFF00;',
  bgBlue: 'background-color:#0000FF;',
  bgMagenta: 'background-color:#FF00FF;',
  bgCyan: 'background-color:#00FFFF;',
  bgWhite: 'background-color:#FFFFFF;',
  blackBright: 'color:#1C1C1C;',
  redBright: 'color:#FF5555;',
  greenBright: 'color:#55FF55;',
  yellowBright: 'color:#FFFF55;',
  blueBright: 'color:#5555FF;',
  magentaBright: 'color:#FF55FF;',
  cyanBright: 'color:#55FFFF;',
  whiteBright: 'color:#BBBBBB;',
  bgBlackBright: 'background-color:#1C1C1C;',
  bgRedBright: 'background-color:#FF5555;',
  bgGreenBright: 'background-color:#55FF55;',
  bgYellowBright: 'background-color:#FFFF55;',
  bgBlueBright: 'background-color:#5555FF;',
  bgMagentaBright: 'background-color:#FF55FF;',
  bgCyanBright: 'background-color:#55FFFF;',
  bgWhiteBright: 'background-color:#BBBBBB;'
} as const

class BrowserAdapterOrigin {
  public list: typeof cssStyles

  public constructor(options?: Partial<typeof cssStyles>) {
    this.list = { ...cssStyles, ...options }
  }

  public dye(color: (typeof colorsIdentity)[number]) {
    return (text: string) => /* html */ `<span style="${this.list[color]}">${text}</span>`
  }
}

export const BrowserAdapter = new Proxy(BrowserAdapterOrigin, {
  construct(target, argArray, newTarget) {
    const instance = Reflect.construct(target, argArray, newTarget) as BrowserAdapterOrigin
    const handleInstance: Record<string, (text: string) => string> = {}
    for (const key of colorsIdentity) handleInstance[key] = instance.dye(key)
    return handleInstance
  }
}) as unknown as new (
  options?: Parameters<(typeof colors)[keyof typeof colors]>[0]
) => ColorsAdapterImpl

export default BrowserAdapter
