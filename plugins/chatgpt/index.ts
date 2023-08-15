/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 10:31:22
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 16:03:48
 */
import { stringProcess, stringSplit } from '@/tools';
import config from './config';
const url = "http://chatgpt.imlolicon.tk/v1/chat/completions";

const requestOptions = (message: string) => {
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apikey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        }),
    }
};


export default (Event: any, Api: any) => {
    Event.listen("on_group_msg", method_group);
    Event.listen("on_private_msg", method_private);

    function method_group(data: any) {
        if (!stringProcess(data.group_id, config.list.groups)) return;
        if (!stringProcess(data.message, config.prefix)) return;

        const message = stringSplit(data.message, config.prefix);
        fetch(url, requestOptions(message))
            .then((response) => response.json())
            .then((res) => {
                Api.send_group_msg(res.choices[0].message.content, data.group_id)
            });
    }

    function method_private(data: any) {
        if (!stringProcess(data.user_id, config.list.users)) return;
        if (!stringProcess(data.message, config.prefix)) return;

        const message = stringSplit(data.message, config.prefix);
        fetch(url, requestOptions(message))
            .then((response) => response.json())
            .then((res) => {
                Api.send_private_msg(res.choices[0].message.content, data.user_id)
            });
    }
}

