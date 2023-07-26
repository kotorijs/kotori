/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-15 16:41:22
 */
import os from 'os';
import { EventDataType, obj, Event, Api, Const } from 'src/interface';
import { getPackageInfo, stringProcess, stringSplit } from '@/function';
import { dealCpu, dealRam, dealTime, fetchJ, fetchT } from './method';
import config from './config';
import Com, { URL, URL2 } from './menu';

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

let Api: Api, Const: Const, data: EventDataType, target: string;

export default (Event: Event, Api_: Api, Const_: Const) => {
    Api = Api_, Const = Const_;
    const run = (data_: EventDataType) => {
        data = data_;
        target = data.message;
        handler();
    }
    Event.listen("on_group_msg", data => run(data));
    Event.listen("on_private_msg", data => run(data));
}

const send = (msg: string) => {
    if (data.message_type === 'private') {
        Api.send_private_msg(msg, data.user_id)
    } else {
        Api.send_group_msg(msg, <number>data.group_id)
    }
}

const stringP = (str: string, key: string) => {
    key += ' ';
    const result = stringProcess(str, key);
    result && (target = stringSplit(str, key));
    return result;
}

const matchFunc = (key: string): (str: string) => boolean => {
    return (str: string) => stringP(str, key);
}

const runHandlerFunc = (handlerFunc: string | (() => void)) => {
    if (typeof handlerFunc === 'string') {
        send(handlerFunc);
    } else {
        handlerFunc();
    };
}

const handler = () => {
    /* 群聊开关检测 */
    if (data.message_type === 'group' && config.group.state === true) {
        if (!stringProcess(<number>data.group_id, config.group.list)) return;
    }

    const result = Com.get(target);
    if (result) {
        runHandlerFunc(result);
        return;
    }

    for (let [key, handlerFunc] of Com) {
        if ((typeof key === 'function' && key(target)) || (Array.isArray(key) && key.includes(target))) {
            runHandlerFunc(handlerFunc);
        }
    }

}

