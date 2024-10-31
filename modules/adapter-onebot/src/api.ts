/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-08-05 15:08:42
 */
import { Api, Tsu, type Message, KotoriError } from 'kotori-bot'
import type OnebotAdapter from './adapter'
import type { EventDataType } from './types'

export class OnebotApi extends Api {
  private factory<T>(callback: (data: Exclude<EventDataType['data'], undefined> | object) => null | T) {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new KotoriError('data response timeout'))
        this.adapter.ctx.off('literal_onebot_raw_data', handler)
      }, 10 * 1000)
      const handler = (data: Exclude<EventDataType['data'], undefined> | object) => {
        const result = callback(data)
        if (!result) return
        this.adapter.ctx.off('literal_onebot_raw_data', handler)
        clearTimeout(timer)
        resolve(result)
      }
      this.adapter.ctx.on('literal_onebot_raw_data', handler)
    })
  }

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

  public sendPrivateMsg(message: Message, userId: string) {
    this.adapter.send('send_private_msg', {
      user_id: Number(userId),
      message: this.adapter.elements.decode(message),
      auto_escape: false
    })
    return this.factory((data) => {
      if (Object.keys(data).length !== 1 || !('message_id' in data)) return null
      this.adapter.ctx.emit('send', { api: this, messageId: String(data.message_id) })
      return { messageId: String(data.message_id), time: Date.now() }
    })
  }

  /**
   * @description: 发送私聊消息
   * @param message 要发送的内容
   * @param groupId 群号
   */
  public sendGroupMsg(message: Message, groupId: string) {
    this.adapter.send('send_group_msg', {
      group_id: Number(groupId),
      message: this.adapter.elements.decode(message),
      auto_escape: false
    })
    return this.factory((data) => {
      if (Object.keys(data).length !== 1 || !('message_id' in data)) return null
      this.adapter.ctx.emit('send', { api: this, messageId: String(data.message_id) })
      return { messageId: String(data.message_id), time: Date.now() }
    })
  }

  /**
   * @description: 撤回消息
   * @param messageId 消息id
   */
  public deleteMsg(messageId: string) {
    this.adapter.send('delete_msg', { messageId })
  }

  public getSelfInfo() {
    this.adapter.send('get_login_info')
    return this.factory((data) => {
      if (Object.keys(data).length !== 2 || !('user_id' in data) || !('nickname' in data)) return null
      return {
        userId: String(data.user_id),
        username: String(data.nickname),
        userDisplayname: String(data.nickname)
      }
    })
  }

  public getUserInfo(userId: string) {
    this.adapter.send('get_stranger_info', { user_id: Number(userId) })
    return this.factory((data) => {
      const result = Tsu.Object({
        user_Id: Tsu.Number(),
        nickname: Tsu.String(),
        sex: Tsu.String(),
        qid: Tsu.String()
      }).parseSafe(data)
      if (!result.value) return null
      return {
        userId: result.data.user_Id.toString(),
        username: result.data.nickname,
        userDisplayname: result.data.nickname,
        userRemark: ''
      }
    })
  }

  public getFriendList() {
    this.adapter.send('get_friend_list')
    return this.factory((data) => {
      const result = Tsu.Array(
        Tsu.Object({
          user_id: Tsu.Number(),
          nickname: Tsu.String(),
          remark: Tsu.String()
        })
      ).parseSafe(data)

      if (!result.value) return null
      return result.data.map((item) => ({
        userId: item.user_id.toString(),
        username: item.nickname,
        userDisplayname: item.nickname,
        userRemark: ''
      }))
    })
  }

  public getGroupInfo(groupId: string) {
    this.adapter.send('get_group_info', { group_id: Number(groupId) })
    return this.factory((data) => {
      const result = Tsu.Object({
        group_id: Tsu.Number(),
        group_name: Tsu.String(),
        group_memo: Tsu.String()
      }).parseSafe(data)
      if (!result.value) return null
      return { groupId: result.data.group_id.toString(), groupName: result.data.group_name }
    })
  }

  public getGroupList() {
    this.adapter.send('get_group_list')
    return this.factory((data) => {
      const result = Tsu.Array(
        Tsu.Object({
          group_id: Tsu.Number(),
          group_name: Tsu.String(),
          group_memo: Tsu.String()
        })
      ).parseSafe(data)
      if (!result.value) return null
      return result.data.map((item) => ({
        groupId: item.group_id.toString(),
        groupName: item.group_name
      }))
    })
  }

  public getGroupMemberInfo(groupId: string, userId: string) {
    this.adapter.send('get_group_member_info', { group_id: Number(groupId), user_id: Number(userId) })
    return this.factory((data) => {
      const result = Tsu.Object({
        group_id: Tsu.Number(),
        user_id: Tsu.Number(),
        nickname: Tsu.String(),
        card: Tsu.String(),
        join_time: Tsu.Number(),
        role: Tsu.String()
      }).parseSafe(data)
      if (!result.value) return null
      return {
        userId: result.data.user_id.toString(),
        username: result.data.nickname,
        userDisplayname: result.data.card
      }
    })
  }

  public getGroupMemberList(groupId: string) {
    this.adapter.send('get_group_member_list', { group_id: Number(groupId) })
    return this.factory((data) => {
      const result = Tsu.Array(
        Tsu.Object({
          group_id: Tsu.Number(),
          user_id: Tsu.Number(),
          nickname: Tsu.String(),
          card: Tsu.String()
        })
      ).parseSafe(data)
      if (!result.value) return null
      return result.data.map((item) => ({
        userId: item.user_id.toString(),
        username: item.nickname,
        userDisplayname: item.card
      }))
    })
  }

  /**
   * @description: 设置群名
   * @param groupId 群号
   * @param groupName 新群名
   */
  public setGroupName(groupId: string, groupName: string) {
    this.adapter.send('set_group_name', { group_id: Number(groupId), group_name: groupName })
  }

  /**
   * @description: 退出群组
   * @param groupId 群号
   */
  public leaveGroup(groupId: string) {
    this.adapter.send('set_group_leave', { group_id: Number(groupId), is_dismiss: false })
  }

  /**
   * @description: 设置群头像
   * @param groupId 群号
   * @param image 图片路径
   */
  public setGroupAvatar(groupId: string, image: string) {
    this.adapter.send('set_group_portrait', { group_id: Number(groupId), file: image, cache: false })
  }

  /**
   * @description: 设置群管理员
   * @param groupId 群号
   * @param userId 要设置的管理员的QQ号
   * @param enable true为设置,false取消,默认true
   */
  public setGroupAdmin(groupId: string, userId: string, enable = true) {
    this.adapter.send('set_group_admin', { group_id: Number(groupId), user_id: Number(userId), enable })
  }

  /**
   * @description: 设置群名片(群备注)
   * @param groupId 群号
   * @param userId 要设置的QQ号
   * @param card 群名片内容,不填或空字符串表示删除群名片
   */
  public setGroupCard(groupId: string, userId: string, card: string) {
    this.adapter.send('set_group_card', { group_id: Number(groupId), user_id: Number(userId), card })
  }

  /**
   * @description: 群禁言
   * @param groupId 群号
   * @param userId 要禁言的QQ号,不填则为群禁言
   * @param time 禁言时长,单位秒,0表示取消禁言
   */
  public setGroupBan(groupId: string, userId?: string, time = 0) {
    this.adapter.send('set_group_ban', { group_id: Number(groupId), user_id: Number(userId), duration: time })
  }

  public setGroupWholeBan(groupId: string, enable = true) {
    this.adapter.send('set_group_whole_ban', { group_id: Number(groupId), enable })
  }

  /**
   * @description: 发送群公告
   * @param groupId 群号
   * @param content 公告内容
   * @param image 图片路径(可选)
   */
  public sendGroupNotice(groupId: string, content: string, image?: string) {
    this.adapter.send('_send_group_notice', { group_id: Number(groupId), content, image })
  }

  /**
   * @description: 群组踢人
   * @param groupId 群号
   * @param userId 要踢的QQ号
   */
  public setGroupKick(groupId: string, userId: string) {
    this.adapter.send('set_group_kick', {
      group_id: Number(groupId),
      user_id: Number(userId),
      reject_add_request: false
    })
  }
}

export default OnebotApi
