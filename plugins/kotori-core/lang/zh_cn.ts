import SDK from "@/utils/class.sdk"

export const GLOBAL = {
    HEAD: 'Kotori-Bot:',
    REPO: 'https://github.com/biyuehu/kotori-bot',
    AVATAR: SDK.cq_image('https://biyuehu.github.io/images/avatar.png'),
}

export enum BOT_RESULT {
    GUIDE = '<名字>代表参数,"?"表示可选参数,"=xx"表示可选有默认值,"..."表示剩余参数,"*"为仅群聊可用,"#"为仅私聊可用',
    SERVER_ERROR = '接口错误!请联系管理员',
    ARGS_EMPTY = '参数不能为空',
    ARGS_ERROR = '参数错误!',
    NUM_ERROR = '序号错误!',
    NUM_CHOOSE = '再次发送指令并传入参数[序号]以选择对应内容',
    NO_ACCESS = '你无权限执行该指令!',
    DISABLE = '该功能未启用',
    EXIST = '目标参数已存在',
    NO_EXIST = '目标参数不存在',
    REPAIRING = '该功能维修中',
    AUTHOR = 'ByHimeno',
    APIKEY_EMPTY = '请先配置APIKEY!',
    EMPTY = '无',
    MESSAGE_TYPE = '该功能仅在群聊或私聊下可用',
    OPTION_ON = '√',
    OPTION_OFF = 'X'
}

