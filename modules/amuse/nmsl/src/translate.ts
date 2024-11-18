import nmsl from './nmsl'

interface EmoticonMap {
  [key: string]: string
}

export class Translate {
  private count = 0

  public result = ''

  public score = 0

  private emoticons: EmoticonMap

  public constructor(text: string, emoticons: EmoticonMap = nmsl) {
    this.emoticons = emoticons
    this.convert(text)
  }

  private convert(text: string) {
    let lastResult = ''
    this.result = text
    for (const key in this.emoticons) {
      lastResult = this.result
      this.result = this.result.replace(new RegExp(key, 'g'), this.emoticons[key])
      if (lastResult !== this.result) this.count += 1
    }
    this.score = (this.count / text.length) * 100
  }
}

export default Translate
