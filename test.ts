/* eslint import/no-extraneous-dependencies: 0 */
import minimist from 'minimist';
import Tsu from 'tsukiko';

function parseArgs(command: string) {
  const args: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar: null | string = null;
  for (let i = 0; i < command.length; i += 1) {
    let c = command[i];
    if (inQuote) {
      if (c === quoteChar) {
        inQuote = false;
        quoteChar = null;
      } else if (c === '\\' && i + 1 < command.length) {
        i += 1;
        c = command[i];
        if (c === '"' || c === "'") {
          current += c;
        } else {
          current += `\\${c}`;
        }
      } else {
        current += c;
      }
    } else if (c === '"' || c === "'") {
      inQuote = true;
      quoteChar = c;
    } else if (c === ' ' && current) {
      args.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (inQuote || quoteChar) return [];
  if (current) args.push(current);
  return args;
}

const enum CommandAccess {
  MEMBER,
  MANGER,
  ADMIN
}
type CommandAction = Function;

type CommandArgType = string | number | boolean /* object<json> */;
const commandArgTypeSignSchema = Tsu.Union([
  Tsu.Union([Tsu.Literal('string'), Tsu.Literal('number')]),
  Tsu.Literal('boolean')
]);
type CommandArgTypeSign = Tsu.infer<typeof commandArgTypeSignSchema>;

interface CommandConfig {
  alias?: string[];
  scope?: /* MessageScope */ 'all';
  access?: CommandAccess;
  help?: string;
  action?: CommandAction;
}

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

class Command {
  static readonly requiredParamMatch = /<(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?>/;

  static readonly optionalParamMatch = /\[(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?\]/;

  static readonly defaultType: CommandArgTypeSign = 'string';

  static handleDefaultValue(value: string, type: CommandArgTypeSign) {
    if (type === 'boolean') return value === 'true';
    if (type === 'number') {
      const float = parseFloat(value);
      const int = parseInt(value, 10);
      return float === int ? int : float;
    }
    return value;
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
    this.parseTemplate();
  }

  private parseTemplate() {
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
    /* handle args and options */
    const args = minimist(str.split(' '))._;
    args.forEach((arg) => {
      const current: CommandArg | undefined = this.meta.args[this.meta.args.length - 1];
      if (current && current.rest) return;
      let result = Command.optionalParamMatch.exec(arg);
      if (result) {
        if (!result[2]) return;
        this.meta.args.push({
          name: result[2],
          type: commandArgTypeSignSchema.parseSafe(result[4]).value
            ? (result[4] as CommandArgTypeSign)
            : Command.defaultType,
          rest: !!result[1],
          optional: true
        });
      }
      result = Command.requiredParamMatch.exec(arg);
      if (!result || !result[2]) return;
      if (!result[6] && current && current.optional) return;
      const type = commandArgTypeSignSchema.parseSafe(result[4]).value
        ? (result[4] as CommandArgTypeSign)
        : Command.defaultType;
      this.meta.args.push({
        name: result[2],
        type,
        rest: !!result[1],
        optional: !!result[6],
        default: result[6] ? Command.handleDefaultValue(result[6], type) : undefined
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
      type: commandArgTypeSignSchema.parseSafe(type).value ? (type as CommandArgTypeSign) : Command.defaultType,
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

const cmd = new Command(minimist(process.argv.slice(2))._[0]);
cmd
  .option('ss', 'sss:number 这是一个选项')
  .option('t', 'time:number 时间选项')
  .alias(['别名1', '别名2'])
  .help('这是具体说明');
console.log(cmd.meta);
