import { obj, stringRightSplit } from '@kotori-bot/tools';
import {
  CommandAccess,
  type CommandAction,
  type CommandArgType,
  type CommandArgTypeSign,
  type CommandConfig,
  type CommandData,
  CommandArg,
  CommandOption,
  CommandParseResultExtra,
  CommandParseResult,
} from '../types';
import { CommandError } from '../utils/errror';
import CommandExtra from '../utils/commandExtra';

export class Command {
  private static parseTemplateParam(content: string) {
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
  }

  private static error<T extends keyof CommandParseResultExtra>(type: T, data: CommandParseResult[T]) {
    return new CommandError(undefined, new CommandExtra({ type, ...data } as CommandParseResultExtra[T]));
  }

  private static parseOption(expectedOptions: CommandOption[], input: string): [obj<CommandArgType>, string] {
    const realityOptions: obj<CommandArgType> = {};
    let cmd = input;
    [...`${cmd} `.matchAll(/\s-([a-z]+)(=(\w+)|)\s?\b/g)].forEach(el => {
      cmd = cmd.replace(el[0], '');
      const key = el[1];
      let val: CommandArgType | undefined = el[3] || undefined;
      expectedOptions.forEach(option => {
        if (option.realname !== key) return;
        if (val !== undefined && val !== '') {
          if (option.type === 'number' && typeof val !== 'number') {
            val = parseInt(val, 10);
            if (Number.isNaN(val)) {
              throw this.error('option_error', {
                expected: 'number',
                reality: 'string,',
                target: option.realname,
              });
            }
          }
        }
        val = option.default || '';
        realityOptions[option.name] = val;
      });
    });
    return [realityOptions, cmd];
  }

  private static parseArgs(expectedArgs: CommandArg[], inputHandel: string) {
    const realityArgs: CommandArgType[] = [];
    let current = '';
    let inBackslash = false;
    let inQuote = false;
    `${inputHandel} `.split('').forEach(char => {
      if (inBackslash) {
        inBackslash = false;
        current += char;
      } else if (char === ' ' && !inQuote) {
        if (!current) return;
        const arg = expectedArgs[realityArgs.length];
        if (!arg) {
          throw this.error('arg_many', { expected: expectedArgs.length, reality: realityArgs.length + 1 });
        }
        let val: CommandArgType = current.trim();
        if (arg.type === 'number' && typeof val !== 'number') {
          val = parseInt(current, 10);
          if (Number.isNaN(val)) {
            throw this.error('arg_error', { expected: 'number', reality: 'string', target: arg.name });
          }
        }
        realityArgs.push(val);
        current = '';
      } else if (char === '"' || char === "'") {
        // dont fix it for big and small quote
        inQuote = !inQuote;
      } else if (char === '\\') {
        inBackslash = true;
      } else {
        current += char;
      }
    });
    if (!inQuote && !inBackslash) return realityArgs;
    throw this.error('syntax', { index: inputHandel.lastIndexOf(inQuote ? '"' : '\\'), char: inQuote ? '"' : '\\' });
  }

  public static readonly dataList: CommandData[] = [];

  public static parse(input: string) {
    this.dataList.forEach(command => {
      if (!command.action) return;
      const cmd = input
        .replace(/(\s+)/g, ' ')
        .replace(/("\s?")|('\s?')/g, '')
        .trim();
      if (!`${input} `.startsWith(`${command.root} `)) {
        const alias = command.alias.filter(el => `${input} `.startsWith(`${el} `));
        if (alias.length <= 0) return;
        // cmd = (input.split(alias[0])[1] ?? '').trim();
      }

      const tempArray = this.parseOption(command.options, cmd);
      const realityOptions = tempArray[0];
      const realityArgs: CommandArgType[] = this.parseArgs(
        command.args,
        stringRightSplit(tempArray[1], cmd.split(' ')[0]),
      );
      const expectedLength = command.args.filter(el => !el.optional).length;
      if (expectedLength > realityArgs.length) {
        throw this.error('arg_few', { expected: expectedLength, reality: realityArgs.length });
      }
      if (command.args.length > realityArgs.length) {
        let index = realityArgs.length;
        while (index < command.args.length) {
          const arg = command.args[index];
          if (arg.default === undefined) break;
          realityArgs.push(arg.default);
          index += 1;
        }
      }
      throw this.error('parsed', { action: command.action!, args: realityArgs, options: realityOptions });
    });
    throw this.error('unknown', { input });
  }

  private template: string;

  public constructor(template: string, config?: CommandConfig) {
    this.template = template;
    this.data = Object.assign(this.data, config);
    Command.dataList.push(this.data);
    this.parseTemplate();
  }

  public readonly data: CommandData = {
    root: '',
    alias: [],
    scope: 'all',
    access: CommandAccess.MEMBER,
    args: [],
    options: [],
  };

  private requiredParamMatch = /<(.*?)>/g;

  private optionalParamMatch = /\[(.*?)]/g;

  private parseTemplate() {
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
      this.data.args.push({ optional: false, rest: false, ...Command.parseTemplateParam(content[1]) });
    });
    [...optionalStr.matchAll(this.optionalParamMatch)].forEach(content => {
      this.data.args.push({ optional: true, rest: false, ...Command.parseTemplateParam(content[1]) });
    });
  }

  public alias(alias: string | string[]) {
    if (typeof alias === 'string') this.data.alias.push(alias);
    else this.data.alias.push(...alias);
    return this;
  }

  public scope(scope: CommandConfig['scope']) {
    this.data.scope = scope;
    return this;
  }

  public access(access: CommandAccess) {
    this.data.access = access;
    return this;
  }

  public option(name: string, template: string) {
    const { '0': root, '1': description } = template.trim().split(' ');
    const handleData = Command.parseTemplateParam(root);
    this.data.options.push({ realname: handleData.name, description, ...handleData, name });
    return this;
  }

  public action(callback: CommandAction) {
    this.data.action = callback;
    return this;
  }

  public help(text: string) {
    this.data.help = text;
    return this;
  }
}

export default Command;
