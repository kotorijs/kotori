/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-09 12:06:28
 */
import os from 'os';
import type { EventDataType, obj, Event, Api, Const } from '@/tools';
import { fetchJson, getPackageInfo, isObjArr } from '@/tools';
import * as M from './method';
import config from './config';
import Com, { BOT_RESULT, URL, CmdInfo } from './menu';
import { HandlerFuncType, RES_CODE, Send, mapIndex, paramInfo } from './interface';
import SDK from '@/utils/class.sdk';

/* 枚举与常量定义 */
enum hitokotoList {
    一言2 = 1,
    骚话,
    情话,
    人生语录,
    社会语录,
    毒鸡汤,
    笑话,
    网抑云,
    温柔语录,
    舔狗语录,
    爱情语录,
    英汉语录,
    经典语录 = 14,
    个性签名,
    诗词,
}

const { apikey: APIKEY } = config;
const { auto: AUTO, mange: MANGE, format: FORMAT } = config.component;

/* 插件入口 */
export class Main {
    public constructor(private Event: Event, Api: Api, Const: Const) {
        Main.Api = Api, Main.Const = Const;
        M.setPath(Const.CONFIG_PLUGIN_PATH);
        M.initConfig(Main.Const.CONFIG_PLUGIN_PATH);
        this.registerEvent();
    }

    private registerEvent = () => {
        this.Event.listen("on_group_msg", data => this.run(data));
        this.Event.listen("on_private_msg", data => this.run(data));
        AUTO.joinGroupWelcome && this.Event.listen("on_group_increase", data => {
            if (!Main.verifyFrom(data)) return;
            Main.Api.send_group_msg(`${SDK.cq_at(data.user_id)} ${AUTO.joinGroupWelcomeMsg}`, data.group_id!)
        });
        AUTO.exitGroupAddBlacklist && this.Event.listen("on_group_decrease", data => {
            if (!Main.verifyFrom(data)) return;
            const list = M.loadConfigP(`${data.group_id}\\blackList.json`) as number[];
            list.push(data.user_id)
            M.saveConfigP(`${data.group_id}\\blackList.json`, list);
            Main.Api.send_group_msg(`检测到用户[${data.user_id}]退群已自动添加至当前群黑名单内`, data.group_id!);
        });
    }

    private run = (data: EventDataType) => {
        if (!Main.verifyFrom(data)) return;
        new Content(data);
    }

    public static Api: Api;
    public static Const: Const;

    public static verifyEnable = (send: Send) => {
        const result = MANGE.enable;
        result || send(BOT_RESULT.DISABLE);
        return result;
    }

    public static verifyAcess = (data: EventDataType, send: Send, access: 1 | 2 = 2): false | 1 | 2 => {
        if (data.user_id === Main.Const.CONFIG.bot.master) return 1;
        const mangerList = M.loadConfigP(`${data.group_id}\\mangerList.json`) as number[];
        const result = mangerList.includes(data.user_id);
        if (!result || access === 1) send(BOT_RESULT.NO_ACCESS);
        return result ? 2 : false;
    }

    public static verifyFrom = (data: EventDataType) => {
        if (data.message_type === 'group' && config.group.enable === true) {
            if (!config.group.list.includes(data.group_id!)) return false;
        }
        if (data.user_id == data.self_id) return false;
        return true;
    }
}

export class Cmd {
    public static register = (keyword: string | string[], callback: HandlerFuncType, params?: paramInfo[], description?: string) => {
        Com.set(keyword, callback);
        CmdInfo.set(keyword, { params, description });
    }
}

class Content {
    public constructor(private data: EventDataType) {
        M.setArgs(this.data.message.split(' '));
        const result = Com.get(M.args[0]);
        if (result) {
            this.runHandlerFunc(result, M.args[0]);
            return;
        }

        for (let [key, handlerFunc] of Com) {
            if ((typeof key === 'function' && key(this.data.message)) || (Array.isArray(key) && key.includes(this.data.message))) {
                this.runHandlerFunc(handlerFunc, key);
                return;
            }
        }

        if (this.data.message_type === 'private' || !MANGE.enable) return;
        this.runOtherFunc();
    }

    private send: Send = msg => {
        if (this.data.message_type === 'private') {
            Main.Api.send_private_msg(msg, this.data.user_id);
        } else {
            Main.Api.send_group_msg(msg, <number>this.data.group_id);
        }
    }

