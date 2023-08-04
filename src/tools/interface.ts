/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-12 15:42:18
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-03 16:44:42
 */
/* Function */
export interface obj<T = any> {
    [key: string]: T
}

export type ConfigFileType = 'json' | 'yaml' | 'xml' | 'ini' | 'txt';
export type FuncSend = (action: string, params?: Object) => void;
export type FuncListen = (callback: FuncListenCallback) => void;
export type FuncListenCallback = (data: EventDataType) => void;
export type FuncAppCallback = (Event: Event, Api: Api) => void;
export type FuncStringProcessStr = string | number;
export type FuncStringProcessKey = FuncStringProcessStr | Array<string | number>;
export type FuncStringProcessMode = 0 | 1 | 2;
export type FuncFetchSuper<T = Response> = (url: string, params?: { [key: string]: FuncStringProcessStr }, init?: RequestInit) => Promise<T>;
export type FuncSdkCq<T = Message> = (type: MessageCqType, data: MessageDataType) => T;
export type PluginData = [Promise<PluginEntity>, string, string, PluginInfo?];
export type PluginAsyncList = Set<PluginData>;
export type ConnectCallback = (arg: ConnectMethod) => void;

export interface ConnectMethod {
    send: FuncSend,
    listen: FuncListen
}

export enum CONNECT_MODE {
    http = 'Http',
    ws = 'Ws',
    'ws-reverse' = 'WsReverse'
};

export const enum LOG_PREFIX {
    SYS = '[System]',
    CONNECT = '[Connect]',
    PLUGIN = '[Plugin]',
    WEB = '[Web]',
    KOTORI = '[Kotori]',
    CMD = '[Result]'
}

export const enum PROCESS_CMD {
    HELP = 'help',
    STOP = 'stop',
    BOT = 'bot',
    PLUGIN = 'plugin',
    PASSWORD = 'password',
    SEND = 'send'
}

export const enum PLUGIN_GLOBAL {
    KOTORI_PLUGIN = 'Kotori',
    ADMIN_PLUGIN = 'kotori-bot-admin-server'
}

export interface ConnectConfig {
    mode: keyof typeof CONNECT_MODE,
    port: number,
    url?: string,
    reverse_port?: number,
    retry_time?: number
}

export interface PackageInfo {
    name: string,
    version: string,
    description: string,
    main: string,
    types: string,
    scripts: {
        start: string,
        dev: string,
        test: string,
        build: string,
        create: string
    },
    author: string,
    license: string,
    bugs: {

        url: string
    },
    homepage: string,
    dependencies: {
        [key: string]: string
    },
    devDependencies: {
        [key: string]: string
    }
}

export interface CreateData {
    project: string,
    style: 'class' | 'function',
    name: string,
    version: string,
    description: string,
    author: string,
    license: string
}

export interface BotInfo {
    self_id: number,
    connect: number,
    heartbeat: number,
    status: EventStatusType
}

export interface BotConfig {
    connect: {
        mode: keyof typeof CONNECT_MODE,
        'access-toekn': string,
        http: {
            url: string,
            port: number,
            'reverse-port': number,
            'retry-time': number
        },
        ws: {
            url: string,
            port: number,
            'retry-time': number
        },
        'ws-reverse': {
            port: number,
        }
    }
    bot: {
        master: number,
        'command-list': {
            reload: string
        }
    }
}

export interface PluginEntity {
    default: (Event: Event, Api: Api, Const?: Const, Proxy?: Object) => void | (new(Event: Event, Api: Api, Const?: Const, Proxy?: Object) => void) 
}

export interface PluginInfo {
    name?: string,
    description?: string,
    icon?: string,
    version?: string,
    author?: string,
    license?: string
}

export interface ConstGlobal {
    ROOT_PATH: string,
    PLUGIN_PATH: string,
    CONFIG_PATH: string,
    DATA_PATH: string,
    LOGS_PATH: string,
    BOT: BotInfo
}

export interface Const {
    _CONFIG: BotConfig,
    _CONFIG_PLUGIN_PATH: string,
    _DATA_PLUGIN_PATH: string,
    _BOT: BotInfo
}

/* Api */
/* 消息类型 */
// 消息
export type Msg = string | Message | Message[];
export type MessageCqType = 'face' | 'record' | 'video' | 'at' | 'share' | 'music' | 'image' | 'reply' | 'redbag' | 'poke' | 'gift' | 'forward' | 'node' | 'xml' | 'json' | 'cardimage' | 'tts';
export type MessageDataType = MessageFace | MessageRecord | MessageVideo | MessageAt | MessageShare | MessageMusic | MessageImage | MessageReply | MessageRedbag | MessagePoke | MessageGift | MessageForward | MessageNode | MessageXml | MessageJson | MessageCardImage | MessageTts;
export interface Message {
    type: MessageCqType,
    data: MessageDataType
}

export type MessageFaceId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221;

