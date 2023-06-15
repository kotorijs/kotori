export default {
    /* 命令发送前缀 */
    cmd_prefix: '/mcs ',
    /* 向游戏内聊天前缀 */
    chat_prefix: '#',
    cmd: {
        help: 'help',
        status: 'status',
        state: 'state',
        start: 'start',
        stop: 'stop',
        rest: 'rest',
        stopex: 'stopex',
        run: 'run',
    },
    /* 服务器群号 */
    group_id: 0,
    /* 机器人管理员,可设置多个 */
    mangers: [],
    /* 信息 */
    info: {
        /* 服务器名字 */
        name: 'MCServer',
        /* 服务器端口 */
        port: 19132,
        /* 服务器群名字 */
        group_name: 'MC服务器交流群'
    },
    /* MCSM配置 */
    mcsm: {
        address: 'http://localhost:23333',
        uuid: '',
        remote_uuid: '',
        apikey: ''
    },
    /* WSS配置,用于与游戏服务器通讯 */
    wss: {
        /* WSS开放端口(不能被占用) */
        port: 1234
    },
    other: {
        /* IP检测时间,检测IP是否发生变化,用于家用宽带开服的动态公网IP的检测 */
        check_ip_time: 600
    },
    /* 消息模板 */
    message: {
        /* 权限不足时 */
        not_manger: '该指令仅管理员可用!', 
        not_supermanger: '该指令仅最高管理员可用!' 
    }
}