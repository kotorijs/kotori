import { Api, MessageRaw } from 'kotori-bot';

export default class QQApi extends Api {
	public send_group_msg(message: MessageRaw, groupId: string, msgId: unknown) {
		this.adapter.send('send_group_msg', { message, groupId, msgId });
	}
}
