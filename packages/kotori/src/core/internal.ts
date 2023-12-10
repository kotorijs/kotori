import { ArrayValue, ObjectValue, none } from '@kotori-bot/tools';
import Message from './message';
import Command from './command';

function internalFactory<T extends object | unknown[]>(target: T) {
	return (readonly?: boolean): T => (readonly && typeof target === 'object' ? Object.create(target) : target);
}

export class Internal extends Message {
	private getModules(readonly: boolean = true) {
		return internalFactory(this.moduleStack)(readonly);
	}

	private setModules(key: number, value: ArrayValue<typeof this.moduleStack>) {
		this.moduleStack[key] = value;
	}

	private getAdapters(readonly: boolean = true) {
		return internalFactory(this.adapterStack)(readonly);
	}

	private setAdapters(key: string, value: ObjectValue<typeof this.adapterStack>) {
		this.adapterStack[key] = value;
	}

	private getBots(readonly: boolean = true) {
		return internalFactory(this.botStack)(readonly);
	}

	private setBots(key: string, value: ObjectValue<typeof this.botStack>) {
		this.botStack[key] = value;
	}

	private getCommands(readonly: boolean = true) {
		return internalFactory(this.commandStack)(readonly);
	}

	private setCommands(key: number, value: ArrayValue<typeof this.commandStack>) {
		this.commandStack[key] = value;
	}

	private getCommandData(readonly: boolean = true) {
		none(this);
		return internalFactory(Command.dataList)(readonly);
	}

	private setCommandData(key: number, value: ArrayValue<typeof Command.dataList>) {
		none(this);
		Command.dataList[key] = value;
	}

	private getMidwares(readonly: boolean = true) {
		return internalFactory(this.midwareStack)(readonly);
	}

	private setMidwares(key: number, value: ArrayValue<typeof this.midwareStack>) {
		this.midwareStack[key] = value;
	}

	private getRegexps(readonly: boolean = true) {
		return internalFactory(this.regexpStack)(readonly);
	}

	private setRegexps(key: number, value: ArrayValue<typeof this.regexpStack>) {
		this.regexpStack[key] = value;
	}

	public get internal() {
		const getModules: typeof this.getModules = readonly => this.getModules(readonly);
		const setModules: typeof this.setModules = (key, value) => this.setModules(key, value);
		const getAdapters: typeof this.getAdapters = readonly => this.getAdapters(readonly);
		const setAdapters: typeof this.setAdapters = (key, value) => this.setAdapters(key, value);
		const getBots: typeof this.getBots = readonly => this.getBots(readonly);
		const setBots: typeof this.setBots = (key, value) => this.setBots(key, value);
		const getCommands: typeof this.getCommands = readonly => this.getCommands(readonly);
		const setCommands: typeof this.setCommands = (key, value) => this.setCommands(key, value);
		const getCommandData: typeof this.getCommandData = readonly => this.getCommandData(readonly);
		const setCommandData: typeof this.setCommandData = (key, value) => this.setCommandData(key, value);
		const getMidwares: typeof this.getMidwares = readonly => this.getMidwares(readonly);
		const setMidwares: typeof this.setMidwares = (key, value) => this.setMidwares(key, value);
		const getRegexps: typeof this.getRegexps = readonly => this.getRegexps(readonly);
		const setRegexps: typeof this.setRegexps = (key, value) => this.setRegexps(key, value);
		return {
			getModules,
			setModules,
			getAdapters,
			setAdapters,
			getBots,
			setBots,
			getCommands,
			setCommands,
			getCommandData,
			setCommandData,
			getMidwares,
			setMidwares,
			getRegexps,
			setRegexps,
		};
	}
}

export default Internal;
