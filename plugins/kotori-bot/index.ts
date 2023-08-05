/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-05 17:25:02
 */
import os from 'os';
import type { EventDataType, obj, Event, Api, Const } from '@/tools';
import { fetchJson, getPackageInfo, isObj, isObjArr, stringProcess, stringSplit } from '@/tools';
import { con, dealCpu, dealEnv, dealRam, dealTime, fetchBGM, fetchJ, fetchT } from './method';
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

/* 插件入口 */
class Main {
    public constructor(private Event: Event, Api: Api, Const: Const) {
        Main.Api = Api, Main.Const = Const;
        this.registerEvent();
    }

    private registerEvent = () => {
        this.Event.listen("on_group_msg", data => this.run(data));
        this.Event.listen("on_private_msg", data => this.run(data));
        config.component.join.enable && this.Event.listen("on_group_increase", data => {
            if (!Main.verifyGroup(data)) return;
            Main.Api.send_group_msg(`${SDK.cq_at(data.user_id)} ${config.component.join.message}`, data.group_id!)
        });
    }

    private run = (data: EventDataType) => {
        if (!Main.verifyGroup(data)) return;
        new Content(data);
    }

    public static Api: Api;
    public static Const: Const;

    public static verifyAcess = (data: EventDataType, send: Function) => {
        const result = data.user_id === Main.Const._CONFIG.bot.master;
        result || send(BOT_RESULT.NO_ACCESS);
        return result;
    }

    public static verifyGroup = (data: EventDataType) => {
        if (data.message_type === 'group' && config.group.state === true) {
            if (!stringProcess(<number>data.group_id, config.group.list)) return false;
        }
        if (data.user_id == data.self_id) return;
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
            }
        }
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

/* 函数定义 */
let args: string[] = [];
const CACHE: obj<ResAfter> = {};
const stringP = (str: string, key: string) => {
    key += ' ';
    const result = stringProcess(str, key);
    result && (args = stringSplit(str, key).split(' '));
    return result;
}

const matchFunc = (key: string): (str: string) => boolean => {
    return (str: string) => stringP(str, key);
}

const fetchJH = (send: Function, url: string, params: {} | undefined = undefined, onSuccess: (res: ResAfter) => void, onError?: string | { condition?: RES_CODE | ((res: Res) => boolean), result?: string }) => {
    fetchJ(url, params).then(res => {
        const matchResult = typeof onError === 'object' && onError.condition ? (
            typeof onError.condition === 'number' ? res.code === onError.condition : onError.condition(res)
        ) : res.code === RES_CODE.ARGS_ERROR;
        typeof onError !== 'object' && (onError = { result: onError });

        if (res.code === RES_CODE.SUCCESS && res.data) {

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
    }).catch((error: Error) => {
        send(`${BOT_RESULT.SERVER_ERROR}\n` + error.toString());
    })
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
Com.set(matchFunc('/music'), send => {
    const num = args[1] ? parseInt(args[1]) : 1;
    const handle = (res: ResAfter) => {
        if (!isObjArrP(send, res.data)) return;

        let message = '';
        if (num == 0) {
            for (let init = 0; init < (res.data.length > config.component.list.maxNums ? config.component.list.maxNums : res.data.length); init++) {
                const song = res.data[init];
                message += `${init + 1}.${song.title} - ${song.author}\n`;
            }
            message += BOT_RESULT.NUM_CHOOSE;
        } else {
            const song = res.data[num - 1];
            if (!song) {
                send(BOT_RESULT.NUM_ERROR);
                return;
            }

            message = (
                `歌曲ID：${song.songid}\n歌曲标题：${song.title}\n歌曲作者 :${song.author}` +
                `\n歌曲下载：${song.url}\n歌曲封面：${SDK.cq_image(song.pic)}`
            );
            send(SDK.cq_Music('163', song.songid));
        }
        send(message);
    }
    if (CACHE[`music${args[0]}`]) { handle(CACHE[`music${args[0]}`]); return; }
    fetchJH(send, 'netease', { name: args[0] }, res => handle(res), '没有找到相应歌曲');
});

Com.set(matchFunc('/bgm'), send => {
    const num = args[1] ? parseInt(args[1]) : 1;
    fetchBGM(`${URL.BGM}search/subject/${args[0]}`, { token: config.apikey.bangumi }).then(res => {
        if (!res || isObjArr(res.list)) {
            send('未找到相应条目');
            return;
        }

        const data = res.list[num - 1];
        if (!data) {
            send(BOT_RESULT.NUM_ERROR);
            return;
        }

        fetchBGM(`${URL.BGM}v0/subjects/${data.id}`, { token: config.apikey.bangumi }).then(res => {
            if (!Array.isArray(res.tags)) {
                send('未找到相应条目');
                return;
            }

            let tags = '';
            res.tags.forEach((data: { name: string, count: number }) => tags += `、${data.name}`);
            send(
                `原名：${res.name}` +
                `\n中文名：${res.name_cn}` +
                `\n介绍：${res.summary}` +
                `\n标签：${tags.substring(1)}` +
                `\n详情：https://bgm.tv/subject/${data.id}` +
                `\n${SDK.cq_image(res.images.large)}`
            )
        });
    });
});

Com.set('/bgmc', send => {
    fetchBGM(`${URL.BGM}calendar`, { token: config.apikey.bangumi }).then(res => {
        if (!isObjArrP(send, res)) return;

        const day_num = (() => {
            const day = (new Date()).getDay();
            return day === 0 ? 6 : day - 1;
        })();
        const items = res[day_num].items;
        let result = '';
        for (let init = 0; init < 3; init++) {
            const item = items[init];
            result += (`\n原名：${item.name}` +
                `\n中文名：${item.name_cn}` +
                `\n开播时间：${item.air_date}` +
                `\n${SDK.cq_image(item.images.large)}`
            );
        }
        send(`日期：${res[day_num].weekday.ja}~${result}`)
    })
})

Com.set(matchFunc('/star'), send => {
    fetchJH(send, 'starluck', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        let msg = `${res.data.name}今日运势：`;
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
    fetchJH(send, 'fanyi', { msg: args[0] }, res => send(`原文：${args[0]}\n译文：${res.data}`));
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
            `状态：在线\nIP：${res.data.real}\n端口：${res.data.port}` +
            `\n物理地址：${res.data.location}\nMOTD：${res.data.motd}` +
            `\n协议版本：${res.data.agreement}\n游戏版本：${res.data.version}` +
            `\n在线人数：${res.data.online} / ${res.data.max}\n延迟：${res.data.ping}ms` +
            `\n图标：${res.data.icon ? SDK.cq_image(`base64://${res.data.icon.substring(22)}`) : '无'}`
        )
    }, {
        condition: res => typeof res.code === 'number',
        result: `状态：离线\nIP：${args[0]}\n端口：${args[1]}`
    });
});

