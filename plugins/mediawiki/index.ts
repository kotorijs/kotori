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
	if (dataList.length <= 0) return 'mediawiki.msg.wiki.empty';

	let res: obj | null = null;
	let wiki: wikiData | null = null;
	const num = parseInt(Core.args[2], 10);
	if (num) {
		wiki = dataList[num - 1];
		if (!wiki || !wiki.api) return 'mediawiki.msg.wiki.error';
		res = await wikiSearch(wiki.api, Core.args[1]);
	} else {
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
	if (!res) return ['mediawiki.msg.wiki.fail', { input: Core.args[1] }];
	return [
		'mediawiki.msg.wiki.info',
		{ ...res, url: `${wiki!.api.split('api.php')[0]}index.php?curid=${res.pageid}`, name: wiki!.name },
	];
})
	.help('mediawiki.help.wiki')
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
		list += temp('mediawiki.msg.wikil.list', { num: init, ...Element });
		init += 1;
	});
	return ['mediawiki.msg.wikil.info', { list }];
})
	.help('mediawiki.help.wikil')
	.menuId('queryTool');

Core.cmd('wikio', () => {
	const oldData = loadWikiData();
	const newData = oldData.filter(Element => Element.name !== Core.args[2]);
	const result = oldData.length === newData.length;
	if (Core.args[1] === 'del') {
		if (result) return BOT_RESULT.NO_EXIST;
		saveConfig(getPath(), newData);
		return ['mediawiki.msg.wikio.del', { input: Core.args[2] }];
	}
	if (Core.args[1] === 'add') {
		if (!Core.args[3].includes('//') || !Core.args[3].includes('api.php')) return BOT_RESULT.ARGS_ERROR;
		if (!result) return BOT_RESULT.EXIST;
		oldData.push({ name: Core.args[2], api: Core.args[3] });
		saveConfig(getPath(), oldData);
		return ['mediawiki.msg.wikio.add', { input: Core.args[2] }];
	}
	return BOT_RESULT.ARGS_ERROR;
})
	.menuId('queryTool')
	.access(ACCESS.MANGER)
	.params({
		add: {
			help: 'mediawiki.help.wikio.add',
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
			help: 'mediawiki.help.wikio.del',
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
