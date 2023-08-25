import fs from 'fs';
import path from 'path';
import { CONST, formatTime } from '../function';
import { Console, obj } from '../type';

export class Logger {
	private static colorList: obj<string> = {
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

	private static prefixColor = 'blue';

	private static logsFilePath = CONST.LOGS_PATH;

	private static originalLog = (
		__console: Console,
		type: string,
		typeColor: keyof typeof this.colorList,
		textColor: keyof typeof this.colorList,
		args: unknown[],
	) => {
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

		const time = formatTime();
		__console(
			`${this.colorList[this.prefixColor]}${time}${this.colorList.default}`,
			`[${this.colorList[typeColor]}${type}${this.colorList.default}]${this.colorList[textColor]}`,
			...args,
			this.colorList.default,
		);

		// Write Logs
		const logFile: string = path.join(this.logsFilePath, `${formatTime(null, 1)}.log`);
		if (!fs.existsSync(logFile)) {
			fs.writeFileSync(logFile, '');
		}
		const content: string = `${time} ${type} ${message}`;
		fs.appendFileSync(logFile, `${content}\n`);
	};

	public static log = (__console: Console, ...args: unknown[]) => {
		this.originalLog(__console, 'LOG', 'cyan', 'white', args);
	};

	public static info = (__console: Console, ...args: unknown[]) => {
		this.originalLog(__console, 'INFO', 'green', 'bright', args);
	};

	public static warn = (__console: Console, ...args: unknown[]) => {
		this.originalLog(__console, 'WARM', 'yellow', 'yellow', args);
	};

	public static error = (__console: Console, ...args: unknown[]) => {
		this.originalLog(__console, 'ERROR', 'red', 'red', args);
	};
}

export default Logger;
