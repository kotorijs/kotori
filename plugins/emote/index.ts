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
	send('emote.cmd.feel.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/mo.php?QQ=${target}`),
	});
})
	.descr('emote.cmd.feel.descr')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('climb', (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('emote.cmd.climb.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/pa/pa.php?qq=${target}`),
	});
})
	.descr('emote.cmd.climb.descr')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('threaten', (send, data) => {
	const target = getQq(Core.args[1]) || data.user_id;
	send('emote.cmd.threaten.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/weixie.php?QQ=${target}`),
	});
})
	.descr('emote.cmd.threaten.descr')
	.params([
		{
			must: false,
			name: 'QQ/At',
		},
	]);

Cmd('hold', (send, data) => {
	send('emote.cmd.hold.info', {
		image: SDK.cq_image(`http://api.tombk.cn/API/dtt/qian.php?qq1=${data.user_id}&qq2=${getQq(Core.args[1])}`),
	});
})
	.descr('emote.cmd.hold.descr')
	.params([
		{
			must: true,
			name: 'QQ/At',
		},
	]);
