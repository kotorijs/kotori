/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-05-02 17:22:10
 */
import { Api, string, Message } from 'kotori-bot'

export class CmdApi extends Api {
  public sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send(String(userId), { msg: message })
  }

  public sendGroupMsg(message: Message, groupId: string) {
    this.adapter.send(String(groupId), { msg: message })
  }
}

export default CmdApi
