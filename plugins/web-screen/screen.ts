import puppeteer from 'puppeteer';

export default async function screenshot(url: string) {
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();

	await page.setViewport({
		width: 1980,
		height: 1080,
	});

	await page.goto(url);

	const buffer = await page.screenshot({
		encoding: 'base64',
	});

	await browser.close();

	return buffer;
}
