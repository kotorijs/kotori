/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 19:04:49
 */
import os from 'os';
import type { EventDataType, obj, Event, Api, Const, Msg } from '@/tools';
import { getPackageInfo, stringProcess, stringSplit } from '@/tools';
import { con, dealCpu, dealEnv, dealRam, dealTime, fetchBGM, fetchJ, fetchT } from './method';
import config from './config/config';
import Com, { BOT_RESULT, URL } from './menu';
import { HandlerFuncType, Res, dataType } from './interface';
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

/* 公共对象 */
let Api: Api, Const: Const;
class Content {
    // private target: string;
    public constructor(private data: EventDataType) {
        const result = Com.get(this.data.message);
        if (result && typeof result === 'string') {
            this.runHandlerFunc(result);
            return;
        }

        for (let [key, handlerFunc] of Com) {
            if ((typeof key === 'function' && key(this.data.message)) || (Array.isArray(key) && key.includes(this.data.message))) {
                this.runHandlerFunc(handlerFunc);
            }
        }
    }

    private send = (msg: Msg) => {
        if (this.data.message_type === 'private') {
            Api.send_private_msg(msg, this.data.user_id)
        } else {
            Api.send_group_msg(msg, <number>this.data.group_id)
        }
    }

    private runHandlerFunc = (handlerFunc: string | HandlerFuncType) => {
        if (typeof handlerFunc === 'string') {
            this.send(handlerFunc);
        } else {
            handlerFunc(this.data, this.target);
        };
    }
}

/* 插件入口 */
export default (Event: Event, Api_: Api, Const_: Const) => {
    Api = Api_, Const = Const_;
    const run = (data: EventDataType) => {
        if (!verifyGroup(data)) return;
        new Content(data);
    }
    Event.listen("on_group_msg", data => run(data));
    Event.listen("on_private_msg", data => run(data));
    config.component.join.enable && Event.listen("on_group_increase", data => {
        if (!verifyGroup(data)) return;
        Api.send_group_msg(`${SDK.cq_at(data.user_id)} ${config.component.join.message}`, data.group_id!)
    })
}

/* 函数定义 */

const verifyAcess = (data: EventDataType, send: ) => {
    const result = data.user_id === Const.CONFIG.bot.master;
    result || send(BOT_RESULT.NO_ACCESS);
    return result;
}

const verifyGroup = (data: EventDataType) => {
    if (data.message_type === 'group' && config.group.state === true) {
        if (!stringProcess(<number>data.group_id, config.group.list)) return false;
    }
    if (data.user_id == data.self_id) return;
    return true;
}

const stringP = (str: string, key: string): [boolean, string] => {
    key += ' ';
    const result = stringProcess(str, key);
    return [result, result ? stringSplit(str, key) : ''];
}

const matchFunc = (key: string): (str: string) => [boolean, string] => {
    return (str: string) => stringP(str, key);
}

interface ResAfter extends Res {
    code: 500,
    data: dataType
}

const fetchJH = (url: string, params: {} | undefined = undefined, onSuccess: (res: ResAfter) => void, onError?: string | { condition?: RES_CODE | ((res: Res) => boolean), result?: string }) => {
    fetchJ(url, params).then(res => {
        const matchResult = typeof onError === 'object' && onError.condition ? (
            typeof onError.condition === 'number' ? res.code === onError.condition : onError.condition(res)
        ) : res.code === RES_CODE.ARGS_ERROR;
        typeof onError !== 'object' && (onError = { result: onError });

        if (res.code === RES_CODE.SUCCESS && res.data) {
            onSuccess(res as ResAfter)
        } else if (onError.result && matchResult) {
            send(onError.result);
            con.warn(res)
        } else {
            send(
                params ? (target ? BOT_RESULT.SERVER_ERROR : BOT_RESULT.ARGS_EMPTY) : BOT_RESULT.SERVER_ERROR
            );
            con.error(res);
        };
    })
}

/* 应用区 */
Com.set('test', () => send(SDK.sdk_cq_j('image', {
    file: 'https://gw.alicdn.com/tfscom/tuitui/O1CN011GotpkuaCpZ0FZr_!!0-rate.jpg'
})));

