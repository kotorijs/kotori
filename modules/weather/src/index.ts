import Kotori, { Tsu } from 'kotori-bot';
import { resolve } from 'path';

Kotori.uselang(resolve(__dirname, '../locales'));

Kotori.command('weather <area> - weather.descr.weather').action(async data => {
	const content = Tsu.String().parse(
		await Kotori.http.get('https://api.hotaru.icu/api/weather', { msg: data.args[0], b: 1 }),
	);
	return ['weather.msg.weather', { content }];
});
