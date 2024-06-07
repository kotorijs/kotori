import { plugins, SessionData, KotoriPlugin } from 'kotori-bot';
import { colorToRGB, loadJapaneseColor, loadZhinaColor, randomFromArray } from './utils';

const plugin = plugins([__dirname, '../']);

@plugin.import
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
class ColorPlugin extends KotoriPlugin {
  @plugin.lang
  public static lang = [__dirname, '../locales'];

  @plugin.command({
    template: 'color [value] - color.descr.color',
    options: [['H', 'help:boolean - color.option.color']]
  })
  public static color(
    { args: [color], options: { help } }: { args: [string]; options: { help: boolean } },
    session: SessionData
  ) {
    if (help) return ['color.msg.help', [session.api.adapter.config['command-prefix']]];
    if (!color) return session.el.image('https://api.hotaru.icu/api/color');

    const rgb = colorToRGB(color.toLocaleLowerCase());
    if (!rgb) return ['color.msg.color.error', [session.api.adapter.config['command-prefix']]];

    return session.el.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`);
  }

  @plugin.command({ template: 'color-jp [value] - color.descr.color_jp' })
  public static colorJp({ args: [color] }: { args: [string?] }, session: SessionData) {
    const colorData = loadJapaneseColor();
    let data;
    if (color) {
      const rgb = colorToRGB(color);
      const handle = color.toUpperCase();
      data = colorData.find(
        (item) => item.name === handle || item.romaji === handle || item.rgb.join(',') === rgb?.join(',')
      );
    } else {
      data = randomFromArray(colorData);
    }
    if (!data) return ['color.msg.color.error2', [session.api.adapter.config['command-prefix']]];

    const { rgb } = data;
    const image = session.el.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`);
    return ['color.msg.color_jp', [data.name, data.romaji, image]];
  }

  @plugin.command({ template: 'color-cn [value] - color.descr.color_cn' })
  public static colorCn({ args: [color] }: { args: [string?] }, session: SessionData) {
    const colorData = loadZhinaColor();
    let data;
    if (color) {
      const rgb = colorToRGB(color);
      data = colorData.find(
        (item) => item.name === color || item.traName === color || item.rgb.join(',') === rgb?.join(',')
      );
    } else {
      data = randomFromArray(colorData);
    }
    if (!data) return ['color.msg.color.error2', [session.api.adapter.config['command-prefix']]];

    const { rgb } = data;
    const image = session.el.image(`https://api.hotaru.icu/api/color?r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`);
    return ['color.msg.color_cn', [data.name, data.pinyin, data.description ?? '', image]];
  }
}
