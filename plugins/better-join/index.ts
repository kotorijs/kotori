import { temp } from 'plugins/kotori-core';
import { Event, Api, EventDataType, getRandomInt } from '@/tools';
import SDK from '@/utils/class.sdk';
import data from './data';

export class Main {
	public constructor(
		event: Event,
		private api: Api,
	) {
		event.listen('on_group_increase', data => this.handle(data));
	}

	private handle = (eventData: EventDataType) => {
		for (let init = 0; init < getRandomInt(2); init += 1) {
			const message = temp(data[getRandomInt(data.length - 1)], {
				at: SDK.cq_at(eventData.user_id),
			});
			this.api.send_group_msg(message, eventData.group_id!);
		}
	};
}

export default Main;
