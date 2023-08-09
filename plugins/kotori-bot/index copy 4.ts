/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-06 21:10:58
 */
import os from 'os';
import type { EventDataType, obj, Event, Api, Const } from '@/tools';
import { fetchJson, getPackageInfo, isObj, isObjArr, loadConfig, saveConfig, stringProcess, stringSplit, stringTemp } from '@/tools';
import { con, dealCpu, dealEnv, dealRam, dealTime, fetchBGM, fetchJ, fetchT, initConfig } from './method';
import config from './config';
import Com, { BOT_RESULT, URL } from './menu';
import { HandlerFuncType, Res, ResAfter, Send } from './interface';
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

const enum RES_CODE {
    SUCCESS = 500,
    ARGS_EMPTY,
    ARGS_ERROR
}

const enum CONTROL_PARAMS {
    QUERY = 'query',
    ADD = 'add',
    DEL = 'del'
}

const { apikey: APIKEY } = config;
const { auto: AUTO, mange: MANGE, format: FORMAT } = config.component;

/* 插件入口 */
class Main {
    public constructor(private Event: Event, Api: Api, Const: Const) {
        Main.Api = Api, Main.Const = Const;
        initConfig(Main.Const.CONFIG_PLUGIN_PATH);
        this.registerEvent();
    }

