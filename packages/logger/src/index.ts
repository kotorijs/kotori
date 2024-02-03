/* import fs from 'fs';
import path from 'path'; */

import { formatTime, obj } from '@kotori-bot/tools';

export enum LoggerLevel {
  LOG,
  DEBUG
}

interface LoggerOptions {
  prefixs: (string | (() => string))[];
  tags: string[];
}

type color = keyof typeof Logger.colorList;

type prefixFunc<T = Logger> = (content: string | (() => string), startColor: color, endColor: color) => T;

export class Logger {
  static readonly colorList = {
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
    whiteBG: '\x1B[47m' // 背景色为白色
  };

  // private static logsFilePath = CONST.LOGS;

  private static handlePrefix(prefixs: LoggerOptions['prefixs']) {
    const handle: string[] = [];
    prefixs.forEach((element) => {
      if (element instanceof Function) {
        handle.push(element());
        return;
      }
      handle.push(element);
    });
    return handle;
  }

  protected static readonly prefixs: LoggerOptions['prefixs'] = [];

  static readonly prefix: prefixFunc = (content, startColor, endColor) => {
    this.prefixs.push(Logger.colorList[startColor], content, Logger.colorList[endColor]);
    return this;
  };

  /* whole logger need to feat */
  static print(args: unknown[], level: LoggerLevel) {
    if ((globalThis as unknown as { env_mode: string }).env_mode !== 'dev' && level === LoggerLevel.DEBUG) return;

    let message = '';
    args.forEach((value) => {
      let Element = value;
      if (Element && typeof Element === 'object') {
        const cache: obj[] = [];
        if (Element instanceof Error) {
          Element = Element.toString();
        } else {
          Element = JSON.stringify(Element, (key, value) => {
            if (typeof value !== 'object' || value === null) return value;
            if (cache.indexOf(value) === -1) return undefined;
            cache.push(value);
            return value;
          });
        }
      }
      if (typeof Element === 'string' && Element.length > 1000) Element = `${Element.substring(0, 999)}...`;
      message += `${Element} `;
      message.slice(0, -1);
    });
    console.log(...this.handlePrefix(this.prefixs), ...this.tags, ...args, this.colorList.default);
    // Write Logs
    /* 		const logFile: string = path.join(this.logsFilePath, `${formatTime(null, 1)}.log`);
		if (!fs.existsSync(logFile)) {
			fs.writeFileSync(logFile, '');
		}
		const content: string = `${time} ${type} ${message}`;
		fs.appendFileSync(logFile, `${content}\n`); */
  }

  private static Tags: string[] = [];

  private static get tags() {
    const tags = Object.create(this.Tags);
    this.Tags = [];
    return tags;
  }

  static tag(tag: string, typeColor: color, textColor: color) {
    this.Tags.push(
      `${Logger.colorList.default}[${Logger.colorList[typeColor]}${tag}${Logger.colorList.default}]${Logger.colorList[textColor]}`
    );
    return this;
  }

  static log(...args: unknown[]) {
    Logger.tag('LOG', 'cyan', 'default').print(args, LoggerLevel.LOG);
  }

  static info(...args: unknown[]) {
    Logger.tag('INFO', 'green', 'bright').print(args, LoggerLevel.LOG);
  }

  static warn(...args: unknown[]) {
    Logger.tag('WARM', 'yellow', 'yellow').print(args, LoggerLevel.LOG);
  }

  static error(...args: unknown[]) {
    Logger.tag('ERROR', 'red', 'red').print(args, LoggerLevel.LOG);
  }

  static debug(...args: unknown[]) {
    Logger.tag('DEBUG', 'magenta', 'red').print(args, LoggerLevel.DEBUG);
  }
}

Logger.prefix(() => formatTime(), 'blue', 'default');

export default Logger;
