/*** 
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-06-15 17:12:29
 */
/**
 * 该文件非机器人插件！！！
 * 请将该文件放在BDS服务器(LiteLoader)的plugins/目录下
 */
const config = {
    /* WS地址(机器人和MC服务器运行在同一主机使用localhost即可) */
    ws: 'localhost',
    /* WS端口 */
    port: 1234,
    /* WS连接失败时尝试重连时间,单位:秒 */
    cycletime: 10
}

const WebSocketClient = new WSClient();

const connect = () => {
    const result = WebSocketClient.connect(`${config.ws}:${config.port}`);
    if (!result) {
        setTimeout(() => connect(), config.cycletime * 1000)
        log('WServer contented failed');
    } else {
        log('WServer contented successful');
    }
}

const send = (event, data) => {
    const JSONStr = JSON.stringify({
        event, data
    });
    log(`WSC Send: ${JSONStr}`);
    WebSocketClient.send(JSONStr);
}


WebSocketClient.listen('onTextReceived', (res) => {
    log(`WSC Receive: ${res}`);
    const data = JSON.parse(res)
    switch (data.action) {
        case 'to_command':
            const result = mc.runcmdEx(data.params.command);
            send('on_command', {
                success: result.success,
                output: result.output
            });
            break;
        case 'to_chat':
            mc.runcmd(`tellraw @a ` + JSON.stringify({rawtext: [{
                    text: `[${data.params.groupname}] ${data.params.nickname}(${data.params.qq}) >>> ${data.params.msg}`
                }]})
            )
            break;
    }
});

WebSocketClient.listen('onLostConnection', () => connect());

connect()

mc.listen('onPreJoin', (player) => {
    send('on_pre_join', {
        name: player.name
    })
})

mc.listen('onJoin', (player) => {
    send('on_join', {
        name: player.name
    })
})

mc.listen('onLeft', (player) => {
    send('on_left', {
        name: player.name
    })
})

mc.listen('onPlayerDie', (player, entity) => {
    send('on_player_die', {
        name: player.name,
        source: entity ? entity.name : null
    })
})

mc.listen('onChat', (player, msg) => {
    send('on_chat', {
        name: player.name,
        msg
    })
})
