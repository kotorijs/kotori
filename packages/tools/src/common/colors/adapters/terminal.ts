import { type ColorsAdapterImpl, colorsIdentity } from '../utils'

const replaceClose = (
  index: number,
  string: string,
  close: string,
  replace: string,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
): string => head + (next < 0 ? tail : replaceClose(next, tail, close, replace))

const clearBleed = (index: number, string: string, open: string, close: string, replace: string) =>
  index < 0 ? open + string + close : open + replaceClose(index, string, close, replace) + close

const filterEmpty =
  (open: string, close: string, replace = open, at = open.length + 1) =>
  (string: string) =>
    string || !(string === '' || string === undefined)
      ? clearBleed(
          // biome-ignore lint:
          ('' + string).indexOf(close, at),
          string,
          open,
          close,
          replace
        )
      : ''

const init = (open: number, close: number, replace?: string) => filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace)

export const colors = {
  reset: init(0, 0),
  bold: init(1, 22, '\x1b[22m\x1b[1m'),
  dim: init(2, 22, '\x1b[22m\x1b[2m'),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49)
}

class TerminalAdapterOrigin {
  public c: ColorsAdapterImpl = colors
}

export const TerminalAdapter = new Proxy(TerminalAdapterOrigin, {
  construct(target, argArray, newTarget) {
    const { c } = Reflect.construct(target, argArray, newTarget) as { c: ColorsAdapterImpl }
    const handleInstance: Record<string, (text: string) => string> = {}
    for (const key of colorsIdentity) handleInstance[key] = c[key].bind(c)
    return handleInstance
  }
}) as unknown as new () => ColorsAdapterImpl

export default TerminalAdapter
