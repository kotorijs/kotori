/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 10:31:22
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-06 17:58:28
 */
import config from './config';
import needle from 'needle';
import fs from 'fs';
import { wss} from './wss';
import { stringProcess, stringSplit } from '@/tools';

const log = (...args:any) => console.log('[MCServer]', ...args);

const _get_own_ip_url: string = 'https://myip4.ipip.net';

const mcsm_api = (action: string, options?: any) => {
    const params: any = {
        apikey: config.mcsm.apikey,
        uuid: config.mcsm.uuid,
        remote_uuid: config.mcsm.remote_uuid,
        ...options
    }
    let paramsStr: string = '';
    for (let key in params) {
        paramsStr += `${key}=${params[key]}&`;
    }
    paramsStr.substring(0, -1)
    return needle('get', `${config.mcsm.address}/api/${action}?${paramsStr}`);
}

export default (Event: any, Api: any, Const: any) => {
    // 基础
    let ip: string;
    needle('get', _get_own_ip_url).then(data => {
        ip = data.body.split(':')[1];
        ip = ip.split(' ')[0];
    });


    // BOT
    const send = (message: string, turn: boolean = false) => {
        turn && (message = `【 ${config.info.name} 】\n${message}\n--------ByHotaru--------`);
        Api.send_group_msg(message, config.group_id)
    }

    const method = (data?: any) => {
        if (data.group_id !== config.group_id || !stringProcess(data.message, config.cmd_prefix)) return;

        const command = stringSplit(data.message, config.cmd_prefix);
        switch (true) {
            case stringProcess(command, config.cmd.help):
                cmd_help();
                break;
            case stringProcess(command, config.cmd.status):
                cmd_status();
                break;
            case stringProcess(command, config.cmd.state):
                cmd_state();
                break;
            case stringProcess(command, config.cmd.start):
                stringProcess(data.user_id, config.mangers) ? cmd_start() : send(config.message.not_manger)
                break;
            case stringProcess(command, config.cmd.stop):
                stringProcess(data.user_id, config.mangers) ? cmd_stop() : send(config.message.not_manger)
                break;
            case stringProcess(command, config.cmd.rest):
                stringProcess(data.user_id, config.mangers) ? cmd_rest() : send(config.message.not_manger)
                break;
            case stringProcess(command, config.cmd.stopex):
                stringProcess(data.user_id, config.mangers) ? cmd_stopex() : send(config.message.not_manger)
                break;
            case stringProcess(command, config.cmd.run):
                // stringProcess(data.user_id, config.mangers) ? cmd_run(command[1]) : send(msg1)
                break;
            default:
                send(`未知的命令,请输入${config.cmd_prefix}${config.cmd.help}以获取帮助`);
        }
    };


    const cmd_help = () => {
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
    }

    const cmd_status = async () => {
        const d = (await needle('get', `https://api.imlolicon.tk/api/motdpe?ip=${ip}&port=${config.info.port}`)).body;

        const message: string = (d.code === 500 ? `服务器地址:${d.data.ip}\n服务器端口:${d.data.port}\n服务器提示:${d.data.motd}\n协议版本:${d.data.argeement}\n游戏版本:${d.data.version}\n游戏模式:${d.data.gamemode}\n在线人数:${d.data.online}/${d.data.max}\nDelay:${d.data.delay}` : '服务器不在线');
        send(message);
    }

    const cmd_state = async () => {
        const data = (await mcsm_api('overview')).body;
        let message: string = '';
        if (data.status === 200) {
            message += `系统内核:${data.data.system.type}\n`;
            message += `系统版本:${data.data.system.version}\n`;
            message += `NODE版本:${data.data.system.node}\n`;
            message += `主机名字:${data.data.system.hostname}\n`;
            message += `CPU:${data.data.process.cpu}\n`;
            message += `内存:${data.data.process.memory}`;
        } else {
            message = '主机状态信息获取失败'
        }
        send(message)
    }

    const cmd_start = async () => {
        send('服务器启动中...');
        const data = (await mcsm_api('protected_instance/open')).body;
        send(data.status === 200 ? '服务器启动成功' : '服务器启动失败' + (typeof (data.data) === 'string' ? data.data : null));
    }

    const cmd_stop = async () => {
        send('服务器关闭中...');
        const data = (await mcsm_api('protected_instance/stop')).body;
        send(data.status === 200 ? '服务器关闭成功' : '服务器关闭失败');
    }

    const cmd_rest = async () => {
        send('服务器重启中...');
        const data = (await mcsm_api('protected_instance/restart')).body;
        send(data.status === 200 ? '服务器重启成功' : '服务器启重启失败');
    }

    const cmd_stopex = async () => {
        const data = (await mcsm_api('protected_instance/kill')).body;
        send(data.status === 200 ? '服务器终止成功' : '服务器终止失败');
    }


    // Timer
    setInterval(() => {
        fs.readFile(`${Const.DATA_PLUGIN_PATH}/ip.ini`, 'utf-8', (err, data) => {
            if (err) {
                console.error('[MCServer]', err);
                return;
            }
            needle('get', _get_own_ip_url).then(res => {
                let temp = res.body.split(':')[1];
                temp = temp.split(' ')[0];
                if (data !== temp) {
                    log(`IP发生了改变 [${data}] -> [${temp}]`);
                    send(`检测提醒:服务器IP已发生改变!\n[${data}] -> [${temp}]\n请及时更改游戏内IP`);
                    ip = temp;
                    fs.writeFile(`${Const.DATA_PLUGIN_PATH}/ip.ini`, temp, () => { });
                }
            })
        });
    }, 1000 * config.other.check_ip_time)


    // Wss
    wss(Event, send);

    Event.listen("on_group_msg", method);
}


// log('MCServer 加载成功');