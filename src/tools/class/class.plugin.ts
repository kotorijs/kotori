/*
 * @Author: hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-24 15:12:55
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-25 15:51:14
 */
import Fs from 'fs';
import Path from 'path';
import { loadConfig, CONST, PluginAsyncList, PluginEntity, PluginInfo } from '@/tools';

export class Plugin {
	private static disableList: string[] = [];

	private static entityList: PluginAsyncList = new Set();

	private static load = (pluginName: string): Promise<PluginEntity> => {
		const promise = import(Path.join(CONST.PLUGIN_PATH, pluginName));
		return promise;
	};

	private static handleFile = (fileName: string) => {
		if (fileName.includes('.disable')) return;
		const fileStat = Fs.statSync(Path.join(CONST.PLUGIN_PATH, fileName));
		const state = !this.disableList.includes(fileName);
		let importPath: string = '';
		let indexPath: string = '';
		let infoData: PluginInfo = {};

		if (fileStat.isFile() && fileName !== 'index.ts' && fileName.includes('.ts')) {
			/* Only File */
			importPath = fileName;
			indexPath = Path.join(CONST.PLUGIN_PATH, fileName);
		} else if (fileStat.isDirectory()) {
			/* Dir */
			const path = Path.join(CONST.PLUGIN_PATH, fileName);
			const manifestPath = Path.join(path, 'manifest.json');
			indexPath = Path.join(path, 'index.ts');

			if (Fs.existsSync(manifestPath)) {
				const data = loadConfig(manifestPath);
				if (data && typeof data === 'object' && 'name' in data) infoData = data as PluginInfo;
			}

			if (!Fs.existsSync(indexPath)) return;
			importPath = Path.join(fileName, 'index.ts');
		}

		const entity = state ? this.load(importPath) : {};
		if (entity) this.entityList.add([entity, fileName, indexPath, infoData, state]);
	};

	public static loadAll = (): PluginAsyncList => {
		/* Clear Plugins Import Cache */
		this.entityList = new Set();
		this.disableList = loadConfig(Path.join(CONST.CONFIG_PATH, 'plugins.json')) as string[];
		const fileList = Fs.readdirSync(CONST.PLUGIN_PATH);
		fileList.forEach(fileName => this.handleFile(fileName));
		return this.entityList;
	};
}

export default Plugin;
