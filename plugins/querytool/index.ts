import path from 'path';
import { Core, fetchT, temp } from 'plugins/kotori-core';
import { fetchJ } from 'plugins/kotori-core/method';
import { CoreVal, CoreKeyword, BOT_RESULT } from 'plugins/kotori-core/type';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { Locale, getUuid, isObj } from '@/tools';
import SDK from '@/utils/class.sdk';

Locale.register(path.resolve(__dirname));

const Cmd = (keyword: CoreKeyword, callback: CoreVal) => {
	const result = Core.cmd(keyword, callback).menuId('queryTool');
	return result;
};

Cmd('github', async send => {
	const res = await fetchJ(`https://api.github.com/repos/${Core.args[1]}`);
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (!res.full_name) return ['querytool.cmd.github.fail', { input: Core.args[1] }];
	send('querytool.cmd.github.info', {
		name: res.full_name || BOT_RESULT.EMPTY,
		description: res.description || BOT_RESULT.EMPTY,
		language: res.language || BOT_RESULT.EMPTY,
		author: res.owner ? res.owner.login || BOT_RESULT.EMPTY : BOT_RESULT.EMPTY,
		create: res.created_at || BOT_RESULT.EMPTY,
		update: res.updated_at || BOT_RESULT.EMPTY,
		push: res.pushed_at || BOT_RESULT.EMPTY,
		license: res.license ? res.license.name || BOT_RESULT.EMPTY : BOT_RESULT.EMPTY,
	});
	return SDK.cq_image(
		`https://opengraph.githubassets.com/c9f4179f4d560950b2355c82aa2b7750bffd945744f9b8ea3f93cc24779745a0/${res.full_name}`,
	);
})
	.descr('querytool.cmd.github.descr')
	.params([
		{
			must: true,
			name: 'repository',
		},
	]);

