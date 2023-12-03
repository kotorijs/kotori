import { Context, EventCallback, getRandomInt } from 'kotori-bot';
import data from './data';

export class Main {
	public constructor(Ctx: Context) {
		Ctx.on('group_increase', data => Main.handle(data));
	}

	private static handle: EventCallback<'group_increase'> = session => {
		for (let init = 0; init < getRandomInt(2); init += 1) {
			session.send(
				`${session.api.extra.type === 'onebot' ? `${session.api.extra.at(session.userId)} ` : ''}${data[init]}`,
			);
		}
	};
}

export default Main;