export const COM = {
    /* dayTool */
    music: {
        cmd: '/music',
        descr: '网易云点歌,序号默认为1,填0显示歌曲列表',
        args: [
            'music', '序号'
        ],
        info: '歌曲ID: %songid%\n歌曲标题: %title%\n歌曲作者: %author%\n歌曲下载: %url%\n歌曲封面: %image%',
        list: '%num%.%title% - %author%\n',
        listInfo: '%list%%NUM_CHOOSE%',
        fail: '未找到相关歌曲: %input%'
    },
    bgm: {
        cmd: '/bgm',
        descr: '翻组计划搜索游戏/动漫',
        args: [
            'content', '序号'
        ],
        info: '原名: %name%\n中文名: %name_cn%\n介绍: %summary%\n标签: %tags%\n详情: %url%\n%image%',
        list: '%num%.%name%%name_cn%\n',
        listInfo: '%list%%NUM_CHOOSE%',
        fail: '未找到相关条目: %input%'
    },
    bgmc: {
        cmd: '/bgmc',
        descr: '获取番组计划今日放送',
        info: '日期: %weekday%~%list%',
        list: '\n原名: %name%\n中文名: %name_cn%\n开播时间: %air_date%\n%image%'
    },
    star: {
        cmd: '/star',
        descr: '查看今日星座运势',
        args: [
            'star'
        ],
        info: '%input%今日运势: %list%',
        list: '\n%content%',
        fail: '星座错误: %input%'
    },
    tran: {
        cmd: '/tran',
        descr: '中外互译',
        args: [
            'content'
        ],
        info: '原文: %input%\n译文: %content%'
    },
    lunar: {
        cmd: '/lunar',
        descr: '查看农历',
        info: '%content%'
    },
    story: {
        cmd: '/story',
        descr: '查看历史上的今天',
        info: '历史上的今天%list%',
        list: '\n%content%'
    },
    luck: {
        cmd: '/luck',
        descr: '查看QQ凶吉',
        args: [
            'qq/at'
        ],
        info: 'QQ: %input%\n运势: %luck%\n性格类型: %character%\n性格系数: %character_score%'
    },
    value: {
        cmd: '/value',
        descr: '查看QQ估价',
        args: [
            'qq/at'
        ],
        info: '%image%'
    },
    weather: {
        cmd: '/weather',
        descr: '查看天气',
        args: [
            'area'
        ],
        info: '%content%'
    },
    waste: {
        cmd: '/waste',
        descr: '查看垃圾分类',
        args: [
            'item'
        ],
        info: '物品: %input%\n类型: %type%',
        key: ['未知垃圾', '可回收垃圾', '有害垃圾', '湿垃圾', '干垃圾', '装修垃圾']
    },
    /* queryTool */
    motd: {
        cmd: '/motd',
        descr: 'MCJE服务器信息查询',
        args: [
            'ip', 'port'
        ],
        info: (
            '状态: 在线\nIP: %real%\n端口: %port%\n物理地址: %location%\nMOTD: %motd%\n协议版本: %agreement%' +
            '\n游戏版本: %version%\n在线人数: %online% / %max%\n延迟: %ping%ms\n图标: %image%'
        ),
        fail: '状态: 离线\nIP: %ip%\n端口: %port%'
    },
    motdbe: {
        cmd: '/motdbe',
        descr: 'MCBE服务器信息查询',
        args: [
            'ip', 'port'
        ],
        info: (
            '状态: 在线\nIP: %real%\n端口: %port%\n物理地址: %location%\nMOTD: %motd%\n游戏模式: %gamemode%' +
            '\n协议版本: %agreement%\n游戏版本: %version%\n在线人数: %online% / %max%\n延迟: %delay%ms'
        ),
        fail: '状态: 离线\nIP: %ip%\n端口: %port%'
    },
    mcskin: {
        cmd: '/mcskin',
        descr: 'MC正版账号皮肤查询',
        args: [
            'id'
        ],
        info: '玩家: %input%\n皮肤: %skin%\n披风: %cape%\n头颅: %avatar%',
        fail: '%input%查无此人!'
    },
    bili: {
        cmd: '/bili',
        descr: 'B站视频信息查询',
        args: [
            'bvid'
        ],
        info: 'BV号: %bvid%\nAV号: %aid%\n视频标题: %title%\n视频简介: %descr%\n作者UID: %owner%\n视频封面: %image%',
        fail: '未找到该视频: %input%'
    },
    sed: {
        cmd: '/sed',
        descr: '社工信息查询',
        args: [
            'qq/phone'
        ],
        info: '查询内容: %input%\n消耗时间: %time%秒\n记录数量: %count%%list%',
        list: '\n%key%: %content%',
        key: {
            qq: 'QQ',
            phone: '手机号',
            location: '运营商',
            id: 'LOLID',
            area: 'LOL区域'
        },
        fail: '未查询到相关记录: %input%'
    },
    idcard: {
        cmd: '/idcard',
        descr: '身份证信息查询',
        args: [
            'id'
        ],
        info: (
            '身份证号: %input%\n性别: %gender%\n出生日期: %birthday%' +
            '\n年龄: %age%\n省份: %province%\n地址: %address%\n星座: %starsign%'
        ),
        fail: '身份证错误: %input%'
    },
    hcb: {
        cmd: '/hcb',
        descr: '韦一云黑信息查询',
        args: [
            'id'
        ],
        info: (
            '%input%有云黑记录\nUUID: %uuid%\n用户平台: %plate%\n用户ID: %idkey%' +
            '\n记录描述: %descr%\n记录等级: %level%\n记录时间: %date%\n相关图片: %images%'
        ),
        fail: '%input%无云黑记录'
    },
    ping: {
        cmd: '/ping',
        descr: '网站PING',
        args: [
            'url'
        ]
    },
    header: {
        cmd: '/header',
        descr: '获取网站图标与标题',
        args: [
            'url'
        ],
        info: '网站: %input%\n标题: %title%\n关键词: %keywords%\n描述: %description%\n图标: %image%'
    },
    state: {
        cmd: '/state',
        descr: '网站状态查询',
        args: [
            'domain'
        ],
        info: '%content%'
    },
    speed: {
        cmd: '/speed',
        descr: '网站速度测试',
        args: [
            'domain'
        ],
        info: '%content%'
    },
    /* randomImg */
    sex: {
        cmd: '/sex',
        descr: 'Pixiv图片',
        args: [
            'tags'
        ],
        tips: '图片正在来的路上....你先别急',
        info: 'PID:%pid%\n标题:%title%\n作者:%author%\n标签:%tags%\n%image%',
        fail: '未找到相应图片%input'
    },
    sexh: {
        cmd: '/sexh',
        descr: 'HuliImg图片',
        args: [
            'tags'
        ],
        tips: '图片正在来的路上....你先别急',
        info: '标签:%tags%\n%image%',
        fail: '未找到相应图片%input%'
    },
    seller: {
        cmd: '/seller',
        descr: '卖家秀图片',
        info: '%image%'
    },
    sedimg: {
        cmd: '/sedimg',
        descr: '诱惑图',
        info: '%image%'
    },
    bing: {
        cmd: '/bing',
        descr: '必应每日图',
        info: '%image%'
    },
    day: {
        cmd: '/day',
        descr: '每日看世界',
        info: '%image%'
    },
    earth: {
        cmd: '/earth',
        descr: '实时地球',
        info: '%image%'
    },
    china: {
        cmd: '/china',
        descr: '实时中国',
        info: '%image%'
    },
    sister: {
        cmd: '/sister',
        descr: '随机小姐姐视频',
        info: '%video%'
    },
    qrcode: {
        cmd: '/qrcode',
        descr: '二维码生成',
        args: [
            'content', 'level:0~3'
        ],
        info: '%image%'
    },
    /* hitokotoList */
    hitokoto: {
        cmd: '一言',
        info: '%msg%%from%\n类型: %type%'
    },
    hitokotoList: {
        cmd: [
            '一言2',
            '骚话',
            '情话',
            '人生语录',
            '社会语录',
            '毒鸡汤',
            '笑话',
            '网抑云',
            '温柔语录',
            '舔狗语录',
            '爱情语录',
            '英汉语录',
            '经典语录',
            '个性签名',
            '诗词'
        ],
        info: '%content%'
    },
    /* funSys */
    feel: {
        cmd: '摸',
        descr: '生成表情包-摸一摸',
        args: [
            'qq/at'
        ],
        info: '%image%'
    },
    climb: {
        cmd: '爬',
        descr: '生成表情包-爬',
        args: [
            'qq/at'
        ],
        info: '%image%'
    },
    threaten: {
        cmd: '威胁',
        descr: '生成表情包-威胁',
        args: [
            'qq/at'
        ],
        info: '%image%'
    },
    hold: {
        cmd: '牵着',
        descr: '生成表情包-牵着',
        args: [
            'qq/at'
        ],
        info: '%image%'
    },
    /* gptChat */
    gpt: {
        cmd: '/gpt',
        descr: 'ChatGPTV3.5聊天',
        args: [
            'content'
        ],
        info: '%content%'
    },
    cl: {
        cmd: '/cl',
        descr: 'Claude聊天',
        args: [
            'content'
        ],
        info: '%content%'
    },
    /* specialCom */
    api: {
        cmd: '/api',
        descr: '查看API站点数据',
        info: '%content%'
    },
    /* aboutInfo */
    bot: {
        cmd: '/bot',
        descr: '查看BOT信息与运行状态',
        info: (
            'BOT信息\nBOTQQ: %self_id%\n连接时间: %connect%' +
            '\n接收包数量: %packet_received%\n发送包数量: %packet_sent%\n丢失包数量: %packet_lost%' +
            '\n接收消息数量: %message_received%\n发送消息数量: %message_sent%' +
            '\n连接丢失次数: %lost_times%\n连接断开次数: %disconnect_times%\n最后消息时间: %last_message_time%' +
            '\n------\n框架信息\n当前BOT框架版本: %version%\n框架协议: %license%' +
            '\n------\n环境信息\nNode版本: %node%\nTypeScript版本: %typescript%\nTsNode版本: %tsnode%\n%AUTHOR%'
        )
    },
    status: {
        cmd: '/status',
        descr: '查看服务器运行状态',
        info: (
            '服务器运行状态\n系统内核: %type%\n系统平台: %platform%\nCPU架构: %arch%\nCPU型号: %model%' +
            '\nCPU频率: %speed%GHz\nCPU核心数: %num%\nCPU使用率: %cpu_rate%%\n内存总量: %total%GB' +
            '\n可用内存: %used%GB\n内存使用率: %ram_rate%%\n网卡数量: %network%\n开机时间: %time%' +
            '\n主机名字: %hostname%\n系统目录: %homedir%\n%AUTHOR%'
        )
    },
    about: {
        cmd: ['/about', '关于BOT', '关于bot'],
        descr: '帮助信息',
        info: (
            '你说得对, 但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n' +
            '开源地址: %REPO%\n\n当前BOT框架版本: %version%\n框架协议: %license%\n%AVATAR%\n%AUTHOR%'
        )
    },
    update: {
        cmd: ['/update', '检查更新'],
        descr: '检查更新',
        info: '当前版本: %version%\n%content%',
        yes: '当前为最新版本!',
        no: '检测到有更新!\n最新版本: %version%\n请前往Github仓库获取最新版本:\n%REPO%'
    },
    /* groupMange */
    ban: {
        cmd: '/ban',
        descr: '禁言某人',
        args: [
            'qq/at', 'time(minutes)'
        ],
        user: '成功禁言[%target%]用户[%time%]分钟',
        all: '全体禁言成功'
    },
    unban: {
        cmd: '/unban',
        descr: '解禁某人',
        args: [
            'qq/at'
        ],
        user: '成功解除禁言[%target%]用户',
        all: '解除全体禁言成功'
    },
    black: {
        cmd: '/black',
        descr: [
            '查询群黑名单',
            '添加群黑名单',
            '删除群黑名单'
        ],
        args: [
            'qq/at'
        ],
        query: '当前群黑名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群黑名单',
        del: '已删除[%target%]从当前群黑名单'
    },
    white: {
        cmd: '/white',
        descr: [
            '查询群白名单',
            '添加群白名单',
            '删除群白名单'
        ],
        args: [
            'qq/at'
        ],
        query: '当前群白名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群白名单',
        del: '已删除[%target%]从当前群白名单'
    },
    kick: {
        cmd: '/kick',
        descr: '踢出某人',
        args: [
            'qq/at'
        ],
        info: '成功踢出[%target%]用户'
    },
    all: {
        cmd: '/all',
        descr: '发生全体成员消息',
        args: [
            'content'
        ],
        info: '%all% 以下消息来自管理员:\n%input%'
    },
    notice: {
        cmd: '/notice',
        descr: '发送群公告',
        args: [
            'content'
        ],
        info: 'From Admin~\n%input%'
    },
    /* superMange */
    config: {
        cmd: '/config',
        descr: '查看Kotori-core配置',
        info: (
            'APIKEY设置: [[已隐藏]]' +
            '\n------\n群聊设置\n白名单: %group_enable%%white_content%' +
            '\n------\n功能设置\n主菜单: %main_menu%' +
            '\n群管:\n -状态: %mange_enable%%mange_content%'
        ),
        white: '\n白名单列表:\n%group_list%',
        mange: (
            '\n -加群欢迎: %join_group_welcome%\n -退群加群黑名单: %exit_group_add_black%' +
            '\n -默认禁言时间: %ban_time%秒\n -屏蔽词默认禁言时间: %banword_ban_time%秒' +
            '\n -刷屏默认禁言时间: %repeat_ban_time%秒\n -刷屏规则:\n  -周期: %cycle_time%秒\n  -最大次数: %max_times%次' +
            '\n格式:\n - 最大列表数量: %max_list_nums%条'
        ),
        list: '%content% '
    },
    view: {
        cmd: '/view',
        descr: '查看Kotori-bot配置',
        info: (
            '连接模式: %mode%\n%mode_content%\n------\nGo-cqHttp路径: %program%\n启动参数: %params%\n签名服务器路径: %signserver%' +
            '\n------\nMaster: %master%\n私聊过滤: %user%%user_list%\n群聊过滤: %group%%group_list%'
        ),
        modeContentHttp: (
            '正向Http地址: %url%\n正向Http端口: %port%\n' +
            '反向Http端口: %reverse_port%\n重连间隔时间: %retry_time%秒'
        ),
        modeContentWs: 'WebSocket地址: %url%\nWebSocket端口: %port%\n重连间隔时间: %retry_time%秒',
        modeContentWsReverse: 'WebSocket反向端口: %port%',
        userListWhite: '\n私聊白名单:\n%list%',
        userListBlack: '\n私聊黑名单:\n%list%',
        groupListWhite: '\n群聊白名单:\n%list%',
        groupListBlack: '\n群聊黑名单:\n%list%',
        list: '%content% '
    },
    plugin: {
        cmd: '/plugin',
        descr: [
            '查看一个或全部插件信息',
            '禁用指定插件',
            '启用指定插件',
        ],
        args: [
            'pluginId'
        ],
        query: `插件信息:%list%`,
        fail: '未找到[%target%]插件',
        list: (
            '\n------\n插件Id: %id%\n插件名字: %name%\n插件版本: %version%\n插件描述: %description%' +
            '\n插件作者: %author%\n插件协议: %license%\n插件状态: %state%'
        ),
        ban: '成功禁用[%id%]插件,重启以查看效果',
        unban: '成功取消禁用[%id%]插件,重启以查看效果'
    },
    system: {
        cmd: '/system',
        descr: [
            '重启Go-cqHttp',
            '重启签名服务器与Go-cqHttp'
        ],
        info: '重启完成!',
        info_0: '即将重启Go-cqHttp...',
        info_1: '即将重启Signserver与Go-cqHttp...',
    },
    blackg: {
        cmd: '/blackg',
        descr: [
            '查询全局黑名单',
            '添加全局黑名单',
            '删除全局黑名单'
        ],
        args: [
            'qq/at'
        ],
        query: '全局黑名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至全局黑名单',
        del: '已删除[%target%]从全局黑名单'
    },
    whiteg: {
        cmd: '/whiteg',
        descr: [
            '查询全局白名单',
            '添加全局白名单',
            '删除全局白名单'
        ],
        args: [
            'qq/at'
        ],
        query: '全局白名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至全局白名单',
        del: '已删除[%target%]从全局白名单'
    },
    manger: {
        cmd: '/manger',
        descr: [
            '查询群BOT管理员',
            '添加群BOT管理员',
            '删除群BOT管理员'
        ],
        args: [
            'qq/at'
        ],
        query: '当前群管理员列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群管理员',
        del: '已删除[%target%]从当前群管理员'
    },
    banword: {
        cmd: '/banword',
        descr: [
            '查询屏蔽词',
            '添加屏蔽词',
            '删除屏蔽词'
        ],
        args: [
            'content/RegExp'
        ],
        query: '屏蔽词列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至屏蔽词',
        del: '已删除[%target%]从屏蔽词'
    }
}