Com.set(matchFunc('/motdpe'), send => {
    args[1] = args[1] ?? 19132;
    fetchJH(send, 'motdpe', { ip: args[0], port: args[1] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `状态：在线\nIP：${res.data.real}\n端口：${res.data.port}` +
            `\n物理地址：${res.data.location}\nMOTD：${res.data.motd}` +
            `\n游戏模式：${res.data.gamemode}\n协议版本：${res.data.agreement}` +
            `\n游戏版本：${res.data.version}` +
            `\n在线人数：${res.data.online} / ${res.data.max}` +
            `\n延迟：${res.data.delay}ms`
        )
    }, {
        condition: res => typeof res.code === 'number',
        result: `状态：离线\nIP：${args[0]}\n端口：${args[1]}`
    });
});

Com.set(matchFunc('/mcskin'), send => {
    fetchJH(send, 'mcskin', { name: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `玩家：${args[0]}\n皮肤：${SDK.cq_image(res.data.skin)}` +
            `\n披风：${res.data.cape ? SDK.cq_image(res.data.cape) : '无'}` +
            `\n头颅：${res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : '无'}`
        )
    }, '查无此人！');
});

Com.set(matchFunc('/bili'), send => {
    fetchJH(send, 'biligetv', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `BV号：${res.data.bvid}\nAV号：${res.data.aid}` +
            `\n视频标题：${res.data.title}\n视频简介：${res.data.descr}` +
            `\n作者UID：${res.data.owner.uid}\n视频封面：${SDK.cq_image(res.data.pic)}`
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
        `查询内容：${args[0]}\n消耗时间：${Math.floor(res.takeTime)}秒\n记录数量：${res.count}` +
        (res.data.qq ? `\nQQ：${res.data.qq}` : '') +
        (res.data.phone ? `\n手机号：${res.data.phone}` : '') +
        (res.data.location ? `\n运营商：${res.data.location}` : '') +
        (res.data.id ? `\nLOLID：${res.data.id}` : '') +
        (res.data.area ? `\nLOL区域：${res.data.area}` : '')
    )}, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '未查询到相关记录'
    });
});

