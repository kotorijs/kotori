import API from "@/utils/class.api";
import { CONST, loadConfig, parseCommand, saveConfig } from "./function";
import path from "path";
import { LOG_PREFIX, PLUGIN_GLOBAL, PROCESS_CMD, PluginAsyncList } from "./interface";
import { existsSync } from "fs";
import ProcessController from "./process";

class Command {
    private Api: object;
    private pluginEntityList: PluginAsyncList;
    private signserverDemo: ProcessController;
    private gocqDemo: ProcessController;
    private params: string[] = [];
    private result = {
        msg: '',
        type: 1,
        callback: () => { }
    };
    private argsError = 'Required parameter missing'

    public constructor(Api: object, pluginEntityList: PluginAsyncList, signserverDemo: ProcessController, gocqDemo: ProcessController) {
        this.Api = Api;
        this.pluginEntityList = pluginEntityList;
        this.signserverDemo = signserverDemo;
        this.gocqDemo = gocqDemo;
    }

    public registerCmd = async (chunk: Buffer) => {
        const input = chunk.toString().trim();
        this.params = parseCommand(input);
        this.result = {
            msg: '',
            type: 1,
            callback: () => { }
        }

        switch (this.params[0]) {
            case PROCESS_CMD.STOP: this.c_stop(); break;
            case PROCESS_CMD.BOT: this.c_bot(); break;
            case PROCESS_CMD.PLUGIN: this.c_plugin(); break;
            case PROCESS_CMD.PASSWORD: await this.c_password(); break;
            case PROCESS_CMD.HELP: this.c_help(); break;
            case PROCESS_CMD.SEND: this.c_send(); break;
            case PROCESS_CMD.SYS: this.c_sys(); break;
            default: this.c_default(input); break;
        }

        if (!this.result.msg) return;
        this.result.msg = `${LOG_PREFIX.CMD} ${this.result.msg}`
        switch (this.result.type) {
            case 1: console.info(this.result.msg); break;
            case 2: console.warn(this.result.msg); break;
            case 3: console.error(this.result.msg); break;
            default: console.log(this.result.msg); break;
        }
        this.result.callback();
    }

    private isOnline = (Api: object = this.Api): Api is API => {
        if (Api instanceof API) return true;
        this.result.msg = 'Currently offline';
        this.result.type = 2;
        return false;
    }

    private c_stop = () => {
        this.result.msg = 'The program is stopping...';
        this.result.callback = () => process.exit();
    }

    private c_bot = () => {
        if (!this.isOnline()) return;
        const BOT = CONST.BOT;
        const STATUS = BOT.status;
        const STAT = BOT.status.stat;
        this.result.msg = STATUS ? (
            `ConnectTime: ${BOT.connect} HeatbeatTime: ${BOT.heartbeat} BotId: ${BOT.self_id}` +
            ` AppEnabled: ${STATUS.app_enabled} AppGood: ${STATUS.app_good} AppInitialized: ${STATUS.app_initialized} Online: ${STATUS.online} PluginsGood: ${STATUS.plugins_good}` +
            ` Packet: ${STAT.packet_sent} ${STAT.packet_received} ${STAT.packet_lost} Message: ${STAT.message_sent} ${STAT.message_received}` +
            ` LostTimes: ${STAT.lost_times} DisconnectTimes: ${STAT.disconnect_times} LastMessageTime: ${STAT.last_message_time}`
        ) : 'Currently offline';
        STATUS || (this.result.type = 2);
    }

