/*
 * @Author: Hotaru biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-07-11 14:18:27
 * @LastEditors: Hotaru biyuehuya@gmail.com
 * @LastEditTime: 2023-07-31 11:49:30
 */
export default {
    apikey: {
        api: {
            day: "1c42abefdb5f7cc463dbc88e82d561b1"
        },
        bot: {
            chatgpt: "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",
            claude: {
                /* 搭建参考:https://juejin.cn/post/7238917620849672247 */
                url: "https://ol7t35.laf.dev/claude-api",
                token: "xoxp-5198247082403-5198378930930-5469415846343-b81ffc4fd41e508fb35e54910b849231",
                bot: "U055UBYFQJW",
                chatId: 'ai'
            },
            /* 私聊开启的用户 */
            users: [
                "3324656453"
            ]
        },
        bangumi: "CUISWUtzJyM0C7VMd8TakNHjtNGCQfIJWYVHAE1R"
    },
    group: {
        /* 群聊白名单功能 */
        state: true,
        /* (state为true可用)群聊开启列表 */
        list: [
            "673830908",
            "317691609",
            // "564988727"
        ]
    },
    component: {
        join: {
            enable: true,
            message: `欢迎加入本群，请先仔细阅读群公告，发送"/menu"或"菜单"查看更多BOT功能和信息`
        },
        mange: {
            defaultBanTime: 10
        }
    }
}