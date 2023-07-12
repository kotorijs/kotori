import Fs from 'fs';
import Path from 'path';
import { loadConfig, _const } from './function';
import { PluginAsyncList, PluginEntity, PluginInfo } from './interface';

export const load = (pluginName: string): Promise<PluginEntity> => {
    return import(`${_const._PLUGIN_PATH}\\${pluginName}`);
}

export const loadAll = (): PluginAsyncList => {
    const fileList = Fs.readdirSync(_const._PLUGIN_PATH);

    const entityList: PluginAsyncList = new Set();
    fileList.forEach(fileName => {
        const filedir = Path.join(_const._PLUGIN_PATH + '\\', fileName);
        const fileStat = Fs.statSync(filedir);
        
        if (fileStat.isFile() && fileName !== 'index.ts' && fileName !== 'index.js') {
            const tempArr = fileName.split('.');
            const fileType = tempArr[tempArr.length - 1];
            if (fileType === 'ts' || fileType === 'js') {
                const entity = load(fileName);
                entity && entityList.add([entity, fileName, `${_const._ROOT_PATH}\\plugins\\${fileName}`]);
            }
        } else if (fileStat.isDirectory()) {
            const Path = `${_const._PLUGIN_PATH}\\${fileName}\\`;
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
