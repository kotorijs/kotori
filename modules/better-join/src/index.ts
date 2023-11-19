import { Context, EventCallback, getRandomInt, stringTemp } from '@kotori-bot/kotori';
import data from './data';

export class Main {
	public constructor(Ctx: Context) {
		Ctx.on('group_increase', data => Main.handle(data));
	}

	private static handle: EventCallback<'group_increase'> = eventData => {
		for (let init = 0; init < getRandomInt(2); init += 1) {
			const message = stringTemp(data[getRandomInt(data.length - 1)], {
				at: `[CQ:at,qq=${eventData.userId}]`,
			});
			eventData.send(message);
		}
	};
}

export default Main;
