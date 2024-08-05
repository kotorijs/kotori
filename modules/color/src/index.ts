import { plugins, type Session, KotoriPlugin, Messages } from 'kotori-bot'
import { colorToRGB, loadJapaneseColor, loadZhinaColor, randomFromArray } from './utils'

const plugin = plugins([__dirname, '../'])

@plugin.import
export class ColorPlugin extends KotoriPlugin {
  @plugin.lang
  public static lang = [__dirname, '../locales']

  @plugin.command({
    template: 'color [value] - color.descr.color',
    options: [['H', 'help:boolean - color.option.color']]
  })
  public color({ args: [color], options: { help } }: { args: [string]; options: { help: boolean } }, session: Session) {
    if (help) return session.format('color.msg.help', [session.api.adapter.config.commandPrefix])
    if (!color) return Messages.image('https://api.hotaru.icu/api/color')

    const rgb = colorToRGB(color.toLocaleLowerCase())
    if (!rgb) return session.format('color.msg.color.error', [session.api.adapter.config.commandPrefix])

    return Messages.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`)
  }

  @plugin.command({ template: 'color-jp [value] - color.descr.color_jp' })
  public colorJp({ args: [color] }: { args: [string?] }, session: Session) {
    const colorData = loadJapaneseColor()
    let data: (typeof colorData)[0] | undefined

    if (color) {
      const rgb = colorToRGB(color)
      const handle = color.toUpperCase()
      data = colorData.find(
        (item) => item.name === handle || item.romaji === handle || item.rgb.join(',') === rgb?.join(',')
      )
    } else {
      data = randomFromArray(colorData)
    }
    if (!data) return session.format('color.msg.color.error2', [session.api.adapter.config.commandPrefix])

    const { rgb } = data
    return Messages(
      session.format('color.msg.color_jp', [data.name, data.romaji]),
      Messages.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`)
    )
  }

  @plugin.command({ template: 'color-cn [value] - color.descr.color_cn' })
  public colorCn({ args: [color] }: { args: [string?] }, session: Session) {
    const colorData = loadZhinaColor()
    let data: (typeof colorData)[0] | undefined

    if (color) {
      const rgb = colorToRGB(color)
      data = colorData.find(
        (item) => item.name === color || item.traName === color || item.rgb.join(',') === rgb?.join(',')
      )
    } else {
      data = randomFromArray(colorData)
    }
    if (!data) return session.format('color.msg.color.error2', [session.api.adapter.config.commandPrefix])

    const { rgb } = data
    return Messages(
      session.format('color.msg.color_cn', [data.name, data.pinyin, data.description ?? '']),
      Messages.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`)
    )
  }
}
