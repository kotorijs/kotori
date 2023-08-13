import SDK from "@/utils/class.sdk"

export const GLOBAL = {
    HEAD: 'Kotori-Bot:',
    REPO: 'https://github.com/biyuehu/kotori-bot',
    AVATAR: SDK.cq_image('https://biyuehu.github.io/images/avatar.png'),
}

export enum BOT_RESULT {
    GUIDE = '[名字]代表参数,带"?"表示非必填,带"=xx"表示非必填有默认值,"*"为仅群聊可用,"#"为仅私聊可用',
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

export const CMD = {
    music: {
        cmd: '/music',
        descr: '网易云点歌,序号默认为1,填0显示歌曲列表',
        args: [
            '歌名', '序号'
        ]
    },
    bgm: {
        cmd: '/bgm',
        descr: '翻组计划搜索游戏/动漫',
        args: [
            '名字', '序号'
        ]
    },
    bgmc: {
        cmd: '/bgmc',
        descr: '获取番组计划今日放送',
    },
    star: {
        cmd: '/star',
        descr: '查看今日星座运势',
        args: [
            '星座名'
        ]
    },
    tran: {
        cmd: '/tran',
        descr: '中外互译',
        args: [
            '内容'
        ]
    },
    lunar: {
        cmd: '/lunar',
        descr: '查看农历'
    },
    story: {
        cmd: '/story',
        descr: '查看历史上的今天'
    },
    motd: {
        cmd: '/motd',
        descr: 'MCJE服务器信息查询',
        args: [
            'IP', '端口'
        ]
    },
    motdbe: {
        cmd: '/motdbe',
        descr: 'MCBE服务器信息查询',
        args: [
            'IP', '端口'
        ]
    },
    mcskin: {
        cmd: '/mcskin',
        descr: 'MC正版账号皮肤查询',
        args: [
            '游戏ID'
        ]
    },
    bili: {
        cmd: '/bili',
        descr: 'B站视频信息查询',
        args: [
            'BV号'
        ]
    },
    sed: {
        cmd: '/sed',
        descr: '社工信息查询',
        args: [
            'QQ/手机号'
        ]
    },
    idcard: {
        cmd: '/idcard',
        descr: '身份证信息查询',
        args: [
            '身份证号'
        ]
    },
    hcb: {
        cmd: '/hcb',
        descr: '韦一云黑信息查询',
        args: [
            'ID'
        ]
    },
    state: {
        cmd: '/state',
        descr: '网站状态查询',
        args: [
            'URL'
        ]
    },
    speed: {
        cmd: '/speed',
        descr: '网站速度测试',
        args: [
            'URL'
        ]
    },
    sex: {
        cmd: '/sex',
        descr: 'Pixiv图片',
        args: [
            'TAG'
        ]
    },
    sexh: {
        cmd: '/sexh',
        descr: 'HuliImg图片',
        args: [
            'TAG'
        ]
    },
    seller: {
        cmd: '/seller',
        descr: '卖家秀图片'
    },
    sedimg: {
        cmd: '/sedimg',
        descr: '诱惑图'
    },
    bing: {
        cmd: '/bing',
        descr: '必应每日图'
    },
    day: {
        cmd: '/day',
        descr: '每日看世界'
    },
    earth: {
        cmd: '/earth',
        descr: '实时地球'
    },
    china: {
        cmd: '/china',
        descr: '实时中国'
    },
    sister: {
        cmd: '/sister',
        descr: '随机小姐姐视频'
    },
    qrcode: {
        cmd: '/qrcode',
        descr: '二维码生成',
        args: [
            '内容', '容错级别,范围0~3'
        ]
    },
    hitokoto: {
        cmd: '一言',
    },
    gpt: {
        cmd: '/gpt',
        descr: 'ChatGPTV3.5聊天',
        args: [
            '内容'
        ]
    },
    cl: {
        cmd: '/cl',
        descr: 'Claude聊天',
        args: [
            '内容'
        ]
    },
    api: {
        cmd: '/api',
        descr: '查看API站点数据'
    },
    bot: {
        cmd: '/bot',
        descr: '查看BOT信息与运行状态'
    },
    status: {
        cmd: '/status',
        descr: '查看服务器运行状态'
    },
    about: {
        cmd: ['/about', 'kotori', '关于BOT', '关于bot'],
        descr: '帮助信息'
    },
    update: {
        cmd: ['/update', '检查更新'],
        descr: '检查更新'
    },
    ban: {
        cmd: '/ban',
        descr: '禁言某人',
        args: [
            'QQ/At', '分钟'
        ]
    },
    unban: {
        cmd: '/unban',
        descr: '解禁某人',
        args: [
            'QQ/At'
        ]
    },
    black: {
        cmd: '/black',
        descr: '查询/添加/删除群黑名单',
        args: [
            'query/add/del', 'QQ/At'
        ]
    },
    white: {
        cmd: '/white',
        descr: '查询/添加/删除群白名单',
        args: [
            'query/add/del', 'QQ/At'
        ]
    },
    kick: {
        cmd: '/kick',
        descr: '踢出某人',
        args: [
            'QQ/At'
        ]
    },
    all: {
        cmd: '/all',
        descr: '发生全体成员消息',
        args: [
            '内容'
        ]
    },
    notice: {
        cmd: '/notice',
        descr: '发送群公告',
        args: [
            '内容'
        ]
    },
    config: {
        cmd: '/config',
        descr: '查看配置',
    },
    blackg: {
        cmd: '/blackg',
        descr: '查询/添加/删除全局黑名单',
        args: [
            'query/add/del', 'QQ/At'
        ]
    },
    whiteg: {
        cmd: '/whiteg',
        descr: '查询/添加/删除全局白名单',
        args: [
            'query/add/del', 'QQ/At'
        ]
    },
    manger: {
        cmd: '/manger',
        descr: '查询/添加/删除群BOT管理员',
        args: [
            'query/add/del', 'QQ/At'
        ]
    },
    banword: {
        cmd: '/banword',
        descr: '查询/添加/删除屏蔽词',
        args: [
            'query/add/del', '内容/正则表达式'
        ]
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
        cmd: ['菜单', '/menu', '/help', 'kotori'],
        content: (
            '%HEAD%' +
            '\n日常工具 查询工具' +
            '\n随机图片 随机语录' +
            '\nGPT聊天 其它功能' +
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
        list: '\n%name%%param%\n%descr%%scope%',
        param: ' [%param_name%%modifier%]',
        paramNameDefault: 'arg',
        modifierOptional: '?',
        modifierDefault: '=%content%',
        descr: '%content%',
        scopePrivate: '#',
        scopeGroup: '*'
    },
    customMenu: {
        hitokotos: {
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
        }
    },
}

export const COM = {
    music: {
        info: '歌曲ID: %songid%\n歌曲标题: %title%\n歌曲作者: %author%\n歌曲下载: %url%\n歌曲封面: %image%',
        list: '%num%.%title% - %author%\n',
        listInfo: '%list%%NUM_CHOOSE%',
        fail: '未找到相关歌曲: %input%'
    },
    bgm: {
        info: '原名: %name%\n中文名: %name_cn%\n介绍: %summary%\n标签: %tags%\n详情: %url%\n%image%',
        list: '%num%.%name%%name_cn%\n',
        listInfo: '%list%%NUM_CHOOSE%',
        fail: '未找到相关条目: %input%'
    },
    bgmc: {
        info: '日期: %weekday%~%list%',
        list: '\n原名: %name%\n中文名: %name_cn%\n开播时间: %air_date%\n%image%'
    },
    star: {
        info: '%input%今日运势: %list%',
        list: '\n%content%',
        fail: '星座错误: %input%'
    },
    tran: '原文: %input%\n译文: %content%',
    lunar: '%content%',
    story: {
        info: '历史上的今天%list%',
        list: '\n%content%'
    },
    motd: {
        info: (
            '状态: 在线\nIP: %real%\n端口: %port%\n物理地址: %location%\nMOTD: %motd%\n协议版本: %agreement%' +
            '\n游戏版本: %version%\n在线人数: %online% / %max%\n延迟: %ping%ms\n图标: %image%'
        ),
        fail: '状态: 离线\nIP: %ip%\n端口: %port%'
    },
    motdbe: {
        info: (
            '状态: 在线\nIP: %real%\n端口: %port%\n物理地址: %location%\nMOTD: %motd%\n游戏模式: %gamemode%' +
            '\n协议版本: %agreement%\n游戏版本: %version%\n在线人数: %online% / %max%\n延迟: %delay%ms'
        ),
        fail: '状态: 离线\nIP: %ip%\n端口: %port%'
    },
    mcskin: {
        info: '玩家: %input%\n皮肤: %skin%\n披风: %cape%\n头颅: %avatar%',
        fail: '%input%查无此人!'
    },
    bili: {
        info: 'BV号: %bvid%\nAV号: %aid%\n视频标题: %title%\n视频简介: %descr%\n作者UID: %owner%\n视频封面: %image%',
        fail: '未找到该视频: %input%'
    },
    sed: {
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
        info: (
            '身份证号: %input%\n性别: %gender%\n出生日期: %birthday%' +
            '\n年龄: %age%\n省份: %province%\n地址: %address%\n%starsign%'
        ),
        fail: '身份证错误: %input%'
    },
    hcb: {
        info: (
            '%input%有云黑记录\nUUID: %uuid%\n用户平台: %plate%\n用户ID: %idkey%' +
            '\n记录描述: %descr%\n记录等级: %level%\n记录时间: %date%\n相关图片: %images%'
        ),
        fail: '%input%无云黑记录'
    },
    state: '%content%',
    speed: '%content%',
    sex: {
        tips: '图片正在来的路上....你先别急',
        info: 'PID:%pid%\n标题:%title%\n作者:%author%\n标签:%tags%\n%image%',
        fail: '未找到相应图片%input'
    },
    sexh: {
        tips: '图片正在来的路上....你先别急',
        info: '标签:%tags%\n%image%',
        fail: '未找到相应图片%input%'
    },
    seller: '%image%',
    sedimg: '%image%',
    bing: '%image%',
    day: '%image%',
    earth: '%image%',
    china: '%image%',
    sister: '%video%',
    qrcode: '%image%',
    hitokoto: '%msg%%from%\n类型: %type%',
    hitokotoList: '%content%',
    gpt: '%content%',
    claude: '%content%',
    api: '%content%',
    bot: (
        'BOT信息\nBOTQQ: %self_id%\n连接时间: %connect%' +
        '\n接收包数量: %packet_received%\n发送包数量: %packet_sent%\n丢失包数量: %packet_lost%' +
        '\n接收消息数量: %message_received%\n发送消息数量: %message_sent%' +
        '\n连接丢失次数: %lost_times%\n连接断开次数: %disconnect_times%' +
        '\n框架信息\n当前BOT框架版本: %version%\n框架协议: %license%' +
        '\n环境信息\nNode版本: %node%\nTypeScript版本: %typescript%\nTsNode版本: %tsnode%\n%AUTHOR%'
    ),
    status: (
        '服务器运行状态\n系统内核: %type%\n系统平台: %platform%\nCPU架构: %arch%\nCPU型号: %model%' +
        '\nCPU频率: %speed%GHz\nCPU核心数: %num%\nCPU使用率: %cpu_rate%%\n内存总量: %total%GB' +
        '\n可用内存: %used%GB\n内存使用率: %ram_rate%%\n网卡数量: %network%\n开机时间: %time%' +
        '\n主机名字: %hostname%\n系统目录: %homedir%\n%AUTHOR%'
    ),
    about: (
        '你说得对, 但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n' +
        '开源地址: %REPO%\n\n当前BOT框架版本: %version%\n框架协议: %license%\n%AVATAR%\n%AUTHOR%'
    ),
    update: {
        info: '当前版本: %version%\n%content%',
        yes: '当前为最新版本!',
        no: '检测到有更新!\n最新版本: %version%\n请前往Github仓库获取最新版本: %REPO%'
    },
    ban: {
        user: '成功禁言[%target%]用户[%time%]分钟',
        all: '全体禁言成功'
    },
    unban: {
        user: '成功解除禁言[%target%]用户',
        all: '解除全体禁言成功'
    },
    black: {
        query: '当前群黑名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群黑名单',
        del: '已删除[%target%]从当前群黑名单'
    },
    white: {
        query: '当前群白名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群白名单',
        del: '已删除[%target%]从当前群白名单'
    },
    kick: '成功踢出[%target%]用户',
    all: '%all% 以下消息来自管理员:\n%input%',
    notice: 'From Admin~\n%input%',
    config: {
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
    global: {
        info: (
            ''
        ),
        list: '%content% '
    },
    blackg: {
        query: '全局黑名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至全局黑名单',
        del: '已删除[%target%]从全局黑名单'
    },
    whiteg: {
        query: '全局白名单列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至全局白名单',
        del: '已删除[%target%]从全局白名单'
    },
    manger: {
        query: '当前群管理员列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至当前群管理员',
        del: '已删除[%target%]从当前群管理员'
    },
    banword: {
        query: '屏蔽词列表:\n%content%',
        list: '%content% ',
        add: '已添加[%target%]至屏蔽词',
        del: '已删除[%target%]从屏蔽词'
    }
}

export default {
    cmd: CMD,
    menu: MENU,
    auto: AUTO,
    com: COM
}
