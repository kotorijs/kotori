/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: https://hotaru.icu
 * @Date: 2023-09-29 14:31:13
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-10-06 15:57:29
 */
import { Api, Msg } from '@kotori-bot/kotori';

export default class CmdApi extends Api {
	public send_private_msg = (message: Msg, userId: number) => {
		/* handled msg... */
		this.adapter.send('send_private_msg', { user_id: userId, message });
	};

	public send_group_msg = () => this.adapter.send('');

	public delete_msg = () => this.adapter.send('');

	public set_group_name = () => this.adapter.send('');

	public set_group_avatar = () => this.adapter.send('');

	public set_group_admin = () => this.adapter.send('');

	public set_group_card = () => this.adapter.send('');

	public set_group_ban = () => this.adapter.send('');

	public send_group_notice = () => this.adapter.send('');

	public set_group_kick = () => this.adapter.send('');

	public set_group_leave = () => this.adapter.send('');
}
