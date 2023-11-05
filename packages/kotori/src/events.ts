import { EventType, EventCallback, EventListenerFunc, EventList } from './types';
import Core from './core';

export class Events extends Core {
	private eventStack: EventList = {
		load_module: [],
		load_all_module: [],
		unload_module: [],
		connect: [],
		disconnect: [],
		ready: [],
		online: [],
		offline: [],
		midwares: [],
		before_command: [],
		command: [],
		before_send: [],
		send: [],
		private_msg: [],
		group_msg: [],
		private_recall: [],
		group_recall: [],
		group_increase: [],
		group_decrease: [],
		group_admin: [],
		group_ban: [],
		private_add: [],
		private_request: [],
		group_request: [],
	};

	private readonly addListener: EventListenerFunc = (type, callback) => {
		const eventStack = this.eventStack[type] as unknown[];
		if (eventStack.filter(Element => Element === callback).length > 0) return false;
		eventStack.push(callback);
		return true;
	};

	private readonly removeListener: EventListenerFunc = (type, callback) => {
		const eventStack = this.eventStack[type] as unknown[];
		const handleArr = eventStack.filter(Element => Element !== callback);
		if (eventStack.length === handleArr.length) return false;
		(this.eventStack[type] as unknown[]) = handleArr;
		return true;
	};

	private readonly removeAllListener: EventListenerFunc = type => {
		const eventStack = this.eventStack[type] as unknown[];
		if (eventStack.length === 0) return false;
		(this.eventStack[type] as unknown[]) = [];
		return true;
	};

	public readonly emit = <T extends keyof EventType>(EventData: EventType[T]) => {
		this.eventStack[EventData.type].forEach(callback => {
			(callback as EventCallback<T>)(EventData);
		});
	};

	public readonly on = this.addListener;

	public readonly once = <T extends keyof EventType>(type: T, callback: EventCallback<T>) => {
		const eventStack = this.eventStack[type] as unknown[];
		const newCallback: EventCallback<T> = data => {
			const index = eventStack.length;
			eventStack.slice(index, index);
			callback(data);
		};
		return this.addListener(type, newCallback);
	};

	public readonly off = this.removeListener;

	public readonly offAll = this.removeAllListener;
}

export default Events;
