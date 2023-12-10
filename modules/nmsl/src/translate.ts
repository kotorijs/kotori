import nmsl from './nmsl';

interface EmoticonMap {
	[key: string]: string;
}

export default class Translate {
	public result = '';

  /* 抽象成都 */
  public score = 0

	private emoticons: EmoticonMap;

	constructor(text: string, emoticons: EmoticonMap = nmsl) {
		this.emoticons = emoticons;
		this.convert(text);
	}

	private convert(text: string) {
		this.result = text;
		Object.keys(this.emoticons).forEach(key => {
			this.result = this.result.replace(new RegExp(key, 'g'), this.emoticons[key]);
	  })
  }
}