Cmd('motd', async () => {
	const res = await fetchJ('motd', { ip: Core.args[1], port: Core.args[2] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
		return [
			'querytool.cmd.motd.fail',
			{
				ip: Core.args[1],
				port: Core.args[2],
			},
		];
	}

	return [
		'querytool.cmd.motd.info',
		{
			...res.data,
			image:
				typeof res.data.icon === 'string'
					? SDK.cq_image(`base64://${res.data.icon.substring(22)}`)
					: BOT_RESULT.EMPTY,
		},
	];
})
	.descr('querytool.cmd.motd.descr')
	.params([
		{
			must: true,
			name: 'ip',
		},
		{
			must: '25565',
			name: 'port',
		},
	]);

Cmd('motdbe', async () => {
	const res = await fetchJ('motdpe', {
		ip: Core.args[1],
		port: Core.args[2],
	});
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if ((res.code !== 500 && typeof res.code === 'number') || !isObj(res.data)) {
		return [
			'querytool.cmd.motdbe.fail',
			{
				ip: Core.args[1],
				port: Core.args[2],
			},
		];
	}

	return [
		'querytool.cmd.motdbe.info',
		{
			...res.data,
		},
	];
})
	.descr('querytool.cmd.motdbe.descr')
	.params([
		{
			must: true,
			name: 'ip',
		},
		{
			must: '19132',
			name: 'port',
		},
	]);

Cmd('mcskin', async () => {
	const res = await fetchJ('mcskin', { name: Core.args[1] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code === 502 || !isObj(res.data)) return ['querytool.cmd.mcskin.fail', { input: Core.args[1] }];

	return [
		'querytool.cmd.mcskin.info',
		{
			input: Core.args[1],
			skin: SDK.cq_image(res.data.skin),
			cape: res.data.cape ? SDK.cq_image(res.data.cape) : BOT_RESULT.EMPTY,
			avatar: res.data.avatar ? SDK.cq_image(`base64://${res.data.avatar.substring(22)}`) : BOT_RESULT.EMPTY,
		},
	];
})
	.descr('querytool.cmd.mcskin.descr')
	.params([
		{
			must: true,
			name: 'id',
		},
	]);

Cmd('sed', async (_send, data) => {
	if (Core.args[1] === data.self_id.toString()) return ['querytool.cmd.sed.fail', { input: Core.args[1] }];

	const res = await fetchJ('sed', { msg: Core.args[1] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code === 501 || !isObj(res.data)) return ['querytool.cmd.sed.fail', { input: Core.args[1] }];
	let list = '';
	list += res.data.qq
		? temp('querytool.cmd.sed.list', {
				key: 'querytool.cmd.sed.key.qq',
				content: res.data.qq,
		  })
		: '';
	list += res.data.phone
		? temp('querytool.cmd.sed.list', {
				key: 'querytool.cmd.sed.key.phone',
				content: res.data.phone,
		  })
		: '';
	list += res.data.location
		? temp('querytool.cmd.sed.list', {
				key: 'querytool.cmd.sed.key.location',
				content: res.data.location,
		  })
		: '';
	list += res.data.id
		? temp('querytool.cmd.sed.list', {
				key: 'querytool.cmd.sed.key.id',
				content: res.data.id,
		  })
		: '';
	list += res.data.area
		? temp('querytool.cmd.sed.list', {
				key: 'querytool.cmd.sed.key.area',
				content: res.data.area,
		  })
		: '';
	return [
		'querytool.cmd.sed.info',
		{
			input: Core.args[1],
			time: Math.floor(res.takeTime),
			count: res.count,
			list,
		},
	];
})
	.descr('querytool.cmd.sed.descr')
	.params([
		{
			must: true,
			name: 'qq/phone',
		},
	]);

Cmd('idcard', async () => {
	const res = await fetchJ('idcard', { msg: Core.args[1] });
	if (!isObj(res)) return [BOT_RESULT.SERVER_ERROR, { res }];
	if (res.code === 501 || !isObj(res.data)) return ['querytool.cmd.idcard.fail', { input: Core.args[1] }];

	return [
		'querytool.cmd.idcard.info',
		{
			input: Core.args[1],
			...res.data,
		},
	];
})
	.descr('querytool.cmd.idcard.descr')
	.params([
		{
			must: true,
			name: 'idcard',
		},
	]);

Cmd('hcb', async () => {
	const res = await fetchJ('https://hcb.imlolicon.tk/api/v3', {
		value: Core.args[1],
	});
	if (!res || res.code !== 500 || !isObj(res.data) || Array.isArray(res.data))
		return [BOT_RESULT.SERVER_ERROR, { res }];

	if (!res.data.status) return ['querytool.cmd.hcb.fail', { input: Core.args[1] }];

	let imgs = '';
	if (res.data.imgs !== null) {
		(<string[]>res.data.imgs).forEach(element => {
			imgs += SDK.cq_image(element);
		});
	}
	return [
		'querytool.cmd.hcb.info',
		{
			input: Core.args[1],
			...res.data,
			images: imgs || BOT_RESULT.EMPTY,
		},
	];
})
	.descr('querytool.cmd.hcb.descr')
	.params([
		{
			must: true,
			name: 'id',
		},
	]);

Cmd('uuid', () => ['querytool.cmd.uuid.info', { uuid: getUuid() }]).descr('querytool.cmd.uuid.descr');

Cmd('color', async () => {
	let r = Math.floor(Math.random() * 256);
	let g = Math.floor(Math.random() * 256);
	let b = Math.floor(Math.random() * 256);
	const componentToHex = (c: number) => {
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
	return ['querytool.cmd.color.info', { hex, rgb, hsl, image: SDK.cq_image(`base64://${buffer}`) }];
}).descr('querytool.cmd.color.descr');

Cmd('header', async send => {
	const res = await fetchT(Core.args[1]);
	if (!res) return [BOT_RESULT.SERVER_ERROR, { res }];
	const $ = cheerio.load(res);

	let image = $('link[rel="icon"]').attr('href');
	image = image || $(/* html */ `link[rel="shortcut icon"]`).attr('href');
	const domain = Core.args[1].match(/^https?:\/\/([^/]+)/i);
	if (image) {
		image = image.includes('http')
			? image
			: `http://${Array.isArray(domain) ? domain[1] : ''}${image.substring(0, 1) === '/' ? '' : '/'}${image}`;
	} else {
		image = '';
	}
	const title = $('title').text() ?? BOT_RESULT.EMPTY;
	const keywords = $('meta[name="keywords"]').attr('content') ?? BOT_RESULT.EMPTY;
	const description = $('meta[name="description"]').attr('content') ?? BOT_RESULT.EMPTY;
	send('querytool.cmd.header.info', {
		input: Core.args[1],
		title,
		keywords,
		description,
	});
	if (image) return ['querytool.cmd.header.image', { image: SDK.cq_image(image) }];
	return '';
})
	.descr('querytool.cmd.header.descr')
	.params([
		{
			must: true,
			name: 'url',
		},
	]);

Cmd('state', async () => {
	const res = await fetchT('webtool', { op: 1, url: Core.args[1] });
	return [
		res ? 'querytool.cmd.state.info' : BOT_RESULT.SERVER_ERROR,
		res ? { content: res.replace(/<br>/g, '\n') } : { res },
	];
})
	.descr('querytool.cmd.state.descr')
	.params([
		{
			must: true,
			name: 'url',
		},
	]);

Cmd('speed', async () => {
	const res = await fetchT('webtool', { op: 3, url: Core.args[1] });
	return [
		res ? 'querytool.cmd.speed.info' : BOT_RESULT.SERVER_ERROR,
		res ? { content: res.replace(/<br>/g, '\n') } : { res },
	];
})
	.descr('querytool.cmd.speed.descr')
	.params([
		{
			must: true,
			name: 'url',
		},
	]);
