import minimist from 'minimist'
import {
  UserAccess,
  type CommandAction,
  type CommandArgType,
  type CommandArgTypeSign,
  type CommandConfig,
  commandArgTypeSignSchema,
  type ArgsOrigin,
  type OptsOrigin
} from '../types'
import { CommandError } from '../utils/error'

/** Command argument */
interface CommandArg {
  /** Argument displayname */
  name: string
  /** Argument type */
  type: CommandArgTypeSign
  /** Argument is wether optional */
  optional: boolean
  /** Argument default value, if exists so `optional` is true */
  default?: CommandArgType
  /** Argument is wether rest arguments */
  rest: boolean
}

/** Command option */
interface CommandOption {
  /** Option short name, composed a uppercase letter */
  name: string
  /** Option type */
  type: CommandArgTypeSign
  /** Option full name (real name), composed some lowercase letters and connect by `-` between word and word */
  realname: string
  /** Option description */
  description?: string
}

/**
 * Command meta data.
 *
 * @template Args - Command arguments
 * @template Opts - Command options
 */
interface CommandData<Args = ArgsOrigin, Opts = OptsOrigin> {
  /** Command root content */
  root: string
  /** Command alias (need bring command prefix) */
  alias: string[]
  /** Command shortcut (needn't bring command prefix) */
  shortcut: string[]
  /** Command is wether hide at the menu */
  hide: boolean
  /** Command arguments */
  args: CommandArg[]
  /** Command options */
  options: CommandOption[]
  /** Command require message scope (session type) */
  scope: CommandConfig['scope']
  /** Command require user access level */
  access: UserAccess
  /** Command description */
  description?: string
  /** Command help message, it has more details than `description` */
  help?: string
  /** Command action */
  action?: CommandAction<Args, Opts>
}

type GetSignType<T extends string> = T extends `${string}number${string}`
  ? number
  : T extends `${string}boolean${string}`
    ? boolean
    : string
type GetArgCtn<Template extends string> = Template extends `${string}:${infer Suffix}`
  ? Suffix extends `${infer T}=${string}`
    ? GetSignType<T>
    : GetSignType<Suffix>
  : Template extends `${infer T}=${string}`
    ? GetSignType<T>
    : string
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
      : []

type ParseOpts<Template extends string> = string extends Template
  ? // biome-ignore lint:
    {}
  : Template extends `${infer K}:${infer V}`
    ? GetSignType<V> extends boolean
      ? { [C in K]: GetSignType<V> }
      : { [C in K]?: GetSignType<V> }
    : // biome-ignore lint:
      {}

