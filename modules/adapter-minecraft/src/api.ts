/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-05-02 17:22:10
 */
import { Api, type Message } from 'kotori-bot'
import type McAdapter from './adapter'

export class CmdApi extends Api {
  public readonly adapter: McAdapter

  public constructor(adapter: McAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send(String(userId), { msg: this.adapter.elements.decode(message) })
    return { messageId: String(this.adapter.messageId), time: Date.now() }
  }

  public async sendGroupMsg(message: Message, groupId: string) {
    this.adapter.send(String(groupId), { msg: this.adapter.elements.decode(message) })
    return { messageId: String(this.adapter.messageId), time: Date.now() }
  }
}

export default CmdApi
