import { parseArgs } from '@kotori-bot/tools';
import minimist from 'minimist';
import {
  CommandAccess,
  type CommandAction,
  type CommandArgType,
  type CommandArgTypeSign,
  type CommandConfig,
  commandArgTypeSignSchema,
  ArgsOrigin,
  OptsOrigin
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

interface CommandData<Args extends ArgsOrigin = ArgsOrigin, Opts extends OptsOrigin = OptsOrigin> {
  root: string;
  alias: string[];
  args: CommandArg[];
  options: CommandOption[];
  scope: CommandConfig['scope'];
  access: CommandAccess;
  help?: string;
  action?: CommandAction<Args, Opts>;
  description?: string;
}

/* eslint-disable @typescript-eslint/ban-types */

type GetSignType<T extends string> = T extends `${string}number${string}`
  ? number
  : T extends `${string}boolean${string}`
    ? boolean
    : string;
type GetArgCtn<Template extends string> = Template extends `${string}:${infer Suffix}`
  ? Suffix extends `${infer T}=${string}`
    ? GetSignType<T>
    : GetSignType<Suffix>
  : Template extends `${infer T}=${string}`
    ? GetSignType<T>
    : string;
type ParseArgs<Template extends string> = string extends Template
  ? ArgsOrigin
  : Template extends `${string} ${`<${infer Ctn}>`}${infer Rest}`
    ? Ctn extends `...${infer Ctn2}`
      ? [...GetSignType<Ctn2>[]]
      : [GetArgCtn<Ctn>, ...ParseArgs<Rest>]
    : Template extends `${string} [${infer Ctn}]${infer Rest}`
      ? Ctn extends `${infer Ctn2}=${string}`
        ? Ctn2 extends `...${infer Ctn3}`
          ? [...GetSignType<Ctn3>[]]
          : [GetArgCtn<Ctn2>, ...ParseArgs<Rest>]
        : Ctn extends `...${infer Ctn2}`
          ? [...GetSignType<Ctn2>[]]
          : [GetArgCtn<Ctn>?, ...ParseArgs<Rest>]
      : [];

type ParseOpts<Template extends string> = string extends Template
  ? {}
  : Template extends `${infer K}:${infer V}`
    ? GetSignType<V> extends Boolean
      ? { [C in K]: GetSignType<V> }
      : { [C in K]?: GetSignType<V> }
    : /* eslint-disable-next-line @typescript-eslint/ban-types */

      {};

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

export class Command<Template extends string = string, Opts extends OptsOrigin = OptsOrigin> {
  public static run(input: string, data: CommandData) {
    /* find start string */
    let starts = '';
    [data.root, ...data.alias].forEach((el) => {
      if (starts) return;
      if (input.startsWith(`${el} `) || input === el) starts = el;
    });
    if (!starts) return new CommandError({ type: 'unknown', input });

    /* handle CommandOption[] to minimist.opts */
    const opts: { string: string[]; boolean: string[]; alias: Record<string, string> } = {
      string: [],
      boolean: [],
      alias: {}
    };
    data.options.forEach((option) => {
      if (option.type === 'string') {
        opts.string.push(option.realname);
      } else if (option.type === 'boolean') {
        opts.boolean.push(option.realname);
      }
      opts.alias[option.realname] = option.name;
    });

    /* parse by minimist */
    const arr = parseArgs(input.slice(starts.length).trim());
    if (!Array.isArray(arr)) return new CommandError({ type: 'syntax', ...arr });
    const result = minimist(arr, opts);

    /* handle args */
    const args: ArgsOrigin = result._;
    const count = {
      expected: data.args.filter((el) => !el.optional).length,
      reality: args.length
    };
    if (count.reality < count.expected) return new CommandError({ type: 'arg_few', ...count });
    count.expected = data.args.length;
    if ((data.args.length <= 0 || !data.args[data.args.length - 1].rest) && count.reality > count.expected)
      return new CommandError({ type: 'arg_many', ...count });
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
    const options: OptsOrigin = {};
    data.options.forEach((val) => {
      if (!(val.realname in result)) return;
      options[val.realname] = Array.isArray(result[val.realname])
        ? (result[val.realname] as ArgsOrigin)[0]
        : (result[val.realname] as CommandArgType);
      options[val.realname] = handleDefaultValue(options[val.realname], val.type);
      if (Number.isNaN(options[val.realname]))
        error = new CommandError({ type: 'option_error', expected: 'number', reality: 'string', target: val.realname });
    });
    if (error) return error;

    return {
      args: data.args.length > 0 && data.args[data.args.length - 1].rest ? args : args.slice(0, data.args.length),
      options
    };
  }

  private template: Template;

  public readonly meta: CommandData<ParseArgs<Template>, Opts> = {
    root: '',
    alias: [],
    scope: 'all',
    access: CommandAccess.MEMBER,
    args: [],
    options: []
  };

  public constructor(template: Template, config?: CommandConfig) {
    this.template = template;
    this.meta = Object.assign(this.meta, config);
    this.parse();
  }

  private parse() {
    const [str, description] = this.template.trim().split(' - ');
    this.meta.description = description; // set description

    /* handle root */
    const requiredIndex = str.indexOf(' <');
    const optionalIndex = str.indexOf(' [');
    if (requiredIndex === -1 && optionalIndex === -1) {
      this.meta.root = str.trim();
      return;
    }
    if (requiredIndex !== -1 && (optionalIndex === -1 || requiredIndex < optionalIndex)) {
      this.meta.root = str.substring(0, requiredIndex).trim();
    } else {
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

  public alias(alias: string | string[]) {
    if (typeof alias === 'string') this.meta.alias.push(alias);
    else this.meta.alias.push(...alias);
    return this;
  }

  public scope(scope: CommandConfig['scope']) {
    this.meta.scope = scope;
    return this;
  }

  public access(access: CommandAccess) {
    this.meta.access = access;
    return this;
  }

  public option<TemplateOpt extends string>(name: string, template: TemplateOpt) {
    const [str, description] = template.trim().split(' ');
    const [realname, type] = str.split(':');
    this.meta.options.push({
      realname,
      description,
      type: commandArgTypeSignSchema.parseSafe(type).value ? (type as CommandArgTypeSign) : defaultType,
      name: name.charAt(0)
    });
    return this as unknown as Command<Template, Opts & ParseOpts<TemplateOpt>>;
  }

  public action(callback: CommandAction<ParseArgs<Template>, Opts>) {
    this.meta.action = callback;
    return this;
  }

  public help(text: string) {
    this.meta.help = text;
    return this;
  }
}

export default Command;
