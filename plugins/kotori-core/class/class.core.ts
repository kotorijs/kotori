import { Locale } from '@/tools';
import { ACCESS, CoreVal, SCOPE, CoreKeywordMatch, InfoArgEx, CoreKeyword, InfoVal, InfoArg, Hook } from '../type';
import { temp } from '../method';
import Command from './class.command';
import Data from './class.data';

export class Core extends Data {
	public static args: string[] = [];

	public static cmd = (keyword: CoreKeyword, callback: CoreVal) => {
		const newKeyword = `/${keyword}`;
		return this.alias(newKeyword, callback);
	};

	public static alias = (keyword: CoreKeyword, callback: CoreVal) => {
		// if (!this.isInitialize) this.initialize();
		this.cmdData.set(keyword, callback);
		const infoData: InfoVal = {
			menuId: undefined,
			description: undefined,
			scope: SCOPE.ALL,
			access: ACCESS.NORMAL,
			params: undefined,
		};
		this.cmdInfoData.set(keyword, infoData);
		return new Command(keyword, infoData);
	};

	public static menu = (keyword: CoreKeyword, menuId: string) => {
		const callback = () => this.menuHandle(menuId);
		const main = menuId === 'main' ? '' : 'main';
		const { menuId: menuIdFun, descr, scope, access } = this.cmd(keyword, callback).menuId(main);
		return {
			menuId: menuIdFun,
			descr,
			scope,
			access,
		};
	};

	public static custom = (match: CoreKeywordMatch, callback: CoreVal) => {
		// if (!this.isInitialize) this.initialize();
		this.cmdData.set(match, callback);
	};

	public static auto = (callback: () => void) => {
		this.autoEvent.push(callback);
	};

	public static hook = (callback: Hook) => {
		Core.hookEvent.push(callback);
	};

	protected static autoEvent: (() => void)[] = [];

	protected static hookEvent: Hook[] = [];

	/* 	private static isInitialize: boolean = false;

	private static initialize = () => {
		this.isInitialize = true;
		if (CCOM.main) {
			this.cmd(LMENU.main.cmd, LMENU.main.content);
		}
		for (const key of Object.keys(LMENU.customMenu)) {
			const menu = (LMENU.customMenu as customMenu)[key];
			if (!menu.cmd || !menu.content) continue;
			this.cmd(menu.cmd, menu.content);
		}
	}; */

	private static menuHandle = (menuId: string) => {
		let list = '';
		for (const key of this.cmdInfoData) {
			const { 0: cmdKey, 1: value } = key;
			if (value.menuId !== menuId || typeof cmdKey === 'function') continue;
			list += this.menuHandleParams(cmdKey, value);
		}
		return temp('core.temp.menu.info', {
			list,
		});
	};

	protected static menuHandleParams = (key: CoreKeyword, value: InfoVal) => {
		const cmdName = Array.isArray(key) ? key[0] : key;
		let scope = '';
		if (value.scope !== SCOPE.ALL) {
			scope = value.scope === SCOPE.GROUP ? 'core.temp.menu.scope.group' : 'core.temp.menu.scope.private';
			scope = Locale.locale(scope);
		}
		let access = '';
		if (value.access !== ACCESS.NORMAL) {
			access = value.access === ACCESS.MANGER ? 'core.temp.menu.access.manger' : 'core.temp.menu.access.admin';
			access = Locale.locale(access);
		}
		let list = '';
		let handleParams = '';

		/* type = InfoArg[] */
		if (Array.isArray(value.params) || !value.params) {
			if (value.params) handleParams = this.menuHandleParamsArr(value.params);
			return temp('core.temp.menu.list', {
				name: cmdName,
				param: handleParams,
				descr: value.description
					? temp('core.temp.menu.descr', {
							content: Locale.locale(value.description),
					  })
					: '',
				scope,
				access,
			});
		}

		/* type = InfoArgEx */
		for (const param of Object.keys(value.params)) {
			handleParams = '';
			const val = (value.params as InfoArgEx)[param];
			if (Array.isArray(val.args)) handleParams += this.menuHandleParamsArr(val.args);
			list += temp('core.temp.menu.list', {
				name: `${cmdName} ${param}`,
				param: handleParams,
				descr: val.descr
					? temp('core.temp.menu.descr', {
							content: Locale.locale(val.descr),
					  })
					: '',
				scope,
				access,
			});
		}
		return list;
	};

	private static menuHandleParamsArr = (params: InfoArg[]) => {
		let handleParams = '';
		params.forEach(element => {
			const paramName = element.name ?? Locale.locale('core.temp.menu.param_name_default');
			const prefix = element.rest ? Locale.locale('core.temp.menu.prefix.rest') : '';
			let suffix = '';
			if (element.must !== true) {
				suffix =
					element.must === false
						? Locale.locale('core.temp.menu.suffix.optional')
						: temp('core.temp.menu.suffix.default', {
								content: element.must,
						  });
			}
			handleParams += temp('core.temp.menu.param', {
				param_name: paramName,
				prefix,
				suffix,
			});
		});
		return handleParams;
	};
}

export default Core;
