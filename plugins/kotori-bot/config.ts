export default {
    apikey: {
        day: "1c42abefdb5f7cc463dbc88e82d561b1",
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
        }
    },
    group: {
        /* 群聊白名单功能 */
        state: true,
        /* (state为true可用)群聊开启列表 */
        list: [
            "673830908",
            "317691609"
        ]
    }
}