// QQ表情
export interface MessageFace {
    id: MessageFaceId
}

// 语音
export interface MessageRecordFile {
    file: string,
    magic?: 0 | 1
}

export interface MessageRecordUrl {
    file: string,
    url: string,
    cache?: 0 | 1,
    proxy?: 0 | 1,
    timeout?: number
}

export type MessageRecord = MessageRecordFile | MessageRecordUrl;

// 短视频
export interface MessageVideo {
    file: string,
    cover?: string,
    c?: 1 | 2 | 3
}

// @某人
export interface MessageAt {
    qq: 'all' | string | number,
    name?: string
}

// 链接分享
export interface MessageShare {
    url: string,
    title: string,
    content?: string,
    image?: string
}

// 音乐分享
export interface MessageMusic {
    type: 'qq' | '163' | 'xm',
    id: string
}

// 音乐自定义分享
export interface MessageMusicCustom {
    type: 'custom',
    url: string,
    audio: string,
    title: string,
    content?: string,
    image?: string
}

// 图片
export interface MessageImage {
    file: string,
    type?: 'flash' | 'show' | 'normal',
    subType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 13,
    url?: string,
    cache?: 0 | 1,
    id?: 40000 | 40001 | 40002 | 40003 | 40004 | 40005,
    c?: 1 | 2 | 3
}

//回复
export interface MessageReply {
    id: number,
    text: string,
    qq?: number,
    time?: number,
    seq?: number
}

// 红包(收)
export interface MessageRedbag {
    title: string
}

// 戳一戳(发)
export interface MessagePoke {
    qq: number
}

// 礼物
export interface MessageGift {
    qq: number,
    id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
}

// 合并转发
export interface MessageForward {
    id: string
}

// 合并转发消息节点
export interface MessageNodeCustom {
    name: string,
    uin: number,
    content: Message,
    seq: Message
}
export type MessageNode = {
    id: number
} | MessageNodeCustom

// XML消息
export interface MessageXml {
    data: string,
    resid?: number | '' | null
}

// JSON消息
export interface MessageJson extends MessageXml {
    resid?: number
}

// cardimage
export interface MessageCardImage {
    file: string,
    minwidth: number,
    minheight: number,
    maxwidth: number,
    maxheight: number,
    source: string,
    icon?: string
}

// 文本转语音
export interface MessageTts {
    text: string
}


export interface ApiInvitedRequest {
    request_id: number,
    invitor_uin: number,
    invitor_nick: number,
    group_id: number,
    group_name: string,
    checked: boolean,
    actor: number
}

export interface ApiJoinRequest extends ApiInvitedRequest {
    message: string
}

