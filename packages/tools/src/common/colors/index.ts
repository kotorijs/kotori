import { TerminalAdapter } from './adapters'
import BrowserAdapter from './adapters/browser'
import { type ColorsAdapterImpl, type ColorsConfig, type ColorsCustomRules, colorsIdentity } from './utils'

export * from './adapters'
export * from './utils'

export class Colors<T extends string = ''> {
  protected readonly customRules: ColorsCustomRules<T>

  public readonly c: ColorsAdapterImpl

  public constructor(config: ColorsAdapterImpl | ColorsConfig<T>) {
    if ('adapter' in config) {
      this.c = config.adapter
      this.customRules = config.rules ?? ({} as ColorsCustomRules<T>)
    } else {
      this.c = config
      this.customRules = {} as ColorsCustomRules<T>
    }
  }

  public parse(text: string) {
    const allColors = [...colorsIdentity, ...Object.keys(this.customRules), 'clear']
    const colorStack: string[] = []
    let result = ''
    let currentText = ''

    const applyColor = () => {
      if (currentText) {
        for (let i = colorStack.length - 1; i >= 0; i--) {
          currentText = this.dye(currentText, colorStack[i] as keyof T)
        }
        result += currentText
        currentText = ''
      }
    }

    const regex = new RegExp(`(<(${allColors.join('|')})>|</(${allColors.join('|')})>|([^<]+))`, 'g')
    let match = regex.exec(text)

    while (match !== null) {
      if (match[2]) {
        // Opening tag
        applyColor()
        colorStack.push(match[2])
      } else if (match[3]) {
        // Closing tag
        applyColor()
        const lastColor = colorStack.pop()
        if (lastColor !== match[3]) continue
      } else if (match[4]) {
        // Text content
        currentText += match[4]
      }
      match = regex.exec(text)
    }

    applyColor() // Apply colors to any remaining text

    return result
  }

  public batch(batches: string[]) {
    return batches.map((batch) => this.parse(batch))
  }

  public dye(text: string, color: (typeof colorsIdentity)[number] | 'clear' | keyof T) {
    if (color in this.c) return this.c[color as (typeof colorsIdentity)[number]](text)
    if (color in this.customRules) return this.customRules[color as keyof ColorsCustomRules<T>](text)
    return this.clear(text)
  }

  public clear(text: string) {
    this.clear.toString()
    return text.replace(/* html */ /<clear>(.*?)<\/clear>/g, '$1')
  }
}

export namespace Colors {
  export function createColor<T extends string>(config: ConstructorParameters<typeof Colors<T>>[0]) {
    return new Colors<T>(config)
  }

  const instance = createColor({ adapter: !globalThis.document ? new TerminalAdapter() : new BrowserAdapter() })

  export const parse = instance.parse.bind(instance)
  export const batch = instance.batch.bind(instance)
  export const dye = instance.dye.bind(instance)
  export const clear = instance.clear.bind(instance)
}

export default Colors
