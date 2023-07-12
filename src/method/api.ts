/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-21 01:37:57
 */

import { ApiInvitedRequest, ApiJoinRequest, Api as api, MessageForward, MessageNode, FuncSend } from "src/interface";

export class Api implements api {
    private send: FuncSend;
    public constructor (send: FuncSend) {
        this.send = send;
    }

    /* Bot账号 */
    /**
     * @description: 获取登录号信息 
     * @return {*}
     */
    public get_login_info = (): void => {
        this.send('get_login_info');
    }

    /**
     * @description: 设置登录号资料
     * @param {string} nickname 名称
     * @param {string} company 公司
     * @param {string} email 邮箱
     * @param {string} college 学校
     * @param {string} personal_note 个人说明
     * @return {*}
     */
    public set_qq_profile = (nickname: string, company: string, email: string, college: string, personal_note: string): void => {
        this.send('set_qq_profile', { nickname, company, email, college, personal_note });
    }

    /**
     * @description: 获取在线机型
     * @param {string} model 机型名称
     * @return {*}
     */
    public _get_model_show = (model: string): void => {
        this.send('_get_model_show', { model });
    }

    /**
     * @description: 设置在线机型
     * @param {string} model 机型名称
     * @param {string} model_show
     * @return {*}
     */
    public _set_model_show = (model: string, model_show?: string): void => {
        this.send('_set_model_show', { model, model_show });
    }

    /**
     * @description: 获取当前帐号在线客户端列表
     * @param {boolean} no_cache 是否无视缓存 默认false
     * @return {*}
     */
    public get_online_clients = (no_cache: boolean = false): void => {
        this.send('get_online_clients', { no_cache });
    }


    /* 好友信息 */
    /**
     * @description: 获取陌生人信息
     * @param {number} user_id QQ号
     * @param {boolean} no_cache 是否不使用缓存(使用缓存可能更新不及时,但响应更快) 默认false
     * @return {*}
     */
    public get_stranger_info = (user_id: number, no_cache: boolean = false): void => {
        this.send('get_stranger_info', { user_id, no_cache });
    }

    /**
     * @description: 获取好友列表
     * @return {*}
     */
    public get_friend_list = (): void => {
        this.send('get_frined_list');
    }

    /**
     * @description: 获取单向好友列表
     * @return {*}
     */
    public get_unidirectional_friend_list = (): void => {
        this.send('get_unidirectional_friend_list');
    }


    /* 好友操作 */
    /**
     * @description: 删除好友
     * @param {number} user_id 好友QQ号
     * @return {*}
     */
    public delete_friend = (user_id: number): void => {
        this.send('delete_friend', { user_id });
    }

    /**
     * @description: 删除单向好友
     * @param {number} user_id 单向好友QQ号
     * @return {*}
     */
    public delete_unidirectional_friend = (user_id: number): void => {
        this.send('delete_unidirectional_friend', { user_id });
    }


    /* 消息 */
    /**
     * @description: 发送私聊消息
     * @param {string} message 要发送的内容
     * @param {number} user_id 对方QQ号
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    public send_private_msg = (message: string, user_id: number, auto_escape: boolean = false): void => {
        this.send('send_private_msg', { user_id, message, auto_escape });
    }

    /**
     * @description: 发送私聊消息
     * @param {string} message 要发送的内容
     * @param {group_id} group_id 群号
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    public send_group_msg = (message: string, group_id: number, auto_escape: boolean = false): void => {
        this.send('send_group_msg', { group_id, message, auto_escape });
    }

    /**
     * @description: 发送消息
     * @param {string} message_type	消息类型,支持private、group,分别对应私聊、群组
     * @param {string} message 要发送的内容
     * @param {number} user_id 	对方QQ号(消息类型为private时需要)
     * @param {number} group_id 群号(消息类型为group时需要)
     * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
     * @return {*}
     */
    public send_msg = (message_type: 'private' | 'group', message: string, user_id?: number, group_id?: number, auto_escape: boolean = false): void => {
        this.send('send_msg',
            message_type === 'private' ?
                { message, user_id, auto_escape } :
                { message, group_id, auto_escape });
    }

