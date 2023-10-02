import { initialize } from '@kotori-bot/tools';
import { eventCallback, eventType } from './events';
import Modules from './modules';
import Api from './api';

export type Msg = string;
export type MsgType = 'private' | 'group';

type messageCallback = eventCallback<'group_msg' | 'private_msg'>;
type midwareCallback = (data: eventType['group_msg' | 'private_msg'], next: () => void) => void | Msg;

interface ImidwareStack<C = midwareCallback, D = number> {
	extend: string;
	callback: C;
	data: D;
}

interface IcommandStack extends ImidwareStack<messageCallback, object> {}

interface IregexpStack extends ImidwareStack<messageCallback, RegExp> {}

export class Message extends Modules {
	private static readonly midwareStack: ImidwareStack[] = [];

	private static readonly commandStack: IcommandStack[] = [];

	private static readonly regexpStack: IregexpStack[] = [];

	private static readonly handleEvent: messageCallback = data => {
		/* Handle middle wares */
		const midwareStack: ImidwareStack[] = Object.create(this.midwareStack);
		let lastMidwareNum = -1;
		while (midwareStack.length > 0) {
			if (lastMidwareNum === midwareStack.length) return;
			lastMidwareNum = midwareStack.length;
			const result = midwareStack[0].callback(data, () => midwareStack.shift());
			if (result) data.send(result);
		}

		/* Handle command and regexo */
		/* 		this.commandStack.forEach(callback => {
			const result = callback(data);
			if (result) data.send(result);
		});
		this.regexpStack.forEach(callback => {
			const result = callback(data);
			if (result) data.send(result);
		}); */
	};

	@initialize
	protected static registeEvent() {
		this.addListener('group_msg', this.handleEvent);
		this.addListener('private_msg', this.handleEvent);
		this.addListener('unload_module', data => {
			if (!data.module) return;
			const superArr = [...this.midwareStack, ...this.commandStack, ...this.regexpStack];
			for (const indexOf of Object.keys(superArr)) {
				const index = parseInt(indexOf, 10);
				const element = superArr[index];
				if (element.extend === data.module.mainPath) delete superArr[index];
			}
		});
	}

	public static readonly midware = (callback: midwareCallback, data: number = 100) => {
		if (this.midwareStack.filter(Element => Element.callback === callback).length) return false;
		this.midwareStack.push({ callback, data, extend: this.getModuleCurrent() });
		this.midwareStack.sort((first, second) => first.data - second.data);
		return true;
	};

	public static readonly command = (format: string) => {};

	public static readonly regexp = (match: RegExp) => {};

	public static readonly boardcasst = (type: MsgType, message: Msg) => {
		const send =
			type === 'private'
				? (api: Api) => api.send_private_msg(message, 1)
				: (api: Api) => api.send_group_msg(message, 1);
		Object.values(this.apiStack).forEach(apis => {
			apis.forEach(api => send(api));
		});
	};

	public static readonly notify = (message: Msg) => {};
}

export default Message;
