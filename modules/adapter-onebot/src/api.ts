/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2024-07-26 15:22:37
 */
import { Api, type Message } from 'kotori-bot'

export class OnebotApi extends Api {
  public sendPrivateMsg(message: Message, userId: number): void {
    this.adapter.status.lastMsgTime = new Date()
    this.adapter.status.sentMsg += 1
    this.adapter.send('send_private_msg', { user_id: userId, message, auto_escape: false })
  }

  /**
   * @description: 发送私聊消息
   * @param {Msg} message 要发送的内容
   * @param {groupId} groupId 群号
   * @return {void}
   */
  public sendGroupMsg(message: Message, groupId: number): void {
    this.adapter.status.lastMsgTime = new Date()
    this.adapter.status.sentMsg += 1
    this.adapter.send('send_group_msg', { group_id: groupId, message, auto_escape: false })
  }

  /**
   * @description: 撤回消息
   * @param {number} messageId 消息id
   * @return {void}
   */
  public deleteMsg(messageId: number): void {
    this.adapter.send('delete_msg', { messageId })
  }

  /**
   * @description: 设置群名
   * @param {number} groupId 群号
   * @param {string} groupName 新群名
   * @return {void}
   */
  public setGroupName(groupId: number, groupName: string): void {
    this.adapter.send('set_group_name', { group_id: groupId, group_name: groupName })
  }

  /**
   * @description: 设置群头像
   * @param {number} groupId 群号
   * @param {string} image 图片路径
   * @return {void}
   */
  public setGroupAvatar(groupId: number, image: string): void {
    this.adapter.send('set_group_portrait', { group_id: groupId, file: image, cache: false })
  }

  /**
   * @description: 设置群管理员
   * @param {number} groupId 群号
   * @param {number} userId 要设置的管理员的QQ号
   * @param {boolean} enable true为设置,false取消,默认true
   * @return {void}
   */
  public setGroupAdmin(groupId: number, userId: number, enable = true): void {
    this.adapter.send('set_group_admin', { group_id: groupId, user_id: userId, enable })
  }

  /**
   * @description: 设置群名片(群备注)
   * @param {number} groupId 群号
   * @param {number} userId 要设置的QQ号
   * @param {string} card 群名片内容,不填或空字符串表示删除群名片
   * @return {void}
   */
  public setGroupCard(groupId: number, userId: number, card: string): void {
    this.adapter.send('set_group_card', { group_id: groupId, user_id: userId, card })
  }

  /**
   * @description: 群禁言
   * @param {number} groupId 群号
   * @param {number} userId 要禁言的QQ号,不填则为群禁言
   * @param {number} time 禁言时长,单位秒,0表示取消禁言
   * @return {void}
   */
  public setGroupBan(groupId: number, userId?: number, time = 0): void {
    if (userId) {
      this.adapter.send('setGroupBan', { group_id: groupId, user_id: userId, duration: time })
    } else {
      this.adapter.send('set_group_whole_ban', { group_id: groupId, enable: !!time })
    }
  }

  /**
   * @description: 发送群公告
   * @param {number} groupId 群号
   * @param {string} content 公告内容
   * @param {string} image 图片路径(可选)
   * @return {void}
   */
  public sendGroupNotice(groupId: number, content: string, image?: string): void {
    this.adapter.send('_sendGroupNotice', { group_id: groupId, content, image })
  }

  /**
   * @description: 群组踢人
   * @param {number} groupId 群号
   * @param {number} userId 要踢的QQ号
   * @return {void}
   */
  public setGroupKick(groupId: number, userId: number): void {
    this.adapter.send('setGroupKick', { group_id: groupId, user_id: userId, reject_add_request: false })
  }

  /**
   * @description: 退出群组
   * @param {number} groupId 群号
   * @return {void}
   */
  public setGroupLeave(groupId: number): void {
    this.adapter.send('setGroupLeave', { group_id: groupId, is_dismiss: false })
  }

  /* extra: ApiExtraValue = { type: 'onebot', image, at, poke }; */
}

export default OnebotApi