    private registerEvent = () => {
        this.Event.listen("on_group_msg", data => this.run(data));
        this.Event.listen("on_private_msg", data => this.run(data));
        AUTO.joinGroupWelcome && this.Event.listen("on_group_increase", data => {
            if (!Main.verifyFrom(data)) return;
            Main.Api.send_group_msg(`${SDK.cq_at(data.user_id)} ${AUTO.joinGroupWelcomeMsg}`, data.group_id!)
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
        access === 1 && send(BOT_RESULT.NO_ACCESS);
        const mangerList = loadConfigP(`${data.group_id}\\mangerList.json`) as number[];
        const result = mangerList.includes(data.user_id);
        return result ? 2 : false;
    }

    public static verifyFrom = (data: EventDataType) => {
        if (data.message_type === 'group' && config.group.enable === true) {
            if (!stringProcess(<number>data.group_id, config.group.list)) return false;
        }
        if (data.user_id == data.self_id) return false;
        return true;
    }
}

class Content {
    public constructor(private data: EventDataType) {
        const result = Com.get(this.data.message);
        if (result) {
            this.runHandlerFunc(result);
            return;
        }

        for (let [key, handlerFunc] of Com) {
            if ((typeof key === 'function' && key(this.data.message)) || (Array.isArray(key) && key.includes(this.data.message))) {
                this.runHandlerFunc(handlerFunc);
                return;
            }
        }

        /* 非固有命令 */
        if (this.data.message_type === 'private' || !MANGE.enable) return;
        const user = this.data.user_id;
        const user_ = this.data.group_id! + user;
        const banwordList = loadConfig(`${Main.Const.CONFIG_PLUGIN_PATH}\\banword.json`) as string[];
        for (let word of banwordList) {
            if (!this.data.message.includes(word)) continue;
            Main.Api.set_group_ban(this.data.group_id!, user, MANGE.banwordBanTime);
            Main.Api.send_group_msg(`${SDK.cq_at(this.data.user_id)} 请勿发送违禁词[${word}]！`, this.data.group_id!);
        }

        if (!CACHE_MSG_TIMES[user_] || CACHE_MSG_TIMES[user_].time + (MANGE.repeatRule.cycleTime * 1000) < new Date().getTime()) {
            CACHE_MSG_TIMES[user_] = {
                time: new Date().getTime(),
                times: 1
            }
            return;
        }
        if (CACHE_MSG_TIMES[user_].times > MANGE.repeatRule.maxTimes) {
            Main.Api.set_group_ban(this.data.group_id!, user, MANGE.repeatBanTime);
            Main.Api.send_group_msg(`${SDK.cq_at(this.data.user_id)} 请勿在短时间内多次刷屏！`, this.data.group_id!);
            return;
        }
        CACHE_MSG_TIMES[user_].times++
    }

    private send: Send = msg => {
        if (this.data.message_type === 'private') {
            Main.Api.send_private_msg(msg, this.data.user_id)
        } else {
            Main.Api.send_group_msg(msg, <number>this.data.group_id)
        }
    }

    private runHandlerFunc = (handlerFunc: string | HandlerFuncType) => {
        if (typeof handlerFunc === 'string') {
            this.send(handlerFunc);
            return;
        }

        handlerFunc(this.send, this.data);
    }
}

/* 缓存定义 */
let args: string[] = [];
const CACHE: obj = {};
const CACHE_MSG_TIMES: obj<{ time: number, times: number }> = {};

/* 函数定义 */
const cacheSet = (key: string, data: obj) => {
    if (!CACHE[key]) CACHE[key] = data;
}

const cacheGet = (key: string): obj | null => {
    return CACHE[key];
}

const stringP = (str: string, key: string) => {
    key += ' ';
    const result = stringProcess(str, key);
    result && (args = stringSplit(str, key).split(' '));
    return result;
}

const matchFunc = (key: string): (str: string) => boolean => {
    return (str: string) => stringP(str, key);
}

const fetchJH = (send: Send, url: string, params: {} | undefined = undefined, onSuccess: (res: ResAfter) => void, onError?: string | { condition?: RES_CODE | ((res: Res) => boolean), result?: string }) => {
    const cache = args[0];
    const handle = (res: Res) => {
        const matchResult = typeof onError === 'object' && onError.condition ? (
            typeof onError.condition === 'number' ? res.code === onError.condition : onError.condition(res)
        ) : res.code === RES_CODE.ARGS_ERROR;
        typeof onError !== 'object' && (onError = { result: onError });

        if (res.code === RES_CODE.SUCCESS && res.data) {
            cacheGet(cache) || cacheSet(cache, res);
            onSuccess(res as ResAfter);
        } else if (onError.result && matchResult) {
            send(onError.result);
            con.warn(res)
        } else {
            send(
                params ? (args[0] ? BOT_RESULT.SERVER_ERROR : BOT_RESULT.ARGS_EMPTY) : BOT_RESULT.SERVER_ERROR
            );
            con.error(res);
        };
    }
    if (cacheGet(cache)) {
        handle(cacheGet(cache) as ResAfter);
        return;
    }
    fetchJ(url, params).then(res => handle(res)).catch((error: Error) => {
        send(`${BOT_RESULT.SERVER_ERROR}\n` + error.toString());
    })
}

const loadConfigP = (filename: string, init: object = []): object => {
    const PATH = `${Main.Const.CONFIG_PLUGIN_PATH}\\${filename}`;
    return loadConfig(PATH, 'json', init) as object ?? init;
}

const saveConfigP = (filename: string, content: object) => {
    const PATH = `${Main.Const.CONFIG_PLUGIN_PATH}\\${filename}`;
    return saveConfig(PATH, content);
}

const isObjArrP = (send: Send, data: unknown): data is obj[] => {
    const result = isObjArr(data);
    result || send(BOT_RESULT.SERVER_ERROR);
    return result;
}

const isObjP = (send: Send, data: unknown): data is obj => {
    const result = isObj(data);
    result || send(BOT_RESULT.SERVER_ERROR);
    return result;
}

const isNotArr = (send: Send, data: unknown): data is string[] | number[] | obj[] => {
    const result = Array.isArray(data);
    result && send(BOT_RESULT.SERVER_ERROR);
    return result;
}


/* 应用区 */
const controlParams = (path: string, msg: [string, string, string]) => {
    let message = '';
    let list = loadConfigP(path) as number[];
    const target = parseInt(args[2]);
    switch (args[1]) {
        case CONTROL_PARAMS.QUERY:
            message += `${msg[0]}\n`;
            list.forEach(user => {
                message += `${user}, `;
            });
            message = message.substring(0, message.length - 2);
            break;
        case CONTROL_PARAMS.ADD:
            if (!args[2]) { message = BOT_RESULT.ARGS_EMPTY; break; }
            if (list.includes(target)) { message = BOT_RESULT.EXIST; break; }
            list.push(target);
            message = stringTemp(msg[1], { target });
            break;
        case CONTROL_PARAMS.DEL:
            if (!args[2]) { message = BOT_RESULT.ARGS_EMPTY; break; }
            if (!message.includes(args[2])) { message = BOT_RESULT.NO_EXIST; break; }
            list = list.filter(item => item !== target);
            message = stringTemp(msg[1], { target });
            break;
        default:
            message = BOT_RESULT.ARGS_ERROR;
            break;
    }
    saveConfigP(path, list);
    return message;
}

Com.set(matchFunc('/music'), send => {
    const num = args[1] ? parseInt(args[1]) : 1;
    fetchJH(send, 'netease', { name: args[0] }, res => {
        if (!isObjArrP(send, res.data)) return;

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
});

Com.set(matchFunc('/bgm'), send => {
    const num = args[1] ? parseInt(args[1]) : 1, cache = `bgm${args[0]}`;
    const handle = (res: obj) => {
        if (!res || !isObjArr(res.list)) {
            send('未找到相应条目');
            return;
        }
        cacheGet(cache) || cacheSet(cache, res);

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

        fetchBGM(`${URL.BGM}v0/subjects/${data.id}`, { token: APIKEY.bangumi }).then(res => {
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
    if (cacheGet(cache)) { handle(cacheGet(cache)!); return; }
    fetchBGM(`${URL.BGM}search/subject/${args[0]}`, { token: APIKEY.bangumi }).then(res => handle(res));
});

Com.set('/bgmc', send => {
    fetchBGM(`${URL.BGM}calendar`, { token: APIKEY.bangumi }).then(res => {
        if (!isObjArrP(send, res)) return;

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
})

Com.set(matchFunc('/star'), send => {
    fetchJH(send, 'starluck', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
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
});

Com.set(matchFunc('/tran'), send => {
    fetchJH(send, 'fanyi', { msg: args[0] }, res => send(`原文: ${args[0]}\n译文: ${res.data}`));
});

Com.set('/lunar', send => {
    fetchT('lunar').then(res => send(res))
});

Com.set('/story', send => {
    fetchJH(send, 'storytoday', undefined, res => {
        let result = '';
        (<string[]>res.data).forEach(str => result += '\n' + str);
        send(`历史上的今天` + result);
    }, {
        condition: RES_CODE.ARGS_EMPTY
    });
});

Com.set(matchFunc('/motd'), send => {
    args[1] = args[1] ?? 25565;
    fetchJH(send, 'motd', { ip: args[0], port: args[1] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `状态: 在线\nIP: ${res.data.real}\n端口: ${res.data.port}` +
            `\n物理地址: ${res.data.location}\nMOTD: ${res.data.motd}` +
            `\n协议版本: ${res.data.agreement}\n游戏版本: ${res.data.version}` +
            `\n在线人数: ${res.data.online} / ${res.data.max}\n延迟: ${res.data.ping}ms` +
            `\n图标: ${res.data.icon ? SDK.cq_image(`base64://${res.data.icon.substring(22)}`) : '无'}`
        )
    }, {
        condition: res => typeof res.code === 'number',
        result: `状态: 离线\nIP: ${args[0]}\n端口: ${args[1]}`
    });
});

Com.set(matchFunc('/motdpe'), send => {
    args[1] = args[1] ?? 19132;
    fetchJH(send, 'motdpe', { ip: args[0], port: args[1] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
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
        result: `状态: 离线\nIP: ${args[0]}\n端口: ${args[1]}`
    });
});

Com.set(matchFunc('/mcskin'), send => {
    fetchJH(send, 'mcskin', { name: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `玩家: ${args[0]}\n皮肤: ${SDK.cq_image(res.data.skin)}` +
            `\n披风: ${res.data.cape ? SDK.cq_image(res.data.cape) : '无'}` +
            `\n头颅: ${res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : '无'}`
        )
    }, '查无此人！');
});

Com.set(matchFunc('/bili'), send => {
    fetchJH(send, 'biligetv', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `BV号: ${res.data.bvid}\nAV号: ${res.data.aid}` +
            `\n视频标题: ${res.data.title}\n视频简介: ${res.data.descr}` +
            `\n作者UID: ${res.data.owner.uid}\n视频封面: ${SDK.cq_image(res.data.pic)}`
        )
    }, '未找到该视频');
});

Com.set(matchFunc('/sed'), (send, data) => {
    if (args[0] === data.self_id.toString()) {
        send('未查询到相关记录');
        return;
    }
    fetchJH(send, 'sed', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `查询内容: ${args[0]}\n消耗时间: ${Math.floor(res.takeTime)}秒\n记录数量: ${res.count}` +
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

Com.set(matchFunc('/idcard'), send => {
    fetchJH(send, 'idcard', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `身份证号: ${args[0]}\n性别: ${res.data.gender}\n` +
            `出生日期: ${res.data.birthday}\n年龄: ${res.data.age}` +
            `\n省份: ${res.data.province}\n地址: ${res.data.address}` +
            `\n${res.data.starsign}`
        )
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '身份证号错误'
    });
});

Com.set(matchFunc('/hcb'), send => {
    fetchJH(send, 'https://hcb.imlolicon.tk/api/v3', { value: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;

        if (<boolean>res.data.status) {
            let imgs = '';
            if (res.data.imgs !== null) {
                (<string[]>res.data.imgs).forEach(element => {
                    imgs += SDK.cq_image(element);
                });
            }
            send(
                `${args[0]}有云黑记录\nUUID: ${res.data.uuid}` +
                `\n用户平台: ${res.data.plate}\n用户ID: ${res.data.idkey}` +
                `\n记录描述: ${res.data.descr}\n记录等级: ${res.data.level}` +
                `\n记录时间: ${res.data.date}\n相关图片: ${imgs ? imgs : '无'}`
            );
        } else {
            send(`${args[0]}无云黑记录`);
        }
    });
});

Com.set(matchFunc('/state'), send => {
    fetchT('webtool', { op: 1, url: args[0] }).then(res => send(res.replace(/<br>/g, '\n')));
});

Com.set(matchFunc('/speed'), send => {
    fetchT('webtool', { op: 3, url: args[0] }).then(res => send(res.replace(/<br>/g, '\n')));
});

Com.set((str: string) => str === '/sex' || stringP(str, '/sex'), send => {
    send('图片正在来的路上....你先别急');

    fetchJH(send, `${URL.BLOG}seimg/v2/`, { tag: args[0] }, res => {
        if (!isObjArrP(send, res.data)) return;

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

Com.set((str: string) => str === '/sexh' || stringP(str, '/sexh'), send => {
    send('图片正在来的路上....你先别急');
    fetchJH(send, `${URL.BLOG}huimg/`, { tag: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;

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
Com.set('/seller', send => send(SDK.cq_image(`${URL.API}sellerimg`)));

Com.set('/sedimg', send => send(SDK.cq_image(`${URL.API}sedimg`)));

Com.set('/bing', send => send(SDK.cq_image(`${URL.API}bing`)));

Com.set('/day', send => {
    send(APIKEY.api.day ? SDK.cq_image(`${URL.API}60s?apikey=${APIKEY.api.day}`) : '请先配置APIKEY！');
});

Com.set('/earth', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')));

Com.set('/china', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')));

Com.set('/sister', send => send(SDK.cq_video(`${URL.API}sisters`)));

Com.set(matchFunc('/qrcode'), send => send(
    args[0] ? SDK.cq_image(`${URL.API}qrcode?text=${args[0]}&frame=2&size=200&e=L`) : BOT_RESULT.ARGS_EMPTY
));

/* 随机语录 */
Com.set('一言', send => {
    fetchJH(send, `${URL.BLOG}hitokoto/v2/`, undefined, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;

        let msg = `${res.data.msg}${res.data.from ? `——${res.data.from}` : ''}`;
        send(msg + `\n类型: ${res.data.type}`);
    });
});

Com.set(Object.keys(hitokotoList), send => {
    hitokotoList[args[0] as keyof typeof hitokotoList] && fetchT('words', { msg: hitokotoList[args[0] as keyof typeof hitokotoList], format: 'text' }).then(res => send(res));
});

/* GPT聊天 */
Com.set(matchFunc('/gpt'), send => {
    args[0] ? fetchJ(URL.GPT, undefined, {
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
                    content: args[0]
                }
            ]
        }),
    }).then(res => (con.log(res), send(res.choices[0].message.content))) : send(BOT_RESULT.ARGS_EMPTY);
});

Com.set(matchFunc('/cl'), send => {
    send('该功能维修中');
});

Com.set('/api', send => {
    fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' }).then(res => send(res))
});

Com.set('/bot', send => {
    const BOT = Main.Const.BOT;
    const STAT = BOT.status.stat;
    const info = getPackageInfo();
    const ENV = dealEnv();
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

Com.set('/status', send => {
    const cpuData = dealCpu();
    const ramData = dealRam();
    send(
        `服务器运行状态\n系统内核: ${os.type()}\n系统平台: ${os.platform()}\nCPU架构: ${os.arch()}\nCPU型号: ` +
        `${cpuData.model}\nCPU频率: ${cpuData.speed.toFixed(2)}GHz\nCPU核心数: ${cpuData.num}` +
        `\nCPU使用率: ${cpuData.rate.toFixed(2)}%\n内存总量: ${ramData.total.toFixed(2)}GB\n可用内存: ` +
        `${ramData.used.toFixed(2)}GB\n内存使用率: ${ramData.rate.toFixed(2)}%\n网卡数量: ` +
        `${Object.keys(os.networkInterfaces()).length}\n开机时间: ${dealTime()}\n主机名字: ${os.hostname()}` +
        `\n系统目录: ${os.homedir()}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Com.set(['/about', 'kotori', '关于BOT', '关于bot'], send => {
    const info = getPackageInfo();
    send(
        `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n` +
        `开源地址: https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本: ${info.version}` +
        `\n框架协议: ${info.license}\n${SDK.cq_image('https://biyuehu.github.io/images/avatar.png')}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Com.set(['/update', '检查更新'], send => {
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

Com.set(str => (str === '/ban' || stringP(str, '/ban')), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    const time = args[1] ? parseInt(args[1]) * 60 : MANGE.banTime;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_ban(data.group_id!, qq, time);
        send(`成功禁言[${qq}]用户[${time}]分钟`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!);
        send('全体禁言成功')
    }
});

Com.set(str => (str === '/unban' || stringP(str, '/unban')), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_ban(data.group_id!, qq, 0);
        send(`成功解除禁言[${qq}]用户`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!, false);
        send('解除全体禁言成功')
    }
});

Com.set(str => stringP(str, '/black'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = controlParams(`${data.group_id}\\blackList.json`, ['当前群黑名单列表:', '已添加[%query%]至黑名单', '已删除[%query%]从黑名单'])
    send(message);
});

Com.set(str => stringP(str, '/white'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = controlParams(`${data.group_id}\\whiteList.json`, ['当前群白名单列表:', '已添加[%query%]至白名单', '已删除[%query%]从白名单'])
    send(message);
});

Com.set(str => stringP(str, '/kick'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_kick(data.group_id!, qq);
        send(`成功踢出[${qq}]用户`);
    }
});

Com.set(str => stringP(str, '/all'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    if (!args[0]) {
        send('请输入消息内容')
        return;
    }
    send(`${SDK.cq_at('all')} 以下消息来自管理员:\n${args[0]}`);
});

Com.set(str => stringP(str, '/notice'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    if (!args[0]) {
        send('请输入公告内容')
        return;
    }
    const image = SDK.get_image(args[0]);
    Main.Api._send_group_notice(data.group_id!, `From Admin~\n${args[0]}`, image || undefined)
});

Com.set(str => stringP(str, '/view'), (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
});

Com.set(str => stringP(str, '/blackg'), (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = controlParams(`blackList.json`, ['全局黑名单列表:', '已添加[%query%]至全局黑名单', '已删除[%query%]从全局黑名单'])
    send(message);
});

Com.set(str => stringP(str, '/whiteg'), (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = controlParams(`whiteList.json`, ['全局白名单列表:', '已添加[%query%]至全局白名单', '已删除[%query%]从全局白名单'])
    send(message);
});


Com.set(str => stringP(str, '/manger'), (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = controlParams(`${data.group_id}\\mangerList.json`, ['当前群管理员列表:', '已添加[%query%]至管理员', '已删除[%query%]从管理员'])
    send(message);
});

export default Main;