Com.set(matchFunc('/music'), (data, send) => {
    this.
    const arr = target.split('*');
    target = arr[0];
    const num = arr[1] ? parseInt(arr[1]) : 1;
    fetchJH('netease', { name: target }, (res: obj) => {
        const song = res.data[num - 1];
        if (!song) {
            send(BOT_RESULT.NUM_ERROR);
            return;
        }
        send(
            `歌曲ID：${song.songid}\n歌曲标题：${song.title}\n歌曲作者 :${song.author}` +
            `\n歌曲下载：${song.url}\n歌曲封面：${SDK.cq_image(song.pic)}`,
            data
        );
        send(SDK.cq_Music('163', song.songid), data);
    }, '没有找到相应歌曲');
});

Com.set(matchFunc('/bgm'), () => {
    if (!target) {
        send(BOT_RESULT.ARGS_EMPTY);
        return;
    }
    const arr = target.split('*');
    target = arr[0];
    const num = arr[1] ? parseInt(arr[1]) : 1;
    fetchBGM(`${URL.BGM}search/subject/${target}`, { token: config.apikey.bangumi }).then((res: { list?: obj[] }) => {
        if (!res || !Array.isArray(res.list)) {
            send('未找到相应条目');
            return;
        }
        const data = res.list[num - 1];
        if (!data) {
            send(BOT_RESULT.NUM_ERROR);
            return;
        }
        fetchBGM(`${URL.BGM}v0/subjects/${data.id}`, { token: config.apikey.bangumi }).then((res: obj) => {
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

Com.set('/bgmc', () => {
    fetchBGM(`${URL.BGM}calendar`, { token: config.apikey.bangumi }).then((res: obj[]) => {
        if (!Array.isArray(res)) {
            send(BOT_RESULT.SERVER_ERROR);
            return;
        }
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

Com.set(matchFunc('/star'), () => {
    fetchJH('starluck', { msg: target }, res => {
        let msg = `${(res.data as obj).name}今日运势：`;
        (res.data as obj).info.forEach((element: string) => {
            msg += `\n${element}`;
        });
        (res.data as obj).index.forEach((element: string) => {
            msg += `\n${element}`;
        });
        send(msg);
    }, {
        condition: RES_CODE.ARGS_EMPTY,
        result: '星座错误！'
    });
});

Com.set(matchFunc('/tran'), () => {
    fetchJH('fanyi', { msg: target }, res => send(`原文：${target}\n译文：${res.data}`));
});

Com.set('/lunar', () => fetchT('lunar').then(res => send(res)));

Com.set('/story', () => {
    fetchJH('storytoday', undefined, res => {
        let result = '';
        (<string[]>res.data).forEach(str => result += '\n' + str);
        send(`历史上的今天` + result);
    }, {
        condition: RES_CODE.ARGS_EMPTY
    });
});

Com.set(matchFunc('/motd'), () => {
    const arr = target.split(':');
    arr[1] = arr[1] ?? 25565;
    fetchJH('motd', { ip: arr[0], port: arr[1] }, res => send(
        `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}` +
        `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}` +
        `\n协议版本：${(<obj>res.data).agreement}\n游戏版本：${(<obj>res.data).version}` +
        `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}\n延迟：${(<obj>res.data).ping}ms` +
        `\n图标：${(<obj>res.data).icon ? SDK.cq_image(`base64://${(<obj>res.data).icon.substring(22)}`) : '无'}`
    ), {
        condition: res => typeof res.code === 'number',
        result: `状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`
    });
});

Com.set(matchFunc('/motdpe'), () => {
    const arr = target.split(':');
    arr[1] = arr[1] ?? 19132;
    fetchJH('motdpe', { ip: arr[0], port: arr[1] }, res => send(
        `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}` +
        `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}` +
        `\n游戏模式：${(<obj>res.data).gamemode}\n协议版本：${(<obj>res.data).agreement}` +
        `\n游戏版本：${(<obj>res.data).version}` +
        `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}` +
        `\n延迟：${(<obj>res.data).delay}ms`
    ), {
        condition: res => typeof res.code === 'number',
        result: `状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`
    });
});

Com.set(matchFunc('/mcskin'), () => {
    fetchJH('mcskin', { name: target }, res => send(
        `玩家：${target}\n皮肤：${SDK.cq_image((<obj>res.data).skin)}` +
        `\n披风：${(<obj>res.data).cape ? SDK.cq_image((<obj>res.data).cape) : '无'}` +
        `\n头颅：${(<obj>res.data).avatar ? SDK.cq_image(`base64://${(<obj>res.data).avatar.substring(22)}`) : '无'}`
    ), '查无此人！');
});

Com.set(matchFunc('/bili'), () => {
    fetchJH('biligetv', { msg: target }, res => send(
        `BV号：${(<obj>res.data).bvid}\nAV号：${(<obj>res.data).aid}` +
        `\n视频标题：${(<obj>res.data).title}\n视频简介：${(<obj>res.data).descr}` +
        `\n作者UID：${(<obj>res.data).owner.uid}\n视频封面：${SDK.cq_image((<obj>res.data).pic)}`
    ), '未找到该视频');
});

Com.set(matchFunc('/sed'), () => {
    if (target === data.self_id.toString()) {
        send('未查询到相关记录');
        return;
    }
    fetchJH('sed', { msg: target }, res => send(
        `查询内容：${target}\n消耗时间：${Math.floor(res.takeTime)}秒\n记录数量：${res.count}` +
        ((res.data as obj).qq ? `\nQQ：${(res.data as obj).qq}` : '') +
        ((res.data as obj).phone ? `\n手机号：${(res.data as obj).phone}` : '') +
        ((res.data as obj).location ? `\n运营商：${(res.data as obj).location}` : '') +
        ((res.data as obj).id ? `\nLOLID：${(res.data as obj).id}` : '') +
        ((res.data as obj).area ? `\nLOL区域：${(res.data as obj).area}` : '')
    ), {
        condition: RES_CODE.ARGS_EMPTY,
        result: '未查询到相关记录'
    });
});

Com.set(matchFunc('/idcard'), () => {
    fetchJH('idcard', { msg: target }, res => send(
        `身份证号：${target}\n性别：${(<obj>res.data).gender}\n` +
        `出生日期：${(<obj>res.data).birthday}\n年龄：${(<obj>res.data).age}` +
        `\n省份：${(<obj>res.data).province}\n地址：${(<obj>res.data).address}` +
        `\n${(<obj>res.data).starsign}`
    ), {
        condition: RES_CODE.ARGS_EMPTY,
        result: '身份证号错误'
    });
});

Com.set(matchFunc('/hcb'), () => {
    fetchJH('https://hcb.imlolicon.tk/api/v3', { value: target }, res => {
        if (<boolean>(<obj>res.data).status) {
            let imgs = '';
            if ((<obj>res.data).imgs !== null) {
                (<string[]>(<obj>res.data).imgs).forEach(element => {
                    imgs += SDK.cq_image(element);
                });
            }
            send(
                `${target}有云黑记录\nUUID：${(<obj>res.data).uuid}` +
                `\n用户平台：${(<obj>res.data).plate}\n用户ID：${(<obj>res.data).idkey}` +
                `\n记录描述：${(<obj>res.data).descr}\n记录等级：${(<obj>res.data).level}` +
                `\n记录时间：${(<obj>res.data).date}\n相关图片：${imgs ? imgs : '无'}`
            );
        } else {
            send(`${target}无云黑记录`);
        }
    });
});

Com.set(matchFunc('/state'), () => {
    fetchT('webtool', { op: 1, url: target }).then(res => send(res.replace(/<br>/g, '\n')));
});

Com.set(matchFunc('/speed'), () => {
    fetchT('webtool', { op: 3, url: target }).then(res => send(res.replace(/<br>/g, '\n')));
});

Com.set((str: string) => str === '/sex' || stringP(str, '/sex'), () => {
    send('图片正在来的路上....你先别急');

    fetchJH(`${URL.BLOG}seimg/v2/`, { tag: target }, (res: obj) => {
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

Com.set((str: string) => str === '/sexh' || stringP(str, '/sexh'), () => {
    send('图片正在来的路上....你先别急');
    fetchJH(`${URL.BLOG}huimg/`, { tag: target }, res => {
        const dd = <obj>res.data;
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
Com.set('/seller', () => send(SDK.cq_image(`${URL.API}sellerimg`)));

Com.set('/sedimg', () => send(SDK.cq_image(`${URL.API}sedimg`)));

Com.set('/bing', () => send(SDK.cq_image(`${URL.API}bing`)));

Com.set('/day', () => {
    send(config.apikey.api.day ? SDK.cq_image(`${URL.API}60s?apikey=${config.apikey.api.day}`) : '请先配置APIKEY！');
});

Com.set('/earth', () => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')));

Com.set('/china', () => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')));

Com.set('/sister', () => send(SDK.cq_video(`${URL.API}sisters`)));

Com.set(matchFunc('/qrcode'), () => send(
    target ? SDK.cq_image(`${URL.API}qrcode?text=${target}&frame=2&size=200&e=L`) : BOT_RESULT.ARGS_EMPTY
));

/* 随机语录 */
Com.set('一言', () => {
    fetchJH(`${URL.BLOG}hitokoto/v2/`, undefined, res => {
        let msg = `${(<obj>res.data).msg}${(<obj>res.data).from ? `——${(<obj>res.data).from}` : ''}`;
        send(msg + `\n类型：${(<obj>res.data).type}`);
    });
});

Com.set(Object.keys(hitokotoList), () => {
    hitokotoList[target as keyof typeof hitokotoList] && fetchT('words', { msg: hitokotoList[target as keyof typeof hitokotoList], format: 'text' }).then(res => send(res));
});

/* GPT聊天 */
Com.set(matchFunc('/gpt'), () => {
    target ? fetchJ(URL.GPT, undefined, {
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
                    content: target
                }
            ]
        }),
    }).then(res => (con.log(res), send(res.choices[0].message.content))) : send(BOT_RESULT.ARGS_EMPTY);
});

Com.set(matchFunc('/cl'), () => {
    send('该功能维修中');
});

Com.set('/api', () => fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' }).then(res => send(res)));

Com.set('/bot', () => {
    const BOT = Const._BOT;
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

Com.set('/status', () => {
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

Com.set(['/about', 'kotori', '关于BOT', '关于bot'], () => {
    const info = getPackageInfo();
    send(
        `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n` +
        `开源地址：https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本：${info.version}` +
        `\n框架协议：${info.license}\n${SDK.cq_image('https://biyuehu.github.io/images/avatar.png')}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Com.set(str => !!data.group_id && (str === '/ban' || stringP(str, '/ban')) && verifyAcess(), () => {
    let qq: number | null;
    const arr = target.split('*');
    const time = arr[1] ? parseInt(arr[1]) : config.component.mange.defaultBanTime;
    if (arr[0] && (qq = SDK.get_at(arr[0]))) {
        Api.set_group_ban(data.group_id!, qq, time * 60);
        send(`成功禁言[${qq}]用户[${time}]分钟`);
    } else {
        Api.set_group_whole_ban(data.group_id!);
        send('全体禁言成功')
    }
});

Com.set(str => !!data.group_id && (str === '/unban' || stringP(str, '/unban')) && verifyAcess(), () => {
    let qq: number | null;
    if (target && (qq = SDK.get_at(target))) {
        Api.set_group_ban(data.group_id!, qq, 0);
        send(`成功解除禁言[${qq}]用户`);
    } else {
        Api.set_group_whole_ban(data.group_id!, false);
        send('解除全体禁言成功')
    }
});

Com.set(str => !!data.group_id && stringP(str, '/kick') && verifyAcess(), () => {
    let qq: number | null;
    const arr = target.split('*');
    if (arr[0] && (qq = SDK.get_at(arr[0]))) {
        Api.set_group_kick(data.group_id!, qq);
        send(`成功踢出[${qq}]用户`);
    }
});

Com.set(str => !!data.group_id && stringP(str, '/all') && verifyAcess(), () => {
    if (!target) {
        send('请输入消息内容')
        return;
    }
    send(`${SDK.cq_at('all')} 以下消息来自管理员：\n${target}`);
});

Com.set(str => !!data.group_id && stringP(str, '/notice') && verifyAcess(), () => {
    if (!target) {
        send('请输入公告内容')
        return;
    }
    const image = SDK.get_image(target);
    Api._send_group_notice(data.group_id!, `From Admin~\n${target}`, image || undefined)
});
