/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-03 20:53:04
 */
import Fs from 'fs';
import Path from 'path';
import { loadConfig, CONST, PluginAsyncList, PluginEntity, PluginInfo } from '@/tools';

export const load = (pluginName: string): Promise<PluginEntity> => {
    return import(`${CONST.PLUGIN_PATH}\\${pluginName}`);
}

export const loadAll = (): PluginAsyncList => {
    const fileList = Fs.readdirSync(CONST.PLUGIN_PATH);

    const entityList: PluginAsyncList = new Set();
    fileList.forEach(fileName => {
        if (fileName.includes('.disable')) return;
        const filedir = Path.join(CONST.PLUGIN_PATH + '\\', fileName);
        const fileStat = Fs.statSync(filedir);
        
        if (fileStat.isFile() && fileName !== 'index.ts' && fileName !== 'index.js') {
            const tempArr = fileName.split('.');
            const fileType = tempArr[tempArr.length - 1];
            if (fileType === 'ts' || fileType === 'js') {
                const entity = load(fileName);
                entity && entityList.add([entity, fileName, `${CONST.ROOT_PATH}\\plugins\\${fileName}`]);
            }
        } else if (fileStat.isDirectory()) {
            const Path = `${CONST.PLUGIN_PATH}\\${fileName}\\`;
            let info: PluginInfo | undefined;
            if (Fs.existsSync(`${Path}manifest.json`)) {
                info = <PluginInfo>loadConfig(`${Path}manifest.json`);
            }

            if (Fs.existsSync(`${Path}index.ts`)) {
                const entity = load(`${fileName}\\index.ts`);
                entity && entityList.add([entity, fileName, `${Path}index.ts`, info]);
            } else if (Fs.existsSync(`${Path}index.js`)) {
                const entity = load(`${fileName}\\index.js`);
                entity && entityList.add([entity, fileName, `${Path}index.js`, info]);
            }
        }
    })
    return entityList;
}

export default {
    load,
    loadAll
}
