/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-10 17:29:11
 */
import os from 'os';
import type { EventDataType, Event, Api, Const } from '@/tools';
import { fetchJson, getPackageInfo, isObj, isObjArr } from '@/tools';
import * as M from './method';
import config from './config';
import Com, { BOT_RESULT, URL, CmdInfo, HEADER } from './menu';
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
        this.Event.listen("on_group_msg", data => this.onMsg(data));
        this.Event.listen("on_private_msg", data => this.onMsg(data));
        this.Event.listen("on_group_increase", data => this.onGroupIncrease(data));
        this.Event.listen("on_group_decrease", data => this.onGroupDecrease(data));
    }

    private onMsg = (data: EventDataType) => {
        if (!Main.verifyFrom(data)) return;
        new Content(data);
    }

    private onGroupIncrease = (data: EventDataType) => {
        if (!AUTO.joinGroupWelcome || !Main.verifyFrom(data)) return;
        Main.Api.send_group_msg(`${SDK.cq_at(data.user_id)} ${AUTO.joinGroupWelcomeMsg}`, data.group_id!)
    }

    private onGroupDecrease = (data: EventDataType) => {
        if (!AUTO.exitGroupAddBlacklist || !Main.verifyFrom(data)) return;
        const list = M.loadConfigP(`${data.group_id}\\blackList.json`) as number[];
        list.push(data.user_id);
        M.saveConfigP(`${data.group_id}\\blackList.json`, list);
        Main.Api.send_group_msg(`检测到用户[${data.user_id}]退群已自动添加至当前群黑名单内`, data.group_id!);
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
    public static menu = (keyword: string | string[], menuId: string) => {
        const callback = () => this.menuHandleFunc(menuId);
        this.register(keyword, undefined, undefined, callback);
    }

    public static register = (keyword: string | string[], menuId: string | undefined, description: string | undefined, callback: HandlerFuncType, params?: paramInfo[]) => {
        Com.set(keyword, callback);
        CmdInfo.set(keyword, { params, description, menuId });
    }

    private static menuHandleFunc = (menuId: string) => {
        let handleResult = `${HEADER}`;
        for (let key of CmdInfo) {
            const { 0: cmdKey, 1: value } = key;
            if (value.menuId !== menuId) continue;
            let handleParams = '';
            value.params?.forEach(element => {
                const paramName = element.name ?? 'arg';
                const modifier = element.must === true ? '' : (
                    element.must === false ? '?' : `=${element.must}`
                );
                handleParams += ` [${paramName}${modifier}]`;
            })
            const description = value.description;
            handleResult += `\n${Array.isArray(cmdKey) ? cmdKey[0] : cmdKey}${handleParams}${description ? `: ${description}` : ''}`;
        }
        return handleResult;
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

        if (!params) return true;
        for (let index in params) {
            if (M.args[parseInt(index) + 1]) continue;
            if (params[index].must !== true) {
                params[index].must !== false && (M.args[parseInt(index) + 1] = params[index].must as string);
                continue;
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

Cmd.menu('日常工具', 'dayTool');
Cmd.menu('查询工具', 'queryTool');
Cmd.menu('随机图片', 'randomImg');
Cmd.menu('GPT聊天', 'gpt');
Cmd.menu('其它功能', 'other');
MANGE.enable && Cmd.menu('群管系统', 'groupMange');
Cmd.menu('超管系统', 'superMange');
Cmd.menu('特殊功能', 'special');
Cmd.menu('关于信息', 'aboutInfo');

Cmd.register('/music', '网易云点歌,序号默认为1,填0显示歌曲列表', 'dayTool', async send => {
    const res = await M.fetchJ('netease', { name: M.args[1] });
    if (res.code === RES_CODE.ARGS_ERROR) {
        send('未找到相关歌曲');
        return;
    }
    if (!M.isObjArrP(send, res.data)) return;

    const num = parseInt(M.args[2]);
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
}, [{
    must: true, name: '歌名'
}, {
    must: '1', name: '序号'
}]);

Cmd.register('/bgm', '番组计划,搜索游戏/动漫/角色等', 'dayTool', async send => {
    const num = parseInt(M.args[2]), cache = `bgm${M.args[1]}`;
    const res = M.cacheGet(cache) || await M.fetchBGM(`search/subject/${M.args[1]}`, { token: APIKEY.bangumi });
    M.cacheSet(cache, res);

    if (!res || !isObjArr(res.list)) {
        send('未找到相应条目');
        return;
    }

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

    const res2 = await M.fetchBGM(`v0/subjects/${data.id}`, { token: APIKEY.bangumi });
    if (!Array.isArray(res2.tags)) {
        send('未找到相应条目');
        return;
    }

    let tags = '';
    res2.tags.forEach((data: { name: string, count: number }) => tags += `、${data.name}`);
    send(
        `原名: ${res2.name}` +
        `\n中文名: ${res2.name_cn}` +
        `\n介绍: ${res2.summary}` +
        `\n标签: ${tags.substring(1)}` +
        `\n详情: https://bgm.tv/subject/${data.id}` +
        `\n${SDK.cq_image(res2.images.large)}`
    )
}, [{
    must: true, name: '名字'
}, {
    must: '1', name: '序号'
}]);

Cmd.register('/bgmc', '获取番组计划今日放送', 'dayTool', async send => {
    const res = await M.fetchBGM(`calendar`, { token: APIKEY.bangumi });
    if (!M.isObjArrP(send, res)) return;

    const day_num = (() => {
        const day = (new Date()).getDay();
        return day === 0 ? 6 : day - 1;
    })();
    const items = res[day_num].items;
    let result = '';
    for (let init = 0; init < 3; init++) {
        const item = items[init];
        result += (
            `\n原名: ${item.name}` +
            `\n中文名: ${item.name_cn}` +
            `\n开播时间: ${item.air_date}` +
            `\n${SDK.cq_image(item.images.large)}`
        );
    }
    send(`日期: ${res[day_num].weekday.ja}~${result}`)
});

Cmd.register('/star', '查看今日星座运势', 'dayTool', async send => {
    const res = await M.fetchJ('starluck', { msg: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send('星座错误');
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    let msg = `${res.data.name}今日运势: `;
    res.data.info.forEach((element: string) => {
        msg += `\n${element}`;
    });
    res.data.index.forEach((element: string) => {
        msg += `\n${element}`;
    });
    send(msg);
}, [{
    must: true, name: '星座名'
}]);

Cmd.register('/tran', '中外互译', 'dayTool', async send => {
    const res = await M.fetchJ('fanyi', { msg: M.args[1] });
    send(res.code === RES_CODE.SUCCESS ? `原文: ${M.args[1]}\n译文: ${res.data}` : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: '内容'
}]);

Cmd.register('/lunar', '查看农历', 'dayTool', async send => {
    const res = await M.fetchT('lunar');
    send(res ? res : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('/story', '查看历史上的今天', 'dayTool', async send => {
    const res = await M.fetchJ('storytoday');
    if (res.code !== RES_CODE.SUCCESS || !isObjArr(res.data)) {
        send(BOT_RESULT.SERVER_ERROR);
        return;
    }

    let result = '';
    res.data.forEach(str => result += `\n${str}`);
    send(`历史上的今天${result}`);
});

Cmd.register('/motd', 'MCJE服务器信息查询', 'queryTool', async send => {
    const res = await M.fetchJ('motd', { ip: M.args[1], port: M.args[2] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(`状态: 离线\nIP: ${M.args[1]}\n端口: ${M.args[2]}`);
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `状态: 在线\nIP: ${res.data.real}\n端口: ${res.data.port}` +
        `\n物理地址: ${res.data.location}\nMOTD: ${res.data.motd}` +
        `\n协议版本: ${res.data.agreement}\n游戏版本: ${res.data.version}` +
        `\n在线人数: ${res.data.online} / ${res.data.max}\n延迟: ${res.data.ping}ms` +
        `\n图标: ${res.data.icon ? SDK.cq_image(`base64://${res.data.icon.substring(22)}`) : '无'}`
    );
}, [{
    must: true, name: 'IP'
}, {
    must: '25565', name: '端口'
}]);

Cmd.register('/motdpe', 'MCBE服务器信息查询', 'queryTool', async send => {
    const res = await M.fetchJ('motdpe', { ip: M.args[1], port: M.args[2] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(`状态: 离线\nIP: ${M.args[1]}\n端口: ${M.args[2]}`);
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `状态: 在线\nIP: ${res.data.real}\n端口: ${res.data.port}` +
        `\n物理地址: ${res.data.location}\nMOTD: ${res.data.motd}` +
        `\n游戏模式: ${res.data.gamemode}\n协议版本: ${res.data.agreement}` +
        `\n游戏版本: ${res.data.version}` +
        `\n在线人数: ${res.data.online} / ${res.data.max}` +
        `\n延迟: ${res.data.delay}ms`
    )
}, [{
    must: true, name: 'IP'
}, {
    must: '19132', name: '端口'
}]);

Cmd.register('/mcskin', 'MC正版账号皮肤查询', 'queryTool', async send => {
    const res = await M.fetchJ('mcskin', { name: M.args[1] });
    if (res.code === RES_CODE.ARGS_ERROR) {
        send(`查无此人！`);
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `玩家: ${M.args[1]}\n皮肤: ${SDK.cq_image(res.data.skin)}` +
        `\n披风: ${res.data.cape ? SDK.cq_image(res.data.cape) : '无'}` +
        `\n头颅: ${res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : '无'}`
    )
}, [{
    must: true,
    name: '游戏ID'
}]);

Cmd.register('/bili', 'B站视频信息查询', 'queryTool', async send => {
    const res = await M.fetchJ('biligetv', { msg: M.args[1] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(`未找到该视频`);
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `BV号: ${res.data.bvid}\nAV号: ${res.data.aid}` +
        `\n视频标题: ${res.data.title}\n视频简介: ${res.data.descr}` +
        `\n作者UID: ${res.data.owner.uid}\n视频封面: ${SDK.cq_image(res.data.pic)}`
    )
}, [{
    must: true, name: 'BV号'
}]);

Cmd.register('/sed', '社工信息查询', 'queryTool', async (send, data) => {
    if (M.args[1] === data.self_id.toString()) {
        send('未查询到相关记录');
        return;
    }

    const res = await M.fetchJ('sed', { msg: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send('未查询带相关记录');
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `查询内容: ${M.args[1]}\n消耗时间: ${Math.floor(res.takeTime)}秒\n记录数量: ${res.count}` +
        (res.data.qq ? `\nQQ: ${res.data.qq}` : '') +
        (res.data.phone ? `\n手机号: ${res.data.phone}` : '') +
        (res.data.location ? `\n运营商: ${res.data.location}` : '') +
        (res.data.id ? `\nLOLID: ${res.data.id}` : '') +
        (res.data.area ? `\nLOL区域: ${res.data.area}` : '')
    )
}, [{
    must: true, name: 'QQ/手机号'
}]);

Cmd.register('/idcard', '身份证信息查询', 'queryTool', async send => {
    const res = await M.fetchJ('idcard', { msg: M.args[1] })
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send('身份证错误');
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(
        `身份证号: ${M.args[1]}\n性别: ${res.data.gender}\n` +
        `出生日期: ${res.data.birthday}\n年龄: ${res.data.age}` +
        `\n省份: ${res.data.province}\n地址: ${res.data.address}` +
        `\n${res.data.starsign}`
    )
}, [{
    must: true, name: '身份证号'
}]);

Cmd.register('/hcb', '韦一云黑信息查询', 'queryTool', async send => {
    const res = await M.fetchJ('https://hcb.imlolicon.tk/api/v3', { value: M.args[1] });
    if (res.code !== RES_CODE.SUCCESS || !isObj(res.data) || Array.isArray(res.data)) {
        send(BOT_RESULT.SERVER_ERROR);
        return;
    }

    if (!<boolean>res.data.status) {
        send(`${M.args[1]}无云黑记录`);
        return;
    }

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
}, [{
    must: true, name: 'ID'
}]);


Cmd.register('/state', '网站状态查询', 'queryTool', async send => {
    const res = await M.fetchT('webtool', { op: 1, url: M.args[1] });
    send(res ? res.replace(/<br>/g, '\n') : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: 'URL'
}]);

Cmd.register('/speed', '网站速度测试', 'queryTool', async send => {
    const res = await M.fetchT('webtool', { op: 3, url: M.args[1] });
    send(res ? res.replace(/<br>/g, '\n') : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: 'URL'
}]);

/* 随机图片 */
Cmd.register('/sex', 'Pixiv图片', 'randomImg', async send => {
    send('图片正在来的路上....你先别急');

    const res = await M.fetchJ(`${URL.BLOG}seimg/v2/`, { tag: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send('未找到相应图片')
        return;
    }
    if (!M.isObjArrP(send, res.data)) return;

    const dd = res.data[0];
    let tags = '';
    dd.tags.forEach((element: string) => {
        tags += `、${element}`;
    });
    let msg = `PID:${dd.pid}\n标题:${dd.title}\n作者:${dd.author}\n标签:${tags.substring(1)}\n${SDK.cq_image(dd.url)}`;
    send(msg);
}, [{
    must: false, name: 'TAG'
}]);

Cmd.register('/sexh', 'HuliImg图片', 'randomImg', async send => {
    send('图片正在来的路上....你先别急');
    const res = await M.fetchJ(`${URL.BLOG}huimg/`, { tag: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send('未找到相应图片')
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    const dd = res.data;
    let tag = '';
    (<string[]>dd.tag).forEach(element => {
        tag += `、${element}`;
    });
    send(`标签:${tag.substring(1)}\n${SDK.cq_image(dd.url)}`);
}, [{
    must: false, name: 'TAG'
}]);

Cmd.register('/seller', '卖家秀图片', 'randomImg', send => send(SDK.cq_image(`${URL.API}sellerimg`)));

Cmd.register('/sedimg', '诱惑图', 'randomImg', send => send(SDK.cq_image(`${URL.API}sedimg`)));

Cmd.register('/bing', '必应每日图', 'randomImg', send => send(SDK.cq_image(`${URL.API}bing`)));

Cmd.register('/day', '每日看世界', 'randomImg', send => {
    send(APIKEY.api.day ? SDK.cq_image(`${URL.API}60s?apikey=${APIKEY.api.day}`) : '请先配置APIKEY！');
});
/* 





*/

Cmd.register('/earth', '实时地球', 'randomImg', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')));

Cmd.register('/china', '实时中国', 'randomImg', send => send(SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')));

Cmd.register('/sister', undefined, undefined, send => send(SDK.cq_video(`${URL.API}sisters`)));

Cmd.register('/qrcode', '二维码 生成', 'randomImg', send => {
    const frame = [
        'L', 'M', 'Q', 'H'
    ][parseInt(M.args[2])] || 'H';
    send(SDK.cq_image(`${URL.API}qrcode?text=${M.args[1]}&frame=2&size=200&e=${frame}`));
}, [{
    must: true, name: '内容'
}, {
    must: '3', name: '容错级别,范围0~3'
}]);

/* 随机语录 */
Cmd.register('一言', undefined, undefined, async send => {
    const res = await M.fetchJ(`${URL.BLOG}hitokoto/v2/`, undefined);
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    let msg = `${res.data.msg}${res.data.from ? `——${res.data.from}` : ''}`;
    send(msg + `\n类型: ${res.data.type}`);
});

Cmd.register(Object.keys(hitokotoList), undefined, undefined, async send => {
    hitokotoList[M.args[1] as keyof typeof hitokotoList] && M.fetchT('words', { msg: hitokotoList[M.args[1] as keyof typeof hitokotoList], format: 'text' })
        .then(res => send(res ? res : BOT_RESULT.SERVER_ERROR));
});

/* GPT聊天 */
Cmd.register('/gpt', 'ChatGPTV3.5聊天', 'gpt', async send => {
    const res = await M.fetchJ(URL.GPT, undefined, {
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
    });

    send(
        !res.choices || !res.choices[0] || !res.choices[0].message || !res.choices[0].message.content ? BOT_RESULT.SERVER_ERROR : res.choices[0].message.content
    );
}, [{
    must: true, name: '内容'
}]);

Cmd.register('/cl', 'Claude聊天', 'gpt', send => {
    send('该功能维修中');
    /* 
    
    
    */
}, [{
    must: true, name: '内容'
}]);

Cmd.register('/api', '查看API站点数据', 'spec', async send => {
    const res = await M.fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' });
    send(res ? res : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('/bot', '查看BOT信息与运行状态', 'aboutInfo', send => {
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

Cmd.register('/status', '查看服务器运行状态', 'aboutInfo', send => {
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

Cmd.register(['/about', 'kotori', '关于BOT', '关于bot'], '帮助新兴', 'aboutInfo', send => {
    const info = getPackageInfo();
    send(
        `你说得对，但是KotoriBot是一个go-cqhttp的基于NodeJS+TypeScript的SDK和QQ机器人框架实现\n` +
        `开源地址: https://github.com/biyuehu/kotori-bot\n\n当前BOT框架版本: ${info.version}` +
        `\n框架协议: ${info.license}\n${SDK.cq_image('https://biyuehu.github.io/images/avatar.png')}` +
        `\n${BOT_RESULT.AUTHOR}`
    );
});

Cmd.register(['/update', '检查更新'], '检查更新', 'aboutInfo', async send => {
    const version = getPackageInfo().version;
    const res = await fetchJson('https://biyuehu.github.io/kotori-bot/package.json')
    send(res ?
        `当前版本: ${version}` +
        (res.version === version ? '\n当前为最新版本！' : (
            '\n检测到有更新！' +
            `\n最新版本: ${res.version}` +
            '\n请前往Github仓库获取最新版本: https://github.com/biyuehu/kotori-bot'
        )) : BOT_RESULT.SERVER_ERROR
    );
});

Cmd.register('/ban', '禁言某人', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const qq = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    const time = parseInt(M.args[2]) * 60;
    if (qq) {
        Main.Api.set_group_ban(data.group_id!, qq, time);
        send(`成功禁言[${qq}]用户[${time}]分钟`);
        return;
    }
    Main.Api.set_group_whole_ban(data.group_id!);
    send('全体禁言成功')
}, [{
    must: false, name: 'QQ/At'
}, {
    must: (MANGE.banTime / 60).toString(), name: '分钟'
}]);

Cmd.register('/unban', '解禁某人', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const qq = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    if (qq) {
        Main.Api.set_group_ban(data.group_id!, qq, 0);
        send(`成功解除禁言[${qq}]用户`);
        return;
    }
    Main.Api.set_group_whole_ban(data.group_id!, false);
    send('解除全体禁言成功')
}, [{
    must: false, name: 'QQ/At'
}]);

Cmd.register('/black', '查询/添加/删除群黑名单', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = M.controlParams(`${data.group_id}\\blackList.json`, ['当前群黑名单列表:', '已添加[%target%]至当前群黑名单', '已删除[%target%]从当前群黑名单'])
    send(message);
}, [{
    must: true, name: 'query/add/del'
}, {
    must: false, name: 'QQ/At'
}]);

Cmd.register('/white', '查询/添加/删除群白名单', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const message = M.controlParams(`${data.group_id}\\whiteList.json`, ['当前群白名单列表:', '已添加[%target%]至当前群白名单', '已删除[%target%]从当前群白名单'])
    send(message);
}, [{
    must: true, name: 'query/add/del'
}, {
    must: false, name: 'QQ/At'
}]);

Cmd.register('/kick', '踢出某人', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const qq = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    if (qq) {
        Main.Api.set_group_kick(data.group_id!, qq);
        send(`成功踢出[${qq}]用户`);
        return;
    }
    send(BOT_RESULT.ARGS_ERROR);
}, [{
    must: true, name: 'QQ/At'
}]);

Cmd.register('/all', '发送全体成员消息', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    send(`${SDK.cq_at('all')} 以下消息来自管理员:\n${M.args[1]}`);
}, [{
    must: true, name: '内容'
}]);

Cmd.register('/notice', '发送群公告', 'groupMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || !Main.verifyAcess(data, send)) return;
    const image = SDK.get_image(M.args[1]);
    Main.Api._send_group_notice(data.group_id!, `From Admin~\n${M.args[1]}`, image || undefined)
}, [{
    must: true, name: '内容'
}]);

Cmd.register('/config', '查看配置', 'superMange', (send, data) => {
    if (Main.verifyAcess(data, send) !== 1) return;
});

Cmd.register('/blackg', '查询/添加/删除全局黑名单', 'superMange', (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`blackList.json`, ['全局黑名单列表:', '已添加[%target%]至全局黑名单', '已删除[%target%]从全局黑名单'])
    send(message);
}, [{
    must: true, name: 'query/add/del'
}, {
    must: false, name: 'QQ/At'
}]);

Cmd.register('/whiteg', '查询/添加/删除全局白名单', 'superMange', (send, data) => {
    if (!Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`whiteList.json`, ['全局白名单列表:', '已添加[%target%]至全局白名单', '已删除[%target%]从全局白名单'])
    send(message);
}, [{
    must: true, name: 'query/add/del'
}, {
    must: false, name: 'QQ/At'
}]);

Cmd.register('/manger', '查询/添加/删除群BOT管理员', 'superMange', (send, data) => {
    if (!data.group_id || !Main.verifyEnable(send) || Main.verifyAcess(data, send) !== 1) return;
    const message = M.controlParams(`${data.group_id}\\mangerList.json`, ['当前群管理员列表:', '已添加[%target%]至当前群管理员', '已删除[%target%]从当前群管理员'])
    send(message);
}, [{
    must: true, name: 'query/add/del'
}, {
    must: false, name: 'QQ/At'
}]);

export default Main;