    /**
     * @description: 获取消息
     * @param {number} message_id 消息id
     * @return {*}
     */
    public get_msg = (message_id: number): void => {
        this.send('get_msg', { message_id });
    }

    /**
     * @description: 撤回消息
     * @param {number} message_id 消息id
     * @return {*}
     */
    public delete_msg = (message_id: number): void => {
        this.send('delete_msg', { message_id });
    }

    /**
     * @description: 标记消息已读
     * @param {number} message_id 消息id
     * @return {*}
     */
    public mark_msg_as_read = (message_id: number): void => {
        this.send('mark_msg_as_read', { message_id });
    }

    /**
     * @description: 获取合并转发内容
     * @param {string} message_id 消息id
     * @return {*}
     */
    public get_forward_msg = (message_id: string): void => {
        this.send('get_forward_msg', { message_id });
    }

    /**
     * @description: 发送合并转发(群聊)
     * @param {msg_forward} messages 自定义转发消息
     * @param {number} group_id 群号
     * @return {*}
     */
    public send_group_forward_msg = (messages: MessageForward | MessageNode[], group_id: number): void => {
        this.send('send_group_forward_msg', { group_id, messages });
    }

    /**
     * @description: 发送合并转发(好友)
     * @param {msg_forward} messages 自定义转发消息
     * @param {number} user_id 好友QQ号
     * @return {*}
     */
    public send_private_forward_msg = (messages: MessageForward | MessageNode[], user_id: number): void => {
        this.send('send_private_forward_msg', { user_id, messages });
    }

    /**
     * @description: 获取群消息历史记录
     * @param {number} message_seq 起始消息序号,可通过 get_msg 获得
     * @param {number} group_id 群号
     * @return {*}
     */
    public get_group_msg_history = (message_seq: number, group_id: number): void => {
        this.send('get_group_msg_history', { group_id, message_seq });
    }


    /* 图片 */
    /**
     * @description: 获取图片信息
     * @param {string} file 图片缓存文件名
     * @return {*}
     */
    public get_image = (file: string): void => {
        this.send('get_image', { file });
    }

    /**
     * @description: 检查是否可以发送图片
     * @return {*}
     */
    public can_send_image = (): void => {
        this.send('can_send_image');
    }

    /**
     * @description: 图片OCR
     * @param {string} image 图片ID
     * @return {*}
     */
    public ocr_image = (image: string): void => {
        this.send('get_', { image });
    }


    /* 语音 */
    /**
     * @description: 获取语音
     * @param {string} file 收到的语音文件名
     * @param {string} out_format 要转换到的格式,目前支持 mp3、amr、wma、m4a、spx、ogg、wav、flac
     * @return {*}
     */
    public get_record = (file: string, out_format: string): void => {
        this.send('get_record', { file, out_format });
    }

    /**
     * @description: 检查是否可以发送语音
     * @return {*}
     */
    public can_send_record = (): void => {
        this.send('can_send_record');
    }


    /* 处理 */
    /**
     * @description: 处理加好友请求
     * @param {string} file 加好友请求的flag
     * @param {boolean} approve 是否同意请求,默认true
     * @param {string} remark 添加后的好友备注
     * @return {*}
     */
    public set_friend_add_request = (file: string, approve: boolean = true, remark: string): void => {
        this.send('set_friend_add_request', { file, approve, remark });
    }

    /**
     * @description: 处理加群请求/邀请
     * @param {string} file 加群请求的flag
     * @param {string} type add或invite
     * @param {boolean} approve 是否同意请求/邀请,默认true
     * @param {string} reason 	拒绝理由（仅在拒绝时有效）
     * @return {*}
     */
    public set_group_add_request = (file: string, type: 'add' | ' invite', approve: boolean = true, reason?: string): void => {
        this.send('set_group_add_request', { file, type, approve, reason });
    }


