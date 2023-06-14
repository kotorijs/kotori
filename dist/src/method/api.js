"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Api = /** @class */ (function () {
    function Api(send) {
        var _this = this;
        /* Bot账号 */
        /**
         * @description: 获取登录号信息
         * @return {*}
         */
        this.get_login_info = function () {
            _this.send('get_login_info');
        };
        /**
         * @description: 设置登录号资料
         * @param {string} nickname 名称
         * @param {string} company 公司
         * @param {string} email 邮箱
         * @param {string} college 学校
         * @param {string} personal_note 个人说明
         * @return {*}
         */
        this.set_qq_profile = function (nickname, company, email, college, personal_note) {
            _this.send('set_qq_profile', { nickname: nickname, company: company, email: email, college: college, personal_note: personal_note });
        };
        /**
         * @description: 获取在线机型
         * @param {string} model 机型名称
         * @return {*}
         */
        this._get_model_show = function (model) {
            _this.send('_get_model_show', { model: model });
        };
        /**
         * @description: 设置在线机型
         * @param {string} model 机型名称
         * @param {string} model_show
         * @return {*}
         */
        this._set_model_show = function (model, model_show) {
            _this.send('_set_model_show', { model: model, model_show: model_show });
        };
        /**
         * @description: 获取当前帐号在线客户端列表
         * @param {boolean} no_cache 是否无视缓存 默认false
         * @return {*}
         */
        this.get_online_clients = function (no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_online_clients', { no_cache: no_cache });
        };
        /* 好友信息 */
        /**
         * @description: 获取陌生人信息
         * @param {number} user_id QQ号
         * @param {boolean} no_cache 是否不使用缓存(使用缓存可能更新不及时,但响应更快) 默认false
         * @return {*}
         */
        this.get_stranger_info = function (user_id, no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_stranger_info', { user_id: user_id, no_cache: no_cache });
        };
        /**
         * @description: 获取好友列表
         * @return {*}
         */
        this.get_friend_list = function () {
            _this.send('get_frined_list');
        };
        /**
         * @description: 获取单向好友列表
         * @return {*}
         */
        this.get_unidirectional_friend_list = function () {
            _this.send('get_unidirectional_friend_list');
        };
        /* 好友操作 */
        /**
         * @description: 删除好友
         * @param {number} user_id 好友QQ号
         * @return {*}
         */
        this.delete_friend = function (user_id) {
            _this.send('delete_friend', { user_id: user_id });
        };
        /**
         * @description: 删除单向好友
         * @param {number} user_id 单向好友QQ号
         * @return {*}
         */
        this.delete_unidirectional_friend = function (user_id) {
            _this.send('delete_unidirectional_friend', { user_id: user_id });
        };
        /* 消息 */
        /**
         * @description: 发送私聊消息
         * @param {string} message 要发送的内容
         * @param {number} user_id 对方QQ号
         * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
         * @return {*}
         */
        this.send_private_msg = function (message, user_id, auto_escape) {
            if (auto_escape === void 0) { auto_escape = false; }
            _this.send('send_private_msg', { user_id: user_id, message: message, auto_escape: auto_escape });
        };
        /**
         * @description: 发送私聊消息
         * @param {string} message 要发送的内容
         * @param {group_id} group_id 群号
         * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
         * @return {*}
         */
        this.send_group_msg = function (message, group_id, auto_escape) {
            if (auto_escape === void 0) { auto_escape = false; }
            _this.send('send_group_msg', { group_id: group_id, message: message, auto_escape: auto_escape });
        };
        /**
         * @description: 发送消息
         * @param {string} message_type	消息类型,支持private、group,分别对应私聊、群组
         * @param {string} message 要发送的内容
         * @param {number} user_id 	对方QQ号(消息类型为private时需要)
         * @param {number} group_id 群号(消息类型为group时需要)
         * @param {boolean} auto_escape 消息内容是否作为纯文本发送(即不解析CQ码) 默认false
         * @return {*}
         */
        this.send_msg = function (message_type, message, user_id, group_id, auto_escape) {
            if (auto_escape === void 0) { auto_escape = false; }
            _this.send('send_msg', message_type === 'private' ?
                { message: message, user_id: user_id, auto_escape: auto_escape } :
                { message: message, group_id: group_id, auto_escape: auto_escape });
        };
        /**
         * @description: 获取消息
         * @param {number} message_id 消息id
         * @return {*}
         */
        this.get_msg = function (message_id) {
            _this.send('get_msg', { message_id: message_id });
        };
        /**
         * @description: 撤回消息
         * @param {number} message_id 消息id
         * @return {*}
         */
        this.delete_msg = function (message_id) {
            _this.send('delete_msg', { message_id: message_id });
        };
        /**
         * @description: 标记消息已读
         * @param {number} message_id 消息id
         * @return {*}
         */
        this.mark_msg_as_read = function (message_id) {
            _this.send('mark_msg_as_read', { message_id: message_id });
        };
        /**
         * @description: 获取合并转发内容
         * @param {string} message_id 消息id
         * @return {*}
         */
        this.get_forward_msg = function (message_id) {
            _this.send('get_forward_msg', { message_id: message_id });
        };
        /**
         * @description: 发送合并转发(群聊)
         * @param {msg_forward} messages 自定义转发消息
         * @param {number} group_id 群号
         * @return {*}
         */
        this.send_group_forward_msg = function (messages, group_id) {
            _this.send('send_group_forward_msg', { group_id: group_id, messages: messages });
        };
        /**
         * @description: 发送合并转发(好友)
         * @param {msg_forward} messages 自定义转发消息
         * @param {number} user_id 好友QQ号
         * @return {*}
         */
        this.send_private_forward_msg = function (messages, user_id) {
            _this.send('send_private_forward_msg', { user_id: user_id, messages: messages });
        };
        /**
         * @description: 获取群消息历史记录
         * @param {number} message_seq 起始消息序号,可通过 get_msg 获得
         * @param {number} group_id 群号
         * @return {*}
         */
        this.get_group_msg_history = function (message_seq, group_id) {
            _this.send('get_group_msg_history', { group_id: group_id, message_seq: message_seq });
        };
        /* 图片 */
        /**
         * @description: 获取图片信息
         * @param {string} file 图片缓存文件名
         * @return {*}
         */
        this.get_image = function (file) {
            _this.send('get_image', { file: file });
        };
        /**
         * @description: 检查是否可以发送图片
         * @return {*}
         */
        this.can_send_image = function () {
            _this.send('can_send_image');
        };
        /**
         * @description: 图片OCR
         * @param {string} image 图片ID
         * @return {*}
         */
        this.ocr_image = function (image) {
            _this.send('get_', { image: image });
        };
        /* 语音 */
        /**
         * @description: 获取语音
         * @param {string} file 收到的语音文件名
         * @param {string} out_format 要转换到的格式,目前支持 mp3、amr、wma、m4a、spx、ogg、wav、flac
         * @return {*}
         */
        this.get_record = function (file, out_format) {
            _this.send('get_record', { file: file, out_format: out_format });
        };
        /**
         * @description: 检查是否可以发送语音
         * @return {*}
         */
        this.can_send_record = function () {
            _this.send('can_send_record');
        };
        /* 处理 */
        /**
         * @description: 处理加好友请求
         * @param {string} file 加好友请求的flag
         * @param {boolean} approve 是否同意请求,默认true
         * @param {string} remark 添加后的好友备注
         * @return {*}
         */
        this.set_friend_add_request = function (file, approve, remark) {
            if (approve === void 0) { approve = true; }
            _this.send('set_friend_add_request', { file: file, approve: approve, remark: remark });
        };
        /**
         * @description: 处理加群请求/邀请
         * @param {string} file 加群请求的flag
         * @param {string} type add或invite
         * @param {boolean} approve 是否同意请求/邀请,默认true
         * @param {string} reason 	拒绝理由（仅在拒绝时有效）
         * @return {*}
         */
        this.set_group_add_request = function (file, type, approve, reason) {
            if (approve === void 0) { approve = true; }
            _this.send('set_group_add_request', { file: file, type: type, approve: approve, reason: reason });
        };
        /* 群消息 */
        /**
         * @description: 获取群信息
         * @param {number} group_id 群号
         * @param {boolean} no_cache 是否不使用缓存
         * @return {*}
         */
        this.get_group_info = function (group_id, no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_group_info', { group_id: group_id, no_cache: no_cache });
        };
        /**
         * @description: 获取群列表
         * @param {boolean} no_cache 是否不使用缓存
         * @return {*}
         */
        this.get_group_list = function (no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_group_list', { no_cache: no_cache });
        };
        /**
         * @description: 获取群成员信息
         * @param {number} group_id 群号
         * @param {number} user_id QQ号
         * @param {boolean} no_cache 是否不使用缓存
         * @return {*}
         */
        this.get_group_member_info = function (group_id, user_id, no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_group_member_info', { group_id: group_id, user_id: user_id, no_cache: no_cache });
        };
        /**
         * @description: 获取群成员列表
         * @param {number} group_id
         * @param {boolean} no_cache
         * @return {*}
         */
        this.get_group_member_list = function (group_id, no_cache) {
            if (no_cache === void 0) { no_cache = false; }
            _this.send('get_group_member_list', { group_id: group_id, no_cache: no_cache });
        };
        /**
         * @description: 获取群荣誉信息
         * @param {number} group_id 群号
         * @param {string} type 要获取的群荣誉类型,可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据,或传入 all 获取所有数据
         * @return {*}
         */
        this.get_group_honor_info = function (group_id, type) {
            _this.send('get_group_honor_info', { group_id: group_id, type: type });
        };
        /**
         * @description: 获取群系统消息
         * @param {InvitedRequest} invited_requests 邀请消息列表
         * @param {JoinRequest} join_requests 进群消息列表
         * @return {*}
         */
        this.get_group_system_msg = function (invited_requests, join_requests) {
            _this.send('get_group_system_msg', { invited_requests: invited_requests, join_requests: join_requests });
        };
        /**
         * @description: 获取精华消息列表
         * @param {number} group_id 群号
         * @return {*}
         */
        this.get_essence_msg_list = function (group_id) {
            _this.send('get_essence_msg_list', { group_id: group_id });
        };
        /**
         * @description: 获取群 @全体成员 剩余次数
         * @param {number} group_id 群号
         * @return {*}
         */
        this.get_group_at_all_remain = function (group_id) {
            _this.send('get_group_at_all_remain', { group_id: group_id });
        };
        /* 设置 */
        /**
         * @description: 设置群名
         * @param {number} group_id 群号
         * @param {string} group_name 新群名
         * @return {*}
         */
        this.set_group_name = function (group_id, group_name) {
            _this.send('set_group_name', { group_id: group_id, group_name: group_name });
        };
        /**
         * @description: 设置群头像
         * @param {number} group_id 群号
         * @param {string} file 图片文件名
         * @param {number} cache 表示是否使用已缓存的文件
         * @return {*}
         */
        this.set_group_portrait = function (group_id, file, cache) {
            _this.send('set_group_portrait', { group_id: group_id, file: file, cache: cache });
        };
        /**
         * @description: 设置群管理员
         * @param {number} group_id 群号
         * @param {number} user_id 要设置的管理员的QQ号
         * @param {boolean} enable true为设置,false取消,默认true
         * @return {*}
         */
        this.set_group_admin = function (group_id, user_id, enable) {
            if (enable === void 0) { enable = true; }
            _this.send('set_group_admin', { group_id: group_id, user_id: user_id, enable: enable });
        };
        /**
         * @description: 设置群名片(群备注)
         * @param {number} group_id 群号
         * @param {number} user_id 要设置的QQ号
         * @param {string} card 群名片内容, 不填或空字符串表示删除群名片
         * @return {*}
         */
        this.set_group_card = function (group_id, user_id, card) {
            _this.send('set_group_card', { group_id: group_id, user_id: user_id, card: card });
        };
        /**
         * @description: 设置群组专属头衔
         * @param {number} group_id 群号
         * @param {number} user_id 要设置的QQ号
         * @param {string} special_title 	专属头衔, 不填或空字符串表示删除专属头衔
         * @param {number} duration
         * @return {*}
         */
        this.set_group_special_title = function (group_id, user_id, special_title, duration) {
            if (duration === void 0) { duration = -1; }
            _this.send('set_group_special_title', { group_id: group_id, user_id: user_id, special_title: special_title, duration: duration });
        };
        /* 群操作 */
        /**
         * @description: 群单人禁言
         * @param {number} group_id 群号
         * @param {number} user_id 要禁言的QQ号
         * @param {number} duration 禁言时长,单位秒,0表示取消禁言
         * @return {*}
         */
        this.set_group_ban = function (group_id, user_id, duration) {
            if (duration === void 0) { duration = 30 * 60; }
            _this.send('set_group_ban', { group_id: group_id, user_id: user_id, duration: duration });
        };
        /**
         * @description: 群全员禁言
         * @param {number} group_id 群号
         * @param {boolean} enable 是否禁用,默认true
         * @return {*}
         */
        this.set_group_whole_ban = function (group_id, enable) {
            if (enable === void 0) { enable = true; }
            _this.send('set_group_whole_ban', { group_id: group_id, enable: enable });
        };
        /**
         * @description: 群匿名用户禁言
         * @param {number} group_id 群号
         * @param {string} flag  要禁言的匿名用户的 flag(从群消息上报的数据中获得)
         * @param {number} duration 禁言时长,单位秒,无法取消匿名用户禁言
         * @return {*}
         */
        this.set_group_anonymous_ban = function (group_id, flag, duration) {
            if (duration === void 0) { duration = 30 * 60; }
            _this.send('set_group_anonymous_ban', { group_id: group_id, flag: flag, duration: duration });
        };
        /**
         * @description: 设置精华消息
         * @param {number} message_id 消息ID
         * @return {*}
         */
        this.set_essence_msg = function (message_id) {
            _this.send('set_essence_msg', { message_id: message_id });
        };
        /**
         * @description: 移出精华消息
         * @param {number} message_id 消息ID
         * @return {*}
         */
        this.delete_essence_msg = function (message_id) {
            _this.send('delete_essence_msg', { message_id: message_id });
        };
        /**
         * @description: 群打卡
         * @param {number} group_id 群号
         * @return {*}
         */
        this.send_group_sign = function (group_id) {
            _this.send('send_group_sign', { group_id: group_id });
        };
        /**
         * @description: 群设置匿名
         * @param {number} group_id 群号
         * @param {boolean} enable 是否允许匿名聊天,默认true
         * @return {*}
         */
        this.set_group_anonymous = function (group_id, enable) {
            if (enable === void 0) { enable = true; }
            _this.send('set_group_anonymous', { group_id: group_id, enable: enable });
        };
        /**
         * @description: 发送群公告
         * @param {number} group_id 群号
         * @param {string} content 公告内容
         * @param {string} image 图片路径(可选)
         * @return {*}
         */
        this._send_group_notice = function (group_id, content, image) {
            _this.send('_send_group_notice', { group_id: group_id, content: content, image: image });
        };
        /**
         * @description: 获取群公告
         * @param {number} group_id 群号
         * @return {*}
         */
        this._get_group_notice = function (group_id) {
            _this.send('_get_group_notice', { group_id: group_id });
        };
        /**
         * @description: 群组踢人
         * @param {number} group_id 群号
         * @param {number} user_id 要踢的QQ号
         * @param {boolean} reject_add_request 拒绝此人的加群请求,默认false
         * @return {*}
         */
        this.set_group_kick = function (group_id, user_id, reject_add_request) {
            if (reject_add_request === void 0) { reject_add_request = false; }
            _this.send('_get_group_notice', { group_id: group_id, user_id: user_id, reject_add_request: reject_add_request });
        };
        /**
         * @description: 退出群组
         * @param {number} group_id 群号
         * @param {boolean} is_dismiss 是否解散,如果登录号是群主,则仅在此项为true时能够解散
         * @return {*}
         */
        this.set_group_leave = function (group_id, is_dismiss) {
            if (is_dismiss === void 0) { is_dismiss = false; }
            _this.send('set_group_kick', { group_id: group_id, is_dismiss: is_dismiss });
        };
        /* 文件 */
        /**
         * @description: 上传群文件
         * @param {number} group_id 群号
         * @param {string} file 本地文件路径
         * @param {string} name 储存名称
         * @param {string} folder 父目录ID
         * @return {*}
         */
        this.upload_group_file = function (group_id, file, name, folder) {
            _this.send('upload_group_file', { group_id: group_id, file: file, name: name, folder: folder });
        };
        /**
         * @description: 删除群文件
         * @param {number} group_id 群号
         * @param {string} file_id 文件ID,参考File对象
         * @param {number} busid 文件类型,参考File对象
         * @return {*}
         */
        this.delete_group_file = function (group_id, file_id, busid) {
            _this.send('delete_group_file', { group_id: group_id, file_id: file_id, busid: busid });
        };
        /**
         * @description: 创建群文件文件夹
         * @param {number} group_id 群号
         * @param {string} name 文件夹名称
         * @param {string} parent_id 仅能为/
         * @return {*}
         */
        this.create_group_file_folder = function (group_id, name, parent_id) {
            _this.send('create_group_file_folder', { group_id: group_id, name: name, parent_id: parent_id });
        };
        /**
         * @description: 删除群文件文件夹
         * @param {number} group_id 群号
         * @param {string} folder_id 文件夹ID,参考Folder对象
         * @return {*}
         */
        this.delete_group_folder = function (group_id, folder_id) {
            _this.send('delete_group_folder', { group_id: group_id, folder_id: folder_id });
        };
        /**
         * @description: 获取群文件系统信息
         * @param {number} group_id 群号
         * @return {*}
         */
        this.get_group_file_system_info = function (group_id) {
            _this.send('get_group_file_system_info', { group_id: group_id });
        };
        /**
         * @description: 获取群根目录文件列表
         * @param {number} group_id 群号
         * @return {*}
         */
        this.get_group_root_files = function (group_id) {
            _this.send('get_group_root_files', { group_id: group_id });
        };
        /**
         * @description: 获取群子目录文件列表
         * @param {number} group_id 群号
         * @param {string} folder_id 文件夹ID,参考Folder对象
         * @return {*}
         */
        this.get_group_files_by_folder = function (group_id, folder_id) {
            _this.send('get_group_files_by_folder', { group_id: group_id, folder_id: folder_id });
        };
        /**
         * @description: 获取群文件资源链接
         * @param {number} group_id 群号
         * @param {string} file_id 文件ID,参考File对象
         * @param {number} busid 文件类型,参考File对象
         * @return {*}
         */
        this.get_group_file_url = function (group_id, file_id, busid) {
            _this.send('get_group_file_url', { group_id: group_id, file_id: file_id, busid: busid });
        };
        /**
         * @description: 上传私聊文件
         * @param {number} group_id 群号
         * @param {string} file 本地文件路径
         * @param {string} name 文件名称
         * @return {*}
         */
        this.upload_private_file = function (group_id, file, name) {
            _this.send('upload_private_file', { group_id: group_id, file: file, name: name });
        };
        /* Go-CqHttp相关 */
        /**
         * @description: 获取版本信息
         * @return {*}
         */
        this.get_version_info = function () {
            _this.send('get_version_info');
        };
        /**
         * @description: 获取状态
         * @return {*}
         */
        this.get_status = function () {
            _this.send('get_status');
        };
        /**
         * @description: 重载事件过滤器
         * @param {string} file 事件过滤器文件
         * @return {*}
         */
        this.reload_event_filter = function (file) {
            _this.send('reload_event_filter', { file: file });
        };
        /**
         * @description: 下载文件到缓存目录
         * @param {string} url 链接地址
         * @param {number} thread_count 下载线程数
         * @param {string} headers 自定义请求头
         * @return {*}
         */
        this.download_file = function (url, thread_count, headers) {
            _this.send('download_file', { url: url, thread_count: thread_count, headers: headers });
        };
        /**
         * @description: 检查链接安全性
         * @param {string} url 需要检查的链接
         * @return {*}
         */
        this.check_url_safely = function (url) {
            _this.send('check_url_safely', { url: url });
        };
        /**
         * @description: 获取中文分词(隐藏API)
         * @param {string} content 内容
         * @return {*}
         */
        this.__get_word_slices = function (content) {
            _this.send('.get_word_slices', { content: content });
        };
        /**
         * @description: 对事件执行快速操作(隐藏API)
         * @param {obj} context 事件数据对象,可做精简,如去掉message等无用字段
         * @param {obj} operation 快速操作对象,例如{"ban":true,"reply":"请不要说脏话"}
         * @return {*}
         */
        this.__handle_quick_operation = function (context, operation) {
            _this.send('.handle_quick_operation', { context: context, operation: operation });
        };
        this.send = send;
    }
    return Api;
}());
exports.default = Api;
//# sourceMappingURL=api.js.map