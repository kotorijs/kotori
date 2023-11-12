import { EventType, EventCallback, EventListenerFunc, EventLists } from './types';
import Core from './core';

type EventBeforeKeys<T> = T extends `before_${infer U}` ? U : never;

export class Events extends Core {
	private eventStack: EventLists = [];

	public readonly emit = <T extends keyof EventType>(type: T, data: Omit<EventType[T], 'type'>) => {
		const eventData = Object.assign(data, { type }) as unknown as EventType[T];
		this.eventStack.filter(El => El.type === type).forEach(El => El.callback(eventData));
	};

	public readonly on: EventListenerFunc = (type, callback) => {
		if (this.eventStack.filter(El => El.callback === callback && El.type === type).length > 0) return false;
		this.eventStack.push({ type, callback: callback as EventCallback<keyof EventType> });
		return true;
	};

	public readonly before = <T extends EventBeforeKeys<keyof EventType>>(
		type: T,
		callback: EventCallback<`before_${T}`>,
	) => {
		const result = this.on(`before_${type}`, callback);
		return result;
	};

	public readonly once = <T extends keyof EventType>(type: T, callback: EventCallback<T>) => {
		const removeSelf: EventCallback<T> = data => {
			const handleArr = this.eventStack.filter(El => El.type !== type && El.callback !== removeSelf);
			this.eventStack = handleArr;
			callback(data);
		};
		return this.on(type, removeSelf);
	};

	public readonly off: EventListenerFunc = (type, callback) => {
		const handleArr = this.eventStack.filter(El => El.callback !== callback && El.type !== type);
		if (this.eventStack.length === handleArr.length) return false;
		this.eventStack = handleArr;
		return true;
	};

	public readonly offAll: EventListenerFunc = type => {
		const handleArr = this.eventStack.filter(El => El.type !== type);
		if (this.eventStack.length === handleArr.length) return false;
		this.eventStack = handleArr;
		return true;
	};
}

export default Events;
