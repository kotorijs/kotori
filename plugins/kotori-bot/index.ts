/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-12 20:30:56
 */
import os from 'os';
import type { EventDataType, Event, Api, Const, PackageInfo } from '@/tools';
import { fetchJson, getPackageInfo, isObj, isObjArr } from '@/tools';
import * as M from './method';
import config from './config';
import Com, { URL, CmdInfo } from './menu';
import { ACCESS, HandlerFuncType, RES_CODE, Send, customMenu, mapIndex, paramInfo, scopeType } from './interface';
import SDK from '@/utils/class.sdk';
import lang, { BOT_RESULT } from './lang/zh_cn';

const { apikey: CAPIKEY, group: CGROUP, component: CCOM } = config;
const { mange: CMANGE, format: CFORMAT } = CCOM;
const { cmd: LCMD, menu: LMENU, auto: LAUTO, com: LCOM } = lang;

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
        if (!CMANGE.joinGroupWelcome || !Main.verifyFrom(data)) return;
        Main.Api.send_group_msg(M.temp(LAUTO.joinGroupWelcome, {
            at: SDK.cq_at(data.user_id)
        }), data.group_id!)
    }

    private onGroupDecrease = (data: EventDataType) => {
        if (!CMANGE.exitGroupAddBlack || !Main.verifyFrom(data)) return;
        const list = M.loadConfigP(`${data.group_id}\\blackList.json`) as number[];
        list.push(data.user_id);
        M.saveConfigP(`${data.group_id}\\blackList.json`, list);
        Main.Api.send_group_msg(M.temp(LAUTO.exitGroupAddBlack, {
            target: data.user_id
        }), data.group_id!);
    }

    public static Api: Api;
    public static Const: Const;

    public static verifyEnable = (send: Send) => {
        const result = CMANGE.enable;
        result || send(BOT_RESULT.DISABLE);
        return result;
    }

    public static verifyFrom = (data: EventDataType) => {
        if (data.message_type === 'group' && CGROUP.enable === true) {
            if (!CGROUP.list.includes(data.group_id!)) return false;
        }
        if (data.user_id == data.self_id) return false;
        return true;
    }

    public static verifyAccess = (data: EventDataType) => {
        if (data.user_id === Main.Const.CONFIG.bot.master) return ACCESS.ADMIN;
        const mangerList = M.loadConfigP(`${data.group_id}\\mangerList.json`) as number[];
        return mangerList.includes(data.user_id) ? ACCESS.MANGER : ACCESS.NORMAL;
    }
}

class Content {
    public constructor(private data: EventDataType) {
        if (this.data.message_type === 'group' && CMANGE.enable) this.runOtherFunc();
        M.setArgs(this.data.message.split(' '));
        const result = Com.get(M.args[0]);
        if (result) {
            this.runHandlerFunc(result, M.args[0]);
            return;
        }

        for (let [key, handlerFunc] of Com) {
            if (typeof key === 'string') return;
            // if (typeof key === 'function' && !key(this.data.message)) return;
            if (Array.isArray(key) && !key.includes(this.data.message)) continue;
            this.runHandlerFunc(handlerFunc, key);
            return;
        }
    }

