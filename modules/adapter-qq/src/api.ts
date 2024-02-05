import { Api, MessageRaw } from 'kotori-bot';

export default class QQApi extends Api {
  sendGroupMsg(message: MessageRaw, groupId: string, msgId: string) {
    const handle = message
      .replace(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/g, '[[hidden:link]]')
      .replace(/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g, '[[hidden:domain]]');
    this.adapter.send('send_group_msg', { message: handle, groupId, id: msgId });
  }
}
