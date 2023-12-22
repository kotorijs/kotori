import Kotori, { formatTime } from 'kotori-bot';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('motd')
	.action(async data => {
		const res = await Kotori.http.get('https://api.hotaru.icu/api/motd', { ip: data.args[0], port: data.args[1] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
			return [
				'minecraft.msg.motd.fail',
				{
					ip: data.args[0],
					port: data.args[1],
				},
			];
		}

		return [
			'minecraft.msg.motd',
			{
				...res.data,
				image: typeof res.data.icon === 'string' ? image(`base64://${res.data.icon.substring(22)}`) : '',
			},
		];
	})
	.help('minecraft.descr.motd');

Kotori.command('motdbe')
	.action(async data => {
		const res = await Kotori.http.get('https://api.hotaru.icu/api/motdpe', { ip: data.args[0], port: data.args[1] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
			return [
				'minecraft.msg.motdbe.fail',
				{
					ip: data.args[0],
					port: data.args[1],
				},
			];
		}

		return [
			'minecraft.msg.motdbe',
			{
				...res.data,
			},
		];
	})
	.help('minecraft.descr.motdbe');

Kotori.command('mcskin')
	.action(async data => {
		const res = await Kotori.http.get('https://api.hotaru.icu/api/mcskin', { name: data.args[0] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if (res.code === 502 || !isObj(res.data)) return ['minecraft.msg.mcskin.fail', { input: data.args[0] }];

		return [
			'minecraft.msg.mcskin',
			{
				input: data.args[0],
				skin: image(res.data.skin),
				cape: res.data.cape ? image(res.data.cape) : '',
				avatar: res.data.avatar ? image(`base64://${res.data.avatar.substring(22)}`) : '',
			},
		];
	})
	.help('minecraft.descr.mcskin');

Kotori.command('mcv')
	.action(async () => {
		const res = await Kotori.http.get('https://piston-meta.mojang.com/mc/game/version_manifest.json');
		if (!res || !res.latest || !Array.isArray(res.versions)) return 'BOT_RESULT.SERVER_ERROR';
		const res2 = await Kotori.http.get('https://bugs.mojang.com/rest/api/2/project/10200/versions');
		if (!res2 || !Array.isArray(res2)) return 'BOT_RESULT.SERVER_ERROR';
		const date = {
			releaseDate: '',
			snapshotDate: '',
			mcbe: '',
			mcbeDate: '',
		};
		let count = 0;
		for (const element of res.versions) {
			count += 1;
			if (count > 100) break;
			if (date.releaseDate && date.snapshotDate) break;
			if (element.id === res.latest.release) {
				date.releaseDate = formatTime(new Date(element.releaseTime));
				continue;
			}
			if (element.id === res.latest.snapshot) date.snapshotDate = formatTime(new Date(element.releaseTime));
		}
		for (const element of res2) {
			if (count > 100) break;
			if (!element.releaseDate) continue;
			date.mcbe = element.name;
			date.mcbeDate = formatTime(new Date(element.releaseDate));
			break;
		}

		return ['minecraft.msg.mcv', { ...res.latest, ...date }];
	})
	.help('minecraft.descr.mcv');
