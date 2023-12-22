/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-12-03 16:55:35
 */
import { Api, MessageRaw } from 'kotori-bot';

export class OneBotApi extends Api {
	public send_private_msg(message: MessageRaw, userId: number) {
		this.adapter.status.lastMsgTime = new Date();
		this.adapter.status.sentMsg += 1;
		this.adapter.send('send_private_msg', { user_id: userId, message, auto_escape: false });
	}

	/**
	 * @description: 发送私聊消息
	 * @param {Msg} message 要发送的内容
	 * @param {groupId} groupId 群号
	 * @return {void}
	 */
	public send_group_msg(message: MessageRaw, groupId: number) {
		this.adapter.status.lastMsgTime = new Date();
		this.adapter.status.sentMsg += 1;
		this.adapter.send('send_group_msg', { group_id: groupId, message, auto_escape: false });
	}

	/**
	 * @description: 撤回消息
	 * @param {number} messageId 消息id
	 * @return {void}
	 */
	public delete_msg(messageId: number) {
		this.adapter.send('delete_msg', { messageId });
	}

	/**
	 * @description: 设置群名
	 * @param {number} groupId 群号
	 * @param {string} groupName 新群名
	 * @return {void}
	 */
	public set_group_name(groupId: number, groupName: string) {
		this.adapter.send('set_group_name', { group_id: groupId, group_name: groupName });
	}

	/**
	 * @description: 设置群头像
	 * @param {number} groupId 群号
	 * @param {string} image 图片路径
	 * @return {void}
	 */
	public set_group_avatar(groupId: number, image: string) {
		this.adapter.send('set_group_portrait', { group_id: groupId, file: image, cache: false });
	}

	/**
	 * @description: 设置群管理员
	 * @param {number} groupId 群号
	 * @param {number} userId 要设置的管理员的QQ号
	 * @param {boolean} enable true为设置,false取消,默认true
	 * @return {void}
	 */
	public set_group_admin(groupId: number, userId: number, enable: boolean = true) {
		this.adapter.send('set_group_admin', { group_id: groupId, user_id: userId, enable });
	}

	/**
	 * @description: 设置群名片(群备注)
	 * @param {number} groupId 群号
	 * @param {number} userId 要设置的QQ号
	 * @param {string} card 群名片内容,不填或空字符串表示删除群名片
	 * @return {void}
	 */
	public set_group_card(groupId: number, userId: number, card: string) {
		this.adapter.send('set_group_card', { group_id: groupId, user_id: userId, card });
	}

	/**
	 * @description: 群禁言
	 * @param {number} groupId 群号
	 * @param {number} userId 要禁言的QQ号,不填则为群禁言
	 * @param {number} time 禁言时长,单位秒,0表示取消禁言
	 * @return {void}
	 */
	public set_group_ban(groupId: number, userId?: number, time: number = 0) {
		if (userId) {
			this.adapter.send('set_group_ban', { group_id: groupId, user_id: userId, duration: time });
		} else {
			this.adapter.send('set_group_whole_ban', { group_id: groupId, enable: !!time });
		}
	}

	/**
	 * @description: 发送群公告
	 * @param {number} groupId 群号
	 * @param {string} content 公告内容
	 * @param {string} image 图片路径(可选)
	 * @return {void}
	 */
	public send_group_notice(groupId: number, content: string, image?: string) {
		this.adapter.send('_send_group_notice', { group_id: groupId, content, image });
	}

	/**
	 * @description: 群组踢人
	 * @param {number} groupId 群号
	 * @param {number} userId 要踢的QQ号
	 * @return {void}
	 */
	public set_group_kick(groupId: number, userId: number) {
		this.adapter.send('set_group_kick', { group_id: groupId, user_id: userId, reject_add_request: false });
	}

	/**
	 * @description: 退出群组
	 * @param {number} groupId 群号
	 * @return {void}
	 */
	public set_group_leave(groupId: number) {
		this.adapter.send('set_group_leave', { group_id: groupId, is_dismiss: false });
	}

	/* public extra: ApiExtraValue = { type: 'onebot', image, at, poke }; */
}

export default OneBotApi;