    private send: Send = (content, params = {}) => {
        typeof content === 'string' && (content = M.temp(content, params));
        if (this.data.message_type === 'private') {
            Main.Api.send_private_msg(content, this.data.user_id);
        } else {
            Main.Api.send_group_msg(content, this.data.group_id!);
            Main.Api.send_group_msg(SDK.cq_poke(this.data.user_id), this.data.group_id!);
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

    private checkScope = (scope: scopeType) => {
        if (scope === 'all' || scope === this.data.message_type) return true;
        this.send(BOT_RESULT.MESSAGE_TYPE);
        return false;
    }

    private checkAccess = (access: ACCESS) => {
        const result = Main.verifyAccess(this.data) >= access
        result || this.send(BOT_RESULT.NO_ACCESS);
        return result;
    }

    private runHandlerFunc = (handlerFunc: string | HandlerFuncType, key: mapIndex) => {
        const cmdInfo = CmdInfo.get(key);
        if (!cmdInfo) return;
        if (!this.checkScope(cmdInfo.scope)) return;
        if (!this.checkAccess(cmdInfo.access)) return;
        if (!this.checkParams(key)) return;

        if (typeof handlerFunc === 'string') {
            this.send(handlerFunc);
            return;
        }

        const result = handlerFunc(this.send, this.data);
        if (typeof result === 'string') this.send(result);
    }

    private runOtherFunc = () => {
        if (Main.verifyAccess(this.data) >= ACCESS.MANGER) return;
        this.blackList();
        const user = this.data.user_id;
        if ((M.loadConfigP(`whiteList.json`) as number[]).includes(user) || (M.loadConfigP(`${this.data.group_id}\\whiteList.json`) as number[]).includes(user)) return;
        this.banword();
        this.msgTimes();
    }

    private blackList = () => {
        const user = this.data.user_id;
        const result = (M.loadConfigP(`blackList.json`) as number[]).includes(user);
        if (!result && !(M.loadConfigP(`${this.data.group_id}\\blackList.json`) as number[]).includes(user)) return true;
        Main.Api.send_group_msg(M.temp(LAUTO.existsOnBlack.info, {
            target: this.data.user_id,
            type: result ? LAUTO.existsOnBlack.type.global : LAUTO.existsOnBlack.type.local
        }), this.data.group_id!);
        return false;
    }

    private banword = () => {
        const banwordList = M.loadConfigP(`banword.json`) as string[];
        for (let content of banwordList) {
            if (!this.data.message.includes(content)) continue;
            Main.Api.send_group_msg(M.temp(LAUTO.bacnWord, {
                at: SDK.cq_at(this.data.user_id), content
            }), this.data.group_id!);
            Main.Api.set_group_ban(this.data.group_id!, this.data.user_id, CMANGE.banwordBanTime);
            Main.Api.delete_msg(this.data.message_id);
        }
    }

    private msgTimes = () => {
        const user = this.data.group_id! + this.data.user_id;
        if (!M.CACHE_MSG_TIMES[user] || M.CACHE_MSG_TIMES[user].time + (CMANGE.repeatRule.cycleTime * 1000) < new Date().getTime()) {
            M.CACHE_MSG_TIMES[user] = {
                time: new Date().getTime(),
                times: 1
            }
            return;
        }
        if (M.CACHE_MSG_TIMES[user].times > CMANGE.repeatRule.maxTimes) {
            Main.Api.set_group_ban(this.data.group_id!, this.data.user_id, CMANGE.repeatBanTime);
            Main.Api.send_group_msg(M.temp(LAUTO.msgTimes, {
                at: SDK.cq_at(this.data.user_id)
            }), this.data.group_id!);
            return;
        }
        M.CACHE_MSG_TIMES[user].times++;
    }
}

export class Cmd {
    private static initialize = () => {
        this.isInitialize = true;
        CCOM.mainMenu && Cmd.register(LMENU.mainMenu.cmd, undefined, undefined, 'all', ACCESS.NORMAL, LMENU.mainMenu.content);
        for (let key of Object.keys(LMENU.customMenu)) {
            const menu = (LMENU.customMenu as customMenu)[key];
            if (!menu.cmd || !menu.content) continue;
            this.register(menu.cmd, undefined, undefined, menu.scope ?? 'all', menu.access ?? ACCESS.NORMAL, menu.content);
        }
    }

    public static menu = (keyword: string | string[], menuId: string, scope: scopeType = 'all', access: ACCESS = ACCESS.NORMAL) => {
        const callback = () => this.menuHandleFunc(menuId);
        this.register(keyword, undefined, undefined, scope, access, callback);
    }

    public static register = (keyword: string | string[], description: string | undefined, menuId: string | undefined, scope: scopeType, access: ACCESS, callback: HandlerFuncType | string, params?: paramInfo[]) => {
        this.isInitialize || this.initialize();
        Com.set(keyword, callback);
        CmdInfo.set(keyword, { menuId, description, scope, access, params });
    }

    private static isInitialize: boolean = false;

    private static menuHandleFunc = (menuId: string) => {
        let list = '';
        for (let key of CmdInfo) {
            const { 0: cmdKey, 1: value } = key;

            if (value.menuId !== menuId) continue;
            let handleParams = '';
            value.params?.forEach(element => {
                const paramName = element.name ?? LMENU.sonMenu.paramNameDefault;
                const modifier = element.must === true ? '' : (
                    element.must === false ? LMENU.sonMenu.modifierOptional : M.temp(LMENU.sonMenu.modifierDefault, {
                        content: element.must
                    })
                );
                handleParams += M.temp(LMENU.sonMenu.param, {
                    param_name: paramName, modifier
                });
            })
            const descr = value.description ? M.temp(LMENU.sonMenu.descr, {
                content: value.description
            }) : '';
            const scope = value.scope === 'all' ? '' : (
                value.scope === 'group' ? LMENU.sonMenu.scopeGroup : LMENU.sonMenu.scopePrivate
            );
            list += M.temp(LMENU.sonMenu.list, {
                name: Array.isArray(cmdKey) ? cmdKey[0] : cmdKey,
                param: handleParams,
                descr,
                scope
            });
        }
        list = M.temp(LMENU.sonMenu.info, {
            list
        });
        return list;
    }
}

Cmd.menu('日常工具', 'dayTool');
Cmd.menu('查询工具', 'queryTool');
Cmd.menu('随机图片', 'randomImg');
Cmd.menu('GPT聊天', 'gpt');
Cmd.menu('其它功能', 'other');
CMANGE.enable && Cmd.menu('群管系统', 'groupMange', 'group');
Cmd.menu('超管系统', 'superMange', 'all');
Cmd.menu('特殊功能', 'special');
Cmd.menu('关于信息', 'aboutInfo');

Cmd.register(LCMD.music.cmd, LCMD.music.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('netease', { name: M.args[1] });
    if (res.code === RES_CODE.ARGS_ERROR) {
        send(LCOM.music.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjArrP(send, res.data)) return;

    const num = parseInt(M.args[2]);
    if (num == 0) {
        let list = '';
        for (let init = 0; init < (res.data.length > CFORMAT.maxListNums ? CFORMAT.maxListNums : res.data.length); init++) {
            const song = res.data[init];
            list += M.temp(LCOM.music.list, {
                num: init + 1, title: song.title, author: song.author
            });
        }
        send(LCOM.music.listInfo, {
            list
        });
        return;
    }

    const song = res.data[num - 1];
    if (!song) {
        send(BOT_RESULT.NUM_ERROR);
        return;
    }

    send(LCOM.music.info, {
        ...song, image: SDK.cq_image(song.pic)
    });
    send(SDK.cq_Music('163', song.songid));
}, [{
    must: true, name: LCMD.music.args[0]
}, {
    must: '1', name: LCMD.music.args[0]
}]);

Cmd.register(LCMD.bgm.cmd, LCMD.bgm.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const num = parseInt(M.args[2]), cache = `bgm${M.args[1]}`;
    const res = M.cacheGet(cache) || await M.fetchBGM(`search/subject/${M.args[1]}`, { token: CAPIKEY.bangumi });
    M.cacheSet(cache, res);

    if (!res || !isObjArr(res.list)) {
        send(LCOM.bgm.fail, {
            input: M.args[1]
        });
        return;
    }

    if (num == 0) {
        let list = '';
        for (let init = 0; init < (res.list.length > CFORMAT.maxListNums ? CFORMAT.maxListNums : res.list.length); init++) {
            const data = res.list[init];
            list += M.temp(LCOM.bgm.list, {
                ...data, num: init + 1
            });
        }
        send(LCOM.bgm.listInfo, {
            list
        });
        return;
    }

    const data = res.list[num - 1];
    if (!data) {
        send(BOT_RESULT.NUM_ERROR);
        return;
    }

    const res2 = await M.fetchBGM(`v0/subjects/${data.id}`, { token: CAPIKEY.bangumi });
    if (!Array.isArray(res2.tags)) {
        send(LCOM.bgm.fail);
        return;
    }

    let tags = '';
    res2.tags.forEach((data: { name: string, count: number }) => tags += `、${data.name}`);
    send(LCOM.bgm.info, {
        ...res2, tags: tags.substring(1), url: `https://bgm.tv/subject/${data.id}`, image: SDK.cq_image(res2.images.large)
    });
}, [{
    must: true, name: LCMD.bgm.args[0]
}, {
    must: '1', name: LCMD.bgm.args[0]
}]);

Cmd.register(LCMD.bgmc.cmd, LCMD.bgmc.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchBGM(`calendar`, { token: CAPIKEY.bangumi });
    if (!M.isObjArrP(send, res)) return;

    const day_num = (() => {
        const day = (new Date()).getDay();
        return day === 0 ? 6 : day - 1;
    })();
    const items = res[day_num].items;
    let list = '';
    for (let init = 0; init < 3; init++) {
        const item = items[init];
        list += M.temp(LCOM.bgmc.list, {
            ...item, image: SDK.cq_image(item.images.large)
        });
    }
    send(LCOM.bgmc.info, {
        weekday: res[day_num].weekday.ja, list
    });
});

