/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-07-11 10:31:22
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 17:18:18
 */
import { Event, Api, stringProcess, stringSplit, EventDataType } from '@/tools';
import config from './config';

const url = 'http://chatgpt.hotaru.icu/v1/chat/completions';

const requestOptions = (message: string) => ({
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${config.apikey}`,
	},
	body: JSON.stringify({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				content: message,
			},
		],
	}),
});

export default (event: Event, api: Api) => {
	function methodGroup(data: EventDataType) {
		if (!stringProcess(data.group_id!, config.list.groups)) return;
		if (!stringProcess(data.message, config.prefix)) return;

		const message = stringSplit(data.message, config.prefix);
		fetch(url, requestOptions(message))
			.then(response => response.json())
			.then(res => {
				api.send_group_msg(res.choices[0].message.content, data.group_id!);
			});
	}

	function methodPrivate(data: EventDataType) {
		if (!stringProcess(data.user_id, config.list.users)) return;
		if (!stringProcess(data.message, config.prefix)) return;

		const message = stringSplit(data.message, config.prefix);
		fetch(url, requestOptions(message))
			.then(response => response.json())
			.then(res => {
				api.send_private_msg(res.choices[0].message.content, data.user_id);
			});
	}

	event.listen('on_group_msg', methodGroup);
	event.listen('on_private_msg', methodPrivate);
};
