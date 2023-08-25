import { temp } from 'plugins/kotori-core';
import { Event, Api, EventDataType, getRandomInt } from '@/tools';
import SDK from '@/utils/class.sdk';
import data from './data';

export class Main {
	public constructor(event: Event, api: Api) {
		event.listen('on_group_increase', data => Main.handle(data, api));
	}

	private static handle = (eventData: EventDataType, api: Api) => {
		const message = temp(data[getRandomInt(data.length - 1)], {
			at: SDK.cq_at(eventData.user_id),
		});
		api.send_group_msg(message, eventData.group_id!);
	};
}

export default Main;
