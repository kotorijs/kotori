// tools
// http and i18n
// otehr servicee

module Utils = {
  type value = String(string) | Number(float) | Bool(bool) | None
  type error
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
  and api = {adapter: adapter}

  @send external getSupportedActions: api => array<string> = "getSupportedActions"
  @send external getSupportedEvents: api => array<string> = "getSupportedEvents"
  @send
  external sendPrivateMsg: (api, KotoriMsg.element, string) => promise<apiResponse> =
    "sendPrivateMsg"
  @send
  external sendGroupMsg: (api, KotoriMsg.element, string) => promise<apiResponse> = "sendGroupMsg"
  @send
  external sendChannelMsg: (api, KotoriMsg.element, string) => promise<apiResponse> =
    "sendChannelMsg"
  @send external deleteMsg: (api, string) => promise<unit> = "deleteMsg"
  @send external getSelfInfo: api => promise<apiResponse> = "getSelfInfo"
  @send external getUserInfo: (api, string) => promise<apiResponse> = "getUserInfo"
  @send external getFriendList: api => promise<array<apiResponse>> = "getFriendList"
  @send external getGroupInfo: (api, string) => promise<apiResponse> = "getGroupInfo"
  @send external getGroupList: api => promise<array<apiResponse>> = "getGroupList"
  @send
  external getGroupMemberInfo: (api, string, string) => promise<apiResponse> = "getGroupMemberInfo"
  @send
  external getGroupMemberList: (api, string) => promise<array<apiResponse>> = "getGroupMemberList"
  @send external setGroupName: (api, string, string) => unit = "setGroupName"
  @send external leaveGroup: (api, string) => unit = "leaveGroup"
  @send external getGuildInfo: (api, string) => promise<apiResponse> = "getGuildInfo"
  @send external getGuildList: api => promise<array<apiResponse>> = "getGuildList"
  @send external setGuildName: (api, string, string) => unit = "setGuildName"
  @send
  external getGuildMemberInfo: (api, string, string, string) => promise<apiResponse> =
    "getGuildMemberInfo"
  @send
  external getGuildMemberList: (api, string, string) => promise<array<apiResponse>> =
    "getGuildMemberList"
  @send external leaveGuild: (api, string) => unit = "leaveGuild"
  @send
  external getChannelInfo: (api, string, string) => promise<apiResponse> = "getChannelInfo"
  @send
  external getChannelList: (api, string, bool) => promise<array<apiResponse>> = "getChannelList"
  @send external setChannelName: (api, string, string, string) => unit = "setChannelName"
  @send
  external getChannelMemberInfo: (api, string, string, string) => promise<apiResponse> =
    "getChannelMemberInfo"
  @send
  external getChannelMemberList: (api, string, string) => promise<array<apiResponse>> =
    "getChannelMemberList"
  @send external leaveChannel: (api, string, string) => unit = "leaveChannel"
  @send
  external uploadImage: (api, string, string, Js.Dict.t<string>) => promise<apiResponse> =
    "uploadImage"
  @send
  external uploadFilePath: (api, string, string) => promise<apiResponse> = "uploadFilePath"
  @send
  external uploadFileData: (api, string, string) => promise<apiResponse> = "uploadFileData"
  @send external getFileUrl: (api, string) => promise<apiResponse> = "getFileUrl"
  @send external getFilePath: (api, string) => promise<apiResponse> = "getFilePath"
  @send external getFileData: (api, string) => promise<apiResponse> = "getFileData"
  @send external setGroupAvatar: (api, string, string) => unit = "setGroupAvatar"
  @send external setGroupAdmin: (api, string, string, bool) => unit = "setGroupAdmin"
  @send external setGroupCard: (api, string, string, string) => unit = "setGroupCard"
  @send external setGroupBan: (api, string, string, int) => unit = "setGroupBan"
  @send
  external setGroupNotice: (api, string, string /* , image?: string */) => unit = "setGroupNotice"
  @send external setGroupWholeBan: (api, string, bool) => unit = "setGroupWholeBan"
  @send external setGroupKick: (api, string, string) => unit = "setGroupKick"
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