    private checkParams = (key: mapIndex) => {
        const params = CmdInfo.get(key)?.params;

        if (!params) return;
        for (let index in params) {
            if (M.args[parseInt(index) + 1]) continue;
            if (params[index].must !== true) {
                params[index].must !== false && (M.args[parseInt(index) + 1] = params[index].must as string);
                continue
            };
            this.send(BOT_RESULT.ARGS_EMPTY);
            return false;
        }
        return true;
    }

    private runHandlerFunc = (handlerFunc: string | HandlerFuncType, key: mapIndex) => {
        if (!this.checkParams(key)) return;

        if (typeof handlerFunc === 'string') {
            this.send(handlerFunc);
            return;
        }

        handlerFunc(this.send, this.data);
    }

    private runOtherFunc = () => {
        this.blackList();
        this.banword();
        this.msgTimes();
    }

    private blackList = () => {
        const user = this.data.user_id;
        const result = (M.loadConfigP(`blackList.json`) as number[]).includes(user);
        if (!result && !(M.loadConfigP(`${this.data.group_id}\\blackList.json`) as number[]).includes(user)) return;
        Main.Api.send_group_msg(`检测到用户[${user}]存在于${result ? '全局' : '当前群'}黑名单`, this.data.group_id!);
    }

    private banword = () => {
        const user = this.data.user_id;
        if ((M.loadConfigP(`whiteList.json`) as number[]).includes(user) || (M.loadConfigP(`${this.data.group_id}\\whiteList.json`) as number[]).includes(user)) return;

        const banwordList = M.loadConfigP(`banword.json`) as string[];
        for (let word of banwordList) {
            if (!this.data.message.includes(word)) continue;
            Main.Api.set_group_ban(this.data.group_id!, user, MANGE.banwordBanTime);
            Main.Api.send_group_msg(`${SDK.cq_at(this.data.user_id)} 请勿发送违禁词[${word}]！`, this.data.group_id!);
        }
    }

    private msgTimes = () => {
        const user = this.data.group_id! + this.data.user_id;
        if (!M.CACHE_MSG_TIMES[user] || M.CACHE_MSG_TIMES[user].time + (MANGE.repeatRule.cycleTime * 1000) < new Date().getTime()) {
            M.CACHE_MSG_TIMES[user] = {
                time: new Date().getTime(),
                times: 1
            }
            return;
        }
        if (M.CACHE_MSG_TIMES[user].times > MANGE.repeatRule.maxTimes) {
            Main.Api.set_group_ban(this.data.group_id!, user, MANGE.repeatBanTime);
            Main.Api.send_group_msg(`${SDK.cq_at(this.data.user_id)} 请勿在短时间内多次刷屏！`, this.data.group_id!);
            return;
        }
        M.CACHE_MSG_TIMES[user].times++;
    }
}

Cmd.register('/music', send => {
    const num = parseInt(M.args[2]);
    M.fetchJH(send, 'netease', { name: M.args[1] }, res => {
        if (!M.isObjArrP(send, res.data)) return;

        if (num == 0) {
            let message = '';
            for (let init = 0; init < (res.data.length > FORMAT.maxListNums ? FORMAT.maxListNums : res.data.length); init++) {
                const song = res.data[init];
                message += `${init + 1}.${song.title} - ${song.author}\n`;
            }
            message += BOT_RESULT.NUM_CHOOSE;
            send(message);
            return;
        }

        const song = res.data[num - 1];
        if (!song) {
            send(BOT_RESULT.NUM_ERROR);
            return;
        }

        send(
            `歌曲ID: ${song.songid}\n歌曲标题: ${song.title}\n歌曲作者 :${song.author}` +
            `\n歌曲下载: ${song.url}\n歌曲封面: ${SDK.cq_image(song.pic)}`
        );
        send(SDK.cq_Music('163', song.songid));
    }, '没有找到相应歌曲');
}, [
    {
        must: true,
        name: '歌名'
    },
    {
        must: '1',
        name: '序号'
    }
], '网易云点歌,序号不填默认为1,填0显示歌曲列表,例子:歌名 2');

