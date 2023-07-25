/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-15 16:41:22
 */
import { loadConfig, saveConfig, stringProcess, stringSplit } from '../../src/function';
import config from './config';

const getClaude = (question: string, conversationId?: string | null) => {
    let url = config.api.url;
    url += `?toekn=${config.api.token}`;
    url += `&bot=${config.api.bot}`;
    url += `&chatId=${config.api.chatId}`;
    url += `&question=${question}`;
    conversationId && (url += `&conversationId=${conversationId}`);
    return fetch(url, {
        method: 'GET',
    }).then(resolve => resolve.json());
}


export default (Event: any, Api: any, Const: any) => {
    const conversationIdFile = `${Const._DATA_PLUGIN_PATH}\\conversationId.json`;
    const conversationIdList = loadConfig(conversationIdFile);
    Event.listen("on_group_msg", method_group);
    Event.listen("on_private_msg", method_private);


    function method_group (data: any) {
        if (!stringProcess(data.group_id, config.list.groups)) return;
        if (!stringProcess(data.message, config.prefix)) return;

        const message = stringSplit(data.message, config.prefix);
        getClaude(message, conversationIdList.groups[data.group_id]).then((d) => {
            console.log(d, conversationIdList, message);
            if (d.code === 0) {
                Api.send_group_msg(d.msg, data.group_id);
                if (!conversationIdList.groups[data.group_id] && conversationIdList.groups[data.group_id] !== d.conversationId) {
                    conversationIdList.groups[data.group_id] = d.conversationId;
                    saveConfig(conversationIdFile, conversationIdList);
                }
            }
        });
    }

    function method_private (data: any) {
        if (!stringProcess(data.user_id, config.list.users)) return;
        if (!stringProcess(data.message, config.prefix)) return;

        getClaude(data.message, conversationIdList.users[data.user_id]).then((d) => {
            console.log(d, conversationIdList, data.message);
            if (d.code === 0) {
                Api.send_private_msg(d.msg, data.user_id);
                if (!conversationIdList.users[data.user_id] && conversationIdList.users[data.user_id] !== d.conversationId) {
                    conversationIdList.users[data.user_id] = d.conversationId;
                    saveConfig(conversationIdFile, conversationIdList);
                }
            }
        });
    }
}

