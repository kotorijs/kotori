// tools
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

module Bot = {
  type apiResponse
  type rec adapter = {
    platform: string,
    selfId: string,
    identity: string,
    api: api,
  }
  and api = {
    adapter: adapter,
    getSupportedActions: unit => array<string>,
    getSupportedEvents: unit => array<string>,
    sendPrivateMsg: (KotoriMsg.element, string) => promise<apiResponse>,
    sendGroupMsg: (KotoriMsg.element, string) => promise<apiResponse>,
    sendChannelMsg: (KotoriMsg.element, string) => promise<apiResponse>,
    deleteMsg: string => promise<unit>,
    getSelfInfo: unit => promise<apiResponse>,
    getUserInfo: string => promise<apiResponse>,
    getFriendList: unit => promise<array<apiResponse>>,
    getGroupInfo: string => promise<apiResponse>,
    getGroupList: unit => promise<array<apiResponse>>,
    getGroupMemberInfo: (string, string) => promise<apiResponse>,
    getGroupMemberList: string => promise<array<apiResponse>>,
    setGroupName: (string, string) => unit,
    leaveGroup: string => unit,
    getGuildInfo: string => promise<apiResponse>,
    getGuildList: unit => promise<array<apiResponse>>,
    setGuildName: (string, string) => unit,
    getGuildMemberInfo: (string, string, string) => promise<apiResponse>,
    getGuildMemberList: (string, string) => promise<array<apiResponse>>,
    leaveGuild: string => unit,
    getChannelInfo: (string, string) => promise<apiResponse>,
    getChannelList: (string, bool) => promise<array<apiResponse>>,
    setChannelName: (string, string, string) => unit,
    getChannelMemberInfo: (string, string, string) => promise<apiResponse>,
    getChannelMemberList: (string, string) => promise<array<apiResponse>>,
    leaveChannel: (string, string) => unit,
    uploadImage: (string, string, Js.Dict.t<string>) => promise<apiResponse>,
    uploadFilePath: (string, string) => promise<apiResponse>,
    uploadFileData: (string, string) => promise<apiResponse>,
    getFileUrl: string => promise<apiResponse>,
    getFilePath: string => promise<apiResponse>,
    getFileData: string => promise<apiResponse>,
    setGroupAvatar: (string, string) => unit,
    setGroupAdmin: (string, string, bool) => unit,
    setGroupCard: (string, string, string) => unit,
    setGroupBan: (string, string, int) => unit,
    setGroupNotice: (string, string /* , image?: string */) => unit,
    setGroupWholeBan: (string, bool) => unit,
    setGroupKick: (string, string) => unit,
  }
}

module Msg = {
  external el: 'a => KotoriMsg.element = "%identity"

  module Seg = {
    @jsx.component
    let make = (~children: KotoriMsg.element) => <seg> {el(children)} </seg>
  }

  module Text = {
    @jsx.component
    let make = (~children: string) => <text> {el(children)} </text>
  }

  module Br = {
    @jsx.component
    let make = () => <br />
  }

  module Image = {
    @jsx.component
    let make = (~src: string) => <image src />
  }

  module Voice = {
    @jsx.component
    let make = (~src: string) => <voice src />
  }

  module Audio = {
    @jsx.component
    let make = (~src: string) => <audio src />
  }

  module Video = {
    @jsx.component
    let make = (~src: string) => <video src />
  }

  module Mention = {
    @jsx.component
    let make = (~userId: string) => <mention userId />
  }

  module MentionAll = {
    @jsx.component
    let make = () => <mentionAll />
  }

  module Reply = {
    @jsx.component
    let make = (~messageId: string) => <reply messageId />
  }

  module File = {
    @jsx.component
    let make = (~src: string) => <file src />
  }

  module Location = {
    @jsx.component
    let make = (~latitude: float, ~longitude: float, ~title: string, ~content: string) =>
      <location latitude longitude title content />
  }

  type confirmConfig = {message: KotoriMsg.element, sure: KotoriMsg.element}
  type session = {
    id: string,
    api: Bot.api,
    i18n: i18n,
    format: (string, array<string>) => string,
    quick: KotoriMsg.element => promise<unit>,
    prompt: KotoriMsg.element => promise<string>,
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
    cmd_action: (command, (commandActionData, session) => promise<KotoriMsg.element>) => command,
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

module Context = {
  type sessionEvent = Msg.session => promise<unit>
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
  on: @string
  [
    | #on_group_increase(Context.sessionEvent)
  ] => unit,
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
  midware: ((unit => promise<unit>, Msg.session) => promise<KotoriMsg.element>, int, unit) => bool,
  regexp: (Js.Re.t, (array<string>, Msg.session) => promise<KotoriMsg.element>, unit) => bool,
  task: (string, unit => unit, unit) => bool, // only supports expr
  // filt: Msg.filterOption => context,
  ...Msg.commandPipes,
  // Extension
  http: http,
  i18n: i18n,
  cache: service,
  file: service,
  server: service,
  db: service,
  browser: service,
}
and service = {
  ctx: context,
  // config: unknown,
  // identity: string,
}
and moduleExport = {
  name?: string,
  main: context => unit,
  // inject?: array<string>,
}

type resHooker = {
  // filt: (Msg.filterOption, context => unit) => unit,
  loadExport: moduleExport => unit,
  unloadExport: moduleExport => unit,
  ...Msg.commandPipes,
}

let resHookerProps = [
  "loadExport",
  "unloadExport",
  "cmd_new",
  "cmd_action",
  "cmd_option",
  "cmd_help",
  "cmd_scope",
  "cmd_access",
  "cmd_alias",
  "cmd_shortcut",
  "cmd_hide",
]

let createResHooker = (ctx: context) => {
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
          switch arg->Js.typeof {
          | "string" => Msg.String(arg)
          | "number" => Msg.Number(arg->Utils.toAny)
          | "boolean" => Msg.Bool(arg->Utils.toAny)
          | _ => Msg.None
          }
        , data["args"])
        callback(data->Utils.toAny, session)
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