export interface Api {
    get_login_info: () => void,
    set_qq_profile: (nickname: string, company: string, email: string, college: string, personal_note: string) => void,
    _get_model_show: (model: string) => void,
    _set_model_show: (model: string, model_show?: string) => void,
    get_online_clients: (no_cache: boolean) => void,
    get_stranger_info: (user_id: number, no_cache: boolean) => void,
    get_friend_list: () => void,
    get_unidirectional_friend_list: () => void,
    delete_friend: (user_id: number) => void,
    delete_unidirectional_friend: (user_id: number) => void,
    send_private_msg: (message: Msg, user_id: number, auto_escape?: boolean) => void,
    send_group_msg: (message: Msg, group_id: number, auto_escape?: boolean) => void,
    send_msg: (message_type: 'private' | 'group', message: Msg, id: number, auto_escape?: boolean) => void
    get_msg: (message_id: number) => void,
    delete_msg: (message_id: number) => void,
    mark_msg_as_read: (message_id: number) => void,
    get_forward_msg: (message_id: string) => void,
    send_group_forward_msg: (messages: MessageForward | MessageNode[], group_id: number) => void,
    send_private_forward_msg: (messages: MessageForward | MessageNode[], user_id: number) => void,
    get_group_msg_history: (message_seq: number, group_id: number) => void,
    get_image: (file: string) => void,
    can_send_image: () => void,
    ocr_image: (image: string) => void,
    get_record: (file: string, out_format: string) => void,
    can_send_record: () => void,
    set_friend_add_request: (file: string, approve: boolean, remark: string) => void,
    set_group_add_request: (file: string, type: 'add' | ' invite', approve: boolean) => void,
    get_group_info: (group_id: number, no_cache: boolean) => void,
    get_group_list: (no_cache: boolean) => void,
    get_group_member_info: (group_id: number, user_id: number, no_cache: boolean) => void,
    get_group_member_list: (group_id: number, no_cache: boolean) => void,
    get_group_honor_info: (group_id: number, type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all') => void,
    get_group_system_msg: (invited_requests: ApiInvitedRequest[], join_requests: ApiJoinRequest[]) => void,
    get_essence_msg_list: (group_id: number) => void,
    get_group_at_all_remain: (group_id: number) => void,
    set_group_name: (group_id: number, group_name: string) => void,
    set_group_portrait: (group_id: number, file: string, cache: number) => void,
    set_group_admin: (group_id: number, user_id: number, enable: boolean) => void,
    set_group_card: (group_id: number, user_id: number, card: string) => void,
    set_group_special_title: (group_id: number, user_id: number, special_title: string, duration: number) => void,
    set_group_ban: (group_id: number, user_id: number, duration: number) => void,
    set_group_whole_ban: (group_id: number, enable?: boolean) => void,
    set_group_anonymous_ban: (group_id: number, flag: string, duration: number) => void,
    set_essence_msg: (message_id: number) => void,
    delete_essence_msg: (message_id: number) => void,
    send_group_sign: (group_id: number) => void,
    set_group_anonymous: (group_id: number, enable: boolean) => void,
    _send_group_notice: (group_id: number, content: string, image?: string) => void,
    _get_group_notice: (group_id: number) => void,
    set_group_kick: (group_id: number, user_id: number, reject_add_request?: boolean) => void,
    set_group_leave: (group_id: number, is_dismiss: boolean) => void,
    upload_group_file: (group_id: number, file: string, name: string, folder: string) => void,
    delete_group_file: (group_id: number, file_id: string, busid: number) => void,
    create_group_file_folder: (group_id: number, name: string, parent_id: '/') => void,
    delete_group_folder: (group_id: number, folder_id: string) => void,
    get_group_root_files: (group_id: number) => void,
    get_group_files_by_folder: (group_id: number, folder_id: string) => void,
    get_group_file_url: (group_id: number, file_id: string, busid: number) => void,
    upload_private_file: (group_id: number, file: string, name: string) => void,
    get_version_info: () => void,
    get_status: () => void,
    reload_event_filter: (file: string) => void,
    download_file: (url: string, thread_count: number, headers: string | obj[]) => void,
    check_url_safely: (url: string) => void,
    __get_word_slices: (content: string) => void,
    __handle_quick_operation: (context: obj, operation: obj) => void,
}


/* Event */
export type EventHandle = (data: EventDataType, callback: Function) => void;
export type EventListName = keyof EventList;
export type EventPostType = 'message' | 'message_sent' | 'request' | 'notice' | 'meta_event';
export type EventMessageType = 'private' | 'group';
export type EventSubType = 'friend' | 'normal' | 'anonymous' | 'group_self' | 'group' | 'notice' | 'connect';
export type EventRequestType = 'friend' | 'group';
export type EventNoticeType = 'group_upload' | 'group_admin' | 'group_decrease' | 'group_increase' | 'group_ban' | 'friend_add' | 'group_recall' | 'friend_recall' | 'group_card' | 'offline_file' | 'client_status' | 'essence' | 'notify';
export type EventNoticeNotifySubType = 'honor' | 'poke' | 'lucky_king' | 'title';
export type EventMetaEventType = 'lifecycle' | 'heartbeat'

export interface Event {
    listen: (action: EventListName, callback: FuncListenCallback) => void
}

export interface EventList {
    on_private_msg: EventHandle,
    on_group_msg: EventHandle,
    on_friend_recall: EventHandle,
    on_group_recall: EventHandle,
    on_group_increase: EventHandle,
    on_group_decrease: EventHandle,
    on_group_admin: EventHandle,
    on_group_upload: EventHandle,
    on_group_ban: EventHandle,
    on_friend_add: EventHandle,
    on_notify: EventHandle,
    on_group_card: EventHandle,
    on_offline_file: EventHandle,
    on_client_status: EventHandle,
    on_essence: EventHandle,
    on_friend_request: EventHandle,
    on_group_request: EventHandle,
    on_heartbeat: EventHandle,
    on_meta_event: EventHandle
}

export interface EventSenderType {
    user_id: number,
    nickname: string,
    sex: 'male' | 'female' | 'unknown',
    age: number
    /* ...待支持 */
}

export interface EventStatusType {
    app_initialized: boolean,
    app_enabled: boolean,
    plugins_good: boolean | null,
    app_good: boolean,
    online: boolean
    stat: EventStatType
}

export interface EventStatType {
    packet_received: number,
    packet_sent: number,
    packet_lost: number,
    message_received: number,
    message_sent: number,
    disconnect_times: number,
    lost_times: number,
    last_message_time: number
}

export interface EventDataType {
    post_type: EventPostType,
    message_type: EventMessageType,
    sub_type: EventSubType,
    request_type: EventRequestType,
    notice_type: EventNoticeType
    notice_notify_subtype: EventNoticeNotifySubType,
    meta_event_type: EventMetaEventType,
    time: number,
    self_id: number,
    message_: Message,
    message: string,
    message_id: number,
    raw_message: string,
    user_id: number,
    group_id?: number,
    sender: EventSenderType,
    status: EventStatusType
    font: number | 0
}
