import Kotori from 'kotori-bot';

export const lang = `${__dirname}../locales`;

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