Cmd.register('/bgm', send => {
    const num = parseInt(M.args[2]), cache = `bgm${M.args[1]}`;
    const handle = (res: obj) => {
        if (!res || !isObjArr(res.list)) {
            send('未找到相应条目');
            return;
        }
        M.cacheGet(cache) || M.cacheSet(cache, res);

        if (num == 0) {
            let message = '';
            for (let init = 0; init < (res.list.length > FORMAT.maxListNums ? FORMAT.maxListNums : res.list.length); init++) {
                const data = res.list[init];
                message += `${init + 1}.${data.name}${data.name_cn ? ` - ${data.name_cn}` : ''}\n`;
            }
            message += BOT_RESULT.NUM_CHOOSE;
            send(message);
            return;
        }

        const data = res.list[num - 1];
        if (!data) {
            send(BOT_RESULT.NUM_ERROR);
            return;
        }

        M.fetchBGM(`${URL.BGM}v0/subjects/${data.id}`, { token: APIKEY.bangumi }).then(res => {
            if (!Array.isArray(res.tags)) {
                send('未找到相应条目');
                return;
            }

            let tags = '';
            res.tags.forEach((data: { name: string, count: number }) => tags += `、${data.name}`);
            send(
                `原名: ${res.name}` +
                `\n中文名: ${res.name_cn}` +
                `\n介绍: ${res.summary}` +
                `\n标签: ${tags.substring(1)}` +
                `\n详情: https://bgm.tv/subject/${data.id}` +
                `\n${SDK.cq_image(res.images.large)}`
            )
        });
    }
    if (M.cacheGet(cache)) { handle(M.cacheGet(cache)!); return; }
    M.fetchBGM(`${URL.BGM}search/subject/${M.args[1]}`, { token: APIKEY.bangumi }).then(res => handle(res));
}, [
    {
        must: true,
        name: '名字'
    },
    {
        must: '1',
        name: '序号'
    }
], '番组计划,搜索游戏/动漫/角色等');

Cmd.register('/bgmc', send => {
    M.fetchBGM(`${URL.BGM}calendar`, { token: APIKEY.bangumi }).then(res => {
        if (!M.isObjArrP(send, res)) return;

        const day_num = (() => {
            const day = (new Date()).getDay();
            return day === 0 ? 6 : day - 1;
        })();
        const items = res[day_num].items;
        let result = '';
        for (let init = 0; init < 3; init++) {
            const item = items[init];
            result += (`\n原名: ${item.name}` +
                `\n中文名: ${item.name_cn}` +
                `\n开播时间: ${item.air_date}` +
                `\n${SDK.cq_image(item.images.large)}`
            );
        }
        send(`日期: ${res[day_num].weekday.ja}~${result}`)
    })
}, undefined, '获取番组计划今日放送')

Cmd.register('/star', send => {
    M.fetchJH(send, 'starluck', { msg: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        let msg = `${res.data.name}今日运势: `;
        res.data.info.forEach((element: string) => {
            msg += `\n${element}`;
        });
        res.data.index.forEach((element: string) => {
            msg += `\n${element}`;
        });
        send(msg);
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '星座错误！'
    });
}, [{
    must: true, name: '星座名'
}], '查看今日星座运势');

Cmd.register('/tran', send => {
    M.fetchJH(send, 'fanyi', { msg: M.args[1] }, res => send(`原文: ${M.args[1]}\n译文: ${res.data}`));
}, [{
    must: true, name: ''
}]);

Cmd.register('/lunar', send => {
    M.fetchT('lunar').then(res => send(res))
});

Cmd.register('/story', send => {
    M.fetchJH(send, 'storytoday', undefined, res => {
        let result = '';
        (<string[]>res.data).forEach(str => result += '\n' + str);
        send(`历史上的今天` + result);
    }, {
        condition: RES_CODE.ARGS_EMPTY
    });
});

Cmd.register('/motd', send => {
    M.args[2] = M.args[2] ?? 25565;
    M.fetchJH(send, 'motd', { ip: M.args[1], port: M.args[2] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `状态: 在线\nIP: ${res.data.real}\n端口: ${res.data.port}` +
            `\n物理地址: ${res.data.location}\nMOTD: ${res.data.motd}` +
            `\n协议版本: ${res.data.agreement}\n游戏版本: ${res.data.version}` +
            `\n在线人数: ${res.data.online} / ${res.data.max}\n延迟: ${res.data.ping}ms` +
            `\n图标: ${res.data.icon ? SDK.cq_image(`base64://${res.data.icon.substring(22)}`) : '无'}`
        )
    }, {
        condition: res => typeof res.code === 'number',
        result: `状态: 离线\nIP: ${M.args[1]}\n端口: ${M.args[2]}`
    });
});

