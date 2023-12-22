import { ElementsParam, none } from 'kotori-bot';

/* 



function cq(type: MessageCqType, data: obj<string|number>) {
    return `[CQ:${type},data]`
} 

const image = ;
const at = (qq: EventDataTargetId) => `[CQ:at,qq=${qq}]`;
const poke = (qq: EventDataTargetId) => `[CQ:poke,qq=${qq}]`;

 interface OneBotApiExtra {
	type: 'onebot';
	image: typeof image;
	at: typeof at;
	poke: typeof poke;
}

declare module 'kotori-bot' {
	interface ApiExtra {
		onebot: OneBotApiExtra;
	}
}
*/ 

export const OneBotElements: ElementsParam = {
	at(target) {
		return `[CQ:at,qq=${target}]`;
	},
	image(url) {
		return `[CQ:image,file=${url},cache=0]`;
	},
	voice(url) {
		return `[CQ:voice,file=${url}]`;
	},
	video(url) {
		return `[CQ:video,file=${url}]`;
	},
	face(id) {
		return `[CQ:face,id=${id}]`;
	},
	file(data) {
		return `[CQ:file,file=${data}]`;
	},
};

export default OneBotElements;