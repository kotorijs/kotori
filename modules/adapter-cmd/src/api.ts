/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-02 16:21:22
 */
import { Api, string, Message } from 'kotori-bot'

export class CmdApi extends Api {
  public sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send('send_private_msg', { user_id: userId, message })
  }
}

export default CmdApi
