import path from 'path';
import { Core, temp } from 'plugins/kotori-core';
import { ACCESS, BOT_RESULT } from 'plugins/kotori-core/type';
import { Const, Locale, loadConfig, obj, saveConfig } from '@/tools';
import wikiData from './type';
import { wikiSearch } from './method';

Locale.register(path.resolve(__dirname));

const defaultData = [
	{
		name: '萌娘百科',
		api: 'https://mzh.moegirl.org.cn/api.php',
	},
	{
		name: 'MCWIKI',
		api: 'https://minecraft.fandom.com/zh/api.php',
	},
];

const getPath = () => path.join(Main.Consts.CONFIG_PLUGIN_PATH, 'wiki.json');

const loadWikiData = () => {
	const data = (loadConfig(getPath(), 'json', defaultData) as wikiData[]) || defaultData;
	return data;
};

Core.cmd('wiki', async () => {
	const dataList = loadWikiData();
	if (dataList.length <= 0) return '暂时还没有wiki列表，使用"/wikio add"以添加新的MediaWiki';

	let res: obj | null = null;
	let wiki: wikiData | null = null;
	const num = parseInt(Core.args[2], 10);
	if (num) {
		wiki = dataList[num - 1];
		if (!wiki || !wiki.api) return '错误的序号不存在该WIKI，使用"/wikil"查看当前MediaWiki列表';
		res = await wikiSearch(wiki.api, Core.args[1]);
	} else {
		// let resPromise = null;
		let init = 0;
		const query = async (): Promise<obj | null> => {
			wiki = dataList[init];
			const res = await wikiSearch(wiki.api, Core.args[1]);
			if (res || init >= dataList.length - 1) return res;
			init += 1;
			return query();
		};
		res = await query();
	}
	if (!res) return ['未查询到相关内容: %input%', { input: Core.args[1] }];
	return ['标题: %title%\n内容: %extract%\n页面ID: %pageid%\n来源: %name%', { ...res, name: wiki!.name }];
})
	.descr('搜索MediaWiki,num指定搜索目标Wiki')
	.menuId('queryTool')
	.params([
		{
			must: true,
		},
		{
			must: false,
			name: 'num',
		},
	]);

Core.cmd('wikil', () => {
	const dataList = loadWikiData();
	let list = '';
	let init = 1;
	dataList.forEach(Element => {
		list += temp('\n%num%.%name% - %api%', { num: init, ...Element });
		init += 1;
	});
	return ['MediaWiki列表:%list%', { list }];
})
	.descr('查看MediaWiki列表')
	.menuId('queryTool');

Core.cmd('wikio', () => {
	const oldData = loadWikiData();
	const newData = oldData.filter(Element => Element.name !== Core.args[2]);
	const result = oldData.length === newData.length;
	if (Core.args[1] === 'del') {
		if (result) return BOT_RESULT.NO_EXIST;
		saveConfig(getPath(), newData);
		return ['成功删除MediaWiki: %input%', { input: Core.args[2] }];
	}
	if (Core.args[1] === 'add') {
		if (!Core.args[3].includes('//') || !Core.args[3].includes('api.php')) return BOT_RESULT.ARGS_ERROR;
		if (!result) return BOT_RESULT.EXIST;
		oldData.push({ name: Core.args[2], api: Core.args[3] });
		saveConfig(getPath(), oldData);
		return ['成功添加MediaWiki: %input%', { input: Core.args[2] }];
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.menuId('queryTool')
	.access(ACCESS.MANGER)
	.params({
		add: {
			descr: '添加MediaWiki',
			args: [
				{
					must: true,
					name: 'name',
				},
				{
					must: true,
					name: 'url',
				},
			],
		},
		del: {
			descr: '删除MediaWiki',
			args: [
				{
					must: true,
					name: 'name',
				},
			],
		},
	});

class Main {
	public static Consts: Const;

	public constructor(_event: unknown, _api: unknown, Consts: Const) {
		Main.Consts = Consts;
	}
}

export default Main;
