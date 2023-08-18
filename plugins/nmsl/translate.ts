import nmsl from './nmsl';

interface EmoticonMap {
	[key: string]: string;
}

export default class Translate {
	public result: string = '';

	private emoticons: EmoticonMap;

	constructor(text: string, emoticons: EmoticonMap = nmsl) {
		this.emoticons = emoticons;
		this.convert(text);
	}

	private convert(text: string) {
		this.result = text;
		for (const key in this.emoticons) {
			if (!key) continue;
			this.result = this.result.replace(new RegExp(key, 'g'), this.emoticons[key]);
		}
	}
}
