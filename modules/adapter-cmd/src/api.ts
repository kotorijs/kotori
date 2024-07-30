/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-30 19:06:41
 */
import { Api, type Message } from 'kotori-bot'

export class CmdApi extends Api {
  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send('send_private_msg', { user_id: userId, message })
    return { messageId: '', time: 0 }
  }
}

export default CmdApi