    /* 群消息 */
    /**
     * @description: 获取群信息
     * @param {number} group_id 群号
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    public get_group_info = (group_id: number, no_cache: boolean = false): void => {
        this.send('get_group_info', { group_id, no_cache });
    }
    
    /**
     * @description: 获取群列表
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    public get_group_list = (no_cache: boolean = false): void => {
        this.send('get_group_list', { no_cache });
    }
    
    /**
     * @description: 获取群成员信息
     * @param {number} group_id 群号
     * @param {number} user_id QQ号
     * @param {boolean} no_cache 是否不使用缓存
     * @return {*}
     */
    public get_group_member_info = (group_id: number, user_id: number, no_cache: boolean = false): void => {
        this.send('get_group_member_info', { group_id, user_id, no_cache });
    }
    
    /**
     * @description: 获取群成员列表
     * @param {number} group_id
     * @param {boolean} no_cache
     * @return {*}
     */
    public get_group_member_list = (group_id: number, no_cache: boolean = false): void => {
        this.send('get_group_member_list', { group_id, no_cache });
    }
    
    /**
     * @description: 获取群荣誉信息
     * @param {number} group_id 群号
     * @param {string} type 要获取的群荣誉类型,可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据,或传入 all 获取所有数据
     * @return {*}
     */
    public get_group_honor_info = (group_id: number, type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all' ): void => {
        this.send('get_group_honor_info', { group_id, type });
    }
    
    /**
     * @description: 获取群系统消息
     * @param {InvitedRequest} invited_requests 邀请消息列表
     * @param {JoinRequest} join_requests 进群消息列表
     * @return {*}
     */
    public get_group_system_msg = (invited_requests: ApiInvitedRequest[], join_requests: ApiJoinRequest[]): void => {
        this.send('get_group_system_msg', { invited_requests, join_requests });
    }
    
    /**
     * @description: 获取精华消息列表
     * @param {number} group_id 群号
     * @return {*}
     */
    public get_essence_msg_list = (group_id: number): void => {
        this.send('get_essence_msg_list', { group_id });
    }
    
    /**
     * @description: 获取群 @全体成员 剩余次数
     * @param {number} group_id 群号
     * @return {*}
     */
    public get_group_at_all_remain = (group_id: number): void => {
        this.send('get_group_at_all_remain', { group_id });
    }


    /* 设置 */
    /**
     * @description: 设置群名
     * @param {number} group_id 群号
     * @param {string} group_name 新群名
     * @return {*}
     */
    public set_group_name = (group_id: number, group_name: string): void => {
        this.send('set_group_name', { group_id, group_name});
    }

    /**
     * @description: 设置群头像
     * @param {number} group_id 群号
     * @param {string} file 图片文件名
     * @param {number} cache 表示是否使用已缓存的文件
     * @return {*}
     */
    public set_group_portrait = (group_id: number, file: string, cache: number): void => {
        this.send('set_group_portrait', { group_id, file, cache });
    }

    /**
     * @description: 设置群管理员
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的管理员的QQ号
     * @param {boolean} enable true为设置,false取消,默认true
     * @return {*}
     */
    public set_group_admin = (group_id: number, user_id: number, enable: boolean = true): void => {
        this.send('set_group_admin', { group_id, user_id, enable});
    }

    /**
     * @description: 设置群名片(群备注)
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的QQ号
     * @param {string} card 群名片内容, 不填或空字符串表示删除群名片
     * @return {*}
     */
    public set_group_card = (group_id: number, user_id: number, card: string): void => {
        this.send('set_group_card', { group_id, user_id, card});
    }

    /**
     * @description: 设置群组专属头衔
     * @param {number} group_id 群号
     * @param {number} user_id 要设置的QQ号
     * @param {string} special_title 	专属头衔, 不填或空字符串表示删除专属头衔
     * @param {number} duration
     * @return {*}
     */
    public set_group_special_title = (group_id: number, user_id: number, special_title: string, duration: number = -1): void => {
        this.send('set_group_special_title', { group_id, user_id, special_title, duration});
    }


