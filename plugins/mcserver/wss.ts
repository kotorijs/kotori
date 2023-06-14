import WebSocket from 'ws';
import config from './config'; 
import { stringProcess, stringSplit } from '../../src/function';

const log = (...args:any) => console.log('[MCServer]', ...args);

export const wss: Function = (Event: any, send: Function) => {
    const WebSocketServer: WebSocket.Server = new WebSocket.Server(config.wss);

    WebSocketServer.on('connection', (ws: WebSocket.WebSocket) => {
        log('MCServer: Client connected successful');

        const send_wss = (action: string, params?: object) => {
            const JSONStr = JSON.stringify({
                action, params
            });
            ws.send(JSONStr);
            log(`MCServer WSS Send: ${JSONStr}`);
        }

        const HandleWscMsg = (d: any) => {
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
            }
            message && send(message);
        }


        const method_wss = (data?: any) => {

            if (data.group_id !== config.group_id) return;
            if (stringProcess(data.message, config.chat_prefix)) {
                send_wss('to_chat', {
                    groupname: config.info.group_name,
                    nickname: data.sender.nickname,
                    qq: data.user_id,
                    msg: data.message.split(config.chat_prefix)[1]
                })
                return;
            }
            if (!stringProcess(data.message, config.cmd_prefix)) return;

            const command = stringSplit(data.message, config.cmd_prefix);

            switch (true) {
                case stringProcess(command, config.cmd.run):
                    stringProcess(data.user_id, config.mangers) ? cmd_run(command) : send(config.message.not_manger);
                    break;;
            }
        };

        const cmd_run = (cmd: string) => {
            const command: string = stringSplit(cmd, `${config.cmd.run} `);
            send_wss('to_command', { command });
            send(`指令发送成功 ${command}`);
        }

        ws.on('message', (message: string) => {
            const data = JSON.parse(message);
            log('MCServer WSS Receive: ' + message);

            HandleWscMsg(data);
        });

        Event.listen("on_group_msg", method_wss);
    })
}