export const AUTO = {
    joinGroupWelcome: '%at% 欢迎加入本群，请先仔细阅读群公告，发送"/menu"或"菜单"查看更多BOT功能和信息',
    exitGroupAddBlack: '检测到用户[%target%]退群已自动添加至当前群黑名单内',
    existsOnBlack: {
        info: '检测到用户[%target%]存在于%type%黑名单',
        type: {
            global: '全局',
            local: '群聊'
        }
    },
    bacnWord: '%at% 请勿发送违禁词[%content%]!',
    msgTimes: '%at% 请勿在短时间内多次刷屏!'
}

export const MENU = {
    mainMenu: {
        cmd: ['菜单', '/menu', '/help'],
        content: (
            '%HEAD%' +
            '\n日常工具 查询工具' +
            '\n随机图片 随机语录' +
            '\n娱乐系统 其它功能' +
            '\n群管系统 超管系统' +
            '\n特殊功能 关于信息' +
            '\n%AUTHOR%'
        )
    },
    sonMenu: {
        info: (
            '%HEAD%' +
            '%list%' +
            '\n%GUIDE%'
        ),
        list: '\n%name%%param% - %descr%%scope%',
        param: ' <%prefix%%param_name%%suffix%>',
        paramNameDefault: 'arg',
        suffixOptional: '?',
        suffixDefault: '=%content%',
        descr: '%content%',
        scopePrivate: '#',
        scopeGroup: '*',
        names: {
            dayTool: '日常工具',
            queryTool: '查询工具',
            randomImg: '随机图片',
            funSys: '娱乐系统',
            groupMange: '群管系统',
            superMange: '超管系统',
            gptChat: 'GPT聊天',
            specialCom: '特殊功能',
            aboutInfo: '关于信息'
        }
    },
    customMenu: {
        hitokotoList: {
            cmd: '随机语录',
            content: (
                '%HEAD%' +
                '\n一言 一言2' +
                '\n诗词 情话' +
                '\n骚话 笑话' +
                '\n人生语录 社会语录' +
                '\n网抑云 毒鸡汤' +
                '\n舔狗语录 爱情语录' +
                '\n温柔语录 个性签名' +
                '\n经典语录 英汉语录'
            )
        },
        otherCom: {
            cmd: '其它功能',
            content: (
                '%HEAD%%' +
                '\nGPT聊天'
            )
        }
    },
}

export default {
    com: COM,
    menu: MENU,
    auto: AUTO
}
