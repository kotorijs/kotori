import { Context, obj, stringTemp } from 'kotori-bot';
import wikiData from './type';
import { wikiSearch } from './method';

export const lang = [__dirname, '../locales'];

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

// const getPath()  path.join(Main.Consts.CONFIG_PLUGIN_PATH, 'wiki.json');

const loadWikiData = () =>
  /* {
	const data = (loadConfig(getPath(), 'json', defaultData) as wikiData[]) || defaultData;
	return data;
}; */ defaultData;

export function main(ctx: Context) {
  ctx.command('wiki <content> [order] - mediawiki.descr.wiki').action(async data => {
    const dataList = loadWikiData();
    if (dataList.length <= 0) return 'mediawiki.msg.wiki.empty';

    let res: obj | null = null;
    let wiki: wikiData | null = null;
    const num = parseInt(data.args[1] as string, 10);
    if (num) {
      wiki = dataList[num - 1];
      if (!wiki || !wiki.api) return 'mediawiki.msg.wiki.error';
      res = await wikiSearch(wiki.api, data.args[0] as string);
    } else {
      let init = 0;
      const query = async (): Promise<obj | null> => {
        wiki = dataList[init];
        const res = await wikiSearch(wiki.api, data.args[0] as string);
        if (res || init >= dataList.length - 1) return res;
        init += 1;
        return query();
      };
      res = await query();
    }
    if (!res) return ['mediawiki.msg.wiki.fail', { input: data.args[0] }];
    return [
      'mediawiki.msg.wiki',
      { ...res, url: `${wiki!.api.split('api.php')[0]}index.php?curid=${res.pageid}`, name: wiki!.name },
    ];
  });

  /* here nedd feat: 二级参数 */
  ctx.command('wikil - mediawiki.descr.wikil').action((_, events) => {
    const dataList = loadWikiData();
    let list = '';
    let init = 1;
    dataList.forEach(Element => {
      list += stringTemp(events.locale('mediawiki.msg.wikil.list'), { num: init, ...Element });
      init += 1;
    });
    return ['mediawiki.msg.wikil', { list }];
  });
}

/* ctx.command('wikio')
	.action(() => {
		const oldData = loadWikiData();
		const newData = oldData.filter(Element => Element.name !== data.args[1]);
		const result = oldData.length === newData.length;
		if (data.args[0] === 'del') {
			if (result) return 'BOT_RESULT.NO_EXIST';
			saveConfig(getPath(), newData);
			return ['mediawiki.msg.wikio.del', { input: data.args[1] }];
		}
		if (data.args[0] === 'add') {
			if (!Core.args[3].includes('//') || !Core.args[3].includes('api.php')) return BOT_RESULT.ARGS_ERROR;
			if (!result) return BOT_RESULT.EXIST;
			oldData.push({ name: data.args[1], api: Core.args[3] });
			saveConfig(getPath(), oldData);
			return ['mediawiki.msg.wikio.add', { input: data.args[1] }];
		}
		return BOT_RESULT.ARGS_ERROR;
	})
	.access(ACCESS.MANGER)
	.params({
		add: {
			help: 'mediawiki.descr.wikio.add',
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
			help: 'mediawiki.descr.wikio.del',
			args: [
				{
					must: true,
					name: 'name',
				},
			],
		},
	}); */
