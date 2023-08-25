import WebSocket from 'ws';
import { Event, EventDataType, obj, stringProcess, stringSplit } from '@/tools';
import config from './config';

const log = (...args: unknown[]) => console.log('[MCServer]', ...args);

export type Send = (msg: string, turn?: boolean) => void;

export const wss = (event: Event, send: Send) => {
	const WebSocketServer: WebSocket.Server = new WebSocket.Server(config.wss);

	WebSocketServer.on('connection', (ws: WebSocket.WebSocket) => {
		log('MCServer: Client connected successful');

		const sendWss = (action: string, params?: object) => {
			const JSONStr = JSON.stringify({
				action,
				params,
			});
			ws.send(JSONStr);
			log(`MCServer WSS Send: ${JSONStr}`);
		};

		const HandleWscMsg = (d: obj) => {
			let message: string = '';
			switch (d.event) {
				case 'on_pre_join':
					message = `玩家 [${d.data.name}] 开始连接服务器`;
					break;
				case 'on_join':
					message = `玩家 [${d.data.name}] 进入了服务器`;
					break;
				case 'on_left':
					message = `玩家 [${d.data.name}] 离开了服务器`;
					break;
				case 'on_player_die':
					message = `玩家 [${d.data.name}] ${d.data.source ? `死于 [${d.data.source}] ` : '意外的死亡'}`;
					break;
				case 'on_chat':
					message = `玩家 [${d.data.name}] 说: ${d.data.msg}`;
					break;
				case 'on_command':
					message = `指令执行${d.data.success ? '成功' : '失败'}: ${d.data.output}`;
					break;
				default:
					break;
			}
			if (message) send(message);
		};

		const cmdRun = (cmd: string) => {
			const command: string = stringSplit(cmd, `${config.cmd.run} `);
			sendWss('to_command', { command });
			send(`指令发送成功 ${command}`);
		};

		const methodWss = (data?: EventDataType) => {
			if (!data?.group_id || data.group_id !== config.group_id) return;
			if (stringProcess(data.message, config.chat_prefix)) {
				sendWss('to_chat', {
					groupname: config.info.group_name,
					nickname: data.sender.nickname,
					qq: data.user_id,
					msg: data.message.split(config.chat_prefix)[1],
				});
				return;
			}
			if (!stringProcess(data.message, config.cmd_prefix)) return;

			const command = stringSplit(data.message, config.cmd_prefix);

			switch (true) {
				case stringProcess(command, config.cmd.run):
					if (stringProcess(data.user_id!, config.mangers)) cmdRun(command);
					else send(config.message.not_manger);
					break;
				default:
					break;
			}
		};

		ws.on('message', (message: string) => {
			const data = JSON.parse(message);
			log(`MCServer WSS Receive: ${message}`);

			HandleWscMsg(data);
		});

		event.listen('on_group_msg', methodWss);
	});
};

export default wss;
