import { obj } from '../function';
export interface message {
    type: string;
    data: Object;
}
export interface msg_face {
    id: string;
}
export interface msg_record {
    file: string;
}
export interface msg_video extends msg_record {
}
export interface msg_at {
    qq: string;
    name: string;
}
export interface msg_share {
    url: string;
    title: string;
}
export interface msg_music {
    type: 'qq' | '163' | 'xm';
    id: string;
}
export interface msg_musicCustom {
    type: 'custom';
    url: string;
    audio: string;
    title: string;
    content: string;
    image: string;
}
export interface msg_image {
    file: string;
    type: null | 'flash' | 'show';
    subType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 13;
    url: string;
    cache: 0 | 1;
    id: 40000 | 40001 | 40002 | 40003 | 40004 | 40005;
    c: 2 | 3;
}
export interface msg_reply {
    id: number;
    text: string;
    qq: number;
    time: number;
    seq: number;
}
export interface msg_redbag {
    title: string;
}
export interface msg_poke {
    qq: number;
}
export interface msg_gift {
    qq: number;
    id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
}
export interface msg_forward {
    id: string;
}
export interface msg_node {
    id: number;
    name: string;
    uin: number;
    content: message;
    seq: message;
}
export interface msg_xml {
    data: string;
    resid: number | '' | null;
}
export interface msg_json extends msg_xml {
    resid: number | 0;
}
export interface msg_cardimage {
    file: string;
    minwidth: number;
    minheight: number;
    maxwidth: number;
    maxheight: number;
    source: string;
    icon: string;
}
export interface tts {
    text: string;
}
export interface InvitedRequest {
    request_id: number;
    invitor_uin: number;
    invitor_nick: number;
    group_id: number;
    group_name: string;
    checked: boolean;
    actor: number;
}
export interface JoinRequest extends InvitedRequest {
    message: string;
}
declare class Api {
    private send;
    constructor(send: Function);
    /**
     * @description: 获取登录号信息
     * @return {*}
     */
    get_login_info: () => void;
    /**
     * @description: 设置登录号资料
     * @param {string} nickname 名称
     * @param {string} company 公司
     * @param {string} email 邮箱
     * @param {string} college 学校
     * @param {string} personal_note 个人说明
     * @return {*}
     */
    set_qq_profile: (nickname: string, company: string, email: string, college: string, personal_note: string) => void;
    /**
     * @description: 获取在线机型
     * @param {string} model 机型名称
     * @return {*}
     */
    _get_model_show: (model: string) => void;
    /**
     * @description: 设置在线机型
     * @param {string} model 机型名称
     * @param {string} model_show
     * @return {*}
     */
    _set_model_show: (model: string, model_show?: string) => void;
    /**
     * @description: 获取当前帐号在线客户端列表
     * @param {boolean} no_cache 是否无视缓存 默认false
     * @return {*}
     */
    get_online_clients: (no_cache?: boolean) => void;
    /**
     * @description: 获取陌生人信息
     * @param {number} user_id QQ号
     * @param {boolean} no_cache 是否不使用缓存(使用缓存可能更新不及时,但响应更快) 默认false
     * @return {*}
     */
    get_stranger_info: (user_id: number, no_cache?: boolean) => void;
    /**
     * @description: 获取好友列表
     * @return {*}
     */
    get_friend_list: () => void;
    /**
     * @description: 获取单向好友列表
     * @return {*}
     */
    get_unidirectional_friend_list: () => void;
    /**
     * @description: 删除好友
     * @param {number} user_id 好友QQ号
     * @return {*}
     */
    delete_friend: (user_id: number) => void;
    /**
     * @description: 删除单向好友
     * @param {number} user_id 单向好友QQ号
     * @return {*}
     */
    delete_unidirectional_friend: (user_id: number) => void;
    /**
     * @description: 发送私聊消息
     * @param {string} message 要发送的内容
     * @param {number} user_id 对方QQ号
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    send_private_msg: (message: string, user_id: number, auto_escape?: boolean) => void;
    /**
     * @description: 发送私聊消息
     * @param {string} message 要发送的内容
     * @param {group_id} group_id 群号
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    send_group_msg: (message: string, group_id: number, auto_escape?: boolean) => void;
    /**
     * @description: 发送消息
     * @param {string} message_type	消息类型,支持private、group,分别对应私聊、群组
     * @param {string} message 要发送的内容
     * @param {number} user_id 	对方QQ号(消息类型为private时需要)
     * @param {number} group_id 群号(消息类型为group时需要)
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    send_msg: (message_type: 'private' | 'group', message: string, user_id?: number, group_id?: number, auto_escape?: boolean) => void;
    /**
     * @description: 获取消息
     * @param {number} message_id 消息id
     * @return {*}
     */
    get_msg: (message_id: number) => void;
    /**
     * @description: 撤回消息
     * @param {number} message_id 消息id
     * @return {*}
     */
    delete_msg: (message_id: number) => void;
    /**
     * @description: 标记消息已读
     * @param {number} message_id 消息id
     * @return {*}
     */
    mark_msg_as_read: (message_id: number) => void;
    /**
     * @description: 获取合并转发内容
     * @param {string} message_id 消息id
     * @return {*}
     */
    get_forward_msg: (message_id: string) => void;
    /**
     * @description: 发送合并转发(群聊)
     * @param {msg_forward} messages 自定义转发消息
     * @param {number} group_id 群号
     * @return {*}
     */
    send_group_forward_msg: (messages: msg_forward | msg_node[], group_id: number) => void;
    /**
     * @description: 发送合并转发(好友)
     * @param {msg_forward} messages 自定义转发消息
     * @param {number} user_id 好友QQ号
     * @return {*}
     */
    send_private_forward_msg: (messages: msg_forward | msg_node[], user_id: number) => void;
    /**
     * @description: 获取群消息历史记录
     * @param {number} message_seq 起始消息序号,可通过 get_msg 获得
     * @param {number} group_id 群号
     * @return {*}
     */
    get_group_msg_history: (message_seq: number, group_id: number) => void;
    /**
     * @description: 获取图片信息
     * @param {string} file 图片缓存文件名
     * @return {*}
     */
    get_image: (file: string) => void;
    /**
     * @description: 检查是否可以发送图片
     * @return {*}
     */
    can_send_image: () => void;
    /**
     * @description: 图片OCR
     * @param {string} image 图片ID
     * @return {*}
     */
    ocr_image: (image: string) => void;
    /**
     * @description: 获取语音
     * @param {string} file 收到的语音文件名
     * @param {string} out_format 要转换到的格式,目前支持 mp3、amr、wma、m4a、spx、ogg、wav、flac
     * @return {*}
     */
    get_record: (file: string, out_format: string) => void;
    /**
     * @description: 检查是否可以发送语音
     * @return {*}
     */
    can_send_record: () => void;
    /**
     * @description: 处理加好友请求
     * @param {string} file 加好友请求的flag
     * @param {boolean} approve 是否同意请求,默认true
     * @param {string} remark 添加后的好友备注
     * @return {*}
     */
    set_friend_add_request: (file: string, approve: boolean | undefined, remark: string) => void;
    /**
     * @description: 处理加群请求/邀请
     * @param {string} file 加群请求的flag
     * @param {string} type add或invite
     * @param {boolean} approve 是否同意请求/邀请,默认true
     * @param {string} reason 	拒绝理由（仅在拒绝时有效）
     * @return {*}
     */
    set_group_add_request: (file: string, type: 'add' | ' invite', approve?: boolean, reason?: string) => void;
    /**
     * @description: 获取群信息
     * @param {number} group_id 群号
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    get_group_info: (group_id: number, no_cache?: boolean) => void;
    /**
     * @description: 获取群列表
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    get_group_list: (no_cache?: boolean) => void;
    /**
     * @description: 获取群成员信息
     * @param {number} group_id 群号
     * @param {number} user_id QQ号
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    get_group_member_info: (group_id: number, user_id: number, no_cache?: boolean) => void;
    /**
     * @description: 获取群成员列表
     * @param {number} group_id
     * @param {boolean} no_cache
     * @return {*}
     */
    get_group_member_list: (group_id: number, no_cache?: boolean) => void;
    /**
     * @description: 获取群荣誉信息
     * @param {number} group_id 群号
     * @param {string} type 要获取的群荣誉类型,可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据,或传入 all 获取所有数据
     * @return {*}
     */
    get_group_honor_info: (group_id: number, type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all') => void;
    /**
     * @description: 获取群系统消息
     * @param {InvitedRequest} invited_requests 邀请消息列表
     * @param {JoinRequest} join_requests 进群消息列表
     * @return {*}
     */
    get_group_system_msg: (invited_requests: InvitedRequest[], join_requests: JoinRequest[]) => void;
    /**
     * @description: 获取精华消息列表
     * @param {number} group_id 群号
     * @return {*}
     */
    get_essence_msg_list: (group_id: number) => void;
    /**
     * @description: 获取群 @全体成员 剩余次数
     * @param {number} group_id 群号
     * @return {*}
     */
    get_group_at_all_remain: (group_id: number) => void;
    /**
     * @description: 设置群名
     * @param {number} group_id 群号
     * @param {string} group_name 新群名
     * @return {*}
     */
    set_group_name: (group_id: number, group_name: string) => void;
    /**
     * @description: 设置群头像
     * @param {number} group_id 群号
     * @param {string} file 图片文件名
     * @param {number} cache 表示是否使用已缓存的文件
     * @return {*}
     */
    set_group_portrait: (group_id: number, file: string, cache: number) => void;
    /**
     * @description: 设置群管理员
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的管理员的QQ号
     * @param {boolean} enable true为设置,false取消,默认true
     * @return {*}
     */
    set_group_admin: (group_id: number, user_id: number, enable?: boolean) => void;
    /**
     * @description: 设置群名片(群备注)
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的QQ号
     * @param {string} card 群名片内容, 不填或空字符串表示删除群名片
     * @return {*}
     */
    set_group_card: (group_id: number, user_id: number, card: string) => void;
    /**
     * @description: 设置群组专属头衔
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的QQ号
     * @param {string} special_title 	专属头衔, 不填或空字符串表示删除专属头衔
     * @param {number} duration
     * @return {*}
     */
    set_group_special_title: (group_id: number, user_id: number, special_title: string, duration?: number) => void;
    /**
     * @description: 群单人禁言
     * @param {number} group_id 群号
     * @param {number} user_id 要禁言的QQ号
     * @param {number} duration 禁言时长,单位秒,0表示取消禁言
     * @return {*}
     */
    set_group_ban: (group_id: number, user_id: number, duration?: number) => void;
    /**
     * @description: 群全员禁言
     * @param {number} group_id 群号
     * @param {boolean} enable 是否禁用,默认true
     * @return {*}
     */
    set_group_whole_ban: (group_id: number, enable?: boolean) => void;
    /**
     * @description: 群匿名用户禁言
     * @param {number} group_id 群号
     * @param {string} flag  要禁言的匿名用户的 flag(从群消息上报的数据中获得)
     * @param {number} duration 禁言时长,单位秒,无法取消匿名用户禁言
     * @return {*}
     */
    set_group_anonymous_ban: (group_id: number, flag: string, duration?: number) => void;
    /**
     * @description: 设置精华消息
     * @param {number} message_id 消息ID
     * @return {*}
     */
    set_essence_msg: (message_id: number) => void;
    /**
     * @description: 移出精华消息
     * @param {number} message_id 消息ID
     * @return {*}
     */
    delete_essence_msg: (message_id: number) => void;
    /**
     * @description: 群打卡
     * @param {number} group_id 群号
     * @return {*}
     */
    send_group_sign: (group_id: number) => void;
    /**
     * @description: 群设置匿名
     * @param {number} group_id 群号
     * @param {boolean} enable 是否允许匿名聊天,默认true
     * @return {*}
     */
    set_group_anonymous: (group_id: number, enable?: boolean) => void;
    /**
     * @description: 发送群公告
     * @param {number} group_id 群号
     * @param {string} content 公告内容
     * @param {string} image 图片路径(可选)
     * @return {*}
     */
    _send_group_notice: (group_id: number, content: string, image?: string) => void;
    /**
     * @description: 获取群公告
     * @param {number} group_id 群号
     * @return {*}
     */
    _get_group_notice: (group_id: number) => void;
    /**
     * @description: 群组踢人
     * @param {number} group_id 群号
     * @param {number} user_id 要踢的QQ号
     * @param {boolean} reject_add_request 拒绝此人的加群请求,默认false
     * @return {*}
     */
    set_group_kick: (group_id: number, user_id: number, reject_add_request?: boolean) => void;
    /**
     * @description: 退出群组
     * @param {number} group_id 群号
     * @param {boolean} is_dismiss 是否解散,如果登录号是群主,则仅在此项为true时能够解散
     * @return {*}
     */
    set_group_leave: (group_id: number, is_dismiss?: boolean) => void;
    /**
     * @description: 上传群文件
     * @param {number} group_id 群号
     * @param {string} file 本地文件路径
     * @param {string} name 储存名称
     * @param {string} folder 父目录ID
     * @return {*}
     */
    upload_group_file: (group_id: number, file: string, name: string, folder: string) => void;
    /**
     * @description: 删除群文件
     * @param {number} group_id 群号
     * @param {string} file_id 文件ID,参考File对象
     * @param {number} busid 文件类型,参考File对象
     * @return {*}
     */
    delete_group_file: (group_id: number, file_id: string, busid: number) => void;
    /**
     * @description: 创建群文件文件夹
     * @param {number} group_id 群号
     * @param {string} name 文件夹名称
     * @param {string} parent_id 仅能为/
     * @return {*}
     */
    create_group_file_folder: (group_id: number, name: string, parent_id: '/') => void;
    /**
     * @description: 删除群文件文件夹
     * @param {number} group_id 群号
     * @param {string} folder_id 文件夹ID,参考Folder对象
     * @return {*}
     */
    delete_group_folder: (group_id: number, folder_id: string) => void;
    /**
     * @description: 获取群文件系统信息
     * @param {number} group_id 群号
     * @return {*}
     */
    get_group_file_system_info: (group_id: number) => void;
    /**
     * @description: 获取群根目录文件列表
     * @param {number} group_id 群号
     * @return {*}
     */
    get_group_root_files: (group_id: number) => void;
    /**
     * @description: 获取群子目录文件列表
     * @param {number} group_id 群号
     * @param {string} folder_id 文件夹ID,参考Folder对象
     * @return {*}
     */
    get_group_files_by_folder: (group_id: number, folder_id: string) => void;
    /**
     * @description: 获取群文件资源链接
     * @param {number} group_id 群号
     * @param {string} file_id 文件ID,参考File对象
     * @param {number} busid 文件类型,参考File对象
     * @return {*}
     */
    get_group_file_url: (group_id: number, file_id: string, busid: number) => void;
    /**
     * @description: 上传私聊文件
     * @param {number} group_id 群号
     * @param {string} file 本地文件路径
     * @param {string} name 文件名称
     * @return {*}
     */
    upload_private_file: (group_id: number, file: string, name: string) => void;
    /**
     * @description: 获取版本信息
     * @return {*}
     */
    get_version_info: () => void;
    /**
     * @description: 获取状态
     * @return {*}
     */
    get_status: () => void;
    /**
     * @description: 重载事件过滤器
     * @param {string} file 事件过滤器文件
     * @return {*}
     */
    reload_event_filter: (file: string) => void;
    /**
     * @description: 下载文件到缓存目录
     * @param {string} url 链接地址
     * @param {number} thread_count 下载线程数
     * @param {string} headers 自定义请求头
     * @return {*}
     */
    download_file: (url: string, thread_count: number, headers: string | obj[]) => void;
    /**
     * @description: 检查链接安全性
     * @param {string} url 需要检查的链接
     * @return {*}
     */
    check_url_safely: (url: string) => void;
    /**
     * @description: 获取中文分词(隐藏API)
     * @param {string} content 内容
     * @return {*}
     */
    __get_word_slices: (content: string) => void;
    /**
     * @description: 对事件执行快速操作(隐藏API)
     * @param {obj} context 事件数据对象,可做精简,如去掉message等无用字段
     * @param {obj} operation 快速操作对象,例如{"ban":true,"reply":"请不要说脏话"}
     * @return {*}
     */
    __handle_quick_operation: (context: obj, operation: obj) => void;
}
export default Api;
