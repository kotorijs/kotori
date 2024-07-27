import { createColors } from 'colorette'
import { type ColorsAdapterImpl, colorsIdentity } from '../utils'

class TerminalAdapterOrigin {
  public c: ColorsAdapterImpl

  public constructor(options?: Parameters<typeof createColors>[0]) {
    this.c = createColors(options)
  }
}

export const TerminalAdapter = new Proxy(TerminalAdapterOrigin, {
  construct(target, argArray, newTarget) {
    const { c } = Reflect.construct(target, argArray, newTarget) as { c: ColorsAdapterImpl }
    const handleInstance: Record<string, (text: string) => string> = {}
    for (const key of colorsIdentity) handleInstance[key] = c[key].bind(c)
    return handleInstance
  }
}) as unknown as new (
  options?: Parameters<typeof createColors>[0]
) => ColorsAdapterImpl

export default TerminalAdapter
