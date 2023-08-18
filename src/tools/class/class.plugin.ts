/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 15:50:45
 */
import Fs from 'fs';
import Path from 'path';
import { loadConfig, CONST, PluginAsyncList, PluginEntity, PluginInfo } from '@/tools';

export class Plugin {
	private static disableList: string[] = [];

	private static entityList: PluginAsyncList = new Set();

	private static load = (pluginName: string): Promise<PluginEntity> =>
		import(Path.join(CONST.PLUGIN_PATH, pluginName));

	private static handleFile = (fileName: string) => {
		if (fileName.includes('.disable')) return;
		const filedir = Path.join(CONST.PLUGIN_PATH, fileName);
		const fileStat = Fs.statSync(filedir);

		if (fileStat.isFile() && fileName !== 'index.ts' && fileName !== 'index.js') {
			const tempArr = fileName.split('.');
			const fileType = tempArr[tempArr.length - 1];

			if (fileType !== 'ts' && fileType !== 'js') return;
			const entity = this.load(fileName);
			if (entity)
				this.entityList.add([
					entity,
					fileName,
					Path.join(CONST.ROOT_PATH, 'plugins', fileName),
					{},
					!this.disableList.includes(fileName),
				]);
			return;
		}
		if (!fileStat.isDirectory()) return;
		const path = Path.join(CONST.PLUGIN_PATH, fileName);
		let info: PluginInfo | undefined;
		const manifestPath = Path.join(path, 'manifest.json');
		const indexPath = Path.join(fileName, 'index.ts');
		const indexPath2 = Path.join(path, 'index.ts');
		if (Fs.existsSync(manifestPath)) info = <PluginInfo>loadConfig(manifestPath);

		if (!Fs.existsSync(indexPath2)) return;
		const entity = this.load(indexPath);
		if (entity) this.entityList.add([entity, fileName, indexPath2, info, !this.disableList.includes(fileName)]);
	};

	public static loadAll = (): PluginAsyncList => {
		this.entityList = new Set(); // Clear Plugins Import Cache
		const fileList = Fs.readdirSync(CONST.PLUGIN_PATH);
		this.disableList = loadConfig(Path.join(CONST.ROOT_PATH, 'plugins.json')) as string[];
		fileList.forEach(fileName => this.handleFile(fileName));
		return this.entityList;
	};
}

export default Plugin;
