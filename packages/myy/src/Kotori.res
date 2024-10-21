// tools
// parsers tsu
// http and i18n
// otehr servicee

module Utils = {
  external toAny: 'a => 'b = "%identity"
  let ignore = (_: 'a) => {()}
  let ignores = (_: array<'a>) => {()}
}

type rec http = {
  // extend: Js.t<'a> => http,
  get: string => promise<unknown>,
  // post: httpMethod<'a>,
  // patch: httpMethod<'a>,
  // put: httpMethod<'a>,
  // delete: httpMethod<'a>,
  // head: httpMethod<'a>,
  // options: httpMethod<'a>,
  // ws: (string, Js.undefined<array<string>>) => 'a,
}

// and httpMethod<'a, 'b> = (string, Js.undefined<Js.Dict.t<string>>, Js.undefined<Js.t<'b>>) => promise<'a>
type localeType = [#en | #zhCN | #zhTW]

type i18n = {
  use: (Js.Dict.t<string>, localeType) => unit,
  locale: string => string,
  t: array<string> => string,
  set: localeType => unit,
  get: unit => localeType,
  date: float => string,
  time: float => string,
  period: float => string,
  number: float => string,
  list: array<string> => string,
  rtime: (float, string) => string,
}

module Msg = {
  type message = {toString: unit => string}
  @module("kotori-bot") external list: array<message> => message = "Messages"
  @module("kotori-bot") @scope("Messages") external text: string => message = "text"
  @module("kotori-bot") @scope("Messages") external mention: string => message = "mention"
  @module("kotori-bot") @scope("Messages") external mentionAll: unit => message = "mentionAll"
  @module("kotori-bot") @scope("Messages") external image: string => message = "image"
  @module("kotori-bot") @scope("Messages") external voice: string => message = "voice"
  @module("kotori-bot") @scope("Messages") external audio: string => message = "audio"
  @module("kotori-bot") @scope("Messages") external video: string => message = "video"
  @module("kotori-bot") @scope("Messages") external file: string => message = "file"
  @module("kotori-bot") @scope("Messages")
  external location: (
    ~latitude: float,
    ~longitude: float,
    ~title: string,
    ~content: string,
  ) => message = "location"
  @module("kotori-bot") @scope("Messages") external reply: string => message = "reply"

  type confirmConfig = {message: message, sure: message}
  type session = {
    id: string,
    // api: Js.t<'a>, // 简化
    i18n: i18n,
    format: (string, array<string>) => string,
    quick: string => promise<unit>,
    prompt: string => promise<string>,
    confirm: confirmConfig => promise<bool>,
    // error: ('a, Js.undefined<'a>) => 'a, // 简化 CommandError 类型
    t: array<string> => string,
    type_: string,
    time: float,
    userId?: string,
    operatorId?: string,
    messageId?: string,
    groupId?: string,
    channelId?: string,
    guildId?: string,
  }

  type value = String(string) | Number(float) | Bool(bool) | None
  type scope = [#all | #"private" | #group | #channel]
  type access = [#member | #manager | #admin]

  type command
  type commandActionData = {args: array<value>, options: Js.Dict.t<value>}
  type commandPipes = {
    cmd_new: string => command,
    cmd_action: (command, (commandActionData, session) => promise<message>) => command,
    cmd_option: (command, string, string) => command,
    cmd_scope: (command, scope) => command,
    cmd_access: (command, access) => command,
    cmd_alias: (command, array<string>) => command,
    cmd_shortcut: (command, array<string>) => command,
    cmd_help: (command, string) => command,
    cmd_hide: (command, bool) => command,
  }

  type filterTestList = [
    | #platform
    | #userId
    | #groupId
    | #operatorId
    | #messageId
    | #scope
    | #access
    | #identity
    | #localeType
    | #selfId
  ]
  type rec filterOption =
    | List({@as("type") type_: [#all_of | #any_of | #none_of], filters: array<filterOption>})
    | Base({
        test: filterTestList,
        value: value,
        operator: [#"==" | #"<" | #">" | #"<=" | #">=" | #"!="],
      })
}

module ConfigAndLoader = {
  type globalConfig = {
    lang: localeType,
    commandPrefix: string,
  }
  type adapterConfig = {
    extends: string,
    master: string,
    lang: localeType,
    commandPrefix: string,
  }
  type config = {
    global: globalConfig,
    adapter: Js.Dict.t<adapterConfig>,
    plugins: Js.Dict.t<unknown>,
  }

  type meta = {
    name: string,
    coreVersion: string,
    loaderVersion: Js.undefined<string>,
    version: Js.undefined<string>,
    description: string,
    main: string,
    license: [#GPL3],
    author: string,
  }

  type baseDir = {
    root: string,
    data: string,
    logs: string,
    config: string,
  }
  type options = {
    mode: [#build | #dev],
    isDaemon: bool,
  }
}

type rec context = {
  // Fluoro
  identity?: string,
  get: string => unknown,
  inject: (string, bool) => bool,
  provide: (string, unknown) => bool,
  mixin: (string, array<string>, bool) => bool,
  extends: string => context,
  // emit parallel on once off offAll
  load: (context => unit) => unit,
  loadExport: moduleExport => unit,
  unload: (context => unit) => unit,
  unloadExport: moduleExport => unit,
  service: (string, service) => unit,
  // Core
  start: unit => unit,
  stop: unit => unit,
  // Config
  config: ConfigAndLoader.config,
  meta: ConfigAndLoader.meta,
  // Loader
  run: bool => unit,
  baseDir: ConfigAndLoader.baseDir,
  options: ConfigAndLoader.options,
  // Message
  midware: ((unit => promise<unit>, Msg.session) => promise<Msg.message>, int) => unit => bool,
  regexp: (Js.Re.t, (array<string>, Msg.session) => promise<Msg.message>) => unit => bool,
  task: (string, unit => unit) => unit => bool, // only supports expr
  // filt: Msg.filterOption => context,
  ...Msg.commandPipes,
  // Extension
  http: http,
  i18n: i18n,
  // cache: Js.t
}
and service = {
  ctx: context,
  // config: unknown,
  identity: string,
}
and moduleExport = {
  name?: string,
  main: context => unit,
  inject?: array<string>,
}

type resHooker = {
  // filt: (Msg.filterOption, context => unit) => unit,
  loadExport: moduleExport => unit,
  unloadExport: moduleExport => unit,
  ...Msg.commandPipes,
}

let createResHooker = (ctx: context) => {
  let handleSession = (session: Msg.session) => {
    // Js.Array.forEach((key: string) => {
    //   let value = if %raw(`session[key] === undefined`) {
    //     None
    //   } else {
    //     Some(%raw(`session[key]`))
    //   }
    //   [%raw(`session[key] = value`), value, key->Utils.toAny]->Utils.ignore
    // }, ["userId", "operatorId", "messageId", "groupId", "channelId", "guildId"])
    session
  }

  let hooker: resHooker = {
    loadExport: moduleExport => {
      Utils.toAny(ctx)["load"](moduleExport)
    },
    unloadExport: moduleExport => {
      Utils.toAny(ctx)["unload"](moduleExport)
    },
    cmd_new: template => {
      Utils.toAny(ctx)["command"](template)
    },
    cmd_action: (cmd, callback) => {
      Utils.toAny(cmd)["action"]((data, session: Msg.session) => {
        data["args"] = Js.Array.map(arg =>
          switch arg->Type.typeof {
          | #string => Msg.String(arg)
          | #number => Msg.Number(arg->Utils.toAny)
          | #boolean => Msg.Bool(arg->Utils.toAny)
          | _ => Msg.None
          }
        , data["args"])
        Console.log(session.userId)
        callback(data->Utils.toAny, session->handleSession)
      })
    },
    cmd_option: (cmd, name, template) => {
      Utils.toAny(cmd)["option"](name, template)
    },
    cmd_scope: (cmd, scope) => {
      if scope == #all {
        Utils.toAny(cmd)["scope"]("all")
      } else {
        Utils.toAny(cmd)["scope"](
          switch scope {
          | #"private" => 0
          | #group => 1
          | _ => 2
          },
        )
      }
    },
    cmd_access: (cmd, access) => {
      Utils.toAny(cmd)["access"](
        switch access {
        | #member => 0
        | #manager => 1
        | #admin => 2
        },
      )
    },
    cmd_alias: (cmd, alias) => {
      Utils.toAny(cmd)["alias"](alias)
    },
    cmd_shortcut: (cmd, short) => {
      Utils.toAny(cmd)["shortcut"](short)
    },
    cmd_help: (cmd, text) => {
      Utils.toAny(cmd)["help"](text)
    },
    cmd_hide: (cmd, isHide) => {
      Utils.toAny(cmd)["hide"](isHide)
    },
  }
  hooker
}
