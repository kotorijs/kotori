import nmsl from './nmsl';

interface EmoticonMap {
  [key: string]: string;
}

export class Translate {
  public result = '';

  public score = 0;

  private emoticons: EmoticonMap;

  public constructor(text: string, emoticons: EmoticonMap = nmsl) {
    this.emoticons = emoticons;
    this.convert(text);
  }

  private convert(text: string) {
    let lastResult = '';
    this.result = text;
    Object.keys(this.emoticons).forEach((key) => {
      lastResult = this.result;
      this.result = this.result.replace(new RegExp(key, 'g'), this.emoticons[key]);
      if (lastResult !== this.result) this.score += 1;
    });
  }
}

export default Translate;