Cmd.register('/motdpe', send => {
    M.args[2] = M.args[2] ?? 19132;
    M.fetchJH(send, 'motdpe', { ip: M.args[1], port: M.args[2] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `状态: 在线\nIP: ${res.data.real}\n端口: ${res.data.port}` +
            `\n物理地址: ${res.data.location}\nMOTD: ${res.data.motd}` +
            `\n游戏模式: ${res.data.gamemode}\n协议版本: ${res.data.agreement}` +
            `\n游戏版本: ${res.data.version}` +
            `\n在线人数: ${res.data.online} / ${res.data.max}` +
            `\n延迟: ${res.data.delay}ms`
        )
    }, {
        condition: res => typeof res.code === 'number',
        result: `状态: 离线\nIP: ${M.args[1]}\n端口: ${M.args[2]}`
    });
});

Cmd.register('/mcskin', send => {
    M.fetchJH(send, 'mcskin', { name: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `玩家: ${M.args[1]}\n皮肤: ${SDK.cq_image(res.data.skin)}` +
            `\n披风: ${res.data.cape ? SDK.cq_image(res.data.cape) : '无'}` +
            `\n头颅: ${res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : '无'}`
        )
    }, '查无此人！');
});

Cmd.register('/bili', send => {
    M.fetchJH(send, 'biligetv', { msg: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `BV号: ${res.data.bvid}\nAV号: ${res.data.aid}` +
            `\n视频标题: ${res.data.title}\n视频简介: ${res.data.descr}` +
            `\n作者UID: ${res.data.owner.uid}\n视频封面: ${SDK.cq_image(res.data.pic)}`
        )
    }, '未找到该视频');
});

Cmd.register('/sed', (send, data) => {
    if (M.args[1] === data.self_id.toString()) {
        send('未查询到相关记录');
        return;
    }
    M.fetchJH(send, 'sed', { msg: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `查询内容: ${M.args[1]}\n消耗时间: ${Math.floor(res.takeTime)}秒\n记录数量: ${res.count}` +
            (res.data.qq ? `\nQQ: ${res.data.qq}` : '') +
            (res.data.phone ? `\n手机号: ${res.data.phone}` : '') +
            (res.data.location ? `\n运营商: ${res.data.location}` : '') +
            (res.data.id ? `\nLOLID: ${res.data.id}` : '') +
            (res.data.area ? `\nLOL区域: ${res.data.area}` : '')
        )
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '未查询到相关记录'
    });
});

Cmd.register('/idcard', send => {
    M.fetchJH(send, 'idcard', { msg: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;
        send(
            `身份证号: ${M.args[1]}\n性别: ${res.data.gender}\n` +
            `出生日期: ${res.data.birthday}\n年龄: ${res.data.age}` +
            `\n省份: ${res.data.province}\n地址: ${res.data.address}` +
            `\n${res.data.starsign}`
        )
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '身份证号错误'
    });
});

Cmd.register('/hcb', send => {
    M.fetchJH(send, 'https://hcb.imlolicon.tk/api/v3', { value: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

        if (<boolean>res.data.status) {
            let imgs = '';
            if (res.data.imgs !== null) {
                (<string[]>res.data.imgs).forEach(element => {
                    imgs += SDK.cq_image(element);
                });
            }
            send(
                `${M.args[1]}有云黑记录\nUUID: ${res.data.uuid}` +
                `\n用户平台: ${res.data.plate}\n用户ID: ${res.data.idkey}` +
                `\n记录描述: ${res.data.descr}\n记录等级: ${res.data.level}` +
                `\n记录时间: ${res.data.date}\n相关图片: ${imgs ? imgs : '无'}`
            );
        } else {
            send(`${M.args[1]}无云黑记录`);
        }
    });
});

Cmd.register('/state', send => {
    M.fetchT('webtool', { op: 1, url: M.args[1] }).then(res => send(res.replace(/<br>/g, '\n')));
});

Cmd.register('/speed', send => {
    M.fetchT('webtool', { op: 3, url: M.args[1] }).then(res => send(res.replace(/<br>/g, '\n')));
});

