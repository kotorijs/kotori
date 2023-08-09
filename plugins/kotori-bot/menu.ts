/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-26 14:50:47
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-09 16:26:24
 */
import { cmdType, comType } from "./interface";

export const enum URL {
    API = 'https://api.imlolicon.tk/api/',
    BLOG = 'https://imlolicon.tk/api/',
    GPT = 'http://chatgpt.imlolicon.tk/v1/chat/completions',
    BGM = 'https://api.bgm.tv/'
}

export const enum BOT_RESULT {
    SERVER_ERROR = '接口错误！请联系管理员',
    ARGS_EMPTY = '参数不能为空',
    ARGS_ERROR = '参数错误！',
    NUM_ERROR = '序号错误！',
    NUM_CHOOSE = '再次发送指令并传入参数[序号]以选择对应内容',
    NO_ACCESS = '你无权限执行该指令！',
    DISABLE = '该功能未启用',
    EXIST = '目标参数已存在',
    NO_EXIST = '目标参数不存在',
    AUTHOR = 'ByHimeno'
}

export const HEADER: string = 'Kotori-Bot:';

export const Com: comType = new Map();
export const CmdInfo: cmdType = new Map();
Com.set(['菜单', '/menu', '/help', 'kotori'],
    HEADER +
    '\n日常工具 查询工具' +
    '\n随机图片 随机语录' +
    '\nGPT聊天 其它功能' +
    '\n群管系统 超管系统' +
    '\n特殊功能 关于信息' +
    `\n${BOT_RESULT.AUTHOR}`
);

Com.set('日常工具',
    HEADER +
    '\n发送指令时无需带[]' +
    '\n/music [歌名] [序号=1]: 网易云点歌,序号不填默认为1,填0显示歌曲列表,例子:歌名 2' +
    '\n/bgm [名字] [序号=1]: 番组计划,搜索游戏/动漫/角色等' + 
    '\n/bgmc: 获取番组计划今日放送' + 
    '\n/star [星座名]: 查看今日星座运势' +
    '\n/tran [内容]: 中外互译' +
    '\n/lunar: 查看农历' +
    '\n/story: 查看历史上的今天'
);

Com.set('查询工具',
    HEADER +
    '\n/motd [IP] [端口=25565]: MCJE服务器信息查询' +
    '\n/motdpe [IP] [端口=19132]: MCBE服务器信息查询' +
    '\n/mcskin [游戏ID]: MC正版账号皮肤查询' +
    '\n/bili [BV号]: B站视频信息查询' +
    '\n/sed [QQ/手机号]: 社工信息查询' +
    '\n/idcard [身份证号]: 身份证信息查询' +
    '\n/hcb [ID]: 韦一云黑信息查询' +
    '\n/state [URL]: 网站状态查询' +
    '\n/speed [URL]: 网站速度测试'
);

Com.set('随机图片',
    HEADER +
    '\n/sex [TAG?]: 来自pixiv,TAG可选' +
    '\n/sexh [TAG?]: 来自huliimg' +
    '\n/seller: 卖家秀图片' +
    '\n/sedimg: 诱惑图' +
    '\n/bing: 必应每日图' +
    '\n/day: 每日看世界' +
    '\n/earth: 实时地球' +
    '\n/china: 实时中国' +
    // '\n/sister: 随机小姐姐视频' + 
    '\n/qrcode [内容]: 二维码生成'
);

Com.set('随机语录',
    HEADER +
    '\n一言 一言2' +
    '\n骚话 情话 ' +
    '\n笑话 诗词' +
    '\n毒鸡汤 网抑云' +
    '\n人生语录 社会语录' +
    '\n温柔语录 舔狗语录' +
    '\n爱情语录 个性签名' +
    '\n经典语录 英汉语录'
);

Com.set('GPT聊天',
    HEADER +
    '\n/gpt [内容]: ChatGPT聊天' +
    '\n/cl [内容]: Claude聊天'
);

Com.set('其它功能',
    HEADER +
    '\n今日长度: 查看今日的牛牛长度'
)

Com.set('群管系统',
    HEADER +
    '\n以下功能仅群内且BOT管理员可用' +
    '\n/ban [QQ/At] [分钟]: 禁言某人,默认10min;不填QQ默认全体禁言' +
    '\n/unban [QQ/At]: 解禁某人;不填QQ默认解除全体禁言' +
    '\n/black [query/add/del] [QQ/At?]: 查询/添加/删除群黑名单,为query时无需填写第二个参数' +
    '\n/white [query/add/del] [QQ/At?]: 查询/添加/删除群白名单' +
    '\n/kick [QQ/At]: 踢出某人' +
    '\n/all [内容]: 发送全体成员消息' +
    '\n/notice [内容]: 发送群公告'
);

Com.set('超管系统',
    HEADER +
    '\n以下功能仅BOT最高管理员可用' +
    '\n/config: 查看配置' +
    '\n/login: 一键登录BOT后台管理网站' +
    '\n/blackg [query/add/del] [QQ/At?]: 查询/添加/删除全局黑名单' +
    '\n/whiteg [query/add/del] [QQ/At?]: 查询/添加/删除全局白名单' +
    '\n/banword [query/add/del] [内容?]: 查询/添加/删除违禁词' +
    '\n/manger [query/add/del] [QQ/At?]: 查询/添加/删除当前群BOT管理员'
);

Com.set('特殊功能',
    HEADER +
    '\n/api: 查看API站点数据'
);

Com.set('关于信息',
    HEADER +
    '\n/help: 帮助信息' +
    '\n/bot: 查看BOT信息与运行状态' +
    '\n/status: 查看服务器运行状态' +
    '\n/about: 关于机器人框架' +
    '\n/update: 检查更新'
);

export default Com;