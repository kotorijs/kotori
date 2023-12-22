import { ElementsParam, none } from 'kotori-bot';

export const CmdElements: ElementsParam = {
	at(target) {
		return `@${target} `;
	},
	image(url) {
		return `[image,${url}]`;
	},
	voice(url) {
		return `[voice,${url}]`;
	},
	video(url) {
		return `[video,${url}]`;
	},
	face(id) {
		return `[face,${id}]`;
	},
	file(data) {
		none(data);
		return `[file]`;
	},
};

export default CmdElements;
