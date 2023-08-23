import path from 'path';
import { Core, fetchT } from 'plugins/kotori-core';
import { fetchJ } from 'plugins/kotori-core/method';
import { BOT_RESULT, CoreValCallbackVal } from 'plugins/kotori-core/type';
import { Locale, isObj } from '@/tools';

Locale.register(path.resolve(__dirname));

Core.cmd(
	'hitokotos',
	'%HEAD%' +
		'\n一言 一言2' +
		'\n诗词 情话' +
		'\n骚话 笑话' +
		'\n人生语录 社会语录' +
		'\n网抑云 毒鸡汤' +
		'\n舔狗语录 爱情语录' +
		'\n温柔语录 个性签名' +
		'\n经典语录 英汉语录',
)
	.descr('hitokotos.menu.hitokotos.descr')
	.menuId('main');

Core.alias('一言', async () => {
	const res = await fetchJ('https://imlolicon.tk/api/hitokoto/v2/');
	if (!isObj(res) || !isObj(res.data)) return [BOT_RESULT.SERVER_ERROR, { res }];

	return [
		'hitokotos.cmd.hitokoto.info',
		{
			...res.data,
			from: res.data.from.trim() ? `——${res.data.from}` : '',
		},
	];
});

const hitokotoT = async (msg: number): Promise<CoreValCallbackVal> => {
	const res = await fetchT('words', { msg, format: 'text' });
	if (!res) return [BOT_RESULT.SERVER_ERROR, { res }];
	return ['hitokotos.cmd.list.info', { content: res }];
};

Core.alias('一言2', () => hitokotoT(1));
Core.alias('骚话', () => hitokotoT(2));
Core.alias('情话', () => hitokotoT(3));
Core.alias('人生语录', () => hitokotoT(4));
Core.alias('社会语录', () => hitokotoT(5));
Core.alias('毒鸡汤', () => hitokotoT(6));
Core.alias('笑话', () => hitokotoT(7));
Core.alias('网抑云', () => hitokotoT(8));
Core.alias('温柔语录', () => hitokotoT(9));
Core.alias('舔狗语录', () => hitokotoT(10));
Core.alias('爱情语录', () => hitokotoT(11));
Core.alias('个性签名', () => hitokotoT(12));
Core.alias('经典语录', () => hitokotoT(14));
Core.alias('英汉语录', () => hitokotoT(15));
Core.alias('诗词', () => hitokotoT(16));