    private c_plugin = () => {
        if (!this.isOnline()) return;
        const pluginsJson = path.join(CONST.ROOT_PATH, 'plugins.json');
        const data = loadConfig(pluginsJson) as string[];
        if (this.params[1] === 'query') {
            for (let element of this.pluginEntityList) {
                if (this.params[2] && element[1] !== this.params[2]) continue;
                const res = element[3];
                this.result.msg += (
                    `\nId: ${element[1]}${res?.name ? ` Name: ${res.name}` : ''}${res?.version ? ` Version: ${res.version}` : ''}` +
                    `${res?.description ? ` Description: ${res.description}` : ''}${res?.author ? ` Author: ${res.author}` : ''}` +
                    `${res?.license ? ` License: ${res.license}` : ''} State: ${data.includes(element[1]) ? 'Off' : 'On'}`
                )
            }
            this.result.msg || (this.result.msg = `Cannot find plugin '${this.params[2]}'`, this.result.type = 3)
            return;
        } else if (this.params[1] === 'ban') {
            if (data.includes(this.params[2])) {
                this.result.msg = 'Target already exists';
                this.result.type = 2;
                return;
            }
            data.push(this.params[2]);
            saveConfig(pluginsJson, data);
            this.result.msg = `Successfully added ${this.params[2]} to the disabled list`
            return;
        } else if (this.params[1] === 'unban') {
            if (!data.includes(this.params[2])) {
                this.result.msg = 'Target does not exist';
                this.result.type = 2;
                return;
            }
            saveConfig(pluginsJson, data.filter(item => item !== this.params[2]));
            this.result.msg = `Successfully deleted ${this.params[2]} from the disabled list`;
            return;
        }
        this.result.msg = this.argsError;
        this.result.type = 3;
    }

    private c_password = async () => {
        const PATH = `${CONST.PLUGIN_PATH}\\${PLUGIN_GLOBAL.ADMIN_PLUGIN}\\config.ts`;
        if (!existsSync(PATH)) {
            this.result.msg = `Cannot find plugin '${PLUGIN_GLOBAL.ADMIN_PLUGIN}'`;
            this.result.type = 2;
            return;
        }
        const config = (await import(PATH)).default;
        this.result.msg = `User: ${config.web.user} Password: ${config.web.pwd}`;
    }

    private c_help = () => {
        this.result.msg = (
            `Command List:` +
            `\n${PROCESS_CMD.STOP} : Stop kotori-bot application` +
            `\n${PROCESS_CMD.BOT} : Get bot status information` +
            `\n${PROCESS_CMD.PLUGIN} <Op:query/ban/unban> <PluginId> : View all or some plugins manifest information and ban or unban a plugin` +
            `\n${PROCESS_CMD.PASSWORD} : View username and password of admin website` +
            `\n${PROCESS_CMD.SEND} <Message> <Type:private/group> <GroupId/UserId> : Send a message to bot's a friend and group` +
            `\n${PROCESS_CMD.SYS} <Mode:0/1> : Input 0 to restart only Go-cqhttp,1 to Signserver and Go-cqhttp` +
            `\n${PROCESS_CMD.HELP} : Get command help information`
        );
    }

    private c_send = () => {
        if (!this.isOnline()) return;
        if (!this.params[1] || (this.params[2] !== 'private' && this.params[2] !== 'group') || !this.params[3]) {
            this.result.msg = this.argsError;
            this.result.type = 3;
            return;
        }
        (this.Api as API).send_msg(this.params[2], this.params[1], parseInt(this.params[3]));
        this.result.msg = 'Message sent successfully';
    }

    private c_sys = () => {
        if (!this.isOnline()) return;
        const num = parseInt(this.params[1]);
        if (!num) {
            this.result.callback = () => this.gocqDemo.restart();
            this.result.msg = 'Restarting Go-cqhttp...';
            return;
        } else if (num == 1) {
            this.result.callback = () => {
                this.signserverDemo.restart();
                this.gocqDemo.restart();
            }
            this.result.msg = 'Restarting Signserver and Go-cqhttp...';
            return;
        }
        this.result.msg = this.argsError;
        this.result.type = 2;
    }

    private c_default = (input: string) => {
        this.result.msg = `Unknown command '${input}', Please input '${PROCESS_CMD.HELP}' to view all command`;
        this.result.type = 3;
    }
}

export default Command;