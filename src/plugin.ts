import Fs from 'fs';
import Path from 'path';
import { obj, loadConfig, _const } from './function';

export const load = (pluginName: string) => {
    return import(`${_const._PLUGIN_PATH}\\${pluginName}`)
        
}

export const loadAll = () => {
    const fileList = Fs.readdirSync(_const._PLUGIN_PATH);

    const entityList: Set<[Promise<obj>, string, string, obj?]> = new Set();
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
            let info: obj|undefined;
            if (Fs.existsSync(`${Path}manifest.json`)) {
                info = loadConfig(`${Path}manifest.json`);
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
