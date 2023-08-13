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

export class Plugin {
    private static load = (pluginName: string): Promise<PluginEntity> => {
        return import(Path.join(CONST.PLUGIN_PATH, pluginName));
    }

    public static loadAll = (): PluginAsyncList => {
        const fileList = Fs.readdirSync(CONST.PLUGIN_PATH);
    
        const entityList: PluginAsyncList = new Set();
        fileList.forEach(fileName => {
            if (fileName.includes('.disable')) return;
            const filedir = Path.join(CONST.PLUGIN_PATH, fileName);
            const fileStat = Fs.statSync(filedir);
            
            if (fileStat.isFile() && fileName !== 'index.ts' && fileName !== 'index.js') {
                const tempArr = fileName.split('.');
                const fileType = tempArr[tempArr.length - 1];
                if (fileType === 'ts' || fileType === 'js') {
                    const entity = this.load(fileName);
                    entity && entityList.add([entity, fileName, Path.join(CONST.ROOT_PATH, 'plugins', fileName)]);
                }
            } else if (fileStat.isDirectory()) {
                const path = Path.join(CONST.PLUGIN_PATH, fileName);
                let info: PluginInfo | undefined;
                const manifestPath = Path.join(path, 'manifest');
                const indexPath = Path.join(fileName, 'index.ts');
                const indexPath2 = Path.join(path, 'index.ts');
                if (Fs.existsSync(manifestPath)) info = <PluginInfo>loadConfig(manifestPath);

                if (Fs.existsSync(indexPath2)) {
                    const entity = this.load(indexPath);
                    entity && entityList.add([entity, fileName, indexPath2, info]);
                }
            }
        })
        return entityList;
    }
}

export default Plugin;