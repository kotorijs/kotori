/* import fs from 'fs';
import path from 'path'; */
import { formatTime, initialize } from '@kotori-bot/tools';

export enum LoggerLevel {
	LOG,
	DEBUG,
}

interface ILogger {
	readonly log: (...args: unknown[]) => void;
	readonly info: (...args: unknown[]) => void;
	readonly warn: (...args: unknown[]) => void;
	readonly error: (...args: unknown[]) => void;
	readonly debug: (...args: unknown[]) => void;
}

interface LoggerOptions {
	prefixs: (string | (() => string))[];
	tags: string[];
}

export class Logger implements ILogger {
	private static colorList = {
		default: '\x1B[0m', // 默认
		bright: '\x1B[1m', // 亮色
		grey: '\x1B[2m', // 灰色
		italic: '\x1B[3m', // 斜体
		underline: '\x1B[4m', // 下划线
		reverse: '\x1B[7m', // 反向
		hidden: '\x1B[8m', // 隐藏
		black: '\x1B[30m', // 黑色
		red: '\x1B[31m', // 红色
		green: '\x1B[32m', // 绿色
		yellow: '\x1B[33m', // 黄色
		blue: '\x1B[34m', // 蓝色
		magenta: '\x1B[35m', // 品红
		cyan: '\x1B[36m', // 青色
		white: '\x1B[37m', // 白色
		blackBG: '\x1B[40m', // 背景色为黑色
		redBG: '\x1B[41m', // 背景色为红色
		greenBG: '\x1B[42m', // 背景色为绿色
		yellowBG: '\x1B[43m', // 背景色为黄色
		blueBG: '\x1B[44m', // 背景色为蓝色
		magentaBG: '\x1B[45m', // 背景色为品红
		cyanBG: '\x1B[46m', // 背景色为青色
		whiteBG: '\x1B[47m', // 背景色为白色
	};

	private static gobalPrefixs: LoggerOptions['prefixs'] = [];

	// private static logsFilePath = CONST.LOGS_PATH;

	@initialize
	protected static initPrefix() {
		this.prefix(() => formatTime(), 'blue', 'default');
	}

	private static handlePrefix = (prefixs: LoggerOptions['prefixs']) => {
		const handle: string[] = [];
		prefixs.forEach(element => {
			if (element instanceof Function) {
				handle.push(element());
				return;
			}
			handle.push(element);
		});
		return handle;
	};

	public static prefix = (
		content: string | (() => string),
		startColor: keyof typeof Logger.colorList,
		endColor: keyof typeof Logger.colorList,
	) => {
		this.gobalPrefixs.push(Logger.colorList[startColor], content, Logger.colorList[endColor]);
		return this;
	};

	public static print = (args: unknown[], level: LoggerLevel) => () => {
		if (process.env.log_level === LoggerLevel[LoggerLevel.DEBUG] && level !== LoggerLevel.DEBUG) return;

		let message: string = '';
		args.forEach(value => {
			let Element = value;
			if (Element && typeof Element === 'object') {
				Element = Element instanceof Error ? Element.toString() : JSON.stringify(Element);
			}
			if (typeof Element === 'string' && Element.length > 1000) Element = `${Element.substring(0, 999)}...`;
			message += `${Element} `;
			message.slice(0, -1);
		});

		console.log(...this.handlePrefix(this.gobalPrefixs), ...args, this.colorList.default);

		// Write Logs
		/* 		const logFile: string = path.join(this.logsFilePath, `${formatTime(null, 1)}.log`);
		if (!fs.existsSync(logFile)) {
			fs.writeFileSync(logFile, '');
		}
		const content: string = `${time} ${type} ${message}`;
		fs.appendFileSync(logFile, `${content}\n`); */
	};

	private prefixs: LoggerOptions['prefixs'] = [];

	private tags: string[] = [];

	public constructor(options?: LoggerOptions) {
		if (!options) return;
		this.prefixs = options.prefixs;
		this.tags = options.tags;
	}

	public prefix = (
		content: string | (() => string),
		startColor: keyof typeof Logger.colorList,
		endColor: keyof typeof Logger.colorList,
	) => {
		this.prefixs.push(Logger.colorList[startColor], content, Logger.colorList[endColor]);
		return this;
	};

	public tag = (tag: string, typeColor: keyof typeof Logger.colorList, textColor: keyof typeof Logger.colorList) => {
		this.tags.push(
			`[${Logger.colorList[typeColor]}${tag}${Logger.colorList.default}]${Logger.colorList[textColor]}`,
		);
		return this;
	};

	public extend = () => {
		const logger = new Logger({
			prefixs: this.prefixs,
			tags: Object.create(this.tags),
		});
		return logger;
	};

	public print = (args: unknown[], level: LoggerLevel) => {
		Logger.print([Logger.handlePrefix(this.prefixs), ...args], level);
	};

	public readonly log = (...args: unknown[]) => {
		const logger = new Logger();
		logger.tag('LOG', 'cyan', 'white').print([...this.prefixs, args], LoggerLevel.LOG);
	};

	public readonly info = (...args: unknown[]) => {
		const logger = new Logger();
		logger.tag('INFO', 'green', 'bright').print([...this.prefixs, args], LoggerLevel.LOG);
	};

	public readonly warn = (...args: unknown[]) => {
		const logger = new Logger();
		logger.tag('WARM', 'yellow', 'yellow').print([...this.prefixs, args], LoggerLevel.LOG);
	};

	public readonly error = (...args: unknown[]) => {
		const logger = new Logger();
		logger.tag('ERROR', 'red', 'red').print([...this.prefixs, args], LoggerLevel.LOG);
	};

	public readonly debug = (...args: unknown[]) => {
		const logger = new Logger();
		logger.tag('DEBUG', 'magenta', 'red').print([...this.prefixs, args], LoggerLevel.DEBUG);
	};
}

export default Logger;
