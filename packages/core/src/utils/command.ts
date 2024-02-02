import { obj, parseArgs } from '@kotori-bot/tools';
import minimist from 'minimist';
import {
  CommandAccess,
  type CommandAction,
  type CommandArgType,
  type CommandArgTypeSign,
  type CommandConfig,
  commandArgTypeSignSchema
} from '../types';
import { CommandError } from './commandError';

interface CommandArg {
  name: string;
  type: CommandArgTypeSign;
  optional: boolean;
  default?: CommandArgType;
  rest: boolean;
}

interface CommandOption {
  name: string; // short name
  type: CommandArgTypeSign;
  realname: string; // full name
  description?: string;
}

interface CommandData {
  root: string;
  alias: string[];
  args: CommandArg[];
  options: CommandOption[];
  scope: CommandConfig['scope'];
  access: CommandAccess;
  help?: string;
  action?: CommandAction;
  description?: string;
}

const requiredParamMatch = /<(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?>/;

const optionalParamMatch = /\[(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?\]/;

const defaultType: CommandArgTypeSign = 'string';

function handleDefaultValue(value: CommandArgType, type: CommandArgTypeSign) {
  if (type === 'boolean') return value !== 'false' && !!value;
  if (type === 'number') {
    if (typeof value === 'number') return value;
    if (value === true) return 1;
    if (value === false) return 0;
    const float = parseFloat(value);
    const int = parseInt(value, 10);
    return float === int ? int : float;
  }
  return value.toString();
}

export class Command {
  static run(input: string, data: CommandData) {
    /* find start string */
    let starts = '';
    [data.root, ...data.alias].forEach((el) => {
      if (starts) return;
      if (input.startsWith(el)) starts = el;
    });
    if (!starts) return new CommandError({ type: 'unknown', input });
    /* handle CommandOption[] to minimist.opts */
    const opts: { string: string[]; boolean: string[]; alias: obj<string> } = { string: [], boolean: [], alias: {} };
    data.options.forEach((option) => {
      if (option.type === 'string') {
        opts.string.push(option.realname);
      } else if (option.type === 'boolean') {
        opts.boolean.push(option.realname);
      }
      opts.alias[option.realname] = option.name;
    });
    /* parse by minimist */
    const arr = parseArgs(input.split(starts)[1].trim());
    if (!Array.isArray(arr)) return new CommandError({ type: 'syntax', ...arr });
    const result = minimist(arr, opts);
    /* handle args */
    const args: CommandArgType[] = result._;
    const nums = {
      expected: data.args.filter((el) => !el.optional).length,
      reality: args.length
    };
    if (nums.reality < nums.expected) return new CommandError({ type: 'arg_few', ...nums });
    nums.expected = data.args.length;
    if (!data.args[data.args.length - 1].rest && nums.reality > nums.expected)
      return new CommandError({ type: 'arg_many', ...nums });
    let error: CommandError | undefined;
    data.args.forEach((val, index) => {
      /* exit when happen error or last arg is empty */
      if (error || (index > 0 && !args[index - 1])) return;
      /* handle rest args and default value */
      if (!args[index] && val.default) {
        args[index] = val.default;
        return;
      }
      if (val.rest || !args[index]) return;
      /* determine if type is valid number */
      args[index] = handleDefaultValue(args[index], val.type);
      if (!Number.isNaN(args[index])) return;
      error = new CommandError({ type: 'arg_error', expected: 'number', reality: 'string', index });
    });
    if (error) return error;
    /* handle options */
    const options: obj<CommandArgType> = {};
    data.options.forEach((val) => {
      if (!(val.realname in result)) return;
      options[val.realname] = Array.isArray(result[val.realname])
        ? (result[val.realname] as CommandArgType[])[0]
        : (result[val.realname] as CommandArgType);
      options[val.realname] = handleDefaultValue(options[val.realname], val.type);
      if (Number.isNaN(options[val.realname]))
        error = new CommandError({ type: 'option_error', expected: 'number', reality: 'string', target: val.realname });
    });
    if (error) return error;
    return {
      args: data.args[data.args.length - 1].rest ? args : args.slice(0, data.args.length),
      options
    };
  }

  private template: string;

  readonly meta: CommandData = {
    root: '',
    alias: [],
    scope: 'all',
    access: CommandAccess.MEMBER,
    args: [],
    options: []
  };

  constructor(template: string, config?: CommandConfig) {
    this.template = template;
    this.meta = Object.assign(this.meta, config);
    this.parse();
  }

  private parse() {
    const { 0: str, 1: description } = this.template.trim().split(' - ');
    this.meta.description = description; // set description
    /* handle root */
    const requiredIndex = str.indexOf(' <');
    const optionalIndex = str.indexOf(' [');
    if (requiredIndex === -1 && optionalIndex === -1) {
      this.meta.root = str.trim();
      return;
    }
    if ((optionalIndex === -1 && requiredIndex !== -1) || requiredIndex < optionalIndex) {
      this.meta.root = str.substring(0, requiredIndex).trim();
    } else if ((optionalIndex !== -1 && requiredIndex === -1) || optionalIndex < requiredIndex) {
      this.meta.root = str.substring(0, optionalIndex).trim();
    }
    /* handle args */
    const args = minimist(str.split(' '))._;
    args.forEach((arg) => {
      const current: CommandArg | undefined = this.meta.args[this.meta.args.length - 1];
      if (current && current.rest) return;
      let result = optionalParamMatch.exec(arg);
      if (result) {
        if (!result[2]) return;
        const type = commandArgTypeSignSchema.parseSafe(result[4]).value
          ? (result[4] as CommandArgTypeSign)
          : defaultType;
        this.meta.args.push({
          name: result[2],
          type,
          rest: !!result[1],
          optional: true,
          default: result[6] ? handleDefaultValue(result[6], type) : undefined
        });
      }
      result = requiredParamMatch.exec(arg);
      if (!result || !result[2]) return;
      if (!result[6] && current && current.optional) return;

      this.meta.args.push({
        name: result[2],
        type: commandArgTypeSignSchema.parseSafe(result[4]).value ? (result[4] as CommandArgTypeSign) : defaultType,
        rest: !!result[1],
        optional: false
      });
    });
  }

  alias(alias: string | string[]) {
    if (typeof alias === 'string') this.meta.alias.push(alias);
    else this.meta.alias.push(...alias);
    return this;
  }

  scope(scope: CommandConfig['scope']) {
    this.meta.scope = scope;
    return this;
  }

  access(access: CommandAccess) {
    this.meta.access = access;
    return this;
  }

  option(name: string, template: string) {
    const { 0: str, 1: description } = template.trim().split(' ');
    const { 0: realname, 1: type } = str.split(':');
    this.meta.options.push({
      realname,
      description,
      type: commandArgTypeSignSchema.parseSafe(type).value ? (type as CommandArgTypeSign) : defaultType,
      name: name.charAt(0)
    });
    return this;
  }

  action(callback: CommandAction) {
    this.meta.action = callback;
    return this;
  }

  help(text: string) {
    this.meta.help = text;
    return this;
  }
}

export default Command;