Cmd.register('/sex', send => {
    send('图片正在来的路上....你先别急');

    M.fetchJH(send, `${URL.BLOG}seimg/v2/`, { tag: M.args[1] }, res => {
        if (!M.isObjArrP(send, res.data)) return;

        const dd = res.data[0];
        let tags = '';
        dd.tags.forEach((element: string) => {
            tags += `、${element}`;
        });
        let msg = `PID:${dd.pid}\n标题:${dd.title}\n作者:${dd.author}\n标签:${tags.substring(1)}`;
        send(`${msg}\n${SDK.cq_image(dd.url)}`);
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '未找到相应图片'
    });
});

Cmd.register('/sexh', send => {
    send('图片正在来的路上....你先别急');
    M.fetchJH(send, `${URL.BLOG}huimg/`, { tag: M.args[1] }, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

        const dd = res.data;
        let tag = '';
        (<string[]>dd.tag).forEach(element => {
            tag += `、${element}`;
        });
        send(`标签:${tag.substring(1)}\n${SDK.cq_image(dd.url)}`);
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '未找到相应图片'
    });
});

/* 随机图片 */
Cmd.register('/seller', send => send(SDK.cq_image(`${URL.API}sellerimg`)));

Cmd.register('/sedimg', send => send(SDK.cq_image(`${URL.API}sedimg`)));

Cmd.register('/bing', send => send(SDK.cq_image(`${URL.API}bing`)));

Cmd.register('/day', send => {
    send(APIKEY.api.day ? SDK.cq_image(`${URL.API}60s?apikey=${APIKEY.api.day}`) : '请先配置APIKEY！');
});

Cmd.register('/earth', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')));

Cmd.register('/china', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')));

Cmd.register('/sister', send => send(SDK.cq_video(`${URL.API}sisters`)));

Cmd.register('/qrcode', send => send(
    M.args[1] ? SDK.cq_image(`${URL.API}qrcode?text=${M.args[1]}&frame=2&size=200&e=L`) : BOT_RESULT.ARGS_EMPTY
));

/* 随机语录 */
Cmd.register('一言', send => {
    M.fetchJH(send, `${URL.BLOG}hitokoto/v2/`, undefined, res => {
        if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

        let msg = `${res.data.msg}${res.data.from ? `——${res.data.from}` : ''}`;
        send(msg + `\n类型: ${res.data.type}`);
    });
});

Cmd.register(Object.keys(hitokotoList), send => {
    hitokotoList[M.args[1] as keyof typeof hitokotoList] && M.fetchT('words', { msg: hitokotoList[M.args[1] as keyof typeof hitokotoList], format: 'text' }).then(res => send(res));
});

/* GPT聊天 */
Cmd.register('/gpt', send => {
    M.args[1] ? M.fetchJ(URL.GPT, undefined, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${APIKEY.bot.chatgpt}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: M.args[1]
                }
            ]
        }),
    }).then(res => (M.con.log(res), send(res.choices[0].message.content))) : send(BOT_RESULT.ARGS_EMPTY);
});

Cmd.register('/cl', send => {
    send('该功能维修中');
});

Cmd.register('/api', send => {
    M.fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' }).then(res => send(res))
});

Cmd.register('/bot', send => {
    const BOT = Main.Const.BOT;
    const STAT = BOT.status.stat;
    const info = getPackageInfo();
    const ENV = M.dealEnv();
    send(
        `BOT信息\nBOTQQ: ${BOT.self_id}\n连接时间: ${BOT.connect}` +
        `\n接收包数量: ${STAT.packet_received}\n发送包数量: ${STAT.packet_sent}\n丢失包数量: ${STAT.packet_lost}` +
        `\n接收消息数量: ${STAT.message_received}\n发送消息数量: ${STAT.message_sent}` +
        `\n连接丢失次数: ${STAT.lost_times}\n连接断开次数: ${STAT.disconnect_times}` +
        `\n框架信息\n当前BOT框架版本: ${info.version}\n框架协议: ${info.license}` +
        `\n环境信息\nNode版本: ${ENV.node}\nTypeScript版本: ${ENV.typescript}\nTsNode版本: ${ENV.tsnode}` +
        `\n${BOT_RESULT.AUTHOR}`
    )
});

