/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 10:31:22
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-18 18:06:36
 */
import fs from 'fs';
import needle from 'needle';
import { Api, Const, Event, EventDataType, stringProcess, stringSplit } from '@/tools';
import config from './config';
import { wss } from './wss';

const log = (...args: any) => console.log('[MCServer]', ...args);

const GET_OWN_IP_URL: string = 'https://myip4.ipip.net';

const mcsmApi = (action: string, options?: any) => {
	const params: any = {
		apikey: config.mcsm.apikey,
		uuid: config.mcsm.uuid,
		remote_uuid: config.mcsm.remote_uuid,
		...options,
	};
	let paramsStr: string = '';
	Object.keys(params).forEach(key => {
		paramsStr += `${key}=${params[key]}&`;
	});
	paramsStr.substring(0, -1);
	return needle('get', `${config.mcsm.address}/api/${action}?${paramsStr}`);
};

export default (event: Event, api: Api, consts: Const) => {
	// 基础
	let ip: string = '';
	needle('get', GET_OWN_IP_URL).then(data => {
		const { 0: getIp } = data.body.split(':')[0].ip.split(' ');
		ip = getIp;
	});

	// BOT
	const send = (msg: string, turn: boolean = false) => {
		let message = msg;
		if (turn) message = `【 ${config.info.name} 】\n${message}\n--------ByHotaru--------`;
		api.send_group_msg(message, config.group_id);
	};

	const cmdHelp = () => {
		let message: string = `查看帮助:${config.cmd_prefix}${config.cmd.help}\n`;
		message += `查询服务器状态:${config.cmd_prefix}${config.cmd.status}\n`;
		// message += `查询主机状态:${config.cmd_prefix}${config.cmd.state}\n`;
		message += `仅管理员可用:\n`;
		message += `启动服务器:${config.cmd_prefix}${config.cmd.start}\n`;
		message += `关闭服务器:${config.cmd_prefix}${config.cmd.stop}\n`;
		message += `重启服务器:${config.cmd_prefix}${config.cmd.rest}\n`;
		message += `终止服务器:${config.cmd_prefix}${config.cmd.stopex}\n`;
		message += `运行游戏指令:${config.cmd_prefix}${config.cmd.run} [Command]\n`;
		message += `发送聊天:${config.chat_prefix}[Message]`;
		send(message, true);
	};

	const cmdStatus = async () => {
		const d = (await needle('get', `https://api.imlolicon.tk/api/motdpe?ip=${ip}&port=${config.info.port}`)).body;

		const message: string =
			d.code === 500
				? `服务器地址:${d.data.ip}\n服务器端口:${d.data.port}\n服务器提示:${d.data.motd}\n协议版本:${d.data.argeement}\n游戏版本:${d.data.version}\n游戏模式:${d.data.gamemode}\n在线人数:${d.data.online}/${d.data.max}\nDelay:${d.data.delay}`
				: '服务器不在线';
		send(message);
	};

	const cmdState = async () => {
		const data = (await mcsmApi('overview')).body;
		let message: string = '';
		if (data.status === 200) {
			message += `系统内核:${data.data.system.type}\n`;
			message += `系统版本:${data.data.system.version}\n`;
			message += `NODE版本:${data.data.system.node}\n`;
			message += `主机名字:${data.data.system.hostname}\n`;
			message += `CPU:${data.data.process.cpu}\n`;
			message += `内存:${data.data.process.memory}`;
		} else {
			message = '主机状态信息获取失败';
		}
		send(message);
	};

	const cmdStart = async () => {
		send('服务器启动中...');
		const data = (await mcsmApi('protected_instance/open')).body;
		send(
			data.status === 200
				? '服务器启动成功'
				: `服务器启动失败${typeof data.data === 'string' ? data.data : null}`,
		);
	};

	const cmdStop = async () => {
		send('服务器关闭中...');
		const data = (await mcsmApi('protected_instance/stop')).body;
		send(data.status === 200 ? '服务器关闭成功' : '服务器关闭失败');
	};

	const cmdRest = async () => {
		send('服务器重启中...');
		const data = (await mcsmApi('protected_instance/restart')).body;
		send(data.status === 200 ? '服务器重启成功' : '服务器启重启失败');
	};

	const cmdStopex = async () => {
		const data = (await mcsmApi('protected_instance/kill')).body;
		send(data.status === 200 ? '服务器终止成功' : '服务器终止失败');
	};

	const method = (data?: EventDataType) => {
		if (!data?.group_id || data.group_id !== config.group_id || !stringProcess(data.message, config.cmd_prefix))
			return;

		const command = stringSplit(data.message, config.cmd_prefix);
		switch (true) {
			case stringProcess(command, config.cmd.help):
				cmdHelp();
				break;
			case stringProcess(command, config.cmd.status):
				cmdStatus();
				break;
			case stringProcess(command, config.cmd.state):
				cmdState();
				break;
			case stringProcess(command, config.cmd.start):
				if (stringProcess(data.user_id, config.mangers)) cmdStart();
				else send(config.message.not_manger);
				break;
			case stringProcess(command, config.cmd.stop):
				if (stringProcess(data.user_id, config.mangers)) cmdStop();
				else send(config.message.not_manger);
				break;
			case stringProcess(command, config.cmd.rest):
				if (stringProcess(data.user_id, config.mangers)) cmdRest();
				else send(config.message.not_manger);
				break;
			case stringProcess(command, config.cmd.stopex):
				if (stringProcess(data.user_id, config.mangers)) cmdStopex();
				else send(config.message.not_manger);
				break;
			case stringProcess(command, config.cmd.run):
				// stringProcess(data.user_id, config.mangers) ? cmd_run(command[1]) : send(msg1)
				break;
			default:
				send(`未知的命令,请输入${config.cmd_prefix}${config.cmd.help}以获取帮助`);
		}
	};

	// Timer
	setInterval(() => {
		fs.readFile(`${consts.DATA_PLUGIN_PATH}/ip.ini`, 'utf-8', (err, data) => {
			if (err) {
				console.error('[MCServer]', err);
				return;
			}
			needle('get', GET_OWN_IP_URL).then(res => {
				const { 0: temp } = res.body.split(':')[1].split(' ');
				if (data !== temp) {
					log(`IP发生了改变 [${data}] -> [${temp}]`);
					send(`检测提醒:服务器IP已发生改变!\n[${data}] -> [${temp}]\n请及时更改游戏内IP`);
					ip = temp;
					fs.writeFile(`${consts.DATA_PLUGIN_PATH}/ip.ini`, temp, () => {});
				}
			});
		});
	}, 1000 * config.other.check_ip_time);

	// Wss
	wss(event, send);

	event.listen('on_group_msg', method);
};

// log('MCServer 加载成功');
