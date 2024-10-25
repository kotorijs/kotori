/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-05 16:56:25
 */
import { Api, type Tsu, type Message, type UserInfoResponse, type GroupInfoResponse } from 'kotori-bot'
import type SandboxAdapter from './adapter'
import type { responseSchema } from './type'

export class SandboxApi extends Api {
  private factory<T>(callback: (data: Tsu.infer<typeof responseSchema>) => null | T) {
    return new Promise<T>((resolve) => {
      const register = () =>
        this.adapter.ctx.once('literal_sandbox_response', (data) => {
          const result = callback(data)
          if (!result) {
            register()
            return
          }
          resolve(result)
        })
    })
  }

  public readonly adapter: SandboxAdapter

  public constructor(adapter: SandboxAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return [
      'on_message',
      'on_message_delete',
      'on_group_increase',
      'on_group_decrease',
      'on_group_whole_ban',
      'on_friend_decrease',
      'on_friend_increase',
      'on_group_ban',
      'on_group_admin'
    ]
  }

  public sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send({ action: 'send_private_msg', message: this.adapter.elements.decode(message), userId })
    return this.factory((data) => (!Array.isArray(data) && data.response === 'send_message_response' ? data : null))
  }

  public sendGroupMsg(message: Message, groupId: string) {
    this.adapter.send({ action: 'send_group_msg', message: this.adapter.elements.decode(message), groupId })
    return this.factory((data) => (!Array.isArray(data) && data.response === 'send_message_response' ? data : null))
  }

  public deleteMsg(messageId: string) {
    this.adapter.send({ action: 'delete_msg', messageId })
  }

  public async getSelfInfo() {
    this.adapter.send({ action: 'get_self_info' })
    return this.factory((data) => (!Array.isArray(data) && data.response === 'self_info_response' ? data : null))
  }

  public async getUserInfo(userId: string) {
    this.adapter.send({ action: 'get_user_info', userId })
    return this.factory((data) => (!Array.isArray(data) && data.response === 'user_info_response' ? data : null))
  }

  public async getFriendList() {
    this.adapter.send({ action: 'get_friend_list' })
    return this.factory((data) =>
      Array.isArray(data) && (data.length === 0 || data[0].response === 'user_info_response')
        ? (data as UserInfoResponse[])
        : null
    )
  }

  public async getGroupInfo(groupId: string) {
    this.adapter.send({ action: 'get_group_info', groupId })
    return this.factory((data) => (!Array.isArray(data) && data.response === 'group_info_response' ? data : null))
  }

  public async getGroupList() {
    this.adapter.send({ action: 'get_group_list' })
    return this.factory((data) =>
      Array.isArray(data) && (data.length === 0 || data[0].response === 'group_info_response')
        ? (data as GroupInfoResponse[])
        : null
    )
  }

  public async getGroupMemberInfo(groupId: string, userId: string) {
    this.adapter.send({ action: 'get_group_member_info', groupId, userId })
    return this.factory((data) =>
      !Array.isArray(data) && data.response === 'group_member_info_response' ? data : null
    )
  }

  public async getGroupMemberList(groupId: string) {
    this.adapter.send({ action: 'get_group_member_list', groupId })
    return this.factory((data) =>
      Array.isArray(data) && (data.length === 0 || data[0].response === 'group_member_info_response')
        ? (data as UserInfoResponse[])
        : null
    )
  }

  public setGroupName(groupId: string, groupName: string) {
    this.adapter.send({ action: 'set_group_name', groupId, groupName })
  }

  public leaveGroup(groupId: string) {
    this.adapter.send({ action: 'leave_group', groupId })
  }

  public setGroupAdmin(groupId: string, userId: string, enable: boolean) {
    this.adapter.send({ action: 'set_group_admin', groupId, userId, enable })
  }

  public setGroupCard(groupId: string, userId: string, card: string) {
    this.adapter.send({ action: 'set_group_card', groupId, userId, card })
  }

  public setGroupBan(groupId: string, userId: string, time: number) {
    this.adapter.send({ action: 'set_group_ban', groupId, userId, time })
  }

  public setGroupWholeBan(groupId: string, enable = true) {
    this.adapter.send({ action: 'set_group_whole_ban', groupId, enable })
  }

  public setGroupKick(groupId: string, userId: string) {
    this.adapter.send({ action: 'set_group_kick', groupId, userId })
  }
}

export default SandboxApi