Com.set(matchFunc('/idcard'), send => {
    fetchJH(send, 'idcard', { msg: args[0] }, res => {
        if (!isObjP(send, res.data) || isNotArr(send, res.data)) return;
        send(
            `身份证号：${args[0]}\n性别：${res.data.gender}\n` +
            `出生日期：${res.data.birthday}\n年龄：${res.data.age}` +
            `\n省份：${res.data.province}\n地址：${res.data.address}` +
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
                `${args[0]}有云黑记录\nUUID：${res.data.uuid}` +
                `\n用户平台：${res.data.plate}\n用户ID：${res.data.idkey}` +
                `\n记录描述：${res.data.descr}\n记录等级：${res.data.level}` +
                `\n记录时间：${res.data.date}\n相关图片：${imgs ? imgs : '无'}`
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
    send(config.apikey.api.day ? SDK.cq_image(`${URL.API}60s?apikey=${config.apikey.api.day}`) : '请先配置APIKEY！');
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
        send(msg + `\n类型：${res.data.type}`);
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
            Authorization: `Bearer ${config.apikey.bot.chatgpt}`,
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
    const BOT = Main.Const._BOT;
    const STAT = BOT.status.stat;
    const info = getPackageInfo();
    const ENV = dealEnv();
    send(
        `BOT信息\nBOTQQ：${BOT.self_id}\n连接时间：${BOT.connect}` +
        `\n接收包数量：${STAT.packet_received}\n发送包数量：${STAT.packet_sent}\n丢失包数量：${STAT.packet_lost}` +
        `\n接收消息数量：${STAT.message_received}\n发送消息数量：${STAT.message_sent}` +
        `\n连接丢失次数：${STAT.lost_times}\n连接断开次数：${STAT.disconnect_times}` +
        `\n框架信息\n当前BOT框架版本：${info.version}\n框架协议：${info.license}` +
        `\n环境信息\nNode版本：${ENV.node}\nTypeScript版本：${ENV.typescript}\nTsNode版本：${ENV.tsnode}` +
        `\n${BOT_RESULT.AUTHOR}`
    )
});

Com.set('/status', send => {
    const cpuData = dealCpu();
    const ramData = dealRam();
    send(
        `服务器运行状态\n系统内核：${os.type()}\n系统平台：${os.platform()}\nCPU架构：${os.arch()}\nCPU型号：` +
        `${cpuData.model}\nCPU频率：${cpuData.speed.toFixed(2)}GHz\nCPU核心数：${cpuData.num}` +
        `\nCPU使用率：${cpuData.rate.toFixed(2)}%\n内存总量：${ramData.total.toFixed(2)}GB\n可用内存：` +
        `${ramData.used.toFixed(2)}GB\n内存使用率：${ramData.rate.toFixed(2)}%\n网卡数量：` +
        `${Object.keys(os.networkInterfaces()).length}\n开机时间：${dealTime()}\n主机名字：${os.hostname()}` +
        `\n系统目录：${os.homedir()}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Com.set(['/about', 'kotori', '关于BOT', '关于bot'], send => {
    const info = getPackageInfo();
    send(
        `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n` +
        `开源地址：https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本：${info.version}` +
        `\n框架协议：${info.license}\n${SDK.cq_image('https://biyuehu.github.io/images/avatar.png')}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Com.set(['/update', '检查更新'], send => {
    const version = getPackageInfo().version;
    fetchJson('https://biyuehu.github.io/kotori-bot/package.json').then(res => {
        send(
            `当前版本：${version}` +
            (res.version === version ? '\n当前为最新版本！' : (
                '\n检测到有更新！' +
                `\n最新版本：${res.version}` +
                '\n请前往Github仓库获取最新版本：https://github.com/biyuehu/kotori-bot'
            ))
        )
    })
});

Com.set(str => (str === '/ban' || stringP(str, '/ban')), (send, data) => {
    if (!data.group_id || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    const time = args[1] ? parseInt(args[1]) : config.component.mange.defaultBanTime;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_ban(data.group_id!, qq, time * 60);
        send(`成功禁言[${qq}]用户[${time}]分钟`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!);
        send('全体禁言成功')
    }
});

Com.set(str => (str === '/unban' || stringP(str, '/unban')), (send, data) => {
    if (!data.group_id || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_ban(data.group_id!, qq, 0);
        send(`成功解除禁言[${qq}]用户`);
    } else {
        Main.Api.set_group_whole_ban(data.group_id!, false);
        send('解除全体禁言成功')
    }
});

Com.set(str => stringP(str, '/kick'), (send, data) => {
    if (!data.group_id || !Main.verifyAcess(data, send)) return;
    let qq: number | null;
    if (args[0] && (qq = SDK.get_at(args[0]) ?? parseInt(args[0]))) {
        Main.Api.set_group_kick(data.group_id!, qq);
        send(`成功踢出[${qq}]用户`);
    }
});

Com.set(str => stringP(str, '/all'), (send, data) => {
    if (!data.group_id || !Main.verifyAcess(data, send)) return;
    if (!args[0]) {
        send('请输入消息内容')
        return;
    }
    send(`${SDK.cq_at('all')} 以下消息来自管理员：\n${args[0]}`);
});

Com.set(str => stringP(str, '/notice'), (send, data) => {
    if (!data.group_id || !Main.verifyAcess(data, send)) return;
    if (!args[0]) {
        send('请输入公告内容')
        return;
    }
    const image = SDK.get_image(args[0]);
    Main.Api._send_group_notice(data.group_id!, `From Admin~\n${args[0]}`, image || undefined)
});

export default Main;