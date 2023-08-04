/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 16:09:39
 */
import Process from 'child_process';
import { LOG_PREFIX } from './interface';

export const execute = (cmd: string) => Process.spawn(cmd, {
    detached: true, 
    windowsHide: true,
    stdio: 'ignore'
});

export const exec = (file: string, info?: string) => Process.exec(file , (error) => {
    if (error) {
        console.error(LOG_PREFIX.SYS, error);
    } else if (info) {
        console.log(LOG_PREFIX.SYS, info);
    }
});

export default {
    execute,
    exec
}