  // type filterTestList = [
  //   | #platform
  //   | #userId
  //   | #groupId
  //   | #operatorId
  //   | #messageId
  //   | #scope
  //   | #access
  //   | #identity
  //   | #localeType
  //   | #selfId
  // ]

  // type rec filterOption =
  //   | List({@as("type") type_: [#all_of | #any_of | #none_of], filters: array<filterOption>})
  //   | Base({
  //       test: filterTestList,
  //       value: Utils.value,
  //       operator: [#"==" | #"<" | #">" | #"<=" | #">=" | #"!="],
  //     })
}

type session = {
  id: string,
  api: Bot.api,
  i18n: i18n,
  // error: ('a, Js.undefined<'a>) => 'a, // 简化 CommandError 类型
  time: float,
  userId?: string,
  operatorId?: string,
  messageId?: string,
  groupId?: string,
  channelId?: string,
  guildId?: string,
}

module Session = {
  type confirmConfig = {message: KotoriMsg.element, sure: KotoriMsg.element}
  type scope = [#all | #"private" | #group | #channel]
  type access = [#member | #manager | #admin]

  @send external format: (session, string, array<string>) => string = "format"
  @send external quick: (session, KotoriMsg.element) => promise<unit> = "quick"
  @send external prompt: (session, KotoriMsg.element) => promise<string> = "prompt"
  @send external confirm: (session, confirmConfig) => promise<bool> = "confirm"
  @send external t: (session, array<string>) => string = "t"

  let get_type = (session: session): string => {
    Utils.toAny(session)["type"]
  }

  let get_user_id_unwarp = (session: session): string => {
    switch session.userId {
    | Some(userId) => userId
    | None => "No user id in session"->Js.Exn.raiseError
    }
  }

  let get_operator_id_unwarp = (session: session): string => {
    switch session.operatorId {
    | Some(operatorId) => operatorId
    | None => "No operator id in session"->Js.Exn.raiseError
    }
  }

  let get_message_id_unwarp = (session: session): string => {
    switch session.messageId {
    | Some(messageId) => messageId
    | None => "No message id in session"->Js.Exn.raiseError
    }
  }

  let get_group_id_unwarp = (session: session): string => {
    switch session.groupId {
    | Some(groupId) => groupId
    | None => "No group id in session"->Js.Exn.raiseError
    }
  }

  let get_channel_id_unwarp = (session: session): string => {
    switch session.channelId {
    | Some(channelId) => channelId
    | None => "No channel id in session"->Js.Exn.raiseError
    }
  }

  let get_guild_id_unwarp = (session: session): string => {
    switch session.guildId {
    | Some(guildId) => guildId
    | None => "No guild id in session"->Js.Exn.raiseError
    }
  }
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
  // Config
  config: ConfigAndLoader.config,
  meta: ConfigAndLoader.meta,
  // Loader
  baseDir: ConfigAndLoader.baseDir,
  options: ConfigAndLoader.options,
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

module EventData = {
  // Message events
  type beforeCommand
  type command
  type beforeRegexp
  type regexp
  type beforeSend
  type eventDataSend
  // Adapter events
  type connect
  type status
}

module Ctx = {
  type sessionEvent = session => promise<unit>
  type moduleExport = {
    name?: string,
    main: context => unit,
    inject?: array<string>,
  }

  // Fluoro
  @send external get: (context, string) => unknown = "get"
  @send external inject: (context, string, bool) => bool = "inject"
  @send external provide: (context, string, unknown) => bool = "provide"
  @send external mixin: (context, string, array<string>, bool) => bool = "mixin"
  @send external extends: (context, string) => context = "extends"
  // emit parallel on once off offAll

  @send
  external on: (
    context,
    @string
    [
      | #ready()
      | #dispose()
      | #before_command(EventData.beforeCommand)
      | #ready_module(moduleExport)
      | #dispose_module(moduleExport)
      | #command(EventData.command)
      | #before_regexp(EventData.beforeRegexp)
      | #regexp(EventData.regexp)
      | #before_send(EventData.beforeSend)
      | #send(EventData.eventDataSend)
      | #connect(EventData.connect)
      | #status(EventData.status)
      | #on_message(sessionEvent)
      | #on_message_delete(sessionEvent)
      | #on_friend_increase(sessionEvent)
      | #on_friend_decrease(sessionEvent)
      | #on_group_increase(sessionEvent)
      | #on_group_decrease(sessionEvent)
      | #on_guild_increase(sessionEvent)
      | #on_guild_decrease(sessionEvent)
      | #on_channel_increase(sessionEvent)
      | #on_channel_decrease(sessionEvent)
      | #on_request(sessionEvent)
      | #on_group_admin(sessionEvent)
      | #on_group_ban(sessionEvent)
      | #on_group_whole_ban(sessionEvent)
      | #on_group_delete(sessionEvent)
    ],
  ) => unit = "on"
  @send external load: (context, context => unit) => unit = "load"
  @send external unload: (context, context => unit) => unit = "unload"
  @send external service: (context, string, service) => unit = "service"
  // Core
  @send external start: context => unit = "start"
  @send external stop: context => unit = "stop"
  // Loader
  @send external run: context => unit = "run"
  // Message
  @send
  external midware: (
    context,
    ((unit => promise<unit>, session) => promise<KotoriMsg.element>, int, unit),
  ) => bool = "midware"
  @send
  external regexp: (
    context,
    Js.Re.t,
    (array<string>, session) => promise<KotoriMsg.element>,
    unit,
  ) => bool = "regexp"
  @sendvv external task: (context, string, unit => unit, unit) => bool = "task"

  let load_export = (ctx: context, moduleExport: moduleExport): unit => {
    Utils.toAny(ctx)["load"](moduleExport)
  }

  let unload_export = (ctx: context, moduleExport: moduleExport): unit => {
    Utils.toAny(ctx)["unload"](moduleExport)
  }

  module Cmd = {
    type command
    type commandActionData = {args: array<Utils.value>, options: Js.Dict.t<Utils.value>}

    let make = (ctx: context, template: string): command => {
      Utils.toAny(ctx)["command"](template)
    }

    let action = (
      cmd: command,
      callback: (commandActionData, session) => KotoriMsg.element,
    ): command => {
      Utils.toAny(cmd)["action"]((data, session: session) => {
        data["args"] = Js.Array.map(arg =>
          switch arg->Js.typeof {
          | "string" => Utils.String(arg)
          | "number" => Utils.Number(arg->Utils.toAny)
          | "boolean" => Utils.Bool(arg->Utils.toAny)
          | _ => Utils.None
          }
        , data["args"])
        callback(data->Utils.toAny, session)
      })
    }

    let action_async = (
      cmd: command,
      callback: (commandActionData, session) => promise<KotoriMsg.element>,
    ): command => {
      action(cmd, Utils.toAny(callback))
    }

    let option = (cmd: command, name: string, template: string): command => {
      Utils.toAny(cmd)["option"](name, template)
    }

    let scope = (cmd: command, scope: Session.scope): command => {
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
    }

    let access = (cmd: command, access: Session.access): command => {
      Utils.toAny(cmd)["access"](
        switch access {
        | #member => 0
        | #manager => 1
        | #admin => 2
        },
      )
    }
    let alias = (cmd: command, alias: array<string>): command => {
      Utils.toAny(cmd)["alias"](alias)
    }

    let shortcut = (cmd: command, short: array<string>): command => {
      Utils.toAny(cmd)["shortcut"](short)
    }

    let help = (cmd: command, text: string): command => {
      Utils.toAny(cmd)["help"](text)
    }

    let hide = (cmd: command, isHide: bool): command => {
      Utils.toAny(cmd)["hide"](isHide)
    }
  }
}
