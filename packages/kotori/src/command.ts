import { CommandAccess, CommandAction, CommandArgType, CommandArgTypeSign, CommandConfig, CommandData } from './types';

const parseTemplateParam = (content: string) => {
	const { '0': root, '1': defaultValue } = content.split('=');
	const { '0': argName, '1': argType } = root.split(':');
	let handleDefault: CommandArgType | undefined = defaultValue || undefined;
	let handleArg: CommandArgTypeSign = 'string';
	if (argType === 'number') {
		handleArg = argType;
		if (handleDefault !== undefined) handleDefault = parseInt(handleDefault, 10);
	}
	return {
		name: argName || 'content',
		type: handleArg,
		default: handleDefault,
	};
};

export class Command {
	public static commandDataStack: CommandData[] = [];

	public constructor(template: string, config?: CommandConfig) {
		this.template = template;
		this.data = Object.assign(this.data, config);
		Command.commandDataStack.push(this.data);
		this.parseTemplate();
	}

	private template: string;

	public readonly data: CommandData = {
		root: '',
		alias: [],
		scope: 'all',
		access: 'member',
		args: [],
		options: [],
	};

	private requiredParamMatch = /<(.*?)>/g;

	private optionalParamMatch = /\[(.*?)]/g;

	private parseTemplate = () => {
		const { '0': root, '1': description } = this.template
			.trim()
			.replace(/\s{2,}/g, ' ')
			.split(' - ');
		this.data.description = description;
		const requiredIndex = root.indexOf(' <');
		const optionalIndex = root.indexOf(' [');
		let requiredStr = '';
		let optionalStr = '';
		if (requiredIndex > 0) {
			this.data.root = root.substring(0, requiredIndex);
			requiredStr = root.substring(requiredIndex);
			const newOptionalIndex = requiredStr.indexOf(' [');
			if (newOptionalIndex > 0) {
				optionalStr = requiredStr.substring(newOptionalIndex);
				requiredStr = requiredStr.substring(0, newOptionalIndex);
			}
		} else if (optionalIndex > 0) {
			this.data.root = root.substring(0, optionalIndex);
			optionalStr = root.substring(optionalIndex);
		} else {
			this.data.root = root;
		}

		[...requiredStr.matchAll(this.requiredParamMatch)].forEach(content => {
			this.data.args.push({ optional: false, ...parseTemplateParam(content[1]) });
		});
		[...optionalStr.matchAll(this.optionalParamMatch)].forEach(content => {
			this.data.args.push({ optional: true, ...parseTemplateParam(content[1]) });
		});
	};

	public readonly alias = (alias: string | string[]) => {
		if (typeof alias === 'string') this.data.alias.push(alias);
		else this.data.alias.push(...alias);
		return this;
	};

	public readonly scope = (scope: CommandConfig['scope']) => {
		this.data.scope = scope;
		return this;
	};

	public readonly access = (access: CommandAccess) => {
		this.data.access = access;
		return this;
	};

	public readonly option = (name: string, template: string) => {
		const { '0': root, '1': description } = template.trim().split(' ');
		const handleData = parseTemplateParam(root);
		this.data.options.push({ realname: handleData.name, description, ...handleData, name });
		return this;
	};

	public readonly action = (callback: CommandAction) => {
		this.data.action = callback;
		return this;
	};

	public readonly help = (text: string) => {
		this.data.help = text;
		return this;
	};
}

export default Command;