const requiredParamMatch = /<(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?>/

const optionalParamMatch = /\[(\.\.\.)?(.*?)(:(.*?))?(=(.*?))?\]/

const defaultType: CommandArgTypeSign = 'string'

/**
 * Command.
 *
 * @template Template - Command template
 * @template Opts - Command options
 *
 * @class
 */
export class Command<Template extends string = string, Opts extends OptsOrigin = OptsOrigin> {
  private static handleDefaultValue(value: CommandArgType, type: CommandArgTypeSign) {
    if (type === 'boolean') return value !== 'false' && !!value
    if (type === 'number') {
      if (typeof value === 'number') return value
      if (value === true) return 1
      if (value === false) return 0
      const float = Number.parseFloat(value)
      const int = Number.parseInt(value)
      return float === int ? int : float
    }
    return value.toString()
  }

  private static parseArgs(command: string) {
    const args: string[] = []
    let current = ''
    let inQuote = false
    let quoteChar: null | string = null
    let lastQuoteChar: null | string = null
    for (let i = 0; i < command.length; i += 1) {
      let c = command[i]
      if (inQuote) {
        if (c === quoteChar) {
          inQuote = false
          quoteChar = null
        } else if (c === '\\' && i + 1 < command.length) {
          i += 1
          c = command[i]
          if (c === '"' || c === "'") {
            current += c
          } else {
            current += `\\${c}`
          }
        } else {
          current += c
        }
      } else if (c === '"' || c === "'") {
        inQuote = true
        quoteChar = c
        lastQuoteChar = c
      } else if (c === ' ' && current) {
        args.push(current)
        current = ''
      } else {
        current += c
      }
    }
    if (inQuote || quoteChar)
      return { char: lastQuoteChar as string, index: command.lastIndexOf(lastQuoteChar as string) }
    if (current) args.push(current)
    return args
  }

  public static run(input: string, data: CommandData) {
    /* find start string */
    let starts = ''

    for (const el of [data.root, ...data.alias]) {
      if (starts) continue
      if (input.startsWith(`${el} `) || input === el) starts = el
    }
    if (!starts) return new CommandError({ type: 'unknown', input })

    /* handle CommandOption[] to minimist.opts */
    const opts: { string: string[]; boolean: string[]; alias: Record<string, string> } = {
      string: [],
      boolean: [],
      alias: {}
    }

    for (const option of data.options) {
      if (option.type === 'string') opts.string.push(option.realname)
      else if (option.type === 'boolean') opts.boolean.push(option.realname)
      opts.alias[option.realname] = option.name
    }

    /* parse by minimist */
    const arr = Command.parseArgs(input.slice(starts.length).trim())
    if (!Array.isArray(arr)) return new CommandError({ type: 'syntax', ...arr })
    const result = minimist(arr, opts)

    /* handle args */
    const args: ArgsOrigin = result._
    const count = {
      expected: data.args.filter((el) => !el.optional).length,
      reality: args.length
    }
    if (count.reality < count.expected) return new CommandError({ type: 'arg_few', ...count })
    count.expected = data.args.length
    if ((data.args.length <= 0 || !data.args[data.args.length - 1].rest) && count.reality > count.expected)
      return new CommandError({ type: 'arg_many', ...count })
    let error: CommandError | undefined

    data.args.forEach((val, index) => {
      /* exit when happen error or last arg is empty */
      if (error || (index > 0 && !args[index - 1])) return
      /* handle rest args and default value */
      if (!args[index] && val.default) {
        args[index] = val.default
        return
      }
      if (val.rest || !args[index]) return
      /* determine if type is valid number */
      args[index] = Command.handleDefaultValue(args[index], val.type)
      if (!Number.isNaN(args[index])) return
      error = new CommandError({ type: 'arg_error', expected: 'number', reality: 'string', index })
    })
    if (error) return error

    /* handle options */
    const options: OptsOrigin = {}

    for (const val of data.options) {
      if (!(val.realname in result)) continue
      options[val.realname] = Array.isArray(result[val.realname])
        ? (result[val.realname] as ArgsOrigin)[0]
        : (result[val.realname] as CommandArgType)
      options[val.realname] = Command.handleDefaultValue(options[val.realname], val.type)
      if (Number.isNaN(options[val.realname]))
        error = new CommandError({ type: 'option_error', expected: 'number', reality: 'string', target: val.realname })
    }
    if (error) return error

    return {
      args: data.args.length > 0 && data.args[data.args.length - 1].rest ? args : args.slice(0, data.args.length),
      options
    }
  }

  private template: Template

  /**
   * Command meta data.
   *
   * @readonly
   */
  public readonly meta: CommandData<ParseArgs<Template>, Opts> = {
    root: '',
    alias: [],
    scope: 'all',
    access: UserAccess.MEMBER,
    args: [],
    options: [],
    hide: false,
    shortcut: []
  }

  /**
   * Create a command instance
   *
   * @param template - Command template.
   * @param config - Command config.
   */
  public constructor(template: Template, config?: CommandConfig) {
    this.template = template
    this.meta = Object.assign(this.meta, config)
    this.parse()
  }

  private parse() {
    const [str, description] = this.template.trim().split(' - ')
    this.meta.description = description // set description

    /* handle root */
    const requiredIndex = str.indexOf(' <')
    const optionalIndex = str.indexOf(' [')
    if (requiredIndex === -1 && optionalIndex === -1) {
      this.meta.root = str.trim()
      return
    }
    if (requiredIndex !== -1 && (optionalIndex === -1 || requiredIndex < optionalIndex)) {
      this.meta.root = str.substring(0, requiredIndex).trim()
    } else {
      this.meta.root = str.substring(0, optionalIndex).trim()
    }

    /* handle args */
    const args = minimist(str.split(' '))._
    for (const arg of args) {
      const current: CommandArg | undefined = this.meta.args[this.meta.args.length - 1]
      if (current?.rest) continue
      let result = optionalParamMatch.exec(arg)
      if (result) {
        if (!result[2]) continue
        const type = commandArgTypeSignSchema.parseSafe(result[4]).value
          ? (result[4] as CommandArgTypeSign)
          : defaultType
        this.meta.args.push({
          name: result[2],
          type,
          rest: !!result[1],
          optional: true,
          default: result[6] ? Command.handleDefaultValue(result[6], type) : undefined
        })
      }
      result = requiredParamMatch.exec(arg)
      if (!result || !result[2]) continue
      if (!result[6] && current?.optional) continue

      this.meta.args.push({
        name: result[2],
        type: commandArgTypeSignSchema.parseSafe(result[4]).value ? (result[4] as CommandArgTypeSign) : defaultType,
        rest: !!result[1],
        optional: false
      })
    }
  }

  /**
   * Add command alias.
   *
   * @param alias - Command alias.
   * @returns Command instance
   */
  public alias(alias: string | string[]) {
    if (typeof alias === 'string') this.meta.alias.push(alias)
    else this.meta.alias.push(...alias)
    return this
  }

  /**
   * Add command shortcut.
   *
   * @param short - shortcut name
   * @returns Command instance
   */
  public shortcut(short: string | string[]) {
    if (typeof short === 'string') this.meta.alias.push(short)
    else this.meta.alias.push(...short)
    return this
  }

  /**
   * Set the message scope which command require.
   *
   * @param scope - Message scope.
   * @returns Command instance
   */
  public scope(scope: CommandConfig['scope']) {
    this.meta.scope = scope
    return this
  }

  /**
   * Set the user access level which command require.
   *
   * @param access - User access level.
   * @returns Command instance
   */
  public access(access: UserAccess) {
    this.meta.access = access
    return this
  }

  /**
   * Add command option.
   *
   * @param name - Option name.
   * @param template - Option template.
   * @returns Command instance
   */
  public option<TemplateOpt extends string>(name: string, template: TemplateOpt) {
    const [str, description] = template.trim().split(' ')
    const [realname, type] = str.split(':')
    this.meta.options.push({
      realname,
      description,
      type: commandArgTypeSignSchema.parseSafe(type).value ? (type as CommandArgTypeSign) : defaultType,
      name: name.charAt(0)
    })
    return this as unknown as Command<Template, Opts & ParseOpts<TemplateOpt>>
  }

  /**
   * Set command action.
   *
   * @param callback - Command action.
   * @returns Command instance
   */
  public action(callback: CommandAction<ParseArgs<Template>, Opts>) {
    this.meta.action = callback
    return this
  }

  /**
   * Set command help text.
   *
   * @param text - Command help text.
   * @returns Command instance
   */
  public help(text: string) {
    this.meta.help = text
    return this
  }

  /**
   * Set command hide.
   *
   * @param isHide - Command hide.
   * @returns Command instance
   */
  public hide(isHide = true) {
    this.meta.hide = isHide
    return this
  }
}

export default Command
