import path from 'path';
import { Core, getQq } from 'plugins/kotori-core';
import { CoreVal } from 'plugins/kotori-core/type';
import SDK from '@/utils/class.sdk';
import { Locale } from '@/tools';

Locale.register(path.resolve(__dirname));

const Cmd = (keyword: string, callback: CoreVal) => {
	const result = Core.cmd(keyword, callback).menuId('funSys');
	return result;
};

Cmd('feel', (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('emote.msg.feel.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/mo.php?QQ=${target}`),
	});
})
	.help('emote.help.feel')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('climb', (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('emote.msg.climb.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/pa/pa.php?qq=${target}`),
	});
})
	.help('emote.help.climb')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('threaten', (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('emote.msg.threaten.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/weixie.php?QQ=${target}`),
	});
})
	.help('emote.help.threaten')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('hold', (send, data) => {
	send('emote.msg.hold.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/qian.php?qq1=${data.user_id}&qq2=${getQq(Core.args[1])}`),
	});
})
	.help('emote.help.hold')
	.params([
		{
			must: true,
			name: 'QQ/At',
		},
	]);
