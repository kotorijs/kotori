import type { EventType, EventCallback, EventLists } from '../types';
import Core from './core';

type EventBeforeKeys<T> = T extends `before_${infer U}` ? U : never;

export class Events extends Core {
	private eventStack: EventLists = [];

	public emit<T extends keyof EventType>(type: T, data: Omit<EventType[T], 'type'>) {
		const session = Object.assign(data, { type }) as unknown as EventType[T];
		this.eventStack.filter(el => el.type === type).forEach(el => el.callback(session));
	}

	public on<T extends keyof EventType>(type: T, callback: EventCallback<T>) {
		// if (this.eventStack.filter(el => el.callback === callback && el.type === type).length > 0) return false;
		this.eventStack.push({ type, callback: callback as EventCallback<keyof EventType> });
	}

	public before<T extends EventBeforeKeys<keyof EventType>>(type: T, callback: EventCallback<`before_${T}`>) {
		this.on(`before_${type}`, callback);
	}

	public once<T extends keyof EventType>(type: T, callback: EventCallback<T>) {
		const removeSelf: EventCallback<T> = data => {
			const handleArr = this.eventStack.filter(el => el.type !== type && el.callback !== removeSelf);
			this.eventStack = handleArr;
			callback(data);
		};
		this.on(type, removeSelf);
	}

	public off<T extends keyof EventType>(type: T, callback: EventCallback<T>) {
		const handleArr = this.eventStack.filter(el => el.callback !== callback && el.type !== type);
		// if (this.eventStack.length === handleArr.length) return false;
		this.eventStack = handleArr;
	}

	public offAll<T extends keyof EventType>(type: T) {
		const handleArr = this.eventStack.filter(el => el.type !== type);
		// if (this.eventStack.length === handleArr.length) return false;
		this.eventStack = handleArr;
	}
}

export default Events;
