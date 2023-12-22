import { none } from '@kotori-bot/tools';
import { ElementsParam, EventDataTargetId } from '../types';

const defaultMethod = (...args: unknown[]) => {
	none(...args);
	return '';
};

export class Elements {
	public constructor(data: ElementsParam) {
		this.at = data.at || defaultMethod;
		this.image = data.image || defaultMethod;
		this.voice = data.voice || defaultMethod;
		this.video = data.video || defaultMethod;
		this.face = data.face || defaultMethod;
		this.file = data.file || defaultMethod;
		this.supports = Object.keys(data);
	}

	public at: (target: EventDataTargetId, extra?: unknown) => string;

	public image: (url: string, extra?: unknown) => string;

	public voice: (url: string, extra?: unknown) => string;

	public video: (url: string, extra?: unknown) => string;

	public face: (id: number | string, extra?: unknown) => string;

	public file: (data: ArrayBuffer, extra?: unknown) => string;

	public supports: string[];
}

export default Elements;
