/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-05 15:08:42
 */
import { Api, type Message } from 'kotori-bot'
import type OnebotAdapter from './adapter'

export class OnebotApi extends Api {
  public readonly adapter: OnebotAdapter

  public constructor(adapter: OnebotAdapter) {
    super(adapter)
    this.adapter = adapter
  }

  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return [
      'on_message',
      'on_message_delete',
      'on_request',
      'on_group_increase',
      'on_group_decrease',
      'on_group_ban',
      'on_group_admin',
      'onebot_poke'
    ]
  }

  public async sendPrivateMsg(message: Message, userId: string) {
    return {
      messageId: String(
        (
          await this.adapter.call<{ message_id: number }>('send_private_msg', {
            user_id: Number(userId),
            message: this.adapter.elements.decode(message),
            auto_escape: false
          })
        ).message_id
      ),
      time: Date.now()
    }
  }

  /**
   * @description: 发送私聊消息
   * @param message 要发送的内容
   * @param groupId 群号
   */
  public async sendGroupMsg(message: Message, groupId: string) {
    return {
      messageId: String(
        (
          await this.adapter.call<{ message_id: number }>('send_group_msg', {
            group_id: Number(groupId),
            message: this.adapter.elements.decode(message),
            auto_escape: false
          })
        ).message_id
      ),
      time: Date.now()
    }
  }

  /**
   * @description: 撤回消息
   * @param messageId 消息id
   */
  public deleteMsg(messageId: string) {
    return this.adapter.call('delete_msg', { message_id: messageId })
  }

  public async getSelfInfo() {
    const data = await this.adapter.call<{ user_id: number; nickname: string }>('get_login_info')
    return {
      userId: String(data.user_id),
      username: data.nickname,
      userDisplayname: data.nickname
    }
  }

  public async getUserInfo(userId: string) {
    const data = await this.adapter.call<{ user_id: number; nickname: string; remark: string }>('get_stranger_info', {
      user_id: Number(userId)
    })
    return {
      userId: String(data.user_id),
      username: data.nickname,
      userDisplayname: data.nickname,
      userRemark: data.remark ?? ''
    }
  }

  public async getFriendList() {
    const data = await this.adapter.call<{ user_id: number; nickname: string; remark: string }[]>('get_friend_list')
    return data.map((item) => ({
      userId: String(item.user_id),
      username: item.nickname,
      userDisplayname: item.nickname,
      userRemark: item.remark ?? ''
    }))
  }

  public async getGroupInfo(groupId: string) {
    const data = await this.adapter.call<{ group_id: number; group_name: string; group_memo: string }>(
      'get_group_info',
      {
        group_id: Number(groupId)
      }
    )
    return {
      groupId: String(data.group_id),
      groupName: data.group_name,
      groupMemo: data.group_memo ?? ''
    }
  }

  public async getGroupList() {
    const data =
      await this.adapter.call<{ group_id: number; group_name: string; group_memo: string }[]>('get_group_list')
    return data.map((item) => ({
      groupId: String(item.group_id),
      groupName: item.group_name,
      groupMemo: item.group_memo ?? ''
    }))
  }

  public async getGroupMemberInfo(groupId: string, userId: string) {
    const data = await this.adapter.call<{
      group_id: number
      user_id: number
      nickname: string
      card: string
      join_time: number
      role: string
    }>('get_group_member_info', {
      group_id: Number(groupId),
      user_id: Number(userId)
    })
    return {
      userId: String(data.user_id),
      username: data.nickname,
      userDisplayname: data.card
    }
  }

  public async getGroupMemberList(groupId: string) {
    const data = await this.adapter.call<
      {
        group_id: number
        user_id: number
        nickname: string
        card: string
      }[]
    >('get_group_member_list', {
      group_id: Number(groupId)
    })
    return data.map((item) => ({
      userId: String(item.user_id),
      username: item.nickname,
      userDisplayname: item.card
    }))
  }

  /**
   * @description: 设置群名
   * @param groupId 群号
   * @param groupName 新群名
   */
  public setGroupName(groupId: string, groupName: string) {
    return this.adapter.call('set_group_name', { group_id: Number(groupId), group_name: groupName })
  }

  /**
   * @description: 退出群组
   * @param groupId 群号
   */
  public leaveGroup(groupId: string) {
    return this.adapter.call('set_group_leave', { group_id: Number(groupId), is_dismiss: false })
  }

  /**
   * @description: 设置群头像
   * @param groupId 群号
   * @param image 图片路径
   */
  public setGroupAvatar(groupId: string, image: string) {
    return this.adapter.call('set_group_portrait', { group_id: Number(groupId), file: image, cache: false })
  }

  /**
   * @description: 设置群管理员
   * @param groupId 群号
   * @param userId 要设置的管理员的QQ号
   * @param enable true为设置,false取消,默认true
   */
  public setGroupAdmin(groupId: string, userId: string, enable = true) {
    return this.adapter.call('set_group_admin', { group_id: Number(groupId), user_id: Number(userId), enable })
  }

  /**
   * @description: 设置群名片(群备注)
   * @param groupId 群号
   * @param userId 要设置的QQ号
   * @param card 群名片内容,不填或空字符串表示删除群名片
   */
  public setGroupCard(groupId: string, userId: string, card: string) {
    return this.adapter.call('set_group_card', { group_id: Number(groupId), user_id: Number(userId), card })
  }

  /**
   * @description: 群禁言
   * @param groupId 群号
   * @param userId 要禁言的QQ号,不填则为群禁言
   * @param time 禁言时长,单位秒,0表示取消禁言
   */
  public setGroupBan(groupId: string, userId?: string, time = 0) {
    return this.adapter.call('set_group_ban', { group_id: Number(groupId), user_id: Number(userId), duration: time })
  }

  public setGroupWholeBan(groupId: string, enable = true) {
    return this.adapter.call('set_group_whole_ban', { group_id: Number(groupId), enable })
  }

  /**
   * @description: 发送群公告
   * @param groupId 群号
   * @param content 公告内容
   * @param image 图片路径(可选)
   */
  public sendGroupNotice(groupId: string, content: string, image?: string) {
    return this.adapter.call('_send_group_notice', { group_id: Number(groupId), content, image })
  }

  /**
   * @description: 群组踢人
   * @param groupId 群号
   * @param userId 要踢的QQ号
   */
  public setGroupKick(groupId: string, userId: string) {
    return this.adapter.call('set_group_kick', {
      group_id: Number(groupId),
      user_id: Number(userId),
      reject_add_request: false
    })
  }
}

export default OnebotApi