    /* 群操作 */
    /**
     * @description: 群单人禁言
     * @param {number} group_id 群号
     * @param {number} user_id 要禁言的QQ号
     * @param {number} duration 禁言时长,单位秒,0表示取消禁言
     * @return {*}
     */
    public set_group_ban = (group_id: number, user_id: number, duration: number = 30 * 60): void => {
        this.send('set_group_ban', { group_id, user_id, duration });
    }

    /**
     * @description: 群全员禁言
     * @param {number} group_id 群号
     * @param {boolean} enable 是否禁用,默认true
     * @return {*}
     */
    public set_group_whole_ban = (group_id: number, enable: boolean = true): void => {
        this.send('set_group_whole_ban', { group_id, enable });
    }

    /**
     * @description: 群匿名用户禁言
     * @param {number} group_id 群号
     * @param {string} flag  要禁言的匿名用户的 flag(从群消息上报的数据中获得)
     * @param {number} duration 禁言时长,单位秒,无法取消匿名用户禁言
     * @return {*}
     */
    public set_group_anonymous_ban = (group_id: number, flag: string, duration: number = 30 * 60): void => {
        this.send('set_group_anonymous_ban', { group_id, flag, duration });
    }

    /**
     * @description: 设置精华消息
     * @param {number} message_id 消息ID
     * @return {*}
     */
    public set_essence_msg = (message_id: number): void => {
        this.send('set_essence_msg', { message_id });
    }

    /**
     * @description: 移出精华消息
     * @param {number} message_id 消息ID
     * @return {*}
     */
    public delete_essence_msg = (message_id: number): void => {
        this.send('delete_essence_msg', { message_id });
    }

    /**
     * @description: 群打卡
     * @param {number} group_id 群号
     * @return {*}
     */
    public send_group_sign = (group_id: number): void => {
        this.send('send_group_sign', { group_id });
    }

    /**
     * @description: 群设置匿名
     * @param {number} group_id 群号
     * @param {boolean} enable 是否允许匿名聊天,默认true
     * @return {*}
     */
    public set_group_anonymous = (group_id: number, enable: boolean = true, ): void => {
        this.send('set_group_anonymous', { group_id, enable });
    }

    /**
     * @description: 发送群公告
     * @param {number} group_id 群号
     * @param {string} content 公告内容
     * @param {string} image 图片路径(可选)
     * @return {*}
     */
    public _send_group_notice = (group_id: number, content: string, image?: string): void => {
        this.send('_send_group_notice', { group_id, content, image });
    }

    /**
     * @description: 获取群公告
     * @param {number} group_id 群号
     * @return {*}
     */
    public _get_group_notice = (group_id: number): void => {
        this.send('_get_group_notice', { group_id });
    }

    /**
     * @description: 群组踢人
     * @param {number} group_id 群号
     * @param {number} user_id 要踢的QQ号
     * @param {boolean} reject_add_request 拒绝此人的加群请求,默认false
     * @return {*}
     */
    public set_group_kick = (group_id: number, user_id: number, reject_add_request: boolean = false): void => {
        this.send('_get_group_notice', { group_id, user_id, reject_add_request });
    }

    /**
     * @description: 退出群组
     * @param {number} group_id 群号
     * @param {boolean} is_dismiss 是否解散,如果登录号是群主,则仅在此项为true时能够解散
     * @return {*}
     */
    public set_group_leave = (group_id: number, is_dismiss: boolean = false): void => {
        this.send('set_group_kick', { group_id, is_dismiss});
    }


    /* 文件 */
    /**
     * @description: 上传群文件
     * @param {number} group_id 群号
     * @param {string} file 本地文件路径
     * @param {string} name 储存名称
     * @param {string} folder 父目录ID
     * @return {*}
     */
    public upload_group_file = (group_id: number, file: string, name: string, folder: string): void => {
        this.send('upload_group_file', { group_id, file, name, folder});
    }
    
    /**
     * @description: 删除群文件
     * @param {number} group_id 群号
     * @param {string} file_id 文件ID,参考File对象
     * @param {number} busid 文件类型,参考File对象
     * @return {*}
     */
    public delete_group_file = (group_id: number, file_id: string, busid: number): void => {
        this.send('delete_group_file', { group_id, file_id, busid });
    }
    
