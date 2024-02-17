/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-02-17 15:06:37
 */
import { Api, MessageRaw } from 'kotori-bot';

export class SandboxApi extends Api {
  sendPrivateMsg(message: MessageRaw, userId: number) {
    this.adapter.status.lastMsgTime = new Date();
    this.adapter.status.sentMsg += 1;
    this.adapter.send('send_private_msg', { userId, message });
  }

  /**
   * @description: 发送私聊消息
   * @param {Msg} message 要发送的内容
   * @param {groupId} groupId 群号
   * @return {void}
   */
  sendGroupMsg(message: MessageRaw, groupId: number) {
    this.adapter.status.lastMsgTime = new Date();
    this.adapter.status.sentMsg += 1;
    this.adapter.send('send_group_msg', { groupId, message });
  }
}

export default SandboxApi;
