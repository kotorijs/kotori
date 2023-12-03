import { ArrayValue, ObjectArrayValue, ObjectValue, none } from '@kotori-bot/tools';
import Message from './message';
import Command from './command';

function internalFactory<T extends object | unknown[]>(target: T) {
	function instance(key: string | number, readonly?: boolean): ObjectArrayValue<T>;
	function instance(key?: undefined, readonly?: boolean): T;
	function instance(key: unknown, readonly?: boolean) {
		const result = key === undefined ? target : target[key as keyof T];
		return readonly && typeof result === 'object' ? Object.create(result) : result;
	}
	return instance;
}

export class Internal extends Message {
	private getModules(id?: string, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.moduleStack)(undefined, readonly)
			: internalFactory(this.moduleStack)(id, readonly);
	}

	private setModules(id: number, value: ArrayValue<typeof this.moduleStack>) {
		internalFactory(this.moduleStack)(undefined)[id] = value;
	}

	private getAdapters(id?: string, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.adapterStack)(undefined, readonly)
			: internalFactory(this.adapterStack)(id, readonly);
	}

	private setAdapters(id: string, value: ObjectValue<typeof this.adapterStack>) {
		internalFactory(this.adapterStack)(undefined)[id] = value;
	}

	private getBots(id?: string, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.botStack)(undefined, readonly)
			: internalFactory(this.botStack)(id, readonly);
	}

	private setBots(id: string, value: ObjectValue<typeof this.botStack>) {
		internalFactory(this.botStack)(undefined, false)[id] = value;
	}

	private getCommands(id?: number, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.commandStack)(undefined, readonly)
			: internalFactory(this.commandStack)(id, readonly);
	}

	private setCommands(id: number, value: ArrayValue<typeof this.commandStack>) {
		internalFactory(this.commandStack)(undefined, false)[id] = value;
	}

	private getCommandData(id?: number, readonly: boolean = true) {
		none(this);
		return id === undefined
			? internalFactory(Command.dataList)(undefined, readonly)
			: internalFactory(Command.dataList)(id, readonly);
	}

	private setCommandData(id: number, value: ArrayValue<typeof Command.dataList>) {
		none(this);
		internalFactory(Command.dataList)(undefined, false)[id] = value;
	}

	private getMidwares(id?: number, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.midwareStack)(undefined, readonly)
			: internalFactory(this.midwareStack)(id, readonly);
	}

	private setMidwares(id: number, value: ArrayValue<typeof this.midwareStack>) {
		internalFactory(this.midwareStack)(undefined, false)[id] = value;
	}

	private getRegexps(id?: number, readonly: boolean = true) {
		return id === undefined
			? internalFactory(this.regexpStack)(undefined, readonly)
			: internalFactory(this.regexpStack)(id, readonly);
	}

	private setRegexps(id: number, value: ArrayValue<typeof this.regexpStack>) {
		internalFactory(this.regexpStack)(undefined, false)[id] = value;
	}

	public readonly internal = {
		getModules: this.getModules,
		setModules: this.setModules,
		getAdapters: this.getAdapters,
		setAdapters: this.setAdapters,
		getBots: this.getBots,
		setBots: this.setBots,
		getCommands: this.getCommands,
		setCommands: this.setCommands,
		getCommandData: this.getCommandData,
		setCommandData: this.setCommandData,
		getMidwares: this.getMidwares,
		setMidwares: this.setMidwares,
		getRegexps: this.getRegexps,
		setRegexps: this.setRegexps,
	};
}

export default Internal;
