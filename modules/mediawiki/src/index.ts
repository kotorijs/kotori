import { CommandAccess, Context, loadConfig, obj, saveConfig, stringTemp } from 'kotori-bot';
import { join } from 'path';
import wikiData from './type';
import { wikiSearch } from './method';

export const lang = [__dirname, '../locales'];

const defaultData = [
  {
    name: '萌娘百科',
    api: 'https://mzh.moegirl.org.cn/api.php'
  },
  {
    name: 'MCWIKI',
    api: 'https://minecraft.fandom.com/zh/api.php'
  }
];

export function main(ctx: Context) {
  const getPath = () => join(ctx.baseDir.data, './mediawiki.json');

  const loadWikiData = () => {
    const data = loadConfig(getPath(), 'json', defaultData) as wikiData[];
    return data;
  };

  ctx.command('wiki <content> [order:number] - mediawiki.descr.wiki').action(async (data) => {
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
      { ...res, api: `${wiki!.api.split('api.php')[0]}index.php?curid=${res.pageid}`, name: wiki!.name }
    ];
  });

  /* here nedd feat: 二级参数 */
  ctx.command('wikil - mediawiki.descr.wikil').action((_, events) => {
    const dataList = loadWikiData();
    let list = '';
    let init = 1;
    dataList.forEach((Element) => {
      list += stringTemp(events.i18n.locale('mediawiki.msg.wikil.list'), { num: init, ...Element });
      init += 1;
    });
    return ['mediawiki.msg.wikil', { list }];
  });

  ctx
    .command('wikio add <name> <url> - mediawiki.descr.wikio.add')
    .action((data, session) => {
      const [name, api] = data.args as string[];
      const list = loadWikiData();
      if (!api.includes('//') || !api.includes('api.php')) return session.error('data_error', { target: 1 });
      list.push({ name, api });
      saveConfig(getPath(), list);
      return ['mediawiki.msg.wikio.add', { input: api }];
    })
    .access(CommandAccess.MANGER);

  ctx
    .command('wikio del <name> - mediawiki.descr.wikio.del')
    .action((data, session) => {
      const list = loadWikiData();
      const [name] = data.args as string[];
      saveConfig(
        getPath(),
        list.filter((content) => content.name !== name)
      );
      return ['mediawiki.msg.wikio.del', { input: name }];
    })
    .access(CommandAccess.MANGER);
}
