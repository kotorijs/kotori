import Kotori, { formatTime, getUuid, isObj, stringTemp } from 'kotori-bot';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

const image(file: string, cache: boolean = true)  `[CQ:image,file=${file}],cache=${cache ? 1 : 0}`;

Kotori.command('github <repository> - querytool.descr.github').action(async data => {
	const res = await Kotori.http.get(`https://api.github.com/repos/${data.args[0]}`);
	if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
	if (!res.full_name) return ['querytool.msg.github.fail', { input: data.args[0] }];
	data.quick([
		'querytool.msg.github',
		{
			name: res.full_name || 'BOT_RESULT.EMPTY',
			description: res.description || 'BOT_RESULT.EMPTY',
			language: res.language || 'BOT_RESULT.EMPTY',
			author: res.owner ? res.owner.login || 'BOT_RESULT.EMPTY' : 'BOT_RESULT.EMPTY',
			create: res.created_at || 'BOT_RESULT.EMPTY',
			update: res.updated_at || 'BOT_RESULT.EMPTY',
			push: res.pushed_at || 'BOT_RESULT.EMPTY',
			license: res.license ? res.license.name || 'BOT_RESULT.EMPTY' : 'BOT_RESULT.EMPTY',
		},
	]);
	return `[CQ:image,file=https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0/${res.full_name}]`;
});

Kotori.command('motd')
	.action(async data => {
		const res = await Kotori.http.get('motd', { ip: data.args[0], port: data.args[1] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
			return [
				'querytool.msg.motd.fail',
				{
					ip: data.args[0],
					port: data.args[1],
				},
			];
		}

		return [
			'querytool.msg.motd',
			{
				...res.data,
				image: typeof res.data.icon === 'string' ? image(`base64://${res.data.icon.substring(22)}`) : '',
			},
		];
	})
	.help('querytool.descr.motd');

Kotori.command('motdbe')
	.action(async data => {
		const res = await Kotori.http.get('motdpe', {
			ip: data.args[0],
			port: data.args[1],
		});
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
			return [
				'querytool.msg.motdbe.fail',
				{
					ip: data.args[0],
					port: data.args[1],
				},
			];
		}

		return [
			'querytool.msg.motdbe',
			{
				...res.data,
			},
		];
	})
	.help('querytool.descr.motdbe');

Kotori.command('mcskin')
	.action(async data => {
		const res = await Kotori.http.get('mcskin', { name: data.args[0] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if (res.code === 502 || !isObj(res.data)) return ['querytool.msg.mcskin.fail', { input: data.args[0] }];

		return [
			'querytool.msg.mcskin',
			{
				input: data.args[0],
				skin: image(res.data.skin),
				cape: res.data.cape ? image(res.data.cape) : '',
				avatar: res.data.avatar ? image(`base64://${res.data.avatar.substring(22)}`) : '',
			},
		];
	})
	.help('querytool.descr.mcskin');

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

		return ['querytool.msg.mcv', { ...res.latest, ...date }];
	})
	.help('querytool.descr.mcv');

Kotori.command('sed')
	.action(async (data, message) => {
		if (data.args[0] === message.api.adapter.selfId.toString())
			return ['querytool.msg.sed.fail', { input: data.args[0] }];

		const res = await Kotori.http.get('sed', { msg: data.args[0] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if (res.code === 501 || !isObj(res.data)) return ['querytool.msg.sed.fail', { input: data.args[0] }];
		let list = '';
		list += res.data.qq
			? stringTemp('querytool.msg.sed.list', {
					key: message.locale('querytool.msg.sed.key.qq'),
					content: res.data.qq,
			  })
			: '';
		list += res.data.phone
			? stringTemp('querytool.msg.sed.list', {
					key: message.locale('querytool.msg.sed.key.phone'),
					content: res.data.phone,
			  })
			: '';
		list += res.data.location
			? stringTemp('querytool.msg.sed.list', {
					key: message.locale('querytool.msg.sed.key.location'),
					content: res.data.location,
			  })
			: '';
		list += res.data.id
			? stringTemp('querytool.msg.sed.list', {
					key: message.locale('querytool.msg.sed.key.id'),
					content: res.data.id,
			  })
			: '';
		list += res.data.area
			? stringTemp('querytool.msg.sed.list', {
					key: message.locale('querytool.msg.sed.key.area'),
					content: res.data.area,
			  })
			: '';
		return [
			'querytool.msg.sed',
			{
				input: data.args[0],
				time: Math.floor(res.takeTime),
				count: res.count,
				list,
			},
		];
	})
	.help('querytool.descr.sed');

Kotori.command('idcard')
	.action(async data => {
		const res = await Kotori.http.get('idcard', { msg: data.args[0] });
		if (!isObj(res)) return ['BOT_RESULT.SERVER_ERROR', { res }];
		if (res.code === 501 || !isObj(res.data)) return ['querytool.msg.idcard.fail', { input: data.args[0] }];

		return [
			'querytool.msg.idcard',
			{
				input: data.args[0],
				...res.data,
			},
		];
	})
	.help('querytool.descr.idcard');

Kotori.command('hcb')
	.action(async data => {
		const res = await Kotori.http.get('https://hcb.hotaru.icu/api/v3', {
			value: data.args[0],
		});
		if (!res || res.code !== 500 || !isObj(res.data) || Array.isArray(res.data))
			return [
				'BOT_RESULT.SERVER_ERROR',
				{
					/* res */
				},
			];

		if (!res.data.status) return ['querytool.msg.hcb.fail', { input: data.args[0] }];

		const imgs = '';
		/* 	if (res.data.imgs !== null) {
		(<string[]>res.data.imgs).forEach(element => {
			imgs += image(element);
		});
	} */
		return [
			'querytool.msg.hcb',
			{
				input: data.args[0],
				// ...res.data,
				images: imgs || 'BOT_RESULT.EMPTY',
			},
		];
	})
	.help('querytool.descr.hcb');

Kotori.command('uuid')
	.action(() => ['querytool.msg.uuid', { uuid: getUuid() }])
	.help('querytool.descr.uuid');

/* Kotori.command('color')
	.action(async () => {
		let r = Math.floor(Math.random() * 256);
		let g = Math.floor(Math.random() * 256);
		let b = Math.floor(Math.random() * 256);
		const componentToHex(c: number)  {
			const hex = c.toString(16);
			return hex.length === 1 ? `0${hex}` : hex;
		};
		const hex = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
		const rgb = `rgb(${r}, ${g}, ${b})`;

		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const l = (max + min) / 2;
		let h = 0;
		let s;

		if (max === min) {
			h = 0;
			s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h *= 60;
		}
		const hsl = `hsl(${Math.floor(h)}, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%)`;

		const browser = await puppeteer.launch({ headless: 'new' });
		const page = await browser.newPage();
		await page.setViewport({ width: 500, height: 500 });
		await page.evaluate(color => {
			document.body.style.backgroundColor = color;
		}, hex);
		const buffer = await page.screenshot({ encoding: 'base64' });
		await browser.close();
		return ['querytool.msg.color', { hex, rgb, hsl, image: image(`base64://${buffer}`) }];
	})
	.help('querytool.descr.color'); */
