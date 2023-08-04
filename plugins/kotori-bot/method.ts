/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-15 15:52:17
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 16:16:32
 */
import { LOG_PREFIX, fetchJson, fetchText } from '@/tools';
import type { FuncFetchSuper } from '@/tools';
import os from 'os';
import { Res } from './interface';
import { URL } from './menu';
import { version as version_ts } from 'typescript';
import { VERSION as version_tsnode } from 'ts-node';

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

export const fetchT: FuncFetchSuper<string> = async (url, params, init) => {
    return fetchText(url.substring(0, 4) === 'http' ? url : URL.API + url, params, init);
}

export const fetchBGM: FuncFetchSuper<any> = async (url, params) => {
    return fetchJson(url, params, {
        headers: {
            'user-agent': 'czy0729/Bangumi/6.4.0 (Android) (http://github.com/czy0729/Bangumi)'
        }
    })
}

export const con = {
    log: (...args: unknown[]) => console.log(LOG_PREFIX.KOTORI, ...args),
    warn: (...args: unknown[]) => console.warn(LOG_PREFIX.KOTORI, ...args),
    error: (...args: unknown[]) => console.error(LOG_PREFIX.KOTORI, ...args),
}