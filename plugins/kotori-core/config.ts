/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-08-15 10:34:45
 */
export default {
    apikey: {
        /* Apikey获取:https://api.imlolicon.tk/user/register */
        api: {
            day: "1c42abefdb5f7cc463dbc88e82d561b1"
        },
        bot: {
            chatgpt: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            /* ClaudeApi搭建参考:https://juejin.cn/post/7238917620849672247 */
            claude: {
                url: "",
                token: "",
                bot: "",
                chatId: ""
            },
        },
        /* Bangumi说明:https://bangumi.github.io/api */
        bangumi: "CUISWUtzJyM0C7VMd8TakNHjtNGCQfIJWYVHAE1R"
    },
    group: {
        /* 群聊白名单开关 */
        /* 建议关闭,使用kotori-bot自带的过滤功能 */
        enable: false,
        /* 群聊白名单列表 */
        list: []
    },
    component: {
        mainMenu: true,
        mange: {
            enable: true,
            joinGroupWelcome: true,
            exitGroupAddBlack: true,
            banTime: 600,
            banwordBanTime: 600,
            repeatBanTime: 600,
            repeatRule: {
                cycleTime: 10,
                maxTimes: 5
            }
        },
        format: {
            maxListNums: 10,
        }
    }
}