    /**
     * @description: 创建群文件文件夹
     * @param {number} group_id 群号
     * @param {string} name 文件夹名称
     * @param {string} parent_id 仅能为/
     * @return {*}
     */
    public create_group_file_folder = (group_id: number, name: string, parent_id: '/' ): void => {
        this.send('create_group_file_folder', { group_id, name, parent_id});
    }
    
    /**
     * @description: 删除群文件文件夹
     * @param {number} group_id 群号
     * @param {string} folder_id 文件夹ID,参考Folder对象
     * @return {*}
     */
    public delete_group_folder = (group_id: number, folder_id: string): void => {
        this.send('delete_group_folder', { group_id, folder_id});
    }
    
    /**
     * @description: 获取群文件系统信息
     * @param {number} group_id 群号
     * @return {*}
     */
    public get_group_file_system_info = (group_id: number): void => {
        this.send('get_group_file_system_info', { group_id });
    }
    
    /**
     * @description: 获取群根目录文件列表
     * @param {number} group_id 群号
     * @return {*}
     */
    public get_group_root_files = (group_id: number): void => {
        this.send('get_group_root_files', { group_id });
    }
    
    /**
     * @description: 获取群子目录文件列表
     * @param {number} group_id 群号
     * @param {string} folder_id 文件夹ID,参考Folder对象
     * @return {*}
     */
    public get_group_files_by_folder = (group_id: number, folder_id: string): void => {
        this.send('get_group_files_by_folder', { group_id, folder_id});
    }
    
    /**
     * @description: 获取群文件资源链接
     * @param {number} group_id 群号
     * @param {string} file_id 文件ID,参考File对象
     * @param {number} busid 文件类型,参考File对象
     * @return {*}
     */
    public get_group_file_url = (group_id: number, file_id: string, busid: number): void => {
        this.send('get_group_file_url', { group_id, file_id, busid });
    }
    
    /**
     * @description: 上传私聊文件
     * @param {number} group_id 群号
     * @param {string} file 本地文件路径
     * @param {string} name 文件名称
     * @return {*}
     */
    public upload_private_file = (group_id: number, file: string, name: string): void => {
        this.send('upload_private_file', { group_id, file, name });
    }


    /* Go-CqHttp相关 */
    /**
     * @description: 获取版本信息
     * @return {*}
     */
    public get_version_info = (): void => {
        this.send('get_version_info');
    }
    
    /**
     * @description: 获取状态
     * @return {*}
     */
    public get_status = (): void => {
        this.send('get_status');
    }
    
    /**
     * @description: 重载事件过滤器
     * @param {string} file 事件过滤器文件
     * @return {*}
     */
    public reload_event_filter = (file: string): void => {
        this.send('reload_event_filter', { file });
    }
    
    /**
     * @description: 下载文件到缓存目录
     * @param {string} url 链接地址
     * @param {number} thread_count 下载线程数
     * @param {string | object[]} headers 自定义请求头
     * @return {*}
     */
    public download_file = (url: string, thread_count: number, headers: string | object[]): void => {
        this.send('download_file', { url, thread_count, headers });
    }
    
    /**
     * @description: 检查链接安全性
     * @param {string} url 需要检查的链接
     * @return {*}
     */
    public check_url_safely = (url: string): void => {
        this.send('check_url_safely', { url });
    }
    
    /**
     * @description: 获取中文分词(隐藏API)
     * @param {string} content 内容
     * @return {*}
     */
    public __get_word_slices = (content: string): void => {
        this.send('.get_word_slices', { content });
    }
    
    /**
     * @description: 对事件执行快速操作(隐藏API)
     * @param {object} context 事件数据对象,可做精简,如去掉message等无用字段
     * @param {object} operation 快速操作对象,例如{"ban":true,"reply":"请不要说脏话"}
     * @return {*}
     */
    public __handle_quick_operation = (context: object, operation: object): void => {
        this.send('.handle_quick_operation', { context, operation });
    }
}

export default Api;
