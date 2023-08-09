/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-15 15:52:17
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-09 17:22:31
 */
import { LOG_PREFIX, fetchJson, fetchText, isObj, isObjArr, loadConfig, saveConfig, stringTemp } from '@/tools';
import type { FuncFetchSuper, obj } from '@/tools';
import os from 'os';
import { CONTROL_PARAMS, Res, Send } from './interface';
import { BOT_RESULT, URL } from './menu';
import { version as version_ts } from 'typescript';
import { VERSION as version_tsnode } from 'ts-node';
import { existsSync } from 'fs';
import SDK from '@/utils/class.sdk';

export const dealTime = () => {
    const seconds = os.uptime() | 0;
    let day: string | number = (seconds / (3600 * 24)) | 0;
    let hours: string | number = ((seconds - day * 3600) / 3600) | 0;
    let minutes: string | number = ((seconds - day * 3600 * 24 - hours * 3600) / 60) | 0;
    let second: string | number = seconds % 60;
    day < 10 && (day = '0' + day);
    hours < 10 && (hours = '0' + hours);
    minutes < 10 && (minutes = '0' + minutes);
    second < 10 && (second = '0' + second);
    return [day, hours, minutes, second].join(':');
};

export const dealRam = () => {
    const total = os.totalmem() / 1024 / 1024 / 1024;
    const unused = os.freemem() / 1024 / 1024 / 1024;
    const used = total - unused;
    const rate = (used / total) * 100;
    return {
        total, unused, used, rate
    }
}

export const dealCpu = () => {
    const cpuData = os.cpus();
    let rate: number = 0, ratearr: number[] = [];
    for (let key of cpuData) {
        const times = key.times;
        const usage = ((1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100);
        ratearr.push(usage);
        rate += usage;
    }
    return {
        model: cpuData[0].model,
        speed: cpuData[0].speed / 1024,
        num: cpuData.length,
        rate,
        ratearr
    }
}

export const dealEnv = () => {
    return {
        node: process.versions.node,
        typescript: version_ts,
        tsnode: version_tsnode
    }
}

export const fetchJ: FuncFetchSuper<Res> = async (url, params, init) => {
    return fetchJson(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);
}

export const fetchT: FuncFetchSuper<string | void> = async (url, params, init) => {
    return fetchText(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);
}

export const fetchBGM: FuncFetchSuper<obj> = async (url, params) => {
    return fetchJson(`${URL.BGM}${url}`, params, {
        headers: {
            'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)'
        }
    });
}

export const con = {
    log: (...args: unknown[]) => console.log(LOG_PREFIX.KOTORI, ...args),
    warn: (...args: unknown[]) => console.warn(LOG_PREFIX.KOTORI, ...args),
    error: (...args: unknown[]) => console.error(LOG_PREFIX.KOTORI, ...args),
}

export const initConfig = (path: string) => {
    const banword = `${path}\\banword.json`;
    const banwordDefault = ['傻逼', '草拟吗', 'cnm', '死妈'];
    existsSync(banword) || saveConfig(banword, banwordDefault);
}

export const isObjArrP = (send: Send, data: unknown): data is obj[] => {
    const result = isObjArr(data);
    result || send(BOT_RESULT.SERVER_ERROR);
    return result;
}

export const isObjP = (send: Send, data: unknown): data is obj => {
    const result = isObj(data);
    result || send(BOT_RESULT.SERVER_ERROR);
    return result;
}

export const isNotArr = (send: Send, data: unknown): data is string[] | number[] | obj[] => {
    const result = Array.isArray(data);
    result && send(BOT_RESULT.SERVER_ERROR);
    return result;
}

const CACHE: obj = {};
export const CACHE_MSG_TIMES: obj<{ time: number, times: number }> = {};
export const cacheSet = (key: string, data: obj) => {
    if (!CACHE[key]) CACHE[key] = data;
}

export const cacheGet = (key: string): obj | null => {
    return CACHE[key];
}

export let args: string[] = [];
export const setArgs = (value: string[]) => {
    args = value;
}

let CONFIG_PLUGIN_PATH: string;
export const setPath = (value: string) => {
    CONFIG_PLUGIN_PATH = value;
}

export const loadConfigP = (filename: string, init: object = []): object => {
    const PATH = `${CONFIG_PLUGIN_PATH}\\${filename}`;
    return loadConfig(PATH, 'json', init) as object || init;
}

export const saveConfigP = (filename: string, content: object) => {
    const PATH = `${CONFIG_PLUGIN_PATH}\\${filename}`;
    return saveConfig(PATH, content);
}
export const controlParams = (path: string, msg: [string, string, string]) => {
    let message = '';
    let list = loadConfigP(path) as number[];
    const target = args[2] ? parseInt(args[2]) || SDK.get_at(args[2]) : null;
    const check = () => {
        if (!args[2]) { message = BOT_RESULT.ARGS_EMPTY; return false; }
        if (!target) { message = BOT_RESULT.ARGS_ERROR; return false; }
        return true;
    }

    switch (args[1]) {
        case CONTROL_PARAMS.QUERY:
            let listRaw = '';
            list.forEach(user => {
                listRaw += `${user}, `;
            });
            listRaw = listRaw.substring(0, listRaw.length - 2);
            message = `${msg[0]}\n` + (listRaw ? listRaw : '无内容');
            break;
        case CONTROL_PARAMS.ADD:
            if(!check()) break;
            if (list.includes(target!)) { message = BOT_RESULT.EXIST; break; }
            list.push(target!);
            message = stringTemp(msg[1], { target: target! });
            break;
        case CONTROL_PARAMS.DEL:
            if(!check()) break;
            if (!list.includes(target!)) { message = BOT_RESULT.NO_EXIST; break; }
            list = list.filter(item => item !== target);
            message = stringTemp(msg[2], { target: target! });
            break;
        default:
            message = BOT_RESULT.ARGS_ERROR;
            break;
    }
    saveConfigP(path, list);
    return message;
}