Cmd.register(LCMD.star.cmd, LCMD.star.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('starluck', { msg: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send(LCOM.star.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    let list = '';
    res.data.info.forEach((content: string) => {
        list += M.temp(LCOM.star.list, {
            content
        });
    });
    res.data.index.forEach((content: string) => {
        list += M.temp(LCOM.star.list, {
            content
        });
    });
    send(LCOM.star.info, {
        input: res.data.name, list
    });
}, [{
    must: true, name: LCMD.star.args[0]
}]);

Cmd.register(LCMD.tran.cmd, LCMD.tran.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('fanyi', { msg: M.args[1] });
    send(res.code === RES_CODE.SUCCESS && typeof res.data === 'string' ? M.temp(LCOM.tran, {
        input: M.args[1], content: res.data
    }) : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: LCMD.tran.args[0]
}]);

Cmd.register(LCMD.lunar.cmd, LCMD.lunar.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchT('lunar');
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register(LCMD.story.cmd, LCMD.story.descr, 'dayTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('storytoday');
    if (res.code !== RES_CODE.SUCCESS || !Array.isArray(res.data)) {
        send(BOT_RESULT.SERVER_ERROR);
        return;
    }

    let list = '';
    (res.data as string[]).forEach(content => list += M.temp(LCOM.story.list, {
        content
    }));
    send(LCOM.story.info, {
        list
    });
});

Cmd.register(LCMD.motd.cmd, LCMD.motd.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('motd', { ip: M.args[1], port: M.args[2] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(LCOM.motd.fail, {
            ip: M.args[1], port: M.args[2]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.motd.info, {
        ...res.data, image: res.data.icon ? SDK.cq_image(`base64://${res.data.icon.substring(22)}`) : BOT_RESULT.EMPTY
    });
}, [{
    must: true, name: LCMD.motd.args[0]
}, {
    must: '25565', name: LCMD.motd.args[1]
}]);

Cmd.register(LCMD.motdbe.cmd, LCMD.motdbe.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('motdpe', { ip: M.args[1], port: M.args[2] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(LCOM.motdbe.fail, {
            ip: M.args[1], port: M.args[2]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.motdbe.info, {
        ...res.data
    });
}, [{
    must: true, name: LCMD.motdbe.args[0]
}, {
    must: '19132', name: LCMD.motdbe.args[1]
}]);

Cmd.register(LCMD.mcskin.cmd, LCMD.mcskin.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('mcskin', { name: M.args[1] });
    if (res.code === RES_CODE.ARGS_ERROR) {
        send(LCOM.mcskin.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.mcskin.info, {
        name: M.args[1],
        skin: SDK.cq_image(res.data.skin),
        cape: res.data.cape ? SDK.cq_image(res.data.cape) : BOT_RESULT.EMPTY,
        avatar: res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : BOT_RESULT.EMPTY
    });
}, [{
    must: true,
    name: LCMD.mcskin.args[0]
}]);

Cmd.register(LCMD.bili.cmd, LCMD.bili.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('biligetv', { msg: M.args[1] });
    if (res.code !== RES_CODE.SUCCESS && typeof res.code === 'number') {
        send(LCOM.bili.fail);
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.bili.info, {
        ...res.data, owner: res.data.owner.uid, image: SDK.cq_image(res.data.pic)
    });
}, [{
    must: true, name: LCMD.bili.args[0]
}]);

Cmd.register(LCMD.sed.cmd, LCMD.sed.descr, 'queryTool', 'all', ACCESS.NORMAL, async (send, data) => {
    if (M.args[1] === data.self_id.toString()) {
        send(LCOM.sed.fail, {
            input: M.args[1]
        });
        return;
    }

    const res = await M.fetchJ('sed', { msg: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send(LCOM.sed.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.sed.info, {
        input: M.args[1], time: Math.floor(res.takeTime), count: res.count, list: (
            (res.data.qq ? M.temp(LCOM.sed.list, {
                key: LCOM.sed.key.qq, content: res.data.data.qq
            }) : '') +
            (res.data.phone ? M.temp(LCOM.sed.list, {
                key: LCOM.sed.key.phone, content: res.data.data.phone
            }) : '') +
            (res.data.location ? M.temp(LCOM.sed.list, {
                key: LCOM.sed.key.location, content: res.data.data.location
            }) : '') +
            (res.data.id ? M.temp(LCOM.sed.list, {
                key: LCOM.sed.key.id, content: res.data.data.id
            }) : '') +
            (res.data.area ? M.temp(LCOM.sed.list, {
                key: LCOM.sed.key.area, content: res.data.data.area
            }) : '')
        )
    });
}, [{
    must: true, name: LCMD.sed.args[0]
}]);

Cmd.register(LCMD.idcard.cmd, LCMD.idcard.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('idcard', { msg: M.args[1] })
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send(LCOM.idcard.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.idcard.info, {
        input: M.args[1], ...res.data
    });
}, [{
    must: true, name: LCMD.idcard.args[0]
}]);

Cmd.register(LCMD.hcb.cmd, LCMD.hcb.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ('https://hcb.imlolicon.tk/api/v3', { value: M.args[1] });
    if (res.code !== RES_CODE.SUCCESS || !isObj(res.data) || Array.isArray(res.data)) {
        send(BOT_RESULT.SERVER_ERROR);
        return;
    }

    if (!<boolean>res.data.status) {
        send(LCOM.hcb.fail, {
            input: M.args[1]
        });
        return;
    }

    let imgs = '';
    if (res.data.imgs !== null) {
        (<string[]>res.data.imgs).forEach(element => {
            imgs += SDK.cq_image(element);
        });
    }
    send(LCOM.hcb.info, {
        input: M.args[1], ...res.data, images: imgs ? imgs : BOT_RESULT.EMPTY
    });
}, [{
    must: true, name: LCMD.hcb.args[0]
}]);


Cmd.register(LCMD.state.cmd, LCMD.state.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchT('webtool', { op: 1, url: M.args[1] });
    send(res ? M.temp(LCOM.state, {
        content: res.replace(/<br>/g, '\n')
    }) : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: LCMD.state.args[0]
}]);

Cmd.register(LCMD.speed.cmd, LCMD.speed.descr, 'queryTool', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchT('webtool', { op: 3, url: M.args[1] });
    send(res ? M.temp(LCOM.status, {
        content: res.replace(/<br>/g, '\n')
    }) : BOT_RESULT.SERVER_ERROR);
}, [{
    must: true, name: LCMD.speed.args[0]
}]);

/* 随机图片 */
Cmd.register(LCMD.sex.cmd, LCMD.sex.descr, 'randomImg', 'all', ACCESS.NORMAL, async send => {
    send(LCOM.sex.tips);

    const res = await M.fetchJ(`${URL.BLOG}seimg/v2/`, { tag: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send(LCOM.sex.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjArrP(send, res.data)) return;

    const dd = res.data[0];
    let tags = '';
    dd.tags.forEach((element: string) => {
        tags += `、${element}`;
    });
    send(LCOM.sex.info, {
        ...dd, tags: tags.substring(1), image: SDK.cq_image(dd.url)
    });
}, [{
    must: false, name: LCMD.sex.args[0]
}]);

Cmd.register(LCMD.sexh.cmd, LCMD.sexh.descr, 'randomImg', 'all', ACCESS.NORMAL, async send => {
    send(LCOM.sexh.tips);
    const res = await M.fetchJ(`${URL.BLOG}huimg/`, { tag: M.args[1] });
    if (res.code === RES_CODE.ARGS_EMPTY) {
        send(LCOM.sexh.fail, {
            input: M.args[1]
        });
        return;
    }
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    const dd = res.data;
    let tags = '';
    (<string[]>dd.tag).forEach(element => {
        tags += `、${element}`;
    });
    send(LCOM.sexh.info, {
        tags: tags.substring(1), image: SDK.cq_image(dd.url)
    });
}, [{
    must: false, name: LCMD.sexh.args[0]
}]);

Cmd.register(LCMD.seller.cmd, LCMD.seller.descr, 'randomImg', 'all', ACCESS.NORMAL, () => M.temp(LCOM.seller, {
    image: SDK.cq_image(`${URL.API}sellerimg`)
}));

Cmd.register(LCMD.sedimg.cmd, LCMD.sedimg.descr, 'randomImg', 'all', ACCESS.NORMAL, () => M.temp(LCOM.sedimg, {
    image: SDK.cq_image(`${URL.API}sedimg`)
}));

Cmd.register(LCMD.bing.cmd, LCMD.bing.descr, 'randomImg', 'all', ACCESS.NORMAL, () => M.temp(LCOM.bing, {
    image: SDK.cq_image(`${URL.API}bing`)
}));

Cmd.register(LCMD.day.cmd, LCMD.day.descr, 'randomImg', 'all', ACCESS.NORMAL, () => {
    return CAPIKEY.api.day ? M.temp(LCOM.day, {
        image: SDK.cq_image(`${URL.API}60s?apikey=${CAPIKEY.api.day}`)
    }) : BOT_RESULT.APIKEY_EMPTY;
});

Cmd.register(LCMD.earth.cmd, LCMD.earth.descr, 'randomImg', 'all', ACCESS.NORMAL, () => M.temp(LCOM.earth, {
    image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_DISK.jpg')
}));

Cmd.register(LCMD.china.cmd, LCMD.china.descr, 'randomImg', 'all', ACCESS.NORMAL, () => M.temp(LCOM.china, {
    image: SDK.cq_image('https://img.nsmc.org.cn/CLOUDIMAGE/FY4A/MTCC/FY4A_CHINA.jpg')
}));

Cmd.register(LCMD.sister.cmd, LCMD.sister.descr, undefined, 'all', ACCESS.NORMAL, () => M.temp(LCOM.sister, {
    video: SDK.cq_video(`${URL.API}sisters`)
}));

Cmd.register(LCMD.qrcode.cmd, LCMD.qrcode.descr, 'randomImg', 'all', ACCESS.NORMAL, () => {
    const frame = [
        'L', 'M', 'Q', 'H'
    ][parseInt(M.args[2])] || 'H';
    return M.temp(LCOM.qrcode, {
        image: SDK.cq_image(`${URL.API}qrcode?text=${M.args[1]}&frame=2&size=200&e=${frame}`)
    });
}, [{
    must: true, name: LCMD.qrcode.args[0]
}, {
    must: '3', name: LCMD.qrcode.args[1]
}]);

/* 随机语录 */
Cmd.register('一言', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ(`${URL.BLOG}hitokoto/v2/`, undefined);
    if (!M.isObjP(send, res.data) || M.isNotArr(send, res.data)) return;

    send(LCOM.hitokoto, {
        ...res.data, from: res.data.from ? `——${res.data.from}` : ''
    });
});

const hitokotoT = (msg: number) => M.fetchT('words', { msg, format: 'text' });
Cmd.register('一言2', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(1);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('骚话', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(2);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('情话', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(3);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('人生语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(4);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('社会语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(5);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('毒鸡汤', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(6);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('笑话', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(7);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('网抑云', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(8);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('温柔语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(9);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('舔狗语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(10);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('爱情语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(11);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('英汉语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(12);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('经典语录', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(14);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('个性签名', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(15);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register('诗词', undefined, undefined, 'all', ACCESS.NORMAL, async send => {
    const res = await hitokotoT(16);
    send(res ? M.temp(LCOM.lunar, {
        content: res
    }) : BOT_RESULT.SERVER_ERROR);
});

/* GPT聊天 */
Cmd.register(LCMD.gpt.cmd, LCMD.gpt.descr, 'gpt', 'all', ACCESS.NORMAL, async send => {
    const res = await M.fetchJ(URL.GPT, undefined, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CAPIKEY.bot.chatgpt}`,
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

    send(LCOM.gpt, {
        content: !res.choices || !res.choices[0] || !res.choices[0].message || !res.choices[0].message.content ? BOT_RESULT.SERVER_ERROR : res.choices[0].message.content
    });
}, [{
    must: true, name: LCMD.gpt.args[0]
}]);

Cmd.register(LCMD.cl.cmd, LCMD.cl.descr, 'gpt', 'all', ACCESS.NORMAL, () => {
    return BOT_RESULT.REPAIRING;
}, [{
    must: true, name: LCMD.cl.args[0]
}]);

Cmd.register(LCMD.api.cmd, LCMD.api.descr, 'spec', 'all', ACCESS.NORMAL, async send => {
    const content = await M.fetchT('https://api.imlolicon.tk/sys/datastat', { format: 'text' });
    send(content ? M.temp(LCOM.api, {
        content
    }) : BOT_RESULT.SERVER_ERROR);
});

Cmd.register(LCMD.bot.cmd, LCMD.bot.descr, 'aboutInfo', 'all', ACCESS.NORMAL, () => {
    const { self_id, connect, status } = Main.Const.BOT;
    const STAT = status.stat;
    const { version, license } = getPackageInfo();
    const ENV = M.dealEnv();
    return M.temp(LCOM.bot, {
        self_id, connect, version, license, ...STAT, ...ENV
    });
});

Cmd.register(LCMD.status.cmd, LCMD.status.descr, 'aboutInfo', 'all', ACCESS.NORMAL, () => {
    const { model, speed, num, rate: cpu_rate } = M.dealCpu();
    const { total, used, rate: ram_rate } = M.dealRam();
    return M.temp(
        LCOM.status, {
        type: os.type(), platform: os.platform(), arch: os.arch(),
        model, speed: speed.toFixed(2), num, cpu_rate: cpu_rate.toFixed(2),
        total: total.toFixed(2), used: used.toFixed(2), ram_rate: ram_rate.toFixed(2),
        network: Object.keys(os.networkInterfaces()).length, time: M.dealTime(), hostname: os.hostname(), homedir: os.homedir()
    });
});

Cmd.register(LCMD.about.cmd, LCMD.about.descr, 'aboutInfo', 'all', ACCESS.NORMAL, () => {
    const { version, license } = getPackageInfo();
    return M.temp(LCOM.about, {
        version, license
    });
});

Cmd.register(LCMD.update.cmd, LCMD.update.descr, 'aboutInfo', 'all', ACCESS.NORMAL, async send => {
    const version = getPackageInfo().version;
    const res = await fetchJson('https://biyuehu.github.io/kotori-bot/package.json') as PackageInfo;
    const content = res.version === version ? LCOM.update.yes : M.temp(LCOM.update.no, {
        version: res.version
    });
    send(res && res.version ?
        M.temp(LCOM.update.info, {
            version, content
        }) : BOT_RESULT.SERVER_ERROR
    );
});

Cmd.register(LCMD.ban.cmd, LCMD.ban.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const target = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    const time = parseInt(M.args[2]) * 60;
    if (target) {
        Main.Api.set_group_ban(data.group_id!, target, time);
        send(LCOM.ban.user, {
            target, time
        });
        return;
    }
    Main.Api.set_group_whole_ban(data.group_id!);
    send(LCOM.ban.all);
}, [{
    must: false, name: LCMD.ban.args[0]
}, {
    must: (CMANGE.banTime / 60).toString(), name: LCMD.ban.args[1]
}]);

Cmd.register(LCMD.unban.cmd, LCMD.unban.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const target = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    if (target) {
        Main.Api.set_group_ban(data.group_id!, target, 0);
        send(LCOM.unban.user, {
            target
        });
        return;
    }
    Main.Api.set_group_whole_ban(data.group_id!, false);
    send(LCOM.unban.all);
}, [{
    must: false, name: LCMD.unban.args[0]
}]);

Cmd.register(LCMD.black.cmd, LCMD.black.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`${data.group_id}\\blackList.json`, [LCOM.black.query, LCOM.black.add, LCOM.black.del, LCOM.white.list]);
    send(message);
}, [{
    must: true, name: LCMD.black.args[0]
}, {
    must: false, name: LCMD.black.args[1]
}]);

Cmd.register(LCMD.white.cmd, LCMD.white.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`${data.group_id}\\whiteList.json`, [LCOM.white.query, LCOM.white.add, LCOM.white.del, LCOM.white.list]);
    send(message);
}, [{
    must: true, name: LCMD.white.args[0]
}, {
    must: false, name: LCMD.white.args[1]
}]);

Cmd.register(LCMD.kick.cmd, LCMD.kick.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const target = M.args[1] ? SDK.get_at(M.args[1]) || parseInt(M.args[1]) : null;
    if (target) {
        Main.Api.set_group_kick(data.group_id!, target);
        send(LCOM.kick, {
            target
        });
        return;
    }
    send(BOT_RESULT.ARGS_ERROR);
}, [{
    must: true, name: LCMD.kick.args[0]
}]);

Cmd.register(LCMD.all.cmd, LCMD.all.descr, 'groupMange', 'group', ACCESS.MANGER, send => {
    if (!Main.verifyEnable(send)) return;
    send(LCOM.all, {
        all: SDK.cq_at('all'), input: M.args[1]
    });
}, [{
    must: true, name: LCMD.all.args[0]
}]);

Cmd.register(LCMD.notice.cmd, LCMD.notice.descr, 'groupMange', 'group', ACCESS.MANGER, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const image = SDK.get_image(M.args[1]);
    Main.Api._send_group_notice(data.group_id!, M.temp(LCOM.notice, {
        input: M.args[1]
    }), image || undefined)
}, [{
    must: true, name: LCMD.notice.args[0]
}]);

Cmd.register(LCMD.config.cmd, LCMD.config.descr, 'superMange', 'all', ACCESS.ADMIN, () => {
    let white_content = ''
    if (CGROUP.enable) {
        let group_list = '';
        for (let content of CGROUP.list) {
            group_list += M.temp(LCOM.config.list, {
                content
            });
        }
        white_content = M.temp(LCOM.config.white, {
            group_list
        });
    }
    const mange_content = CMANGE.enable ? M.temp(LCOM.config.mange, {
        join_group_welcome: M.formatOption(CMANGE.joinGroupWelcome),
        exit_group_add_black: M.formatOption(CMANGE.exitGroupAddBlack),
        ban_time: CMANGE.banTime,
        banword_ban_time: CMANGE.banwordBanTime,
        repeat_ban_time: CMANGE.repeatBanTime,
        cycle_time: CMANGE.repeatRule.cycleTime,
        max_times: CMANGE.repeatRule.maxTimes,
        max_list_nums: CFORMAT.maxListNums
    }) : '';
    return M.temp(LCOM.config.info, {
        group_enable: M.formatOption(CGROUP.enable),
        white_content,
        main_menu: M.formatOption(CCOM.mainMenu),
        mange_enable: M.formatOption(CMANGE.enable),
        mange_content
    });
});

Cmd.register(LCMD.blackg.cmd, LCMD.blackg.descr, 'superMange', 'all', ACCESS.ADMIN, send => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`blackList.json`, [LCOM.blackg.query, LCOM.blackg.add, LCOM.blackg.del, LCOM.blackg.list]);
    send(message);
}, [{
    must: true, name: LCMD.blackg.args[0]
}, {
    must: false, name: LCMD.blackg.args[1]
}]);

Cmd.register(LCMD.whiteg.cmd, LCMD.whiteg.descr, 'superMange', 'all', ACCESS.ADMIN, send => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`whiteList.json`, [LCOM.whiteg.query, LCOM.whiteg.add, LCOM.whiteg.del, LCOM.whiteg.list]);
    send(message);
}, [{
    must: true, name: LCMD.whiteg.args[0]
}, {
    must: false, name: LCMD.whiteg.args[1]
}]);

Cmd.register(LCMD.manger.cmd, LCMD.manger.descr, 'superMange', 'group', ACCESS.ADMIN, (send, data) => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`${data.group_id}\\mangerList.json`, [LCOM.manger.query, LCOM.manger.add, LCOM.manger.del, LCOM.manger.list]);
    send(message);
}, [{
    must: true, name: LCMD.manger.args[0]
}, {
    must: false, name: LCMD.manger.args[1]
}]);

Cmd.register(LCMD.banword.cmd, LCMD.banword.descr, 'superMange', 'all', ACCESS.ADMIN, send => {
    if (!Main.verifyEnable(send)) return;
    const message = M.controlParams(`banword.json`, [LCOM.banword.query, LCOM.banword.add, LCOM.banword.del, LCOM.banword.list], true);
    send(message);
}, [{
    must: true, name: LCMD.banword.args[0]
}, {
    must: false, name: LCMD.banword.args[1]
}]);

export default Main;