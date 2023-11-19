import { Api } from 'kotori-bot';

export default class CmdApi extends Api {
	public send_private_msg = () => this.adapter.send('');

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
