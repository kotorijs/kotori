export const URL = 'https://api.imlolicon.tk/api/';
export const URL2 = 'https://imlolicon.tk/api/';
export const HEADER: string = 'Kotori-Bot:';

const Com: Map<string | string[] | ((str: string) => boolean), (() => void) | string> = new Map();
Com.set(['菜单', '/menu', '/help', 'kotori'],
    HEADER +
    '\n日常工具 查询工具' +
    '\n随机图片 随机语录' +
    '\nGPT聊天 群管系统' +
    '\n特殊功能 关于BOT'
);

Com.set('日常工具',
    HEADER +
    '\n发送指令时无需带[]' +
    '\n/music [歌名*序号]: 网易云点歌,序号不填默认为1,例子:歌名*2' +
    '\n/star [星座名]: 查看今日星座运势' +
    '\n/translate [内容]: 中英互译' +
    '\n/lunar: 查看农历' +
    '\n/story: 查看历史上的今天'
);

Com.set('查询工具',
    HEADER +
    '\n发送指令时无需带[]' +
    '\n/motd [IP:端口]: MCJE服务器信息查询' +
    '\n/motdpe [IP:端口]: MCBE服务器信息查询' +
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
    '\n/sex [TAG]: 来自pixiv,TAG可选' +
    '\n/sexh [TAG]: 来自huliimg,TAG可选' +
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
    '\n发送指令时无需带[]' +
    '\n/gpt [内容]: ChatGPT聊天' +
    '\n/cl [内容]: Claude聊天'
);

Com.set('群管系统',
    HEADER +
    '\n以下功能仅群内且有权限时可用' +
    '\n发送指令时无需带[]' +
    '\n/ban [QQ*倍率]: 禁言某人,默认10min,填2就是20min;不填QQ默认全体禁言' +
    '\n/unban [QQ]: 解禁某人;不填QQ默认解除全体禁言' +
    '\n/kick [QQ]: 踢出某人' +
    '\n/all [内容]: 发送全体成员消息' +
    '\n/notice [内容]: 发送群公告'
);

Com.set('特殊功能',
    HEADER +
    '\n/api: 查看API站点数据'
);

Com.set('关于',
    HEADER +
    '\n/help: 帮助信息' +
    '\n/status: 查看BOT运行状态' +
    '\n/about: 关于机器人框架'
);

export default Com;