Cmd.register('/status', send => {
    const cpuData = M.dealCpu();
    const ramData = M.dealRam();
    send(
        `服务器运行状态\n系统内核: ${os.type()}\n系统平台: ${os.platform()}\nCPU架构: ${os.arch()}\nCPU型号: ` +
        `${cpuData.model}\nCPU频率: ${cpuData.speed.toFixed(2)}GHz\nCPU核心数: ${cpuData.num}` +
        `\nCPU使用率: ${cpuData.rate.toFixed(2)}%\n内存总量: ${ramData.total.toFixed(2)}GB\n可用内存: ` +
        `${ramData.used.toFixed(2)}GB\n内存使用率: ${ramData.rate.toFixed(2)}%\n网卡数量: ` +
        `${Object.keys(os.networkInterfaces()).length}\n开机时间: ${M.dealTime()}\n主机名字: ${os.hostname()}` +
        `\n系统目录: ${os.homedir()}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Cmd.register(['/about', 'kotori', '关于BOT', '关于bot'], send => {
    const info = getPackageInfo();
    send(
        `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n` +
        `开源地址: https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本: ${info.version}` +
        `\n框架协议: ${info.license}\n${SDK.cq_image('https://biyuehu.github.io/images/avatar.png')}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Cmd.register(['/update', '检查更新'], send => {
    const version = getPackageInfo().version;
    fetchJson('https://biyuehu.github.io/kotori-bot/package.json').then(res => {
        send(
            `当前版本: ${version}` +
            (res.version === version ? '\n当前为最新版本！' : (
                '\n检测到有更新！' +
                `\n最新版本: ${res.version}` +
                '\n请前往Github仓库获取最新版本: https://github.com/biyuehu/kotori-bot'
            ))
        )
    })
});

Cmd.register('/ban', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    const time = M.args[2] ? parseInt(M.args[2]) * 60 : MANGE.banTime;
    if (M.args[1] && (qq = SDK.get_at(M.args[1]) || parseInt(M.args[1]))) {
        Main.Api.set_group_ban(data.group_id!, qq, time);
        send(`成功禁言[${qq}]用户[${time}]分钟`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!);
        send('全体禁言成功')
    }
});

Cmd.register('/unban', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    if (M.args[1] && (qq = SDK.get_at(M.args[1]) || parseInt(M.args[1]))) {
        Main.Api.set_group_ban(data.group_id!, qq, 0);
        send(`成功解除禁言[${qq}]用户`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!, false);
        send('解除全体禁言成功')
    }
});

Cmd.register('/black', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = M.controlParams(`${data.group_id}\\blackList.json`, ['当前群黑名单列表:', '已添加[%target%]至当前群黑名单', '已删除[%target%]从当前群黑名单'])
    send(message);
});

Cmd.register('/white', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = M.controlParams(`${data.group_id}\\whiteList.json`, ['当前群白名单列表:', '已添加[%target%]至当前群白名单', '已删除[%target%]从当前群白名单'])
    send(message);
});

Cmd.register('/kick', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number;
    if (M.args[1] && (qq = SDK.get_at(M.args[1]) || parseInt(M.args[1]))) {
        Main.Api.set_group_kick(data.group_id!, qq);
        send(`成功踢出[${qq}]用户`);
        return;
    }
});

Cmd.register('/all', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    if (!M.args[1]) {
        send('请输入消息内容')
        return;
    }
    send(`${SDK.cq_at('all')} 以下消息来自管理员:\n${M.args[1]}`);
});

Cmd.register('/notice', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    if (!M.args[1]) {
        send('请输入公告内容')
        return;
    }
    const image = SDK.get_image(M.args[1]);
    Main.Api._send_group_notice(data.group_id!, `From Admin~\n${M.args[1]}`, image || undefined)
});

Cmd.register('/view', (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
});

Cmd.register('/blackg', (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`blackList.json`, ['全局黑名单列表:', '已添加[%target%]至全局黑名单', '已删除[%target%]从全局黑名单'])
    send(message);
});

Cmd.register('/whiteg', (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`whiteList.json`, ['全局白名单列表:', '已添加[%target%]至全局白名单', '已删除[%target%]从全局白名单'])
    send(message);
});


Cmd.register('/manger', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`${data.group_id}\\mangerList.json`, ['当前群管理员列表:', '已添加[%target%]至当前群管理员', '已删除[%target%]从当前群管理员'])
    send(message);
});

export default Main;