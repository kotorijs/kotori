import Kotori, { formatTime, getUuid, isObj, stringTemp } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

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

/* 

Kotori.command('uuid')
	.action(() => ['querytool.msg.uuid', { uuid: getUuid() }])
	.help('querytool.descr.uuid');
  Kotori.command('color')
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
