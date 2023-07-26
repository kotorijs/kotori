import { fetchJson, fetchText } from '@/function';
import { FuncFetchSuper } from '@/interface';
import os from 'os';
import { Res } from './interface';

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

export const fetchJ: FuncFetchSuper<Res> = async (url, params, init) => {
    return fetchJson(url.substring(0, 4) === 'http' ? url : URL + url, params, init);
}

export const fetchT: FuncFetchSuper<string> = async (url, params, init) => {
    return fetchText(url.substring(0, 4) === 'http' ? url : URL + url, params, init);
}