Com.set(matchFunc('/music'), () => {
    const arr = target.split('*');
    target = arr[0];
    const num = arr[1] ? parseInt(arr[1]) : 1;
    fetchJ('netease', { name: target }).then(res => {
        if (res.code === 500 && res.data) {
            const song = res.data[num - 1];
            if (song) {
                let msg = `歌曲ID：${song.songid}\n歌曲标题：${song.title}\n歌曲作者 :${song.author}`;
                msg += `\n歌曲下载：${song.url}\n歌曲封面：[CQ:image,file=${song.pic}]`;
                send(msg);
                send(`[CQ:music,type=163,id=${song.songid}]`);
            } else send(`序号错误！`);
        } else if (res.code === 502) {
            send('没有找到相应歌曲');
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/star'), () => {
    fetchJ('starluck', { msg: target }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `${(<obj>res.data).name}今日运势：`;
            (<obj>res.data).info.forEach((element: string) => {
                msg += `\n${element}`;
            });
            (<obj>res.data).index.forEach((element: string) => {
                msg += `\n${element}`;
            });
            send(msg);
        } else if (res.code === 501) {
            send('星座错误！');
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/translate'), () => {
    fetchJ('fanyi', { msg: target }).then(res => {
        if (res.data) {
            send(`原文：${target}\n译文：${res.data}`);
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set('/lunar', () => fetchT('lunar').then(res => send(res)));

Com.set('/story', () => {

});

Com.set(matchFunc('/motd'), () => {
    const arr = target.split(':');
    arr[1] = arr[1] ?? 25565;
    fetchJ('motd', { ip: arr[0], port: arr[1] }).then(res => {        
        if (res.code === 500 && res.data) {
            let msg = `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}`;
            msg += `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}`;
            msg += `\n协议版本：${(<obj>res.data).agreement}\n游戏版本：${(<obj>res.data).version}`;
            msg += `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}`;
            msg += `\n延迟：${(<obj>res.data).ping}ms`;
            send(msg + `\n图标：${(<obj>res.data).icon ?
                `[CQ:image,file=base64://${(<obj>res.data).icon.substring(22)}]` : '无'}`);
        } else if (typeof res.code === 'number') {
            send(`状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`);
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/motdpe'), () => {
    const arr = target.split(':');
    arr[1] = arr[1] ?? 19132;
    fetchJ('motdpe', { ip: arr[0], port: arr[1] }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `状态：在线\nIP：${(<obj>res.data).real}\n端口：${(<obj>res.data).port}`;
            msg += `\n物理地址：${(<obj>res.data).location}\nMOTD：${(<obj>res.data).motd}`;
            msg += `\n游戏模式：${(<obj>res.data).gamemode}\n协议版本：${(<obj>res.data).agreement}`;
            msg += `\n游戏版本：${(<obj>res.data).version}`;
            msg += `\n在线人数：${(<obj>res.data).online} / ${(<obj>res.data).max}`;
            send(msg + `\n延迟：${(<obj>res.data).delay}ms`);
        } else if (typeof res.code === 'number') {
            send(`状态：离线\nIP：${arr[0]}\n端口：${arr[1]}`);
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/mcskin'), () => {
    fetchJ('mcskin', { name: target }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `玩家：${target}\n皮肤：[CQ:image,file=${(<obj>res.data).skin}]`;
            msg += `\n披风：${(<obj>res.data).cape ? `[CQ:image,file=${(<obj>res.data).cape}]` : '无'}`;
            msg += `\n头颅：${(<obj>res.data).avatar ?
                `[CQ:image,file=base64://${(<obj>res.data).avatar.substring(22)}]` : '无'}`;
            send(msg);
        } else if (res.code === 502) {
            send('查无此人！');
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/bili'), () => {
    fetchJ('biligetv', { msg: target }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `BV号：${(<obj>res.data).bvid}\nAV号：${(<obj>res.data).aid}`;
            msg += `\n视频标题：${(<obj>res.data).title}\n视频简介：${(<obj>res.data).descr}`;
            msg += `\n作者UID：${(<obj>res.data).owner.uid}\n视频封面：[CQ:image,file=${(<obj>res.data).pic}]`;
            send(msg);
        } else if (res.code === 502) {
            send('未找到该视频');
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/sed'), () => {
    if (target === data.self_id.toString()) {
        send('未查询到相关记录');
        return;
    }
    fetchJ('sed', { msg: target }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `查询内容：${target}\n消耗时间：${Math.floor(res.takeTime)}秒\n记录数量：${res.count}`;
            msg += (<obj>res.data).qq ? `\nQQ：${(<obj>res.data).qq}` : '';
            msg += (<obj>res.data).phone ? `\n手机号：${(<obj>res.data).phone}` : '';
            msg += (<obj>res.data).location ? `\n运营商：${(<obj>res.data).location}` : '';
            msg += (<obj>res.data).id ? `\nLOLID：${(<obj>res.data).id}` : '';
            msg += (<obj>res.data).area ? `\nLOL区域：${(<obj>res.data).area}` : '';
            send(msg)
        } else if (res.code === 501) {
            send('未查询到相关记录');
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

Com.set(matchFunc('/idcard'), () => {
    fetchJ('idcard', { msg: target }).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `身份证号：${target}\n性别：${(<obj>res.data).gender}\n`;
            msg += `出生日期：${(<obj>res.data).birthday}\n年龄：${(<obj>res.data).age}`;
            msg += `\n省份：${(<obj>res.data).province}\n地址：${(<obj>res.data).address}`;
            send(msg + `\n${(<obj>res.data).starsign}`);
        } else if (res.code === 501) {
            send('身份证号错误');
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

Com.set(matchFunc('/hcb'), () => {
    fetchJ('https://hcb.imlolicon.tk/api/v3', { value: target }).then(res => {
        if (res.code === 500 && res.data) {
            if (<boolean>(<obj>res.data).status) {
                let imgs = '';
                if ((<obj>res.data).imgs !== null) {
                    (<string[]>(<obj>res.data).imgs).forEach(element => {
                        imgs += `[CQ:image,file=${element}]`;
                    });
                }
                let msg = `${target}有云黑记录\nUUID：${(<obj>res.data).uuid}`;
                msg += `\n用户平台：${(<obj>res.data).plate}\n用户ID：${(<obj>res.data).idkey}`;
                msg += `\n记录描述：${(<obj>res.data).descr}\n记录等级：${(<obj>res.data).level}`;
                msg += `\n记录时间：${(<obj>res.data).date}\n相关图片：${imgs ? imgs : '无'}`;
                send(msg);
            } else {
                send(`${target}无云黑记录`);
            }
        } else if (res.code === 501) {
            send('参数不能为空');
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

Com.set(matchFunc('/state'), () => {
    fetchT('webtool', { op: 1, url: target }).then(res => send(res));
});

Com.set(matchFunc('/speed'), () => {
    fetchT('webtool', { op: 3, url: target }).then(res => send(res));
});

Com.set((str: string) => str === '/sex' || stringP(str, '/sex '), () => {
    fetchJ(`${URL2}seimg/v2/`, { tag: target }).then(res => {
        if (res.code === 500 && res.data) {
            const dd = res.data[0];
            let tags = '';
            dd.tags.forEach((element: string) => {
                tags += `、${element}`;
            });
            let msg = `PID:${dd.pid}\n标题:${dd.title}\n作者:${dd.author}\n标签:${tags.substring(1)}`;
            send(msg + `\n[CQ:image,file=${dd.url}]`);
        } else if (res.code === 501) {
            send('未找到相应图片');
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

Com.set(matchFunc('/'), () => {
    fetchJ(`${URL2}huimg/`, { tag: target }).then(res => {
        if (res.code === 500 && res.data) {
            const dd = <obj>res.data;
            let tag = '';
            (<string[]>dd.tag).forEach(element => {
                tag += `、${element}`;
            });
            send(`标签:${tag.substring(1)}\n[CQ:image,file=${dd.url}]`);
        } else if (res.code === 501) {
            send('未找到相应图片');
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

/* 随机图片 */
Com.set(matchFunc('/'), () => send(`[CQ:image,file=${URL}sellerimg]`));

Com.set(matchFunc('/'), () => send(`[CQ:image,file=${URL}sedimg]`));

Com.set(matchFunc('/'), () => send(`[CQ:image,file=${URL}bing]`));

Com.set(matchFunc('/'), () => {
    send(config.apikey.day ? `[CQ:image,file=${URL}60s?apikey=${config.apikey.day}]` : '请先配置APIKEY！');
});

Com.set(matchFunc('/'), () => send(`[CQ:image,file=https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg]`));

Com.set(matchFunc('/'), () => send(`[CQ:image,file=https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg]`));

Com.set(matchFunc('/'), () => send(`[CQ:video,file=${URL}sisters]`));

/* 随机语录 */
Com.set(matchFunc('/'), () => {
    fetchJ(`${URL2}hitokoto/v2/`).then(res => {
        if (res.code === 500 && res.data) {
            let msg = `${(<obj>res.data).msg}${(<obj>res.data).from ? `——${(<obj>res.data).from}` : ''}`;
            send(msg + `\n类型：${(<obj>res.data).type}`);
        } else {
            send('接口错误！请联系管理员');
        }
    });
});

Com.set(Object.keys(hitokotoList), () => {
    hitokotoList[target] && fetchT('words', { msg: hitokotoList[target], format: 'text' }).then(res => send(res));
});

/* GPT聊天 */
Com.set(matchFunc('/gpt'), () => {
    fetchJ('', {}).then(res => {
        if (res.code === 500 && res.data) {
            send(``)
        } else if (res.code === 502) {
            send('');
        } else {
            send(target ? '接口错误！请联系管理员' : '参数不能为空');
        }
    });
});

Com.set(matchFunc('/cl'), () => {
    send('该功能维修中');
});

Com.set('/api', () => fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' }).then(res => send(res)));

Com.set('/status', () => {
    const cpuData = dealCpu();
    const ramData = dealRam();
    const BOT = Const._BOT;
    const STAT = BOT.status.stat;
    const info = getPackageInfo();
    let result = `服务器信息：\n系统内核：${os.type()}\n系统平台：${os.platform()}\nCPU架构：${os.arch()}\nCPU型号：`;
    result += `${cpuData.model}\nCPU频率：${cpuData.speed.toFixed(2)}GHz\nCPU核心数：${cpuData.num}`;
    result += `\nCPU使用率：${cpuData.rate.toFixed(2)}%\n内存总量：${ramData.total.toFixed(2)}GB\n可用内存：`;
    result += `${ramData.used.toFixed(2)}GB\n内存使用率：${ramData.rate.toFixed(2)}%\n网卡数量：`;
    result += `${Object.keys(os.networkInterfaces()).length}\n开机时间：${dealTime()}\n主机名字：${os.hostname()}`;
    result += `\n系统目录：${os.homedir()}\nBOT信息：\nBOTQQ：${BOT.self_id}\n连接时间：${BOT.connect}`;
    result += `\n接收包数量：${STAT.packet_received}\n发送包数量：${STAT.packet_sent}\n丢失包数量：${STAT.packet_lost}`;
    result += `\n接收消息数量：${STAT.message_received}\n发送消息数量：${STAT.message_sent}`;
    result += `\n连接丢失次数：${STAT.lost_times}\n连接断开次数：${STAT.disconnect_times}`;
    result += `\n框架信息：\n当前BOT框架版本：${info.version}\n框架协议：${info.license}`;
    send(result + `\n-------ByHimeno-------`);
});

Com.set('/about', () => {
    const info = getPackageInfo();
    let msg = `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n`;
    msg += `开源地址：https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本：${info.version}`;
    msg += `\n框架协议：${info.license}\n[CQ:image,file=https://biyuehu.github.io/images/avatar.png]`;
    send(msg + `\n-------ByHimeno-------`);
});

Com.set((str: string) => str === '/ban' || stringP(str, '/ban'), () => {

});

Com.set((str: string) => str === '/unban' || stringP(str, '/unban'), () => {

});

Com.set(matchFunc('/kick'), () => {

});

Com.set(matchFunc('/all'), () => {

});

Com.set(matchFunc('/notice'), () => {

});
